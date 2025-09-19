import { Logger } from "@medusajs/framework/types";
import { FedexAddress, FedexContact, FedexRateRequestItem, FedexShipmentResponse } from "./types";

/**
 * Creates a FedEx shipment fulfillment by sending a request to the FedEx API.
 *
 * @param baseUrl - The base URL of the FedEx API.
 * @param token - The Bearer token used for authentication with the FedEx API.
 * @param accountNumber - The FedEx account number to be used for the shipment.
 * @param origin - The origin address for the shipment, conforming to the FedexAddress type.
 * @param destination - The destination address for the shipment, conforming to the FedexAddress type.
 * @param items - An array of items to be shipped, each conforming to the FedexRateRequestItem type.
 * @param shippingMethod - The FedEx shipping method/service type to be used (e.g., "FEDEX_GROUND").
 * @param logger - (Optional) Logger instance for logging debug and error information.
 * @returns A promise that resolves to a FedexShipmentResponse object containing the tracking number, tracking URL, and label URL.
 * @throws Will throw an error if the FedEx API request fails or returns a non-OK response.
 */
export const createFulfillment = async (
    baseUrl: string,
    token: string,
    accountNumber: string,
    origin: FedexAddress,
    originContact: FedexContact,
    destination: FedexAddress,
    destinationContact: FedexContact,
    items: FedexRateRequestItem[],
    shippingMethod: string,
    logger?: Logger | Console
): Promise<FedexShipmentResponse> => {
    const shipmentPayload = {
        accountNumber: { value: accountNumber },
        labelResponseOptions: "URL_ONLY",
        requestedShipment: {
            shipper: {
                address: origin,
                contact: originContact,
            },
            recipients: [
                {
                    address: destination,
                    contact: destinationContact,
                }
            ],
            pickupType: "DROPOFF_AT_FEDEX_LOCATION",
            packagingType: "YOUR_PACKAGING",
            requestedPackageLineItems: items,
            serviceType: shippingMethod,
            shipTimestamp: new Date().toISOString(),
            labelSpecification: {
                imageType: "PDF",
                labelStockType: "PAPER_4X6",
                labelFormatType: "COMMON2D",
                labelRotation: "NONE"
            },
            shippingChargesPayment: {
                paymentType: "SENDER",
                payor: {
                    responsibleParty: {
                        accountNumber: { value: accountNumber },
                    },
                },
            },
        },
    };

    if (logger) {
        logger.log(
            `FedEx create shipment payload: ${JSON.stringify(shipmentPayload, null, 2)}`
        );
    }

    const response = await fetch(`${baseUrl}/ship/v1/shipments`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-account-number": accountNumber,
        },
        body: JSON.stringify(shipmentPayload),
    });

    if (!response.ok) {
        const text = await response.text();
        if (logger) {
            logger.error(`FedEx create shipment failed [${response.status}]: ${text}`);
        }
        throw new Error(`FedEx create shipment failed: ${response.statusText}`);
    }
    const result = await response.json();

    if (logger) {
        logger.log(
            `FedEx create shipment response: ${JSON.stringify(result, null, 2)}`
        );
    }

    const shipmentDetail = result.output?.transactionShipments?.[0] || {};

    const trackingNumber = shipmentDetail.masterTrackingNumber || null;
    const firstPiece = shipmentDetail.pieceResponses?.[0];
    const firstDoc   = firstPiece?.packageDocuments?.[0];
    const labelUrl   = firstDoc?.url || null;
    const trackingUrl = trackingNumber
        ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
        : "";

    return {
        trackingNumber,
        trackingUrl,
        labelUrl,
    };
};
