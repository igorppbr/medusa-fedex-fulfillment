import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CartLineItemDTO,
  CreateFulfillmentResult,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
  ProductVariantDTO
} from "@medusajs/framework/types"
import {
  FedexAddress,
  fedexMapping,
  FedexRateRequestItem,
  FedexShippingRate,
} from "../../fedex-api/types"
import { getAuthToken } from "../../fedex-api/auth"
import { getShippingRates } from "../../fedex-api/get-shipping-rates"
import createFedexShipmentWorkflow from "../../workflows/create-shipment"
import getFedexCredentials from "../../workflows/get-credentials"
import { SetupCredentialsInput } from "../../api/admin/fedex/route"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  isEnabled: boolean
  clientId: string
  clientSecret: string
  accountNumber: string
  isSandbox: boolean
  enableLogs: boolean
  weightUnitOfMeasure?: "LB" | "KG"
}

class FedexProviderService extends AbstractFulfillmentProviderService {
  static identifier = "fedex"

  protected logger_: Logger
  protected options_: Options

  /**
   * Create a new FedEx provider service.
   * @param logger - The logger instance.
   * @param options - The FedEx options.
   */
  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  /**
   * Get FedEx credentials.
   * @returns {Promise<SetupCredentialsInput>}
   */
  async getCredentials(): Promise<SetupCredentialsInput> {
    const { result, errors } = await getFedexCredentials()
      .run({
        input: {}
      })

    if ((errors && errors.length > 0)) {
      this.logger_.error("Error getting FedEx credentials:" + JSON.stringify(errors, null, 2))
    }

    // If not provided in the admin we use from the options
    if (!result || !result.account_number || !result.client_id || !result.client_secret) {
      return {
        client_id: this.options_.clientId,
        client_secret: this.options_.clientSecret,
        account_number: this.options_.accountNumber,
        is_sandbox: this.options_.isSandbox,
        enable_logs: this.options_.enableLogs,
        weight_unit_of_measure: this.options_.weightUnitOfMeasure as ("LB" | "KG"),
        is_enabled: this.options_.isEnabled
      }
    }

    return result
  }

  /**
   * Get the base URL for the FedEx API.
   * @param isSandbox - Whether to use the sandbox environment.
   * @returns The base URL for the FedEx API.
   */
  getBaseUrl(isSandbox: boolean): string {
    return isSandbox
      ? "https://apis-sandbox.fedex.com"
      : "https://apis.fedex.com"
  }

  /**
   * Check if the FedEx provider can calculate shipping rates.
   * @returns {Promise<boolean>}
   */
  async canCalculate(): Promise<boolean> {
    const credentials = await this.getCredentials()
    return credentials.is_enabled && !!(credentials.client_id && credentials.client_secret && credentials.account_number)
  }

  /**
   * Get fulfillment options from the FedEx API.
   * @returns {Promise<FulfillmentOption[]>}
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    try {
      return Object.entries(fedexMapping).map(([key, value]) => ({
        id: value,
        carrier_code: value,
        carrier_name: key,
        service_code: value,
        name: key,
      }))
    } catch (error) {
      this.logger_.error("Error getting FedEx fulfillment options:", error)
      throw new Error("Failed to retrieve FedEx fulfillment options")
    }
  }

  /**
   * Calculate shipping price using FedEx API.
   * @param optionData - The shipping option data.
   * @param data - The shipping data.
   * @param context - The context for the shipping request.
   * @returns The calculated shipping price.
   */
  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const credentials = await this.getCredentials()
    const baseUrl = this.getBaseUrl(credentials.is_sandbox)

    const token = await getAuthToken(
      baseUrl,
      credentials.client_id,
      credentials.client_secret
    )

    const accountNumber = credentials.account_number

    if (!context.items || context.items.length === 0) {
      throw new Error("Cart is empty")
    }

    // Validate customer address
    if (!context.shipping_address) {
      throw new Error("Missing shipping address in context")
    }

    if (!context.shipping_address.province) {
      throw new Error("Missing shipping address province in context")
    }

    if (!context.shipping_address.postal_code) {
      throw new Error("Missing shipping address postal code in context")
    }

    if (!context.shipping_address.country_code) {
      throw new Error("Missing shipping address country code in context")
    }

    // Validate store address
    if (!context.from_location) {
      throw new Error("Missing store address in context")
    }

    if (!context.from_location.address) {
      throw new Error("Missing store address in context")
    }

    if (!context.from_location.address.province) {
      throw new Error("Missing store address state in context")
    }

    if (!context.from_location.address.postal_code) {
      throw new Error("Missing store address zip in context")
    }

    if (!context.from_location.address.country_code) {
      throw new Error("Missing store address country in context")
    }

    const originAddress: FedexAddress = {
      stateOrProvinceCode: context.from_location.address.province,
      postalCode: context.from_location.address.postal_code,
      countryCode: context.from_location.address.country_code,
    }

    const destinationAddress: FedexAddress = {
      stateOrProvinceCode: context.shipping_address.province,
      postalCode: context.shipping_address.postal_code,
      countryCode: context.shipping_address.country_code,
    }

    const items: FedexRateRequestItem[] = context.items.map(
      (item: CartLineItemDTO & { variant?: ProductVariantDTO }) => ({
        weight: {
          units: credentials.weight_unit_of_measure,
          value: item.variant?.weight ? item.variant.weight : 1,
        },
      })
    )

    const rates: FedexShippingRate[] = await getShippingRates(
      baseUrl,
      token,
      accountNumber,
      originAddress,
      destinationAddress,
      items,
      credentials.enable_logs ? this.logger_ : undefined
    )

    // Find matching rate
    const rate = rates.find((r) => r.code === optionData.service_code)

    if (!rate) {
      this.logger_.error(
        "FedEx rate quote response missing expected rate data"
      )
      throw new Error("FedEx rate quote response missing expected rate data")
    }

    return {
      calculated_amount: rate.price!,
      is_calculated_price_tax_inclusive: true,
    }
  }

  /**
   * Validate the fulfillment data for a given shipping option.
   * @returns A promise that resolves to a boolean indicating whether the fulfillment data is valid.
   */
  async validateFulfillmentData(
  ): Promise<boolean> {
    // Nothing to review and approve for now
    return Promise.resolve(true)
  }

  /**
   * Create a fulfillment for a given order.
   * @param data - The fulfillment data.
   * @param items - The line items to fulfill.
   * @param order - The order to fulfill.
   * @param fulfillment - The fulfillment information.
   * @returns A promise that resolves to the fulfillment result.
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<
      Omit<FulfillmentDTO, "provider_id" | "data" | "items">
    >
  ): Promise<CreateFulfillmentResult> {
    const credentials = await this.getCredentials()
    const baseUrl = this.getBaseUrl(credentials.is_sandbox)

    const token = await getAuthToken(
      baseUrl,
      credentials.client_id,
      credentials.client_secret
    )

    const accountNumber = credentials.account_number

    try {
      const locationId = fulfillment.location_id

      if (!locationId) {
        this.logger_.error("FedEx create fulfillment failed: Missing location ID")
        throw new Error("FedEx create fulfillment failed: Missing location ID")
      }

      const { result } = await createFedexShipmentWorkflow().run({
        input: {
          token,
          baseUrl,
          accountNumber,
          locationId,
          data,
          items,
          order,
          fulfillment,
          debug: credentials.enable_logs,
          weightUnitOfMeasure: credentials.weight_unit_of_measure!
        }
      });

      return result.shipment;
    } catch (error) {
      this.logger_.error(`FedEx create fulfillment failed: ${error.message}`)
      throw new Error(`FedEx create fulfillment failed: ${error.message}`)
    }
  }
}

export default FedexProviderService
