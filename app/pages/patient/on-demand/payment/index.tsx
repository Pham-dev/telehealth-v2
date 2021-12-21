import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../../components/Heading';
import {
  InsuranceForm,
  Layout,
  UploadInsurance,
} from '../../../../components/Patient';
import { PaymentForm } from '../../../../components/Patient/PaymentForm';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import { Uris } from '../../../../services/constants';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';
import useOnDemandContext from '../../../../components/Base/OnDemandProvider/useOnDemandContext/useOnDemandContext';

const PaymentPage = () => {
  const router = useRouter();
  const [enterManually, setEnterManually] = useState(false);
  const { connect: syncConnect } = useSyncContext();

  // Initialize the Sync Client prior to reduce backend API calls latency
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

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <Heading>Payment</Heading>
        <p className="mt-2 mb-7 text-center text-dark">
          The price only indicates the price of the visit, not the price of any
          medication or treatment prescribed.
        </p>
        <p>Your cost for this visit:</p>
        <Heading>$72.00</Heading>
        <PaymentForm/>
      </div>
    </Layout>
  );
};

PaymentPage.Layout = OnDemandLayout;
export default PaymentPage;
