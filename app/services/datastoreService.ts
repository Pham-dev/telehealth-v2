import {EHRPatient, EHRProvider, EHRContent, EHRAppointment, PatientUser, ProviderUser, TelehealthUser, TelehealthVisit} from "../types";
import {Uris} from "./constants";


function instantiatePatient(data: any) : EHRPatient {
  const medication = data.patient_medications.map(e => { return { medication: e }; });
  return {
    id: data.patient_id,
    name: data.patient_name,
    family_name: data.patient_family_name,
    given_name: data.patient_given_name,
    phone: data.patient_phone,
    ...(data.patient_email && { email: data.patient_email }),
    gender: data.patient_gender,
    ...(data.patient_language && { language: data.patient_language }),
    medications: data.patient_medications,
    conditions: data.patient_conditions,
  } as EHRPatient;
}

function instantiateProvider(data: any) : EHRProvider {
  return {
    id: data.provider_id,
    name: data.provider_name,
    phone: data.provider_phone,
    on_call: new Boolean(data.provider_on_call),
  } as EHRProvider;
}

function instantiateAppointment(data: any) : EHRAppointment {
  return {
    id: data.appointment_id,
    type: data.appointment_type,
    start_datetime_ltz: new Date(data.appointment_start_datetime_utc),
    end_datetime_ltz: new Date(data.appointment_end_datetime_utc),
    ...(data.appointment_reason && { reason: data.appointment_reason }),
    references: data.appointment_references,
    patient_id: data.patient_id,
    provider_id: data.provider_id,
  } as EHRAppointment;
}

function instantiateContent(data: any) : EHRContent {
  return {
    id: data.content_id,
    title: data.content_title,
    ...(data.content_description && { description: data.content_description }),
    video_url: data.content_video_url,
    provider_ids: data.providers.map(e => { return e; }),
  } as EHRContent;
}


/* --------------------------------------------------------------------------------------------------------------
 * fetch TelehealthVists for the specified provider from server datastore
 *
 * result is ordered in ascending order of appointment start time
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchAllTelehealthVisits(provider: ProviderUser): Promise<Array<TelehealthVisit>> {
  if(provider.role !== 'provider') {
    Promise.reject({ error: "Only provider can get patient queue" });
  }
  const tuple = await fetch(Uris.backendRoot + '/datastore/appointments', {
    method: 'POST',
    body: JSON.stringify({ action: 'GETTUPLE', provider_id: provider.id }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  const result: TelehealthVisit[] = [];
  tuple.forEach((t) => {
    const patient = instantiatePatient(t.patient);
    const provider = instantiateProvider(t.provider);
    const appointment = instantiateAppointment(t.appointment);
    const tv = {
      id: appointment.id,
      roomName: appointment.id,
      ehrAppointment: appointment,
      ehrPatient: patient,
      ehrProvider: provider,
    } as TelehealthVisit;
    result.push(tv);
    //console.log(tv);
  });

  return Promise.resolve(result);
}

/* --------------------------------------------------------------------------------------------------------------
 * fetch TelehealthVisit for the specified appointment id from server datastore
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchTelehealthVisitForPatient(user: TelehealthUser, appointment_id: string): Promise<TelehealthVisit | { error : string }> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/appointments', {
    method: 'POST',
    body: JSON.stringify({ action: 'GETTUPLE', appointment_id: appointment_id }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  }).then((r) => r.json());

  if(tuple.length === 0) {
    Promise.reject({ error: `not found appointment: ${appointment_id}` });
  }

  const _patient = instantiatePatient(tuple[0].patient);
  const _provider = instantiateProvider(tuple[0].provider);
  const _appointment = instantiateAppointment(tuple[0].appointment);
  const result = {
    id: _appointment.id,
    roomName: _appointment.id,
    ehrAppointment: _appointment,
    ehrPatient: _patient,
    ehrProvider: _provider,
  } as TelehealthVisit;

  //console.log(result);
  return Promise.resolve(result);
}


/* --------------------------------------------------------------------------------------------------------------
 * fetch the all waiting room content from server datastore
 *
 * return content assigned to specified provider first
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchAllContent(provider: ProviderUser): Promise<Array<EHRContent>> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET' }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  const allContent : EHRContent [] = tuple.map((t) => instantiateContent(t));
  const assignedContent : EHRContent = allContent.find((c) => {
    return c.provider_ids.some((p) => p === provider.id);
  });

  const result : EHRContent[] = [];
  result.push(assignedContent);
  for(const c of allContent) {
    if (c.id === assignedContent.id) continue;
    result.push(c);
   }

  return Promise.resolve(result);
}

/* --------------------------------------------------------------------------------------------------------------
 * fetch the waiting room content for the specified provider from server datastore
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchContentForProvider(provider: ProviderUser): Promise<EHRContent> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET', provider_id: provider.id }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  if(tuple.length === 0) {
    Promise.reject({ error: 'not found any content' });
  }

  const _content = instantiateContent(tuple[0]);

  return Promise.resolve(_content);
}


/* --------------------------------------------------------------------------------------------------------------
 * assign waiting room content to the specified provider
 * --------------------------------------------------------------------------------------------------------------
 */
async function assignContentToProvider(content_id: string, provider: ProviderUser): Promise<string> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({
      action: 'ASSIGN',
      content_id: content_id,
      provider_id: provider.id
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  return Promise.resolve(content_id);
}


export default {
  fetchAllTelehealthVisits,
  fetchTelehealthVisitForPatient,
  fetchAllContent,
  fetchContentForProvider,
  assignContentToProvider,
};