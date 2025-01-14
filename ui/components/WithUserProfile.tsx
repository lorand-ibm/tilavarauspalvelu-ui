import React from "react";
import { isBrowser, authEnabled } from "../modules/const";
import { UserProfile } from "../modules/types";

function withUserProfile<TProps>(
  wrappedComponent: React.ComponentType<TProps>
) {
  return function New(props: TProps): JSX.Element {
    // eslint-disable-next-line
    wrappedComponent.displayName =
      wrappedComponent.displayName || wrappedComponent.name || "Component";
    const WrappedComponent = wrappedComponent;

    if (!isBrowser || !authEnabled) {
      return <WrappedComponent {...props} />;
    }

    const WithOidc = require("./common/WithOidc").default;

    return (
      <WithOidc
        render={({ profile }: { profile: UserProfile | null }) => (
          <WrappedComponent profile={profile} {...props} />
        )}
      />
    );
  };
}

export default withUserProfile;
