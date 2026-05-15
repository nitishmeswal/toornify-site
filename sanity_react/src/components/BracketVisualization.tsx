import type { BracketMatch } from '@/lib/services';
import { CustomBracket } from './CustomBracket';

interface BracketVisualizationProps {
  matches: BracketMatch[];
  onMatchClick?: (match: BracketMatch) => void;
  editable?: boolean;
}

export function BracketVisualization({ matches, onMatchClick, editable = false }: BracketVisualizationProps) {
  return <CustomBracket matches={matches} onMatchClick={onMatchClick} editable={editable} />;
}
