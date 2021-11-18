/*
 * main controller javascript used by administration.html
 */

async function sendScheduledPatientLink(e) {
  const THIS = sendScheduledPatientLink.name;
  try {
    let s = 1;
    console.log(THIS, `${s++}. get patient/visit detail from server`);
    // TBD
    const patient_identifier = null;
    const patient_name_text = null;
    const encounter_identifier = null;

    console.log(THIS, `${s++}. get patient token from server`);
    const response = await fetch('/visit/patient-token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patient_identity: 'p1000000',
        visit_id: 'e1000000',
        patient_name: 'BJ Choi'
      })
    });
    const payload = await response.json();
    const patient_token = payload.token;

    console.log(THIS, `${s++}. send link to patient waiting room via SMS`);
    const link = `${location.origin}/patient/index.html?token=${patient_token}`
    console.log(link);

  } catch (err) {
    console.log(THIS, err);
  }
}

function sendOnDemandPatientLink(e) {
  const THIS = sendOnDemandPatientLink.name;
  let i = 1;
  console.log(THIS, `${i++}. generate unique visitID`);
  console.log(THIS, `${i++}. send link to patient in-take via SMS`);
}

function sendProviderLink(e) {
  const THIS = sendProviderLink.name;
  let i = 1;
  console.log(THIS, `${i++}. get provider detail from server`);
  console.log(THIS, `${i++}. get provider token from server`);
  console.log(THIS, `${i++}. send link to provider dashboard via SMS`);
}

