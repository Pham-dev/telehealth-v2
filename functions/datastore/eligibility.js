/*
 * --------------------------------------------------------------------------------
 * insurance eligibility check
 *
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/eligibility-schema.json';
const PROTOTYPE = '/datastore/eligibility-prototype.json';
const FHIR_COVERAGE_ELIGIBILITY_RESPONSE = 'CoverageEligibilityResponses';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_eligibility(CoverageEligibilityResponse) {
  const r = CoverageEligibilityResponse;
  const eligibility = {
    patient_id: r.patient.reference.replace('Patient/', ''),
    copay_usd: r.insurance[0].item[0].benefit.find(e => e.type.text === 'copay').allowedMoney.value,
  };
  return eligibility;
}


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'eligibility:';
  console.time(THIS);
  const { isValidAppToken } = require(Runtime.getFunctions()["authentication-helper"].path);

  /* Following code checks that a valid token was sent with the API call */
  if (event.token && !isValidAppToken(event.token, context)) {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(401);
    response.setBody({message: 'Invalid or expired token'});
    return callback(null, response);
  }
  try {

    const action = event.action ? event.action : 'USAGE'; // default action

    switch (action) {

      case 'USAGE': {
        // json prototype for ADD
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);

        const usage = {
          action: 'usage for eligibility function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for eligibility in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of eligibility in telehealth',
            parameters: {},
          },
          GET: {
            description: 'returns array of eligibility',
            parameters: {
              patient_id: 'required, filters for specified patient',
            }
          },
        };

        return callback(null, usage);
      }

      case 'SCHEMA': {
        const schema = await fetchPublicJsonAsset(context, SCHEMA);
        return callback(null, schema);
      }

      case 'PROTOTYPE': {
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);
        return callback(null, prototype);
      }

      case 'GET': {
        assert(event.patient_id, 'Missing event.patient_id!!!!');

        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_COVERAGE_ELIGIBILITY_RESPONSE);

        const eligibility = resources.map(r => transform_fhir_to_eligibility(r));

        // hard-code to return same eligibility/copay for specified patient_id
        eligibility[0].patient_id = event.patient_id;

        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(eligibility);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      default: // unknown action
        throw Error(`Unknown action: ${action}!!!`);
    }

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}
