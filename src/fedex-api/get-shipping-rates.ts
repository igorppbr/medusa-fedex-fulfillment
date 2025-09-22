import { FedexAddress, FedexRateRequestItem, FedexShippingRate } from "./types";
import { Logger } from "@medusajs/framework/types";

// Define RateReplyDetail type if not already imported
type RateReplyDetail = {
  serviceType: string;
  serviceName: string;
  ratedShipmentDetails: { totalNetCharge: number }[];
  commit?: { transitDays?: { description?: string } };
};

/**
 * Get the FedEx shipping rates.
 * @param baseUrl - The base URL for the FedEx API.
 * @param token - The FedEx API authentication token.
 * @param accountNumber - The FedEx account number.
 * @param origin - The origin address.
 * @param destination - The destination address.
 * @param items - The list of items to ship.
 * @param logger - The logger instance.
 * @returns The FedEx shipping rates.
 */
export const getShippingRates = async (
    baseUrl: string,
    token: string,
    accountNumber: string,
    origin: FedexAddress,
    destination: FedexAddress,
    items: FedexRateRequestItem[],
    logger?: Logger
): Promise<FedexShippingRate[]> => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid items array");
    }

    const shipment = {
        accountNumber: {
            value: accountNumber,
        },
        rateRequestControlParameters: {
            returnTransitTimes: true,
        },
        requestedShipment: {
            shipper: {
                address: {
                    stateOrProvinceCode: origin.stateOrProvinceCode,
                    postalCode: origin.postalCode,
                    countryCode: origin.countryCode,
                },
            },
            recipient: {
                address: {
                    stateOrProvinceCode: destination.stateOrProvinceCode,
                    postalCode: destination.postalCode,
                    countryCode: destination.countryCode,
                },
            },
            pickupType: "DROPOFF_AT_FEDEX_LOCATION",
            packagingType: "YOUR_PACKAGING",
            rateRequestType: ["ACCOUNT", "LIST"],
            requestedPackageLineItems: items,
        },
    };

    if (logger) {
        logger.debug("FedEx rate quote request: \n" + JSON.stringify(shipment, null, 2));
    }

    const response = await fetch(`${baseUrl}/rate/v1/rates/quotes`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-locale": "en_US",
            "X-account-number": accountNumber,
        },
        body: JSON.stringify(shipment),
    });

    if (!response.ok) {
        if (logger) {
            logger.error(`FedEx rate quote request failed: ${response.statusText}`);
        }
        throw new Error(`FedEx rate quote request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (logger) {
        logger.debug("FedEx rate quote response: \n" + JSON.stringify(result, null, 2));
    }

    return Array.isArray(result.output?.rateReplyDetails)
    ? result.output.rateReplyDetails.map((r: RateReplyDetail) => {
        const rawTransit = r.commit?.transitDays?.description ?? "";

        return {
          code:              r.serviceType,
          name:              r.serviceName,
          price:             r.ratedShipmentDetails[0].totalNetCharge,
          estimatedDelivery: rawTransit
        };
      })
    : [];
};
