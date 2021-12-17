import React from "react";
import OnDemandProvider from "../Base/OnDemandProvider";
import { SyncProvider } from "../Base/SyncProvider";
import composeProviders from "../ComposeProviders/ComposeProviders";

const Providers = composeProviders(
  OnDemandProvider,
  SyncProvider,
)

export function OnDemandLayout(props: React.PropsWithChildren<{}>) {
  return (
    <Providers>
      {props.children}
    </Providers>
  );
}

export default OnDemandLayout;