import React, { useEffect, useState } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { Layout } from '../../../../components/Patient';
import { useRouter } from 'next/router';
import { Uris } from '../../../../services/constants';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';

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
  const { syncClient, onDemandMap } = useSyncContext();

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
  }, []);

  // Will need to change this to real data get call.
  useEffect(() => {
    if (syncClient && onDemandMap) {
      onDemandMap.set('p4000000', {
          "resourceType": "Appointment",
          "id": "a4000000",
          "status": "booked",
          "appointmentType": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v2-0276",
                "code": "ROUTINE"
              }
            ]
          },
          "reasonCode": [
            {
              "text": "I think I twiseted my ankle earlier this week when I jumped down some stairs but I can't tell, I attached a photo"
            }
          ],
          "supportingInformation": [
            {
              "reference": "datastore/images/a1000000-ankle.png"
            }
          ],
          "start": "2021-01-01T17:00:00Z",
          "end": "2021-01-01T17:30:00Z",
          "participant": [
            {
              "actor": {
                "reference": "Patient/p4000000"
              }
            },
            {
              "type": [
                {
                  "coding": [
                    {
                      "system": "http://hl7.org/fhir/ValueSet/encounter-participant-type",
                      "code": "ATND"
                    }
                  ]
                }
              ],
              "actor": {
                "reference": "Practitioner/d1000"
              }
            }
          ]
      }, { ttl: 14400})
      .then(item => {
        console.log('Map SyncMapItem set() successful, item data:', item.data);
      })
      .catch((error) => {
        console.error('Map SyncMapItem set() failed', error);
      });
    }
  }, [onDemandMap, syncClient])


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

export default PaymentReceivedPage;
PaymentReceivedPage.Layout = OnDemandLayout;
