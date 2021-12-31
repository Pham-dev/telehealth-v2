import { useEffect, useState } from "react";
import datastoreService from "../../services/datastoreService";
import { useVisitContext } from "../../state/VisitContext";
import { PostVisitSurvey, Reaction } from "../../types";
import { joinClasses } from "../../utils";
import { Button } from "../Button";
import { Card } from "../Card";
import { Icon } from "../Icon";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { CardHeading } from "../Provider/CardHeading";

interface SurveyResultsCardProps {
  className: string;
}

const SurveyResultsCard = ({className}: SurveyResultsCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [surveys, setSurveys] = useState<PostVisitSurvey[]>();
  const [thumbsUp, setThumbsUp] = useState<number>(0);
  const [thumbsDown, setThumbsDown] = useState<number>(0);
  const [issues, setIssues] = useState<string[]>([]);
  const { user } = useVisitContext();

  useEffect(() => {
    const getSurveys = async () => {
      if (user) {
        const surveys: PostVisitSurvey[] = await datastoreService.getSurveys(user.token);
        console.log(surveys);
        setSurveys(surveys);
        let up, down = 0;
        let uniqueIssues = new Set<string>();
        for (const survey of surveys) {
          survey.selectedIssues.map(issue => {
            uniqueIssues.add(issue);
          });
          let thumb: Reaction = survey.selectedThumb;
          if (thumb === 'thumb_up') up++;
          else down++;
        }
        setIssues(Array.from(uniqueIssues))
        setThumbsUp(up);
        setThumbsDown(down);
        setIsLoading(false);
      }
    }
    getSurveys();
    console.log(issues)
  }, [user])

  return (
    <Card className={className}>
      <CardHeading>
        Video Quality Surveys
      </CardHeading>
      <div className="">
        {isLoading ? 
          <LoadingSpinner/> :
          <div className="mt-2">
            <div className="justify-items-center grid gap-2 grid-cols-2">
              <div>
                <Icon
                  className="text-primary mt-2"
                  name='thumb_up'
                  outline
                />
                <p className="font-bold">{thumbsUp ? thumbsUp : 0}</p>
              </div>
              <div>
                <Icon
                  className="text-primary mt-2"
                  name='thumb_down'
                  outline
                />
                <p className="mx-2 font-bold">{thumbsDown ? thumbsDown : 0}</p>
              </div>
            </div>
            {issues && 
              <div>
                <p className="text-primary text-lg">Issues:</p>
                {issues.map((issue, index) => 
                  <p className="text-sm" key={index}>• {issue}</p>
                )}
              </div>
            }
          </div>
        }
      </div>
    </Card>
  )
}

export default SurveyResultsCard;
