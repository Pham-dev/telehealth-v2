

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  //console.log(TWILIO_SYNC_SID);

  const stream = client.sync
    .services(TWILIO_SYNC_SID)
    .syncStreams
    .create()
    .then(stream => stream);

  console.log(stream);

  const response = new Twilio.Response();

  response.setStatusCode(200);
  response.setBody({message: "Hello World"})
  return callback(null, response);
}