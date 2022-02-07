export type Group = string;
export type Score = number;
export type Stat = number;
export type Rank = number;
export type ScoresDict = Record<Group, Score[]>;
export type Year = string;

export interface CompDetail {
  raw: ScoresDict;
  normal: ScoresDict;
  rawAverages: Record<string, number>;
  normalAverages: Record<string, number>;
  normalMedians: Record<string, number>;
  max: number;
  min: number;
  judgeAvgs: number[];
}
