import { joinClasses } from '../../../utils';
import { useEffect } from 'react';
import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import {TelehealthVisit} from "../../../types";

export interface PatientQueueCardProps {
  className?: string;
  visitQueue: TelehealthVisit[];
}

function calculateWaitTime(visitStartTimeLTZ) {
  const now : Date = new Date();
  const diffSeconds = Math.trunc((now.getTime() - visitStartTimeLTZ.getTime())/1000);
  const hhmmdd = Math.trunc(diffSeconds/60/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds % 60).toString().padStart(2,'0');

  return (diffSeconds > 0 ? 'Waiting ': 'Starting ') + hhmmdd;
}

export const PatientQueueCard = ({ className, visitQueue }: PatientQueueCardProps) => {

  useEffect(() => {
    console.log('PatientQueueCard visitQueue=', visitQueue);
  }, []);

  return (
    <Card className={className}>
      <CardHeading>Patient Queue</CardHeading>
      <div className="px-1 py-2 grid grid-cols-2 gap-4 font-bold text-xs">
        <div>Patient</div>
        <div>Reason For Visit:</div>
      </div>
      {visitQueue.map((visit, i) => (
        <div
          key={i}
          className={joinClasses(
            'grid grid-cols-2 gap-4 font-bold text-xs px-1 py-2',
            i % 2 ? '' : 'bg-[#FAFAFA]'
          )}
        >
          <div>
            <a className="text-link underline">{visit.ehrPatient.name}</a>
            <div className="font-bold text-light">
              { calculateWaitTime(visit.ehrAppointment.start_datetime_ltz) }
            </div>
          </div>
          <div className="line-clamp-2 overflow-ellipsis overflow-hidden text-dark">
            {visit.ehrAppointment.reason}
          </div>
        </div>
      ))}
    </Card>
  );
};
