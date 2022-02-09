import axios from "axios";
import { isBrowser } from "../const";

const oidcClientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
const oidcUrl = process.env.NEXT_PUBLIC_OIDC_URL;
const apiScope = process.env.NEXT_PUBLIC_TILAVARAUS_API_SCOPE;

export const getApiAccessToken = (): string | null =>
  isBrowser && sessionStorage.getItem(`oidc.apiToken.${apiScope}`);

const setApiAccessToken = (accessToken: string) =>
  isBrowser && sessionStorage.setItem(`oidc.apiToken.${apiScope}`, accessToken);

export const getAccessToken = (): string | null => {
  const key = `oidc.user:${oidcUrl}/:${oidcClientId}`;
  const data = isBrowser && sessionStorage.getItem(key);

  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.access_token;
    } catch (Exception) {
      return undefined;
    }
  }
  return undefined;
};

export const updateApiAccessToken = async (
  accessToken: string | undefined
): Promise<string | null> => {
  console.log("refreshing api access token");
  if (!accessToken) {
    throw new Error("Api access token not available. Cannot update");
  }
  if (!apiScope) {
    throw new Error("Application configuration error, illegal api scope.");
  }
  try {
    const response = await axios.request({
      responseType: "json",
      method: "POST",
      url: `${oidcUrl}/api-tokens/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { data } = response;

    const apiAccessToken = data[apiScope];
    setApiAccessToken(apiAccessToken);

    console.log("returning new api access token", data);
    return apiAccessToken;
  } catch (e) {
    console.log("could not get bew token returning new api access token", e);
  }
  return null;
};
