import { map, mapValues, values, range } from "lodash";
import { max, median, mean, min } from "mathjs";
import { ScoresDict } from "../types";

/**
 * Handles a single competition.
 * :param year: year
 * :param comp: name of comp
 * :return: raw and normalized score dictionary, mapping group to list of scores for this comp
 */
export const handleComp = (raw: ScoresDict, numJudges: number): CompDetail => {
  // normalize for each group for this comp
  const judgeAvgs = map(range(numJudges), (i) => {
    const judgeScores = map(raw, (scores) => scores[i]);
    const m = mean(judgeScores);
    return m;
  });

  const normal = mapValues(raw, (scores) => map(scores, (x, i) => (x * 100) / judgeAvgs[i]));

  const rawAverages = mapValues(raw, (scores) => mean(scores));
  const normalAverages = mapValues(normal, (scores) => mean(scores));
  const normalMedians = mapValues(normal, (scores) => median(scores));
  const finalScoresList = values(normalAverages);
  const compMax = finalScoresList.length ? max(finalScoresList) : 0;
  const compMin = finalScoresList.length ? min(finalScoresList) : 0;
  // TODO judge names

  return {
    raw,
    normal,
    rawAverages,
    normalAverages,
    normalMedians,
    max: compMax,
    min: compMin,
    judgeAvgs,
  };
};

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
