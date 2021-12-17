import React from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../components/Heading';
import { InfoForm, Layout } from '../../../components/Patient';
import OnDemandLayout from '../../../components/Patient/OnDemandLayout';
import useOnDemandContext from '../../../components/Base/OnDemandProvider/useOnDemandContext/useOnDemandContext';

interface FormValue {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  needTranslator: string;
  gender: string;
}

const InfoFormPage = () => {
  const router = useRouter();
  const {
    setFirstName,
    setLastName,
    setPhoneNumber,
    setEmail,
    setNeedTranslator,
    setGender,
  } = useOnDemandContext();

  return (
    <Layout>
      <Heading>Please Share Your Info</Heading>
      <InfoForm
        onSubmit={(formValue: FormValue) => {
          setFirstName(formValue.firstName);
          setLastName(formValue.lastName);
          setEmail(formValue.email);
          setGender(formValue.gender);
          setNeedTranslator(formValue.needTranslator.toLowerCase() === 'no' ? false : true);
          setPhoneNumber(formValue.phoneNumber);
          router.push(`/patient/on-demand/health`);
        }}
      />
    </Layout>
  );
};

InfoFormPage.Layout = OnDemandLayout;
export default InfoFormPage;
