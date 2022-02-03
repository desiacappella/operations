export type Group = string;
export type Score = number;
export type Stat = number;
export type Rank = number;
export type ScoresDict = Record<Group, Score[]>;

export interface SingleYear {
  order: string[];
  names: Record<string, string>;
  sheetIds: Record<string, string>;
}
