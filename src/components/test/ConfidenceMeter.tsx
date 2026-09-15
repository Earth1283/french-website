import { SE_STOP_THRESHOLD } from '../../utils/irt';
import { Meter } from '../ui/Meter';

interface ConfidenceMeterProps {
  se: number;
  questionNumber: number;
}

export function ConfidenceMeter({ se, questionNumber }: ConfidenceMeterProps) {
  const confidence = Math.max(0, Math.min(1, (1 - se) / (1 - SE_STOP_THRESHOLD)));

  return (
    <div className="flex items-center gap-3">
      <span className="t-small num whitespace-nowrap">
        Question {questionNumber}
      </span>
      <Meter percent={confidence * 100} label={`${Math.round(confidence * 100)} percent confidence`} className="meter meter--wide flex-1" />
    </div>
  );
}
