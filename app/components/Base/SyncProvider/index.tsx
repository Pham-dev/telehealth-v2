import React, { createContext, useCallback, useEffect, useState } from 'react';
import { SyncClient, SyncStream } from 'twilio-sync';
import { useVisitContext } from '../../../state/VisitContext';

type SyncContextType = {
  connect: (token: string) => void;
  syncClient: SyncClient;
}

export const SyncContext = createContext<SyncContextType>(null);

export const SyncProvider: React.FC = ({children}) => {
  const [syncClient, setSyncClient] = useState<SyncClient>(null);
  const [syncStream, setSyncStream] = useState<SyncStream>(null);
  // const { syncToken } = useSyncToken();
  const { visit, user } = useVisitContext();

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
    
  }, [user, visit]);

  // useEffect(() => {
  //   console.log(syncClient);
  //   if (syncClient && visit) {
  //     console.log(syncClient)
  //     syncClient.stream(visit.id)
  //       .then(stream => {
  //         console.log(stream);
  //         setSyncStream(stream);
  //       }).catch(err => {
  //         console.log(err);
  //       })
  //   }
  // },[syncClient, visit]);

  return (
    <SyncContext.Provider value={{connect, syncClient}} >
      {children}
    </SyncContext.Provider>
  );
}