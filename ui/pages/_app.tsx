import React from "react";
import { appWithTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { format, isValid } from "date-fns";
import { AppProps } from "next/app";
import { fi } from "date-fns/locale";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../modules/apolloClient";
import SessionLost from "../components/common/SessionLost";
import PageWrapper from "../components/common/PageWrapper";
import { authEnabled, isBrowser, mockRequests } from "../modules/const";
import LoggingIn from "../components/common/LoggingIn";
import oidcConfiguration from "../modules/auth/configuration";
import nextI18NextConfig from "../next-i18next.config";
import "../styles/global.scss";
import { TrackingWrapper } from "../modules/tracking";
import { FullscreenSpinner } from "../components/common/FullscreenSpinner";
import { DataContextProvider } from "../context/DataContext";

if (mockRequests) {
  require("../mocks");
}

const AuthenticationProvider = dynamic(
  () =>
    // eslint-disable-next-line import/no-unresolved
    import("@axa-fr/react-oidc-context").then(
      (mod) => mod.AuthenticationProvider
    ),
  { ssr: false }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  if (!isBrowser) {
    return (
      <DataContextProvider>
        <ApolloProvider client={apolloClient}>
          <PageWrapper>
            <Component {...pageProps} />
          </PageWrapper>
        </ApolloProvider>
      </DataContextProvider>
    );
  }

  console.log(
    "initializing auth provider with config:",
    JSON.stringify(oidcConfiguration)
  );

  return (
    <AuthenticationProvider
      authenticating={FullscreenSpinner}
      notAuthenticated={SessionLost}
      sessionLostComponent={SessionLost}
      configuration={oidcConfiguration}
      isEnabled={authEnabled}
      callbackComponentOverride={LoggingIn}
    >
      <DataContextProvider>
        <TrackingWrapper>
          <ApolloProvider client={apolloClient}>
            <PageWrapper>
              <Component {...pageProps} />
            </PageWrapper>
          </ApolloProvider>
        </TrackingWrapper>
      </DataContextProvider>
    </AuthenticationProvider>
  );
}

export default appWithTranslation(MyApp, {
  ...nextI18NextConfig,
  interpolation: {
    format: (value, fmt, lng) => {
      const locales = { fi };
      if (value instanceof Date && isValid(value))
        return format(value, fmt || "d.M.yyyy", { locale: locales[lng] });
      return value;
    },
    escapeValue: false,
  },
});
