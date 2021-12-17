import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../components/Heading';
import { HealthForm, Layout } from '../../../components/Patient';
import OnDemandLayout from '../../../components/Patient/OnDemandLayout';
import useOnDemandContext from '../../../components/Base/OnDemandProvider/useOnDemandContext/useOnDemandContext';

interface HealthFile {
  name: string;
  url?: string;
}

interface HealthFormValue {
  conditions: string;
  files?: HealthFile[];
  medications: string;
  reason: string;
}

const HealthFormPage = () => {
  const router = useRouter();
  const { 
    setPreExistingConditions,
    setReasonForVisit,
    setMedications,
  } = useOnDemandContext();
  return (
    <Layout>
      <Heading>About your health</Heading>
      <HealthForm
        onSubmit={(formValue: HealthFormValue) => {
          setPreExistingConditions(formValue.conditions);
          setReasonForVisit(formValue.reason);
          setMedications(formValue.medications);
          router.push(`/patient/on-demand/insurance`);
        }}
      />
    </Layout>
  );
};

HealthFormPage.Layout = OnDemandLayout;
export default HealthFormPage;
