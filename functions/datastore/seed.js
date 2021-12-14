/*
 * --------------------------------------------------------------------------------
 * seed datastore with data from private assets in /assets/datastore/FHIR
 *
 * --------------------------------------------------------------------------------
 */

const assert = require("assert");
const path = require("path");
const { getParam, assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);
const { upsertSyncDocument } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
async function seedResource(context, syncServiceSid, seedAssetPath) {

  try {
    // open private asset
    const asset = Runtime.getAssets()[seedAssetPath];
    const bundle = JSON.parse(asset.open());
    assert(bundle.total === bundle.entry.length, 'bundle checksum error!!!');
    const syncDocumentName = path.basename(asset.path)
      .replace(/.+FHIR\//, '')
      .replace('.private.json', '')
      .replace('.json', '');

    const document = await upsertSyncDocument(context, syncServiceSid, syncDocumentName, bundle);

    return {
      uniqueName: document.uniqueName,
      sid: document.sid,
      resourceCount: document.data.entry.length,
    };
  } catch (err) {
    throw err;
  }
}

// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'seed';

  console.time(THIS);
  assertLocalhost(context);
  try {
    const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

    const result = [];
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/Appointments.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/Conditions.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/CoverageEligibilityResponses.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/DocumentReferences.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/MedicationStatements.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/Patients.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/PractitionerRoles.json'));
    result.push(await seedResource(context, TWILIO_SYNC_SID, '/datastore/FHIR/Practitioners.json'));

    return callback(null, result);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}

