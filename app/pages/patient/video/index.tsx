import React, { useEffect } from 'react';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { VideoConsultation } from '../../../components/Patient';
import { useVisitContext } from '../../../state/VisitContext';
import { PatientUser } from '../../../types';
import { roomService } from '../../../services/roomService';
import { useRouter } from 'next/router';
import PatientVideoContextLayout from '../../../components/Patient/PatientLayout';


const VideoPage = () => {
  const { user, visit } = useVisitContext();
  const { connect: videoConnect, room } = useVideoContext();
  const router = useRouter();
  useEffect(() => {
    if(!room) {
      roomService.checkRoom(user as PatientUser, visit.roomName)
      .then(roomTokenResp => {
        if(!roomTokenResp.roomAvailable) {
          router.push('/patient/waiting-room');
        }
        videoConnect(roomTokenResp.token);
      });
    }
  },[router, room]);

  return <VideoConsultation />;
};

VideoPage.Layout = PatientVideoContextLayout;
export default VideoPage;
