import React, { useEffect } from 'react';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { VideoConsultation } from '../../../components/Provider';
import { useVisitContext } from '../../../state/VisitContext';
import { useRouter } from 'next/router';
import { roomService } from '../../../services/roomService';
import { TelehealthUser, TelehealthVisit, TwilioPage } from '../../../types';
import VideoContextLayout from '../../../components/Base/VideoProvider';
import clientStorage from '../../../services/clientStorage';
import { CURRENT_VISIT_ID } from '../../../constants';

const VideoPage: TwilioPage = () => {
  const { user, visit } = useVisitContext();
  const { connect: videoConnect, room } = useVideoContext();
  const router = useRouter();
  useEffect(() => {
    if(!room) {
      clientStorage.getFromStorage<string>(CURRENT_VISIT_ID)
        .then(roomName => {
          roomService.createRoom(user as TelehealthUser, roomName)
          .then(roomTokenResp => {
            if(!roomTokenResp.roomAvailable) {
              router.push('/provider/dashboard');
            }
            videoConnect(roomTokenResp.token);
          });
        });
    }
  },[router, room]);

  return <VideoConsultation />;
};

VideoPage.Layout = VideoContextLayout;
export default VideoPage;