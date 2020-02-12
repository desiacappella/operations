import log from "loglevel";
import { median, min } from "mathjs";
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
  mean,
  filter,
  get,
  size,
  zipObject,
  max
} from "lodash";

import { DETAILS } from "./constants";
import { GSheetsScoreManager } from "./scoreManager";
import { ScoresDict, Group, Stat, Rank } from "./types";

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

  forEach(allScores, val => {
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
  const sortedByValue = reverse(sortBy(values(pairs), [p => p[1]]));

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

export class CircuitView {
  year: string;
  comps: any;
  compDetails?: Record<string, Record<string, any>>;
  groups?: string[];
  amed?: Record<string, number>;
  amean?: Record<string, number>;
  rmed?: Record<string, number>;
  rmean?: Record<string, number>;
  amedRank?: Record<string, number>;
  ameanRank?: Record<string, number>;
  rmedRank?: Record<string, number>;
  rmeanRank?: Record<string, number>;

  /* Process competition scores to produce a CircuitView. `num` is the number of competitions to process. If num is -1, processes all competitions. `year` is the year to process. */
  constructor(num: number, year: string) {
    this.year = year;

    // First, convert (num, year) to comps
    const _comps: string[] = DETAILS[year].order;

    if (num > _comps.length) {
      throw new Error("Illegal argument: num");
    }

    if (num < 0) num = _comps.length;

    this.comps = _comps.slice(0, num);

    log.debug("comps:", this.comps);
  }

  async process() {
    this.compDetails = zipObject(
      this.comps,
      await Promise.all(map(this.comps, comp => this.handle_comp(comp)))
    );

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
    // this.attended: Record<Group, Array<string>> = reduce(this.groups, (acc, group) => {
    //     const list = [comp for comp in this.comps if group in this.comp_details[comp][RAW]];
    //     const list = filter(group in this.comp_details[comp][RAW] ?
    //     acc[group] = list
    // }, {});

    // {
    //     group: [
    //         ]
    //     for group in this.groups
    // }
    // this.avg_groups_per_comp = numpy.mean(
    //     [len(this.comp_details[comp][RAW]) for comp in this.comp_details])
    // this.avg_judges_per_comp = numpy.mean(
    //     [len(this.comp_details[comp]["judge_avgs"]) for comp in this.comp_details])
    // this.avg_comps_per_group = numpy.mean(
    //     [len(this.attended[group]) for group in this.groups])
    // this.best_score = {
    //     "group": "Lel",
    //     "comp": "Lol",
    //     "score": 420.69
    // }
  }

  /*
        Handles a single competition.
        :param comp: name of comp
        :return: raw and normalized score dictionary, mapping group to list of scores for this comp
        */
  async handle_comp(comp: string): Promise<Record<string, any>> {
    const scoreManager = new GSheetsScoreManager();

    const [raw, numJudges] = await scoreManager.get_raw_scores(this.year, comp);

    // normalize for each group for this comp
    const judgeAvgs = map(range(numJudges), i => mean(map(raw, scores => scores[i])));

    const normal = mapValues(raw, scores => map(scores, (x, i) => (x * 100) / judgeAvgs[i]));

    const finalScores = mapValues(normal, scores => mean(scores));
    const finalScoresList = values(finalScores);
    const compMax = max(finalScoresList);
    const compMin = min(finalScoresList);
    // TODO judge names

    return {
      RAW: raw,
      NORMAL: normal,
      final_scores: finalScores,
      max: compMax,
      min: compMin,
      judge_avgs: judgeAvgs
    };
  }

  /*
        Returns an ordered dictionary of all of the thresholded groups.
        */
  get_standings() {
    const buckets: Record<number, string[]> = {};
    log.debug(`${size(this.groups)} total groups`);

    // Bucketize all groups
    forEach(this.groups, group => {
      const bucket = max([
        get(this.amedRank, `[${group}]`, size(this.groups)),
        get(this.ameanRank, `[${group}]`, size(this.groups)),
        get(this.rmedRank, `[${group}]`, size(this.groups)),
        get(this.rmeanRank, `[${group}]`, size(this.groups))
      ]);
      if (bucket) {
        buckets[bucket] = bucket in buckets ? concat(buckets[bucket], group) : [group];
      }
    });

    // Sort each bucket by group name
    return mapValues(buckets, vals => sortBy(vals));
  }

  /* Select groups given a threshold. */
  selectGroups = (threshold: number) =>
    filter(
      this.groups,
      t =>
        get(this.amedRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.ameanRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.rmedRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.rmeanRank, `[${t}]`, size(this.groups)) <= threshold
    );
}
