import router from "next/router";
import React, { useEffect, useState } from "react";
import { useVisitContext, VisitStateProvider } from "../../state/VisitContext";
import { ChatProvider } from "../Base/ChatProvider";
import VideoProvider from "../Base/VideoProvider";
import useConnectionOptions from "../Base/VideoProvider/useConnectionOptions/useConnectionOptions";
import useVideoContext from "../Base/VideoProvider/useVideoContext/useVideoContext";

 function VideoProviderChildrenWrapper(props: React.PropsWithChildren<{}>) {
    const { visit, user } = useVisitContext();
    const { getAudioAndVideoTracks, localTracks } = useVideoContext();
    const [mediaError, setMediaError] = useState<Error>();
  
    useEffect(() => {
      if (!mediaError) {
        getAudioAndVideoTracks().catch(error => {
          console.log('Error acquiring local media:');
          console.dir(error);
          setMediaError(error);
          router.push("/patient/video/no-av-permission");
        });
      }
    }, [getAudioAndVideoTracks, mediaError]);
    return (
      visit && user && (localTracks && localTracks.length > 1) &&
      <>
        { props.children }
      </>
    );
  }
  
  export function PatientVideoContextLayout(props: React.PropsWithChildren<{}>) {
    const connectionOptions = useConnectionOptions();
    return (
      <VisitStateProvider>
        <VideoProvider options={connectionOptions} onError={(error) => console.log(error)}>
          <VideoProviderChildrenWrapper>
            <ChatProvider>
              { props.children }
            </ChatProvider>
          </VideoProviderChildrenWrapper>
        </VideoProvider>
      </VisitStateProvider>
    );
  }
  
  export default PatientVideoContextLayout;
  