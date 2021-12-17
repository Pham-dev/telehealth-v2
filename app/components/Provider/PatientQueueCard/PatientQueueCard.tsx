import { useEffect } from 'react';
import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import {TelehealthVisit} from "../../../types";
import { PatientVisitCard } from './PatientVisitCard';
import useSyncContext from '../../Base/SyncProvider/useSyncContext/useSyncContext';
import { joinClasses } from '../../../utils';

export interface PatientQueueCardProps {
  className?: string;
  visitQueue: TelehealthVisit[];
  onDemandQueue: TelehealthVisit[];
}

function calculateWaitTime(visitStartTimeLTZ) {
  const now : Date = new Date();
  const diffSeconds = Math.trunc((now.getTime() - visitStartTimeLTZ.getTime())/1000);
  const hhmmdd = Math.trunc(diffSeconds/60/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds % 60).toString().padStart(2,'0');

  return (diffSeconds > 0 ? 'Waiting ': 'Starting ') + hhmmdd;
}

export const PatientQueueCard = ({ className, onDemandQueue, visitQueue }: PatientQueueCardProps) => {
  console.log("onDemandQueue", onDemandQueue);
  useEffect(() => {
    console.log('PatientQueueCard visitQueue=', visitQueue);
    console.log('onDemandCard visitQueue=', onDemandQueue);
  }, []);

  return (
    <Card className={className}>
      <CardHeading>Patient Queue</CardHeading>
      <div className="px-1 py-2 grid grid-cols-2 gap-4 font-bold text-xs">
        <div>Patient</div>
        <div>Reason For Visit:</div>
      </div>
      {onDemandQueue.map((visit, index) => (
        <PatientVisitCard visit={visit} key={index} index={index} waitTime={calculateWaitTime(visit.ehrAppointment.start_datetime_ltz)} />
      ))}
      {visitQueue.map((visit, index) => (
        <PatientVisitCard visit={visit} key={index} index={index} waitTime={calculateWaitTime(visit.ehrAppointment.start_datetime_ltz)} />
      ))}
    </Card>
  );
};
