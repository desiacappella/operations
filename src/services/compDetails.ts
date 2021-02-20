import { map, mapValues, values, range } from "lodash";
import { max, mean, min,  } from "mathjs";
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

  const finalScores = mapValues(normal, (scores) => mean(scores));
  const finalScoresList = values(finalScores);
  const compMax = finalScoresList.length ? max(finalScoresList) : 0;
  const compMin = finalScoresList.length ? min(finalScoresList) : 0;
  // TODO judge names

  return {
    raw,
    normal,
    finalScores,
    max: compMax,
    min: compMin,
    judgeAvgs,
  };
};

export interface CompDetail {
  raw: ScoresDict;
  normal: ScoresDict;
  finalScores: Record<string, number>;
  max: number;
  min: number;
  judgeAvgs: number[];
}
