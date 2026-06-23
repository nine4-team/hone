import { beltPoints } from './hits';
import type { Belt } from './types';

export type BeltOption = {
  belt: Belt;
  label: string;
  kids: boolean;
  points: number;
};

// Display order for belt pickers: adult ranks first, then kids ranks.
export const BELT_OPTIONS: BeltOption[] = [
  { belt: 'white', label: 'White', kids: false, points: beltPoints('white') },
  { belt: 'blue', label: 'Blue', kids: false, points: beltPoints('blue') },
  { belt: 'purple', label: 'Purple', kids: false, points: beltPoints('purple') },
  { belt: 'brown', label: 'Brown', kids: false, points: beltPoints('brown') },
  { belt: 'black', label: 'Black', kids: false, points: beltPoints('black') },
  { belt: 'kids_white', label: 'White (Kids)', kids: true, points: beltPoints('kids_white') },
  { belt: 'kids_grey', label: 'Grey (Kids)', kids: true, points: beltPoints('kids_grey') },
  { belt: 'kids_yellow', label: 'Yellow (Kids)', kids: true, points: beltPoints('kids_yellow') },
  { belt: 'kids_orange', label: 'Orange (Kids)', kids: true, points: beltPoints('kids_orange') },
  { belt: 'kids_green', label: 'Green (Kids)', kids: true, points: beltPoints('kids_green') },
];

const LABEL_BY_BELT = new Map<Belt, string>(BELT_OPTIONS.map((option) => [option.belt, option.label]));

// Short label for showing a partner's belt. Defaults to White when unset.
export function beltLabel(belt?: Belt): string {
  return LABEL_BY_BELT.get(belt ?? 'white') ?? 'White';
}
