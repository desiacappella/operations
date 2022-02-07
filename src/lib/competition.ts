import { mean, max, min, median } from "mathjs";
import { values, map, range, mapValues } from "lodash";
import { CompDetail, ScoresDict, Year } from "../types";
import { GSheetsScoreManager } from "../services/scoreManager";

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

// Retrieve competition details for a year and competition name
export const handleGComp = async (year: Year, comp: string): Promise<CompDetail> => {
  const scoreManager = new GSheetsScoreManager();

  const [raw, numJudges] = await scoreManager.get_raw_scores(year, comp);

  return handleComp(raw, numJudges);
};
