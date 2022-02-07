import { median, mean, max } from "mathjs";
import {
  reduce,
  forEach,
  concat,
  sortBy,
  keys,
  map,
  mapValues,
  filter,
  get,
  size,
  has,
  set,
} from "lodash";
import { DETAILS } from "../services/compIds";
import { ScoresDict, Group, Stat, Rank, CompDetail, Year } from "../types";
import log from "loglevel";
import { handleGComp } from "./competition";
import { get_ranks } from "./calculator";

// Represents the view across multiple competitions, i.e. a season or part of a season.
export class CircuitView {
  year: Year;
  comps: string[];
  compDetails: Record<string, CompDetail> = {};
  groups: Group[] = [];
  amed: Record<Group, Stat> = {};
  amean: Record<Group, Stat> = {};
  rmed: Record<Group, Stat> = {};
  rmean: Record<Group, Stat> = {};
  amedRank: Record<Group, Rank> = {};
  ameanRank: Record<Group, Rank> = {};
  rmedRank: Record<Group, Rank> = {};
  rmeanRank: Record<Group, Rank> = {};
  attended: Record<Group, string[]> = {};
  avgGroupsPerComp = 0;
  avgJudgesPerComp = 0;
  avgCompsPerGroup = 0;

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
    // FIXME For now, do sequentially because we need to cache in localStorage internally
    const details = {} as Record<string, CompDetail>;
    for (const comp of this.comps) {
      details[comp] = await handleGComp(this.year, comp);
    }

    this.compDetails = details; /* zipObject(
    cv.comps,
    await Promise.all(map(cv.comps, comp => handleComp(cv.year, comp)))
  );*/

    // build normals
    const [raw, normal] = CircuitView.build_totals(this.compDetails);
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
    this.attended = reduce(
      this.groups,
      (acc, group) =>
        set(
          acc,
          group,
          filter(this.comps, (comp) => {
            // See if this group competed in this comp
            if (has(this.compDetails[comp].raw, group)) {
              return true;
            }
            return false;
          })
        ),
      {}
    );

    try {
      this.avgGroupsPerComp = mean(map(this.compDetails, (det) => size(det.raw)));
      this.avgJudgesPerComp = mean(map(this.compDetails, (det) => size(det.judgeAvgs)));
      this.avgCompsPerGroup = mean(map(this.groups, (g) => size(this.attended[g])));
    } catch (err) {
      log.error(err);
      this.avgGroupsPerComp = 0;
      this.avgJudgesPerComp = 0;
      this.avgCompsPerGroup = 0;
    }
    // cv.best_score = {
    //     "group": "Lel",
    //     "comp": "Lol",
    //     "score": 420.69
    // }
  }

  /*
    Builds up all of the raw and normalized scores across the given competitions for all groups.
    :param all_scores: all competition scores
    :return: tuple of [raw scores dict, normalized scores dict]
    */
  private static build_totals(allScores?: Record<string, CompDetail>): [ScoresDict, ScoresDict] {
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

  getStandings() {
    const buckets: Record<number, string[]> = {};

    // Bucketize all groups
    forEach(this.groups, (group) => {
      const bucket = max([
        get(this.amedRank, `[${group}]`, size(this.groups)),
        get(this.ameanRank, `[${group}]`, size(this.groups)),
        get(this.rmedRank, `[${group}]`, size(this.groups)),
        get(this.rmeanRank, `[${group}]`, size(this.groups)),
      ]);
      if (bucket) {
        buckets[bucket] = bucket in buckets ? concat(buckets[bucket], group) : [group];
      }
    });

    // Sort each bucket by group name
    return mapValues(buckets, (vals) => sortBy(vals));
  }

  /**
   * Returns an ordered dictionary of all of the thresholded groups.
   */
  getFullStandings(): Record<number, Record<string, Record<string, number>>> {
    const buckets = this.getStandings();

    return mapValues(buckets, (groups) =>
      reduce(
        groups,
        (acc, group) => {
          acc[group] = {
            amed: this.amedRank[group],
            amean: this.ameanRank[group],
            rmed: this.rmedRank[group],
            rmean: this.rmeanRank[group],
          };
          return acc;
        },
        {} as Record<string, Record<string, number>>
      )
    );
  }

  /* Select groups given a threshold. */
  selectGroups(threshold: number) {
    return filter(
      this.groups,
      (t) =>
        get(this.amedRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.ameanRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.rmedRank, `[${t}]`, size(this.groups)) <= threshold &&
        get(this.rmeanRank, `[${t}]`, size(this.groups)) <= threshold
    );
  }
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
