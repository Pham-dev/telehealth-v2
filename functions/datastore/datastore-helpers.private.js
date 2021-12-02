/*
 * ----------------------------------------------------------------------------------------------------
 * helper functions for datastore functions
 * - manages persistent storage using Twilio Sync
 *
 * depends on:
 *   SYNC_SERVICE_SID: Sync service sid, automatically procured in helpers.private.js
 * ----------------------------------------------------------------------------------------------------
 */

const assert = require('assert');

/*
 * ----------------------------------------------------------------------------------------------------
 * seclt a Sync document
 *
 * parameters:
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: select object, null if document does not exist
 * ----------------------------------------------------------------------------------------------------
 */
async function _fetchSyncDocument(client, syncServiceSid, syncDocumentName) {
  const documents = await client.sync
    .services(syncServiceSid)
    .documents
    .list();
  const document = documents.find(d => d.uniqueName === syncDocumentName);

  return document; // will be 'undefined' is not found
}


/*
 * ----------------------------------------------------------------------------------------------------
 * select a Sync document
 *
 * parameters:
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: select object, null if document does not exist
 * ----------------------------------------------------------------------------------------------------
 */
async function selectSyncDocument(context, syncServiceSid, syncDocumentName) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');

  const client = context.getTwilioClient();

  const document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  return document ? document.data : null;
}


/*
 * ----------------------------------------------------------------------------------------------------
 * insert/update a new Sync document
 *
 * parameters
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 * - documentData: document data object
 *
 * returns: document SID if successful
 * ----------------------------------------------------------------------------------------------------
 */
async function upsertSyncDocument(context, syncServiceSid, syncDocumentName, syncDocumentData) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');
  assert(syncDocumentData, 'missing parameter: syncDocumentData!!!');

  const client = context.getTwilioClient();

  let document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  if (document) {
    console.log('updating document:', document.uniqueName, document.sid);
    document = await client.sync
      .services(syncServiceSid)
      .documents(document.sid)
      .update({
        data: syncDocumentData,
      });
  } else {
    console.log('creating document:', syncDocumentName);
    document = await client.sync
      .services(syncServiceSid)
      .documents.create({
        data: syncDocumentData,
        uniqueName: syncDocumentName,
      });
  }
  return document.sid;
}

/*
 * ----------------------------------------------------------------------------------------------------
 * delete an existing Sync document
 *
 * parameters
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: document SID if successful, null if nothing was delete
 * ----------------------------------------------------------------------------------------------------
 */
async function deleteSyncDocument(context, syncServiceSid, syncDocumentName) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');

  const client = context.getTwilioClient();

  const document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  if (document) {
    await client.sync
      .services(syncServiceSid)
      .documents(document.sid).remove();
    return document.sid;
  } else {
    return null;
  }
}


/*
 * ----------------------------------------------------------------------------------------------------
 * reads FHIR resources stored as Sync document
 *
 * resources are stored as FHIR Bundle resource of type=searchset
 *
 * parameters
 * - context: Twilio runtime context
 * - resourceType: FHIR resource type in plural (e.g., Patients)
 *
 * returns: array of requested FHIR resources
 * ----------------------------------------------------------------------------------------------------
 */
async function read_fhir(context, syncServiceSid, resourceType) {

  const bundle = await selectSyncDocument(context, syncServiceSid, resourceType);
  assert(bundle.total === bundle.entry.length, 'bundle checksum error!!!');

  return bundle.entry;
}


/*
 * ----------------------------------------------------------------------------------------------------
 * saves FHIR resources stored as Sync document, effectively over-writing previous
 *
 * resources are stored as FHIR Bundle resource of type=searchset
 *
 * parameters
 * - context: Twilio runtime context
 * - resourceType: FHIR resource type in plural (e.g., Patients)
 * - resources: array of FHIR resources to save
 *
 * returns: Sync document
 * ----------------------------------------------------------------------------------------------------
 */
async function save_fhir(context, syncServiceSid, resourceType, resources) {

  const bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: resources.length,
    entry: resources,
  }
  const document = await upsertSyncDocument(context, syncServiceSid, resourceType, bundle);

  return document ? document.sid : null;
}

// --------------------------------------------------------------------------------
module.exports = {
  read_fhir,
  save_fhir,
  selectSyncDocument,
  upsertSyncDocument,
  deleteSyncDocument,
};