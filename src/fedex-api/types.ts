export type FedexShippingRate = {
    code: string;
    name: string;
    price?: number;
    estimatedDelivery?: string;
};

export type FedexAddress = {
    stateOrProvinceCode: string;
    postalCode: string;
    countryCode: string;
    city?: string;
    streetLines?: string[];
};

export type FedexContact = {
    personName: string;
    phoneNumber: string;
}

export type FedexRateRequestItem = {
    weight: {
        units: "LB" | "KG";
        value: number;
    };
    dimensions?: {
        length: number;
        width: number;
        height: number;
        units: "IN";
    };
    groupPackageCount?: number;
};

export type FedexShipmentResponse = {
    trackingNumber: string;
    trackingUrl: string;
    labelUrl: string;
}

export const fedexMapping: Record<string, string> = {
    "FedEx Ground": "FEDEX_GROUND",
    "FedEx Express Saver": "FEDEX_EXPRESS_SAVER",
    "FedEx 2Day": "FEDEX_2_DAY",
    "FedEx 2Day AM": "FEDEX_2_DAY_AM",
    "FedEx Standard Overnight": "STANDARD_OVERNIGHT",
    "FedEx Priority Overnight": "PRIORITY_OVERNIGHT",
    "FedEx First Overnight": "FIRST_OVERNIGHT",
    "FedEx International Economy": "INTERNATIONAL_ECONOMY",
    "FedEx International Priority": "INTERNATIONAL_PRIORITY",
    "FedEx International First": "INTERNATIONAL_FIRST",
    "FedEx International Ground": "INTERNATIONAL_GROUND",
    "FedEx Home Delivery": "FEDEX_HOME_DELIVERY",
    "FedEx SmartPost": "SMART_POST",
    "FedEx Freight Economy": "FEDEX_FREIGHT_ECONOMY",
    "FedEx Freight Priority": "FEDEX_FREIGHT_PRIORITY",
    "FedEx Freight Direct": "FEDEX_FREIGHT_DIRECT",
    "FedEx SameDay": "FEDEX_SAME_DAY",
    "FedEx SameDay City": "FEDEX_SAME_DAY_CITY",
    "FedEx Custom Critical": "FEDEX_CUSTOM_CRITICAL",
    "FedEx 1Day Freight": "FEDEX_1_DAY_FREIGHT",
    "FedEx 2Day Freight": "FEDEX_2_DAY_FREIGHT",
    "FedEx 3Day Freight": "FEDEX_3_DAY_FREIGHT",
    "FedEx Europe First International Priority": "EUROPE_FIRST_INTERNATIONAL_PRIORITY",
    "FedEx International Priority Freight": "INTERNATIONAL_PRIORITY_FREIGHT",
    "FedEx International Economy Freight": "INTERNATIONAL_ECONOMY_FREIGHT",
    "FedEx International Connect Plus": "INTERNATIONAL_CONNECT_PLUS",
    "FedEx International Priority Express": "INTERNATIONAL_PRIORITY_EXPRESS",
    "FedEx International Distribution Freight": "INTERNATIONAL_DISTRIBUTION_FREIGHT",
    "FedEx International Distribution Economy": "INTERNATIONAL_DISTRIBUTION_ECONOMY",
    "FedEx International Distribution Priority": "INTERNATIONAL_DISTRIBUTION_PRIORITY",
    "FedEx International Priority DirectDistribution": "INTERNATIONAL_PRIORITY_DIRECTDISTRIBUTION",
    "FedEx International Economy DirectDistribution": "INTERNATIONAL_ECONOMY_DIRECTDISTRIBUTION",
    "FedEx International MailService": "INTERNATIONAL_MAIL_SERVICE",
    "FedEx International Priority DirectDistribution Freight": "INTERNATIONAL_PRIORITY_DIRECTDISTRIBUTION_FREIGHT",
    "FedEx International Economy DirectDistribution Freight": "INTERNATIONAL_ECONOMY_DIRECTDISTRIBUTION_FREIGHT",
    "FedEx International Premium": "INTERNATIONAL_PREMIUM",
    "FedEx International Broker Select": "INTERNATIONAL_BROKER_SELECT",
    "FedEx International Controlled Export": "INTERNATIONAL_CONTROLLED_EXPORT",
    "FedEx International Controlled Import": "INTERNATIONAL_CONTROLLED_IMPORT",
    "FedEx International Next Flight": "INTERNATIONAL_NEXT_FLIGHT",
    "FedEx International Priority Overnight": "INTERNATIONAL_PRIORITY_OVERNIGHT",
    "FedEx International Priority Saturday Delivery": "INTERNATIONAL_PRIORITY_SATURDAY_DELIVERY",
    "FedEx International Economy Saturday Delivery": "INTERNATIONAL_ECONOMY_SATURDAY_DELIVERY",
    "FedEx International Priority Freight Saturday Delivery": "INTERNATIONAL_PRIORITY_FREIGHT_SATURDAY_DELIVERY",
    "FedEx International Economy Freight Saturday Delivery": "INTERNATIONAL_ECONOMY_FREIGHT_SATURDAY_DELIVERY",
    "FedEx International First Saturday Delivery": "INTERNATIONAL_FIRST_SATURDAY_DELIVERY",
    "FedEx International Priority Express Saturday Delivery": "INTERNATIONAL_PRIORITY_EXPRESS_SATURDAY_DELIVERY",
    "FedEx International Connect Plus Saturday Delivery": "INTERNATIONAL_CONNECT_PLUS_SATURDAY_DELIVERY",
    "FedEx International Distribution Freight Saturday Delivery": "INTERNATIONAL_DISTRIBUTION_FREIGHT_SATURDAY_DELIVERY",
    "FedEx International Distribution Economy Saturday Delivery": "INTERNATIONAL_DISTRIBUTION_ECONOMY_SATURDAY_DELIVERY",
    "FedEx International Distribution Priority Saturday Delivery": "INTERNATIONAL_DISTRIBUTION_PRIORITY_SATURDAY_DELIVERY",
    "FedEx International Priority DirectDistribution Saturday Delivery": "INTERNATIONAL_PRIORITY_DIRECTDISTRIBUTION_SATURDAY_DELIVERY",
    "FedEx International Economy DirectDistribution Saturday Delivery": "INTERNATIONAL_ECONOMY_DIRECTDISTRIBUTION_SATURDAY_DELIVERY",
    "FedEx International MailService Saturday Delivery": "INTERNATIONAL_MAIL_SERVICE_SATURDAY_DELIVERY",
    "FedEx International Priority DirectDistribution Freight Saturday Delivery": "INTERNATIONAL_PRIORITY_DIRECTDISTRIBUTION_FREIGHT_SATURDAY_DELIVERY",
    "FedEx International Economy DirectDistribution Freight Saturday Delivery": "INTERNATIONAL_ECONOMY_DIRECTDISTRIBUTION_FREIGHT_SATURDAY_DELIVERY",
    "FedEx International Premium Saturday Delivery": "INTERNATIONAL_PREMIUM_SATURDAY_DELIVERY",
    "FedEx International Broker Select Saturday Delivery": "INTERNATIONAL_BROKER_SELECT_SATURDAY_DELIVERY",
    "FedEx International Controlled Export Saturday Delivery": "INTERNATIONAL_CONTROLLED_EXPORT_SATURDAY_DELIVERY",
    "FedEx International Controlled Import Saturday Delivery": "INTERNATIONAL_CONTROLLED_IMPORT_SATURDAY_DELIVERY",
    "FedEx International Next Flight Saturday Delivery": "INTERNATIONAL_NEXT_FLIGHT_SATURDAY_DELIVERY",
    "FedEx International Priority Overnight Saturday Delivery": "INTERNATIONAL_PRIORITY_OVERNIGHT_SATURDAY_DELIVERY",
};
