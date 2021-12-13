import React, { useCallback, useEffect, useState } from 'react';
import { joinClasses } from '../../../utils';
import useParticipants from '../../Base/VideoProvider/useParticipants/useParticipants';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Chat } from '../../Chat';
import { ConnectionIssueModal } from '../../ConnectionIssueModal';
import { PoweredByTwilio } from '../../PoweredByTwilio';
import { VideoControls } from '../../VideoControls';
import { InviteParticipantPopover } from './InviteParticipantPopover';
import { SettingsPopover } from './SettingsPopover';
import { VideoParticipant } from './VideoParticipant';
import { ProviderRoomState } from '../../../constants';
import useChatContext from '../../Base/ChatProvider/useChatContext/useChatContext';
import { useVisitContext } from '../../../state/VisitContext';
import useLocalAudioToggle from '../../Base/VideoProvider/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../../Base/VideoProvider/useLocalVideoToggle/useLocalVideoToggle';
import { roomService } from '../../../services/roomService';

export interface VideoConsultationProps {}

const providerName = 'Dr. Josefina Santos';

export const VideoConsultation = ({}: VideoConsultationProps) => {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [inviteModalRef, setInviteModalRef] = useState(null);
  const [settingsModalRef, setSettingsModalRef] = useState(null);
  const [connectionIssueModalVisible, setConnectionIssueModalVisible] = useState(false);
  const participants = useParticipants();
  const { setIsChatWindowOpen, isChatWindowOpen } = useChatContext();
  const { user } = useVisitContext();
  const { room, isRecording, toggleScreenShare } = useVideoContext();
  const [callState, setCallState] = useState<ProviderRoomState>({
    patientName: null,
    providerName: null,
    visitorName: null,
    patientParticipant: null,
    providerParticipant: null,
    visitorParticipant: null,
  });

  useEffect(() => {
    if (room) {
      setCallState(prev => {
        return {
          ...prev,
          providerParticipant: room!.localParticipant,
          patientParticipant: participants.find(p => p.identity != room!.localParticipant.identity),
          visitorParticipant: participants[1]
        }
      })
    }
  }, [participants, room]);

  const toggleRecordingCb = useCallback(async () => 
    await roomService.toggleRecording(user, room.sid, isRecording ? 'stop' : 'start'),
    [user, room, isRecording]);

  const titleStyles = {left: '45%'};
  const styles = {paddingBottom: '10px'}
  return (
    <div className="relative h-full">
      <h1 className="absolute text-white text-2xl font-bold top-4 z-10" style={titleStyles}>
        Owl Health
      </h1>
      <div
        className={joinClasses(
          'bg-secondary flex flex-col h-full w-full items-center',
          isRecording ? 'border-[10px] border-primary' : 'p-[10px]'
        )}
      >

        <div className="absolute right-6 w-48 flex flex-col">
          {callState.providerParticipant &&
            <VideoParticipant
              name={providerName}
              hasAudio={isAudioEnabled}
              hasVideo={isVideoEnabled}
              isProvider
              isSelf
              participant={callState.providerParticipant}
              fullScreen
            />}
          {callState.visitorParticipant &&
            <VideoParticipant
              name='Invited Visitor'
              hasAudio={isAudioEnabled}
              hasVideo={isVideoEnabled}
              isSelf
              participant={callState.visitorParticipant}
              fullScreen
            />}
        </div>

        <div className="w-2/3 h-full">
            {callState.patientParticipant &&
              <VideoParticipant
                name="Sarah Coopers"
                hasAudio
                hasVideo
                participant={callState.patientParticipant}
                fullScreen
              />
            }
        </div>
        <VideoControls
          containerClass="absolute bottom-10 mb-5 bg-[#FFFFFF4A] rounded-lg"
          addParticipant={(event) =>
            setInviteModalRef(inviteModalRef ? null : event?.target)
          }
          toggleAudio={toggleAudioEnabled}
          toggleChat={() => setIsChatWindowOpen(!isChatWindowOpen)}
          toggleScreenShare={toggleScreenShare}
          toggleSettings={(event) =>
            setSettingsModalRef(settingsModalRef ? null : event?.target)
          }
          toggleVideo={toggleVideoEnabled}
        />
        <div className="absolute bottom-6">
          <PoweredByTwilio inverted />
        </div>
      </div>
      {isChatWindowOpen && (
        <div className="absolute bottom-0 right-10 max-w-[405px] w-full max-h-[400px] h-full">
          <Chat
            close={() => setIsChatWindowOpen(false)}
            userName={user.name}
            userRole={user.role}
            showHeader
            inputPlaceholder="Message Sarah Cooper"
          />
        </div>
      )}
      <ConnectionIssueModal
        close={() => setConnectionIssueModalVisible(false)}
        isVisible={connectionIssueModalVisible}
      />
      <InviteParticipantPopover
        referenceElement={inviteModalRef}
        close={() => setInviteModalRef(null)}
        isVisible={!!inviteModalRef}
      />
      <SettingsPopover
        referenceElement={settingsModalRef}
        close={() => setSettingsModalRef(null)}
        isRecording={isRecording}
        isVisible={!!settingsModalRef}
        toggleRecording={toggleRecordingCb}
      />
    </div>
  );
};
