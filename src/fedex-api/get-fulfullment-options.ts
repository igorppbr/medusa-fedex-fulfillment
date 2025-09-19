import { Logger } from "@medusajs/framework/types"
import { FedexShippingRate } from "./types"

/**
 * Get the FedEx fulfillment options. This method is not in use at the moment but can be used to retrieve real time (online) options that are available.
 * @param token - The FedEx API authentication token.
 * @param baseUrl - The base URL for the FedEx API.
 * @param accountNumber - The FedEx account number.
 * @param logger - The logger instance.
 * @returns The FedEx fulfillment options.
 */
export const getFulfillmentOptions = async (
    token: string,
    baseUrl: string,
    accountNumber: string,
    logger?: Logger,
    weightUnitOfMeasure: "LB" | "KG" = "LB"
): Promise<FedexShippingRate[]> => {
    const options: FedexShippingRate[] = []

    // 1. Build a minimal "dummy" shipment
    const body = {
        accountNumber: {
            value: accountNumber,
        },
        rateRequestControlParameters: {
            returnTransitTimes: false,
        },
        requestedShipment: {
            shipper: {
                address: {
                    stateOrProvinceCode: "FL",
                    postalCode: "33064",
                    countryCode: "US",
                },
            },
            recipient: {
                address: {
                    stateOrProvinceCode: "FL",
                    postalCode: "33442",
                    countryCode: "US",
                },
            },
            pickupType: "DROPOFF_AT_FEDEX_LOCATION",
            packagingType: "YOUR_PACKAGING",
            rateRequestType: ["ACCOUNT", "LIST"],
            requestedPackageLineItems: [
                {
                    weight: {
                        units: weightUnitOfMeasure,
                        value: 1,
                    },
                },
            ],
        },
    }

    if (logger) {
        logger.debug(
            "FedEx API Request: " +
            JSON.stringify({
                url: `${baseUrl}/rate/v1/rates/quotes`,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-locale": "en_US",
                    "X-account-number": accountNumber,
                },
                body: JSON.stringify(body),
            }, null, 2)
        )
    }

    // 2. Hit the Rate & Transit Times API
    const resp = await fetch(`${baseUrl}/rate/v1/rates/quotes`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-locale": "en_US",
            "X-account-number": accountNumber,
        },
        body: JSON.stringify(body),
    })

    if (!resp.ok) {
        const text = await resp.text()
        if (logger) {
            logger.error(`FedEx rates/quotes failed [${resp.status}]: ${text}`)
        }
        throw new Error(`FedEx rates/quotes failed: ${resp.statusText}`)
    }

    const json = await resp.json()
    const details = Array.isArray(json.output?.rateReplyDetails)
        ? json.output.rateReplyDetails
        : []

    if (logger) {
        logger.debug("FedEx API Response: \n" + JSON.stringify(details, null, 2))
    }

    // 3. Map each serviceType into your FulfillmentOption shape
    // Remove duplicates by serviceType
    const unique = new Map<string, any>()
    for (const d of details) {
        if (!unique.has(d.serviceType)) {
            unique.set(d.serviceType, d)
        }
    }

    // Return mapped options
    for (const [serviceType, detail] of unique.entries()) {
        options.push({
            code: serviceType,
            name: detail.serviceName,
        })
    }

    return options
}
