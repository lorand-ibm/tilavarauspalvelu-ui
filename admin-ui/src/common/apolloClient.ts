import {
  ApolloClient,
  ApolloLink,
  fromPromise,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import {
  getAccessToken,
  getApiAccessToken,
  updateApiAccessToken,
} from "./auth/util";
import { apiBaseUrl } from "./const";

const getNewToken = (): Promise<string> => {
  const accessToken = getAccessToken();
  if (accessToken) {
    return updateApiAccessToken(accessToken);
  }

  return Promise.reject(new Error("no access token available!"));
};

const httpLink = new HttpLink({
  uri: `${apiBaseUrl}/graphql/`,
});

const authLink = setContext((ignore, { headers }) => {
  const token = getApiAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// eslint-disable-next-line consistent-return
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    const hasAuthError = Boolean(
      // TODO is this correct indicator !?
      graphQLErrors.find((e) => e.message.indexOf("AnonymousUser") !== -1)
    );

    if (hasAuthError) {
      return fromPromise(
        getNewToken().catch(() => {
          // TODO Handle token refresh error
          return null;
        })
      )
        .filter((value) => Boolean(value))
        .flatMap((accessToken) => {
          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${accessToken}`,
            },
          });

          return forward(operation);
        });
    }
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([errorLink, authLink, httpLink]),
});

export default client;