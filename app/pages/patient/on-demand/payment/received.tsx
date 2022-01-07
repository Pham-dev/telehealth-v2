import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { Layout } from '../../../../components/Patient';
import { useRouter } from 'next/router';
import { Uris } from '../../../../services/constants';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';
import datastoreService from '../../../../services/datastoreService';
import { EHRAppointment, EHRPatient } from '../../../../types';
import Image from 'next/image';
import clientStorage from '../../../../services/clientStorage';
import { HealthInfo, HEALTH_INFO_KEY, PatientInfo, PATIENT_INFO_KEY } from '../../../../constants';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';

/* 
* After landing on this page, a visitId should be created from EHR
* - Payment is valid, and POST request sent to EHR
* - EHR sends back a visitId
* - This page creats a token with the visitId attached
**/
const PaymentReceivedPage = () => {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [appToken, setAppToken] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [appt, setAppt] = useState<EHRAppointment>(null);
  const { syncClient, syncToken, onDemandStream } = useSyncContext();
  
  const publishOnDemandVisit = useCallback(
    async (token: string) => {
      try {      
        const [patientInfo, healthInfo] = await Promise.all([
          clientStorage.getFromStorage(PATIENT_INFO_KEY),
          clientStorage.getFromStorage(HEALTH_INFO_KEY)
        ]) as [PatientInfo, HealthInfo];

        const ehrPatient: EHRPatient = {
          name: patientInfo.lastName,
          family_name: patientInfo.lastName,
          given_name: patientInfo.firstName,
          phone: patientInfo.phoneNumber,
          gender: patientInfo.gender
        }

        // combine calls to reduce latency time
        const [provider, patient] = await Promise.all([
          datastoreService.fetchProviderOnCall(token),
          datastoreService.addPatient(token, ehrPatient)
        ]);
        const appointment: EHRAppointment = {
          provider_id: provider.id,
          patient_id: patient.id,
          reason: healthInfo.reason,
          references: [],
        }
        setAppt(appointment);
      } catch(err) {
        console.log(err);
        router.push('/patient/on-demand/info');
      }
    }, [router]);

  // The values in this fetch statement will be gathered from EHR integration
  useEffect(() => {
    fetch(Uris.get(Uris.visits.token), {
      method: 'POST',
      body: JSON.stringify({
        role: "patient",
        action: "PATIENT",
        id: "p1000000",
        visitId: "a1000000" // should be generated from EHR
      }),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(async token => {
      const resolvedToken = await token.json();
      setAppToken(resolvedToken.token);
      setPasscode(resolvedToken.passcode);
    }).catch(err => {
      setIsError(true);
      new Error(err);
    })
  }, [syncToken]);

  useEffect(() => {
    if (appToken) {
      publishOnDemandVisit(appToken);
    }
  }, [appToken, publishOnDemandVisit]);

  // Will need to change this to real data get call.
  useEffect(() => {
    console.log("HEELOL @")
    console.log(syncClient && onDemandStream && appt && syncToken && appToken)
    if (syncClient && onDemandStream && appt && syncToken && appToken) {
      console.log("hello")
      onDemandStream.publishMessage({
        appointment: appt,
        patientSyncToken: syncToken,
      })
      .then(async message => {
        //@ts-ignore
        await datastoreService.addAppointment(appToken, message.data.appointment);
        setIsReady(true);
      })
      .catch(error => {
        console.error('Stream publishMessage() failed', error);
      });
      console.log(passcode, isReady)
    }
  }, [appToken, appt, isReady, onDemandStream, passcode, syncClient, syncToken])


  // No check needed because the payment is already validated
  const enterWaitingRoom = () => {
    router.push(`/patient?token=${passcode}`);
  }

  return (
    <Layout>
      <Alert
        title="Payment Received"
        icon={<Image alt="Payment Success" src="/icons/payment-success.svg" height={98} width={135} />}
        contentBeforeIcon
        content={
          <>
            <p className="mb-6">
              We’ve received your payment information, and will be using it to
              process this visit. {!isReady && 'Please wait while we process your appointment.'}
            </p>
          </>
        }
      />
      <div className="my-5 mx-auto max-w-[250px] w-full">
        {passcode && isReady ? 
            <Button type="submit" disabled={isError} className="w-full" onClick={enterWaitingRoom}>
              Connect to Waiting Room
            </Button> :
            <LoadingSpinner/>
        }
      </div>
    </Layout>
  );
};

PaymentReceivedPage.Layout = OnDemandLayout;
export default PaymentReceivedPage;
