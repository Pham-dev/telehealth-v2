import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Layout } from '../../components/Patient';
import { Select } from '../../components/Select';
import { STORAGE_USER_KEY, STORAGE_VISIT_KEY } from '../../constants';
import clientStorage from '../../services/clientStorage';
import visitorAuth from '../../services/authService';
import visitService from '../../services/visitService';
import { TelehealthUser } from '../../types';

const InvitedAttendeePage = () => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [terms, setTerms] = useState(false);
  useEffect(() => {
    const token = router.query.token as string;
    if(token) {
      visitorAuth.authenticateVisitorOrPatient(token)
      .then(u => {
        clientStorage.saveToStorage(STORAGE_USER_KEY, u);
        return visitService.getVisitForPatient(u);
      }).then(v => {
        // need to get the visit
        // call the dataStore service
        // since it is third party no need to call ehr integration
        if(v) {
          clientStorage.saveToStorage(STORAGE_VISIT_KEY, v);
          setIsInitialized(true);
        }
      });
      // TODO: Implement CATCH
    }
  }, [router]);

  const onSubmit = async () => {
    if(name) {
      let user = await clientStorage.getFromStorage(STORAGE_USER_KEY) as TelehealthUser;
      user.name = name;
      await clientStorage.saveToStorage(STORAGE_USER_KEY, user);
      router.push("/invited-attendee/technical-check/");
    }
  };

  return isInitialized && (
    <Layout>
      <Alert
        title="Welcome"
        content={
          <>
            <p className="mb-6">
              Thanks for coming to support Sarah Cooper. Please share some
              information about yourself below for Dr. Josefina Santos:
            </p>
            <div className="">
              <Input className="w-full my-2" autoFocus placeholder="Full Name" name="name"  value={name} onChange={evt => setName(evt.target.value)} />
              <Select
                className="w-full my-2"
                placeholder="Relationship with Patient"
                options={[
                  { value: 'Caregiver' },
                  { value: 'Family Member' },
                  { value: 'Other' },
                ]}
                name="relationship"
                onChange={evt => setRelationship(evt.target.value)}
                value={relationship}
              />
              <div className="text-left">
                <label className="text-light">
                  <input type="checkbox" name="terms" onChange={evt => setTerms(evt.target.checked)} checked={terms}/> I agree to the Terms & Conditions
                </label>
              </div>
              <div>
                <Button
                  as="button"
                  onClick={onSubmit}
                  className="inline-block w-full mt-3 mb-1"
                >
                  Continue
                </Button>

                <a className="text-link">Terms & Conditions</a>
              </div>
            </div>
          </>
        }
      />
    </Layout>
  );
};
export default InvitedAttendeePage;
