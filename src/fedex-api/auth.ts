/**
 * Get the FedEx authentication token.
 * @param baseUrl - The base URL for the FedEx API.
 * @param clientId - The FedEx client ID.
 * @param clientSecret - The FedEx client secret.
 * @returns The FedEx authentication token.
 */
export const getAuthToken = async (
    baseUrl: string,
    clientId: string,
    clientSecret: string,
): Promise<string> => {
    const authUrl = `${baseUrl}/oauth/token`;

    if (!clientId) {
        throw new Error("FedEx client ID is required in database settings");
    }
    if (!clientSecret) {
        throw new Error("FedEx client secret is required in database settings");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const response = await fetch(authUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error(`FedEx auth request failed: ${response.statusText}`);
    }

    const { access_token } = await response.json();

    return access_token;
};
