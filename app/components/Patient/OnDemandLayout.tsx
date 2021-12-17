import React, { useEffect, useState } from "react";
import { SyncProvider } from "../Base/SyncProvider";
import useSyncContext from "../Base/SyncProvider/useSyncContext/useSyncContext";
import composeProviders from "../ComposeProviders/ComposeProviders";

const Providers = composeProviders(
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