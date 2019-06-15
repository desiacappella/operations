import collections
import csv
import itertools
import json
import os
from typing import List, Dict, Type, Tuple, Any
from tabulate import tabulate

import numpy

SCORES_DIR = 'scores'
RAW = "raw"
NORMAL = "normal"

Group: Type = str
Score: Type = float
Stat: Type = float
Rank: Type = int
ScoresDict: Type = Dict[Group, List[Score]]


def comp_to_file(comp: str) -> str:
    return f"{SCORES_DIR}{os.path.sep}{comp}.csv"


def handle_comp(comp: str) -> Dict[str, Any]:
    """
    Handles a single competition.
    :param comp: name of comp
    :return: raw and normalized score dictionary, mapping group to list of scores for this comp
    """
    with open(comp_to_file(comp), mode='r') as infile:
        # Trick to calculate the number of judges ahead of time
        col_reader, reader = itertools.tee(csv.reader(infile))

        num_judges = len(next(col_reader)) - 1
        del col_reader

        # raw judges' scores per group
        raw = {oScores[0]: [float(x) for x in oScores[1:]] for oScores in reader}

    # normalize for each group for this comp
    judge_avgs = [numpy.mean([raw[group][i] for group in raw]) for i in range(num_judges)]

    normal = {group: [x * 100 / judge_avgs[i] for i, x in enumerate(raw[group])] for group in raw}

    final_scores = {group: numpy.average(normal[group]) for group in normal}
    final_scores_list = final_scores.values()
    comp_max = max(final_scores_list)
    comp_min = min(final_scores_list)
    comp_avg = numpy.mean(list(final_scores_list))
    # TODO judge names

    return {RAW: raw, NORMAL: normal, 'final_scores': final_scores, 'max': comp_max, 'min': comp_min, 'avg': comp_avg,
            'judge_avgs': judge_avgs}


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
            all_raw[group] = (all_raw[group] + raw[group]) if group in all_raw else raw[group]
            all_normal[group] = (all_normal[group] + normal[group]) if group in all_normal else normal[group]

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
    sorted_by_value = sorted(stats_map.items(), key=lambda kv: kv[1], reverse=True)
    # start with 1
    return {tup[0]: (i + 1) for i, tup in enumerate(sorted_by_value)}


class CircuitView:
    """
    Represents the state of the circuit
    """

    def __init__(self, comps: List[str], setup=True):
        self.comps = comps

        if setup:
            self.comp_details: Dict[str, Dict[str, Any]] = {
                comp: handle_comp(comp) for comp in comps
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

    # TODO look up a better way to persist python classes
    @staticmethod
    def load(filename: str):
        with open(filename, 'r') as f:
            d = json.load(f)

        cv = CircuitView(d['comps'], False)
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
        Bucketize and get standings. Save to filename
        :return:
        """
        buckets: Dict[float, List[str]] = {}
        print(f"{len(self.groups)} groups")

        # Bucketize all groups
        for group in self.groups:
            bucket: Rank = max(self.amed_rank[group], self.amean_rank[group], self.rmed_rank[group],
                               self.rmean_rank[group])
            buckets[bucket] = (buckets[bucket] + [group]) if bucket in buckets else [group]

        # Sort each bucket by group name
        buckets = {key: sorted(value) for (key, value) in buckets.items()}

        # Convert to OrderedDict for output
        ordered_buckets = collections.OrderedDict(sorted(iter(buckets.items())))

        with open(filename, mode="w") as outfile:
            outfile.write("Threshold,Groups\n")
            for bucket in ordered_buckets:
                outfile.write(f"{bucket},{ordered_buckets[bucket]}\n")

    def get_group_stats(self, group: Group):
        return {
            "amed": self.amed[group] if group in self.amed else 0,
            "amean": self.amean[group] if group in self.amean else 0,
            "rmed": self.rmed[group] if group in self.rmed else 0,
            "rmean": self.rmean[group] if group in self.rmean else 0,
        }

    def get_group_ranks(self, group: Group):
        return {
            "amed": self.amed_rank[group] if group in self.amed_rank else len(self.groups),
            "amean": self.amean_rank[group] if group in self.amean_rank else len(self.groups),
            "rmed": self.rmed_rank[group] if group in self.rmed_rank else len(self.groups),
            "rmean": self.rmean_rank[group] if group in self.rmean_rank else len(self.groups),
        }


def print_sep():
    print()
    print("-" * 100)
    print()


def get_circuit_view(n: int) -> CircuitView:
    """
    :param n: n is number of competitions to consider
    :return:
    """
    if os.path.exists(f"{n}.json"):
        view = CircuitView.load(f"{n}.json")
    else:
        view = CircuitView(comps_18_19[0:n])
        view.dump(f"{n}.json")

    return view


comps_18_19 = ['jeena', 'anahat', 'sangeet', 'mehfil', 'sahana', 'gathe', 'awaazein']


def r(n: float) -> str:
    return str(round(n, 3))


def main():
    # Setup
    circuit_views = [get_circuit_view(i) for i in range(1, len(comps_18_19) + 1)]
    full = circuit_views[-1]

    group = "Tufaan"  # input("Enter group: ")

    print(f"ASA SCORE REPORT 2018-19 FOR {group.upper()}")

    print_sep()

    # SECTION 1: Final details
    print("Year-end scores")
    ranks = full.get_group_ranks(group)
    scores = full.get_group_stats(group)
    print(tabulate([
        ("Ranks",) + (*ranks.values(),),
        ("Scores",) + tuple(r(score) for score in scores.values())
    ], headers=["", "Abs Median", "Abs Mean", "Rel Median", "Rel Mean"]))

    print_sep()

    # SECTION 2: Per-comp details
    attended = [comp for comp in comps_18_19 if group in full.comp_details[comp][RAW]]
    print("Attended competitions: ", *attended)
    for comp in attended:
        details = full.comp_details[comp]
        print(f"{comp}:")
        tprint("Normalized stats:")
        tprint("Average score:", r(details['avg']), n=2)
        tprint("Max score:", r(details['max']), n=2)
        tprint("Min score:", r(details['min']), n=2)

        tprinttable(
            tabulate([
                ("Judge averages",) + tuple(r(avg) for avg in details['judge_avgs']),
                ("Your raw",) + tuple(r(score) for score in details[RAW][group]),
                ("Your normalized",) + tuple(r(score) for score in details[NORMAL][group]),
            ])
        )

    print_sep()

    # SECTION 3: Progression through the year
    rank_progression = [circuit_views[i].get_group_ranks(group) for i in range(len(comps_18_19))]

    print("Your rank progression through the season:")
    print(tabulate([
        ('Abs Median',) + tuple(stat['amed'] for stat in rank_progression),
        ('Abs Mean',) + tuple(stat['amean'] for stat in rank_progression),
        ('Rel Median',) + tuple(stat['rmed'] for stat in rank_progression),
        ('Rel Mean',) + tuple(stat['rmean'] for stat in rank_progression),
    ], headers=(["stat"] + comps_18_19)))


def tprint(*values: Any, n=1):
    print("\t" * n, *values)


def tprinttable(s: str, n=1):
    """
    Split by newline and add tabs
    """
    for line in s.split("\n"):
        tprint(line, n=n)


if __name__ == '__main__':
    main()
