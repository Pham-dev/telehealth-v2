import { LocalParticipant, RemoteParticipant } from "twilio-video";
import { Settings } from "./types";

export const DEFAULT_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  width: 1280,
  height: 720,
  frameRate: 24,
};

// These are used to store the selected media devices in localStorage
export const SELECTED_AUDIO_INPUT_KEY = 'TwilioVideoApp-selectedAudioInput';
export const SELECTED_AUDIO_OUTPUT_KEY = 'TwilioVideoApp-selectedAudioOutput';
export const SELECTED_VIDEO_INPUT_KEY = 'TwilioVideoApp-selectedVideoInput';

// This is used to store the current background settings in localStorage
export const SELECTED_BACKGROUND_SETTINGS_KEY = 'TwilioVideoApp-selectedBackgroundSettings';

export const STORAGE_USER_KEY = 'TelehealthUser';
export const STORAGE_VISIT_KEY = 'TelehealthVisit';
export const CURRENT_VISIT_ID = 'CurrentVisitId';

// On Demand Local Storage Keys
export const PATIENT_INFO_KEY = 'PatientInfo';
export const HEALTH_INFO_KEY = 'HealthInfo';
export const INSURANCE_INFO_KEY = 'InsuranceInfo';
export const LOCAL_SYNC_TOKEN_KEY = 'LocalSyncToken';

export const ALLOWED_FILE_TYPES =
'audio/*, image/*, text/*, video/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document .xslx, .ppt, .pdf, .key, .svg, .csv';

export const initialSettings: Settings = {
  trackSwitchOffMode: undefined,
  dominantSpeakerPriority: 'standard',
  bandwidthProfileMode: 'collaboration',
  maxAudioBitrate: '16000',
  contentPreferencesMode: 'auto',
  clientTrackSwitchOffControl: 'auto',
  roomType: 'group'
};

// On Demand Intefaces
export interface PatientInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  needTranslator: string;
  gender: string;
}
interface HealthFile {
  name: string;
  url?: string;
}
export interface HealthInfo {
  conditions: string;
  files?: HealthFile[];
  medications: string;
  reason: string;
}

export interface InsuranceInfo {
  haveInsurance: string;
  memberId: string;
  healthPlan: string;
  isPrimaryMember: string;

}

// Room Interfaces
export interface ParticipantRoomState {
  patientName: string;
  providerName: string;
  visitorName?: string // todo change to array of visitors
}

export interface ProviderRoomState extends ParticipantRoomState {
  patientParticipant: RemoteParticipant;
  providerParticipant: LocalParticipant;
  visitorParticipant?: RemoteParticipant; // todo change to array of visitors
}

export interface PatientRoomState extends ParticipantRoomState {
  patientParticipant: LocalParticipant;
  providerParticipant: RemoteParticipant;
  visitorParticipant?: RemoteParticipant; // todo change to array of visitors
}
