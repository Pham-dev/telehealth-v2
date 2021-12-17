import React, { useEffect, useState } from 'react';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import {
  AudioVideoCard,
  ContentManagementCard,
  InviteCard,
  Layout,
  PatientQueueCard,
} from '../../../components/Provider';
import { NextPatientCard } from '../../../components/Provider/NextPatientCard';
import { TelehealthVisit, TwilioPage } from '../../../types';
import ProviderVideoContextLayout from '../../../components/Provider/ProviderLayout';
import datastoreService from '../../../services/datastoreService';
import { EHRContent } from '../../../types';
import { useVisitContext } from '../../../state/VisitContext';
import useSyncContext from '../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import { Uris } from '../../../services/constants';
import { SyncMapItem } from 'twilio-sync';
import { reference } from '@popperjs/core';

const DashboardPage: TwilioPage = () => {
  
  const { getAudioAndVideoTracks } = useVideoContext();
  const [ mediaError, setMediaError] = useState<Error>();
  const [ visitNext, setVisitNext ] = useState<TelehealthVisit>();
  const [ visitQueue, setVisitQueue ] = useState<TelehealthVisit[]>([]);
  const [ onDemandQueue, setOnDemandQueue ] = useState<TelehealthVisit[]>([]);
  const [ contentAssigned, setContentAssigned ] = useState<EHRContent>();
  const [ contentAvailable, setContentAvailable ] = useState<EHRContent[]>([]);
  const { user } = useVisitContext();
  const { connect: syncConnect, syncClient, onDemandMap } = useSyncContext();

  // Gets Sync token to utilize Sync API prior to video room
  useEffect(() => {
    fetch(Uris.get(Uris.visits.token), {
      method: 'POST',
      body: JSON.stringify({ action: "SYNC" }),
      headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
    }).then(async r => {
      const syncToken = await r.json();
      syncConnect(syncToken.token);
    })
  }, [syncConnect]);

  useEffect(() => {
    if (!mediaError) {
      getAudioAndVideoTracks().catch(error => {
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, mediaError]);

  useEffect(() => {
    datastoreService.fetchAllTelehealthVisits(user)
      .then(tv => {
        setVisitQueue(tv);
        setVisitNext(tv[0]);
        //console.log('NEXT VISIT IS', visitNext);
      });

    datastoreService.fetchAllContent(user)
      .then(cArray => {         
        setContentAvailable(cArray);
        setContentAssigned(cArray.find((c) => {
          c.provider_ids.some(e => e === user.id);
        }));
      });
  }, [user]);

  useEffect(() => {
    console.log(onDemandMap);
    const itemAdded = (item: SyncMapItem) => {
      console.log("itemAdded: ", item);
    };
    const itemUpdated = (item: SyncMapItem) => {
      // @ts-ignore
      console.log("itemUpdated: ", item.item);
      // @ts-ignore
      const onDemandVisit = {
        id: "a4000000",
        visitDateTime: new Date(),
        roomName: "Hello World",
        ehrPatient: {
          name: "Sean Jackson",
          id: "a4000000",
          phone: "5101234567",
          gender: "male"
        },
        ehrAppointment: {
          id: "a4000000",
          type: "appointment",
          reason: "I broke my femur",
          references: ["hello"],
          patient_id: "a4000000",
          provider_id: "d1000",
          start_datetime_ltz: new Date(),
        }
      } as TelehealthVisit
      setOnDemandQueue(prev => [...prev, onDemandVisit]);
    };
    if (syncClient && onDemandMap) {
      onDemandMap.on('itemAdded', itemAdded);
      onDemandMap.on('itemUpdated', itemUpdated);
      return () => {
        onDemandMap.off('itemAdded', itemAdded);
        onDemandMap.off('itemUpdated', itemUpdated);
      }
    }
  }, [onDemandMap]);

  return (
    <Layout>
      <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1" >
        <div>
          {visitNext && (<NextPatientCard className="my-2" visitNext={visitNext} />)}
          <InviteCard />
        </div>
        <div>
          <PatientQueueCard className="my-2" onDemandQueue={onDemandQueue} visitQueue={visitQueue} />
          <ContentManagementCard className="my-2" contentAssigned={contentAssigned} contentAvailable={contentAvailable}/>
        </div>
        <div className="order-first lg:order-last">
          <AudioVideoCard />
        </div>
      </div>
    </Layout>
  );
};
 
DashboardPage.Layout = ProviderVideoContextLayout;
export default DashboardPage;
