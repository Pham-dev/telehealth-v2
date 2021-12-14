import React, { createContext, useCallback, useState } from 'react';
import { SyncClient } from 'twilio-sync';

type SyncContextType = {
  connect: (token: string) => void;
}

export const SyncContext = createContext<SyncContextType>(null);

export const SyncProvider: React.FC = ({children}) => {
  const [syncClient, setSyncClient] = useState<SyncClient>(null);

  const connect = useCallback((token :string) => {
    const newSyncClient = new SyncClient(token);
    // @ts-ignore
    window.syncClient = newSyncClient;
    setSyncClient(newSyncClient);
  }, []);

  return (
    <SyncContext.Provider value={{connect}} >
      {children}
    </SyncContext.Provider>
  );
}