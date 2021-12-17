import React, { createContext, useCallback, useEffect, useState } from 'react';
import { SyncClient, SyncMap, SyncStream } from 'twilio-sync';

type SyncContextType = {
  connect: (token: string) => void;
  syncClient: SyncClient;
  onDemandMap: SyncMap;
}

export const SyncContext = createContext<SyncContextType>(null);

export const SyncProvider: React.FC = ({children}) => {
  const [syncClient, setSyncClient] = useState<SyncClient>(null);
  const [syncStream, setSyncStream] = useState<SyncStream>(null);
  const [onDemandMap, setOnDemandMap] = useState<SyncMap>(null);

  const connect = useCallback((token :string) => {
    try {
      const newSyncClient = new SyncClient(token);
      console.log(newSyncClient);
      // @ts-ignore
      window.syncClient = newSyncClient;
      setSyncClient(newSyncClient);
    } catch (err) {
      throw new Error('Error invalid token: ', err);
    }
    
  }, []);

  useEffect(() => {
    if (syncClient) {
      syncClient.map('MyMap')
        .then(onDemandMap => {
          setOnDemandMap(onDemandMap);
        })
    }
  }, [syncClient])

  return (
    <SyncContext.Provider value={{connect, syncClient, onDemandMap}} >
      {children}
    </SyncContext.Provider>
  );
}