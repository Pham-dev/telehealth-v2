import { joinClasses } from '../../utils';
import { Button, ButtonVariant } from '../Button';
import { Select } from '../Select';
import { VirtualBackgroundOptions } from '../VirtualBackgroundOptions';
import { useEffect, useState } from 'react';
import MicTest from './MicTest';
import { Icon } from '../Icon';
import clientStorage from '../../services/clientStorage';
import { CURRENT_VISIT_ID } from '../../constants';
import { useRouter } from 'next/router';
import { TelehealthVisit } from '../../types';
import { Header } from '../Provider/Header';
export interface AudioVideoSettingsProps {
  className?: string;
  isDark?: boolean;
  isCallInProgress?: boolean;
  isRecording?: boolean;
  visitNext?: TelehealthVisit;
  toggleRecording?: () => void;
}

export interface Device {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

/**
 * TODO:
 * - Figure out a way to change browser's audio settings
 * - Virtual Backgrounds implementation
 */
export const AudioVideoSettings = ({
  className,
  isDark,
  isCallInProgress,
  isRecording,
  toggleRecording,
  visitNext
}: AudioVideoSettingsProps) => {
  const router = useRouter();
  const [videoDevices, setVideoDevices] = useState<ReadonlyArray<Device>>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<ReadonlyArray<Device>>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<ReadonlyArray<Device>>([]);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [nurseName, setNurseName] = useState<string>('Nurse Educator');

  useEffect(() => {
    const getNurseName = async () => {
      let name: string = await clientStorage.getFromStorage('flexUser');
      console.log(name);
      if (name) setNurseName(name);
    }
    getNurseName();
  }, []);
  
  function handleChange(e) {
    // Todo: Handle Device Change.
    console.log(e.target.value);
  }
  
  // Gets machine's Audio and Video devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoInputDevices: Device[] = devices.filter(device => device.kind === 'videoinput');
      const audioInputs: Device[] = devices.filter((device, index, array) => 
        device.kind === 'audioinput' && 
        !device.label.includes("Virtual")
      );
      const audioOutputs: Device[] = devices.filter(device => 
        device.kind === 'audiooutput' &&
        !device.label.includes("Virtual"));
      setVideoDevices(videoInputDevices);
      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
    })
  }, [isMicOn]);

  function startVisit() {
    clientStorage.saveToStorage(CURRENT_VISIT_ID, visitNext.ehrAppointment.id);
    router.push("/provider/video/");
  };

  const Label = ({ children }) => (
    <label
      className={joinClasses(
        'my-2 text-xs block',
        isDark ? 'text-white' : 'text-dark'
      )}
    >
      {children}
    </label>
  );

  return (
    <div className={joinClasses(className)}>
      <div className="my-3">
        <Header name={nurseName} />
        <Label>Camera</Label>
        <Select
          isDark={isDark}
          key={"videoInput"}
          onChange={handleChange}
          className="w-full"
          options={videoDevices.map(device => (
            { 
              label: device.label ? device.label : "System Default (Webcam)",
              value: device.deviceId
            }))
          }
        />
      </div>
      <div className="my-3">
        <Label>Voice Input Device:</Label>
        <Select
          isDark={isDark}
          key={"audioInput"}
          onChange={handleChange}
          className="w-full"
          options={audioInputDevices.map(device => ({label: device.label, value: device.deviceId}))}
        />
        <input className="mt-4 w-full bg-primary" type="range" />
      </div>
      <div className="my-3">
        <Label>Audio Output Device:</Label>
        <Select
          isDark={isDark}
          key={"audioOutput"}
          onChange={handleChange}
          className="w-full"
          options={audioOutputDevices.map(device => ({label: device.label, value: device.deviceId}))}
        />
        <input className="mt-4 w-full bg-primary" type="range" />
      </div>
      {isCallInProgress ? (
        <div className="my-6 flex items-center">
          <div className="pr-5 text-sm">Recording:</div>
          <div className="flex-grow">
            <Button
              variant={isRecording ? ButtonVariant.primary : ButtonVariant.link}
              className="w-full"
              onClick={toggleRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="my-3 flex justify-center items-center space-x-5">
          <Button variant={ButtonVariant.tertiary} onClick={() => {setIsMicOn(!isMicOn); console.log(isMicOn)}} outline className='flex justify-center items-center space-x-2'>
            Test
            <Icon name="mic"></Icon>
          </Button>
          <MicTest className="w-full" isMicOn={isMicOn}/>
        </div>
      )}
        <div className="my-3">
            <Label>Virtual Background</Label>
            <VirtualBackgroundOptions isDark={isDark} />
        </div>

      <div className="my-5 font-bold text-center">
        <Button as="button" onClick={startVisit}>
          Start Visit
        </Button>
      </div>
    </div>
  );
};
