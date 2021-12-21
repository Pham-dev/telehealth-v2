import React, { useEffect, useState } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { Layout } from '../../../../components/Patient';
import { useRouter } from 'next/router';
import { Uris } from '../../../../services/constants';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';
import useOnDemandContext from '../../../../components/Base/OnDemandProvider/useOnDemandContext/useOnDemandContext';
import datastoreService from '../../../../services/datastoreService';
import { EHRAppointment, EHRPatient } from '../../../../types';

/* 
* After landing on this page, a visitId should be created from EHR
* - Payment is valid, and POST request sent to EHR
* - EHR sends back a visitId
* - This page creats a token with the visitId attached
**/
const PaymentReceivedPage = () => {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string>();
  const [isError, setIsError] = useState<boolean>(false);
  const { syncClient, syncToken, onDemandStream } = useSyncContext();
  const [appt, setAppt] = useState<EHRAppointment>(null);
  const { 
    firstName,
    lastName,
    phoneNumber,
    gender,
    reasonForVisit,
    preExistingConditions
   } = useOnDemandContext();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const publishOnDemandVisit = async () => {
    const ehrPatient: EHRPatient = {
      name: lastName,
      family_name: lastName,
      given_name: firstName,
      phone: phoneNumber,
      gender: gender
    }
    // combine calls to reduce latency time
    const [provider, patient] = await Promise.all([
      datastoreService.fetchProviderOnCall(syncToken),
      datastoreService.addPatient(syncToken, ehrPatient)
    ]);
    const appointment: EHRAppointment = {
      provider_id: provider.id,
      patient_id: patient.id,
      reason: reasonForVisit,
      references: [],
    }
    setAppt(appointment);
  }

  // The values in this fetch statement will be gathered from EHR integration
  useEffect(() => {
    fetch(Uris.get(Uris.visits.token), {
      method: 'POST',
      body: JSON.stringify({
        role: "patient",
        action: "PATIENT",
        id: "a1000000",
        visitId: "p1000000" // should be generated from EHR
      }),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    .then(async token => {
      const resolvedToken = await token.json();
      setPasscode(resolvedToken.passcode);
    }).catch(err => {
      setIsError(true);
      new Error(err);
    })
  }, [syncToken]);

  useEffect(() => {
    publishOnDemandVisit();
  }, []);

  // Will need to change this to real data get call.
  useEffect(() => {
    if (syncClient && onDemandStream && appt && syncToken) {
      onDemandStream.publishMessage({
        appointment: appt,
        patientSyncToken: syncToken,
      })
        .then(message => {
          console.log('Stream publishMessage() successful, message SID:', message);
        })
        .catch(error => {
          console.error('Stream publishMessage() failed', error);
        })
    }
  }, [appt, onDemandStream, syncClient, syncToken])


  // No check needed because the payment is already validated
  const enterWaitingRoom = () => {
    router.push(`/patient?token=${passcode}`);
  }

  return (
    <Layout>
      <Alert
        title="Payment Received"
        icon={<img src="/icons/payment-success.svg" height={98} width={135} />}
        contentBeforeIcon
        content={
          <>
            <p className="mb-6">
              We’ve received your payment information, and will be using it to
              process this visit.
            </p>
          </>
        }
      />
      <div className="my-5 mx-auto max-w-[250px] w-full">
        {passcode && 
          <Button type="submit" disabled={isError} className="w-full" onClick={enterWaitingRoom}>
            Connect to Waiting Room
          </Button>
        }
      </div>
    </Layout>
  );
};

PaymentReceivedPage.Layout = OnDemandLayout;
export default PaymentReceivedPage;
