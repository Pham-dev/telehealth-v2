/* global Twilio Runtime */
'use strict';

const AccessToken = Twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;
const MAX_ALLOWED_SESSION_DURATION = 14400;

module.exports.handler = async (context, event, callback) => {
  const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, ROOM_TYPE, CONVERSATIONS_SERVICE_SID } = context;

  // TODO: Add Patient Auth Handler
  const authHandler = require(Runtime.getFunctions()['auth/jwt-auth-handler'].path);
  const authResult = await authHandler(context, event, callback);
  if(authResult.response) {
      return callback(null, authResult.response);
  }

  console.log("Auth result");
  console.log(authResult);

  const { room_name } = event;
  const { identity } = authResult.decoded.grants;

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!identity) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing user_identity',
        explanation: 'The user_identity parameter is missing.',
      },
    });
    return callback(null, response);
  }

  if (!room_name) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing room_name',
        explanation: 'The room_name parameter is missing. room_name is required when create_room is true.',
      },
    });
    return callback(null, response);
  }

  let responseBody = {
    roomSid: null,
    roomAvailable: false,
    conversationAvailable: false,
    token: null,
    roomType: null
  };
  if (room_name) {
    const client = context.getTwilioClient();
    let room;

    try {
      // See if a room already exists
      room = await client.video.rooms(room_name).fetch();
    } catch (e) {
        console.log("Error Fetching room");
        console.log(e);
        response.setStatusCode(200);
        response.setBody(responseBody);
        return callback(null, response);
    }

    
    if (room) {
      responseBody.roomSid = room.sid;
      responseBody.roomAvailable = true;
      /*const conversationsClient = client.conversations.services(CONVERSATIONS_SERVICE_SID);
      try {
        // See if conversation already exists
        await conversationsClient.conversations(room.sid).fetch();
        await conversationsClient.conversations(room.sid).participants.create({ identity: identity });
        responseBody.conversationAvailable = true;
      } catch (e) {
        if (e.code !== 50433) {
            console.log(`Error adding participant to conversation conversaion ${room.sid}`);
            console.log(e);
        }
      }*/
    }
  }

  // Create token
  const token = new AccessToken(ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });

  // Add participant's identity to token
  token.identity = identity;

  // Add video grant to token
  const videoGrant = new VideoGrant({ room: room_name });
  token.addGrant(videoGrant);

  // Add chat grant to token
  const chatGrant = new ChatGrant({ serviceSid: CONVERSATIONS_SERVICE_SID });
  token.addGrant(chatGrant);

  // Return token
  response.setStatusCode(200);
  responseBody.token = token.toJwt();
  responseBody.roomType = ROOM_TYPE;
  response.setBody(responseBody);
  return callback(null, response);
};