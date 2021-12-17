import { TelehealthVisit } from "../../../types";
import { joinClasses } from "../../../utils"


export interface PatientVisitCardProps {
  visit: TelehealthVisit;
  index: number;
  waitTime: string;
}

export const PatientVisitCard = ({visit, index, waitTime}: PatientVisitCardProps) => {
  return (
    <div
      key={index}
      className={joinClasses(
        'grid grid-cols-2 gap-4 font-bold text-xs px-1 py-2',
        index % 2 ? '' : 'bg-[#FAFAFA]'
      )}
    >
      <div>
        <a className="text-link underline">{visit.ehrPatient.name}</a>
        <div className="font-bold text-light">
          { waitTime }
        </div>
      </div>
      <div className="line-clamp-2 overflow-ellipsis overflow-hidden text-dark">
        {visit.ehrAppointment.reason}
      </div>
    </div>
  )
}