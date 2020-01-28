import os
import collections
import json
import numpy
import itertools
import csv
from typing import Type, Dict, List, Any, Tuple

Group: Type = str
Score: Type = float
Stat: Type = float
Rank: Type = int
ScoresDict: Type = Dict[Group, List[Score]]

SCORES_DIR = 'scores'
RAW = "raw"
NORMAL = "normal"


def build_totals(all_scores: Dict[str, Dict[str, ScoresDict]]) -> Tuple[ScoresDict, ScoresDict]:
    """
    Builds up all of the raw and normalized scores across the given competitions for all groups.
    :param all_scores: all competition scores
    :return:
    """
    all_raw: ScoresDict = {}
    all_normal: ScoresDict = {}
    for comp in all_scores:
        raw = all_scores[comp]["raw"]
        normal = all_scores[comp]["normal"]

        # TODO nicer reduce function?
        for group in raw:
            all_raw[group] = (all_raw[group] + raw[group]
                              ) if group in all_raw else raw[group]
            all_normal[group] = (
                all_normal[group] + normal[group]) if group in all_normal else normal[group]

    return all_raw, all_normal


def get_stats(scores: ScoresDict):
    """
    Converts dictionary of scores to dictionaries of median and mean values
    :param scores: dictionary of group to list of scores
    :return: median and mean dictionaries
    """
    med: Dict[Group, Stat] = {}
    mean: Dict[Group, Stat] = {}

    for group in scores:
        med[group] = Stat(numpy.median(scores[group]))
        mean[group] = Stat(numpy.mean(scores[group]))

    return med, mean


def get_ranks(stats_map: Dict[Group, Stat]) -> Dict[Group, Rank]:
    # TODO use pandas rank
    sorted_by_value = sorted(
        stats_map.items(), key=lambda kv: kv[1], reverse=True)
    # start with 1
    return {tup[0]: (i + 1) for i, tup in enumerate(sorted_by_value)}


class CircuitView:
    """
    Represents the state of the circuit after a certain number of competitions have occurred.
    """

    def __init__(self, year: str, comps: List[str] = None, setup=True):
        if not comps:
            comps = [x[0:x.find(".csv")] for x in os.listdir(
                os.path.join(SCORES_DIR, year)) if x.endswith(".csv")]

        self.year = year
        self.comps = comps

        if setup:
            self.comp_details: Dict[str, Dict[str, Any]] = {
                comp: self.handle_comp(comp) for comp in comps
            }

            # build normals
            raw, normal = build_totals(self.comp_details)
            self.groups = list(raw.keys())

            # evaluate numbers
            self.amed, self.amean = get_stats(raw)
            self.rmed, self.rmean = get_stats(normal)

            # get ranks
            self.amed_rank = get_ranks(self.amed)
            self.amean_rank = get_ranks(self.amean)
            self.rmed_rank = get_ranks(self.rmed)
            self.rmean_rank = get_ranks(self.rmean)

            # compute misc. stats
            self.attended: Dict[Group, List[str]] = {
                group: [
                    comp for comp in self.comps if group in self.comp_details[comp][RAW]]
                for group in self.groups
            }
            self.avg_groups_per_comp = numpy.mean(
                [len(self.comp_details[comp][RAW]) for comp in self.comp_details])
            self.avg_judges_per_comp = numpy.mean(
                [len(self.comp_details[comp]["judge_avgs"]) for comp in self.comp_details])
            self.avg_comps_per_group = numpy.mean(
                [len(self.attended[group]) for group in self.groups])
            self.best_score = {
                "group": "Lel",
                "comp": "Lol",
                "score": 420.69
            }

    # TODO look up a better way to persist python classes to files
    @staticmethod
    def load(filename: str):
        with open(filename, 'r') as f:
            d = json.load(f)

        cv = CircuitView(d['year'], d['comps'], False)
        cv.comp_details = d['comp_details']
        cv.groups = d['groups']
        cv.amed = d['amed']
        cv.amean = d['amean']
        cv.rmed = d['rmed']
        cv.rmean = d['rmean']
        cv.amed_rank = d['amed_rank']
        cv.amean_rank = d['amean_rank']
        cv.rmed_rank = d['rmed_rank']
        cv.rmean_rank = d['rmean_rank']
        cv.attended = d['attended']
        cv.avg_groups_per_comp = d['avg_groups_per_comp']
        cv.avg_judges_per_comp = d['avg_judges_per_comp']
        cv.avg_comps_per_group = d['avg_comps_per_group']
        cv.best_score = d['best_score']

        return cv

    def dump(self, filename: str):
        with open(filename, 'w') as f:
            json.dump(self.__dict__, f, indent=4)

    def select_groups(self):
        while True:
            threshold = int(input("Enter threshold: "))
            selected_groups = [t for t in self.groups if
                               self.amed_rank[t] <= threshold and self.amean_rank[t] <= threshold and self.rmed_rank[
                                   t] <= threshold and
                               self.rmean_rank[t] <= threshold]
            print(selected_groups)

    def save_standings(self, filename: str):
        """
        Bucketize and get standings. Save to filename (CSV)
        :return:
        """
        buckets: Dict[float, List[str]] = {}
        print(f"{len(self.groups)} groups")

        # Bucketize all groups
        for group in self.groups:
            bucket: Rank = max(self.amed_rank[group], self.amean_rank[group], self.rmed_rank[group],
                               self.rmean_rank[group])
            buckets[bucket] = (buckets[bucket] + [group]
                               ) if bucket in buckets else [group]

        # Sort each bucket by group name
        buckets = {key: sorted(value) for (key, value) in buckets.items()}

        # Convert to OrderedDict for output
        ordered_buckets = collections.OrderedDict(
            sorted(iter(buckets.items())))

        with open(filename, mode="w") as outfile:
            outfile.write("Threshold,Groups\n")
            for bucket in ordered_buckets:
                outfile.write(
                    f"{bucket},{' '.join(ordered_buckets[bucket])}\n")

    def get_group_stats(self, group: Group):
        return {
            "amed": self.amed[group] if group in self.amed else 0,
            "amean": self.amean[group] if group in self.amean else 0,
            "rmed": self.rmed[group] if group in self.rmed else 0,
            "rmean": self.rmean[group] if group in self.rmean else 0,
        }

    def get_group_ranks(self, group: Group):
        return {
            "amed": self.amed_rank[group] if group in self.amed_rank else len(self.groups) + 1,
            "amean": self.amean_rank[group] if group in self.amean_rank else len(self.groups) + 1,
            "rmed": self.rmed_rank[group] if group in self.rmed_rank else len(self.groups) + 1,
            "rmean": self.rmean_rank[group] if group in self.rmean_rank else len(self.groups) + 1,
            "total": len(self.groups),
        }

    def handle_comp(self, comp: str) -> Dict[str, Any]:
        """
        Handles a single competition.
        :param comp: name of comp
        :return: raw and normalized score dictionary, mapping group to list of scores for this comp
        """
        with open(self.comp_to_file(comp), mode='r') as infile:
            # Trick to calculate the number of judges ahead of time
            col_reader, reader = itertools.tee(csv.reader(infile))

            num_judges = len(next(col_reader)) - 1
            del col_reader

            # raw judges' scores per group
            raw = {oScores[0]: [float(x) for x in oScores[1:]]
                   for oScores in reader}

        # normalize for each group for this comp
        judge_avgs = [numpy.mean([raw[group][i] for group in raw])
                      for i in range(num_judges)]

        normal = {group: [x * 100 / judge_avgs[i]
                          for i, x in enumerate(raw[group])] for group in raw}

        final_scores = {group: numpy.average(
            normal[group]) for group in normal}
        final_scores_list = final_scores.values()
        comp_max = max(final_scores_list)
        comp_min = min(final_scores_list)
        # TODO judge names

        return {RAW: raw, NORMAL: normal, 'final_scores': final_scores, 'max': comp_max, 'min': comp_min,
                'judge_avgs': judge_avgs}

    def comp_to_file(self, comp: str) -> str:
        return os.path.join(SCORES_DIR, self.year, f"{comp}.csv")
