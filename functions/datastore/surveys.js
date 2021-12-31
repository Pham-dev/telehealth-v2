const SURVEY_RESOURCE = 'Surveys';

exports.handler = async function(context, event, callback) {
  const THIS = 'FUNCTION: /datastore/surveys';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { read_fhir, save_fhir } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  const response = new Twilio.Response();

  if (context.DOMAIN_NAME.startsWith('localhost:')) {
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  console.log("event", event);

  /* Following code checks that a valid token was sent with the API call */
  if (event.token && !isValidAppToken(event.token, context)) {
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(401);
    response.setBody({message: 'Invalid or expired token'});
    return callback(null, response);
  }

  const action = event.action ? event.action : null;
  const survey = event.survey ? event.survey : null;

  try {
    switch (action) {
      case 'ADD': {
        const resources = await read_fhir(context, TWILIO_SYNC_SID, SURVEY_RESOURCE);
        resources.push(survey);
        const res = await save_fhir(context, TWILIO_SYNC_SID, SURVEY_RESOURCE, resources);
        response.setBody(survey);
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'GET': {
        const resources = await read_fhir(context, TWILIO_SYNC_SID, SURVEY_RESOURCE);
        response.setBody(resources);
        response.setStatusCode(200);
        return callback(null, response);
      }
      default: {
        response.setBody({message: 'Neither a ADD or GET action'});
        response.appendHeader('Content-Type', 'application/json');
        response.setStatusCode(401);
        return callback(null, response);
      }
    }
  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {

  }

};