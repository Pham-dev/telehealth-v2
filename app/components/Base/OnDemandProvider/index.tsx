
import React, { createContext, useState } from 'react';

type OnDemandContextType = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  needTranslator: boolean;
  gender: string;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
  setNeedTranslator: (needTranslator: boolean) => void;
  setGender: (setGender: string) => void;

  preExistingConditions: string;
  medications: string;
  reasonForVisit: string;
  setPreExistingConditions: (conditions: string) => void;
  setMedications: (medications: string) => void;
  setReasonForVisit: (reason: string) => void;
  
  // add insurance information and payment information
}

export const OnDemandContext = createContext<OnDemandContextType>(null);

export const OnDemandProvider = ({children}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [needTranslator, setNeedTranslator] = useState<boolean>(false);
  const [gender, setGender] = useState<string>('');

  const [preExistingConditions, setPreExistingConditions] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');

  return (
    <OnDemandContext.Provider value={{
      firstName,
      lastName,
      phoneNumber,
      email,
      needTranslator,
      gender,
      setFirstName,
      setLastName,
      setPhoneNumber,
      setEmail,
      setNeedTranslator,
      setGender,
      preExistingConditions,
      medications,
      reasonForVisit,
      setPreExistingConditions,
      setMedications,
      setReasonForVisit,
    }}>
      {children}
    </OnDemandContext.Provider>
  )
}

export default OnDemandProvider;
