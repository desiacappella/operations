import { median, mean, min, max } from "mathjs";
import {
  reduce,
  forEach,
  concat,
  toPairs,
  reverse,
  sortBy,
  values,
  keys,
  map,
  range,
  mapValues,
  filter,
  get,
  size,
} from "lodash";

import { DETAILS } from "./compDetails";
import { GSheetsScoreManager } from "./scoreManager";
import { ScoresDict, Group, Stat, Rank } from "../types";

export class CircuitView {
  year: Year;
  comps: string[];
  compDetails: Record<string, Record<string, any>> = {};
  groups: string[] = [];
  amed: Record<string, number> = {};
  amean: Record<string, number> = {};
  rmed: Record<string, number> = {};
  rmean: Record<string, number> = {};
  amedRank: Record<string, number> = {};
  ameanRank: Record<string, number> = {};
  rmedRank: Record<string, number> = {};
  rmeanRank: Record<string, number> = {};

  /**
   * Process competition scores to produce a CircuitView. `num` is the number of competitions to
   * process. If num is -1, processes all competitions. `year` is the year to process.
   */
  constructor(num: number, year: string) {
    this.year = year;

    // First, convert (num, year) to comps
    const _comps: string[] = DETAILS[year].order;

    if (num > _comps.length) {
      throw new Error("Illegal argument: num");
    }

    if (num < 0) num = _comps.length;

    this.comps = _comps.slice(0, num);
  }

  async process() {
    // FIXME For now, do sequentially because we need to cache
    const details = {} as Record<string, Record<string, any>>;
    for (const comp of this.comps) {
      details[comp] = await handleComp(this.year, comp);
    }

    this.compDetails = details; /* zipObject(
    cv.comps,
    await Promise.all(map(cv.comps, comp => handleComp(cv.year, comp)))
  );*/

    // build normals
    const [raw, normal] = build_totals(this.compDetails);
    this.groups = keys(raw);

    // evaluate numbers
    const [amed, amean] = get_stats(raw);
    const [rmed, rmean] = get_stats(normal);
    this.amed = amed;
    this.amean = amean;
    this.rmed = rmed;
    this.rmean = rmean;

    // get ranks
    this.amedRank = get_ranks(this.amed);
    this.ameanRank = get_ranks(this.amean);
    this.rmedRank = get_ranks(this.rmed);
    this.rmeanRank = get_ranks(this.rmean);

    // compute misc. stats
    // cv.attended: Record<Group, Array<string>> = reduce(cv.groups, (acc, group) => {
    //     const list = [comp for comp in cv.comps if group in cv.comp_details[comp][RAW]];
    //     const list = filter(group in cv.comp_details[comp][RAW] ?
    //     acc[group] = list
    // }, {});

    // {
    //     group: [
    //         ]
    //     for group in cv.groups
    // }
    // cv.avg_groups_per_comp = numpy.mean(
    //     [len(cv.comp_details[comp][RAW]) for comp in cv.comp_details])
    // cv.avg_judges_per_comp = numpy.mean(
    //     [len(cv.comp_details[comp]["judge_avgs"]) for comp in cv.comp_details])
    // cv.avg_comps_per_group = numpy.mean(
    //     [len(cv.attended[group]) for group in cv.groups])
    // cv.best_score = {
    //     "group": "Lel",
    //     "comp": "Lol",
    //     "score": 420.69
    // }
  }

  getGroupStats(group: Group) {
    return {
      amed: this.amed[group] || 0,
      amean: this.amean[group] || 0,
      rmed: this.rmed[group] || 0,
      rmean: this.rmean[group] || 0,
    };
  }

  getGroupRanks(group: Group) {
    return {
      amed: this.amedRank[group] || this.groups.length + 1,
      amean: this.ameanRank[group] || this.groups.length + 1,
      rmed: this.rmedRank[group] || this.groups.length + 1,
      rmean: this.rmeanRank[group] || this.groups.length + 1,
      total: this.groups.length,
    };
  }
}

export type Year = string;

/*
    Builds up all of the raw and normalized scores across the given competitions for all groups.
    :param all_scores: all competition scores
    :return: tuple of [raw scores dict, normalized scores dict]
    */
function build_totals(
  allScores?: Record<string, Record<string, ScoresDict>>
): [ScoresDict, ScoresDict] {
  const allRaw: ScoresDict = {};
  const allNormal: ScoresDict = {};

  forEach(allScores, (val) => {
    const raw = val.raw;
    const normal = val.normal;

    // TODO nicer reduce function?
    forEach(raw, (scores, group) => {
      allRaw[group] = group in allRaw ? concat(allRaw[group], scores) : scores;
      allNormal[group] =
        group in allNormal ? concat(allNormal[group], normal[group]) : normal[group];
    });
  });

  return [allRaw, allNormal];
}

/*
    Converts dictionary of scores to dictionaries of median and mean values
    :param scores: dictionary of group to list of scores
    :return: median and mean dictionaries
    */
function get_stats(scores?: ScoresDict) {
  const _med: Record<Group, Stat> = {};
  const _mean: Record<Group, Stat> = {};

  forEach(scores, (score, group) => {
    _med[group] = median(score);
    _mean[group] = mean(score);
  });

  return [_med, _mean];
}

// Map of group -> value
function get_ranks(statsMap: Record<Group, Stat>): Record<Group, Rank> {
  const pairs = toPairs(statsMap);
  const sortedByValue = reverse(sortBy(values(pairs), [(p) => p[1]]));

  // start with 1
  return reduce(
    sortedByValue,
    (acc, cur, idx) => {
      acc[cur[0]] = idx + 1;
      return acc;
    },
    {} as Record<Group, Rank>
  );
}

/**
 * Handles a single competition.
 * :param year: year
 * :param comp: name of comp
 * :return: raw and normalized score dictionary, mapping group to list of scores for this comp
 */
export const handleComp = async (year: Year, comp: string): Promise<Record<string, any>> => {
  const scoreManager = new GSheetsScoreManager();

  const [raw, numJudges] = await scoreManager.get_raw_scores(year, comp);

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

export const getStandings = (cv: CircuitView) => {
  const buckets: Record<number, string[]> = {};

  // Bucketize all groups
  forEach(get(cv, "groups"), (group) => {
    const bucket = max([
      get(cv.amedRank, `[${group}]`, size(cv.groups)),
      get(cv.ameanRank, `[${group}]`, size(cv.groups)),
      get(cv.rmedRank, `[${group}]`, size(cv.groups)),
      get(cv.rmeanRank, `[${group}]`, size(cv.groups)),
    ]);
    if (bucket) {
      buckets[bucket] = bucket in buckets ? concat(buckets[bucket], group) : [group];
    }
  });

  // Sort each bucket by group name
  return mapValues(buckets, (vals) => sortBy(vals));
};

/*
        Returns an ordered dictionary of all of the thresholded groups.
        */
export const getFullStandings = (
  cv: CircuitView
): Record<number, Record<string, Record<string, number>>> => {
  const buckets = getStandings(cv);

  return mapValues(buckets, (groups) =>
    reduce(
      groups,
      (acc, group) => {
        acc[group] = {
          amed: cv.amedRank[group],
          amean: cv.ameanRank[group],
          rmed: cv.rmedRank[group],
          rmean: cv.rmeanRank[group],
        };
        return acc;
      },
      {} as Record<string, Record<string, number>>
    )
  );
};

/* Select groups given a threshold. */
export const selectGroups = (cv: CircuitView, threshold: number) => {
  filter(
    cv.groups,
    (t) =>
      get(cv.amedRank, `[${t}]`, size(cv.groups)) <= threshold &&
      get(cv.ameanRank, `[${t}]`, size(cv.groups)) <= threshold &&
      get(cv.rmedRank, `[${t}]`, size(cv.groups)) <= threshold &&
      get(cv.rmeanRank, `[${t}]`, size(cv.groups)) <= threshold
  );
};
