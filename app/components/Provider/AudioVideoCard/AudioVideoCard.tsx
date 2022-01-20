/* eslint-disable @next/next/no-img-element */
import { AudioVideoSettings } from '../../AudioVideoSettings';
import { LocalVideoTrack } from 'twilio-video';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Card } from '../../Card';
import VideoTrack from '../../Base/ParticipantTracks/Publication/VideoTrack/VideoTrack';
import { useEffect, useState } from 'react';
import { TelehealthVisit } from '../../../types';

export interface AudioVideoCardProps {
  visitNext: TelehealthVisit;
}

export const AudioVideoCard = ({ visitNext }: AudioVideoCardProps) => {
  const { localTracks } = useVideoContext();
  const [ videoTrack, setVideoTrack ] = useState<LocalVideoTrack>();

  useEffect(() => {
    setVideoTrack(localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack); 
  }, [localTracks]);

  return (
    <>
      {videoTrack ?
        <div className='w-full mt-2.5'>
          <VideoTrack track={videoTrack} isLocal />
        </div> :
          <img src="/provider.jpg" alt="Provider" className="border border-light" /> 
      }
      <Card>
        <AudioVideoSettings visitNext={visitNext}/>
      </Card>
    </>
  );
};
