import collections
import csv
import itertools
import os
from typing import List, Dict, Type, Tuple

import numpy

# In order list of competitions
COMPS = ['jeena', 'anahat', 'sangeet', 'mehfil', 'sahana', 'gathe', 'awaazein']
SCORES_DIR = 'scores'

Group: Type = str
Score: Type = float
Stat: Type = float
Rank: Type = int
ScoresDict: Type = Dict[Group, List[Score]]


def handle_comp(file: str) -> Tuple[ScoresDict, ScoresDict]:
    """
    Handles a single competition.
    :param file: CSV file with scores for the competition (relative path to script)
    :return: raw and normalized score dictionary, mapping group to list of scores for this comp
    """
    with open(file, mode='r') as infile:
        # Trick to calculate the number of judges ahead of time
        col_reader, reader = itertools.tee(csv.reader(infile))

        num_judges = len(next(col_reader)) - 1
        del col_reader

        # raw judges' scores per group
        raw: ScoresDict = {}
        for oScores in reader:
            raw[oScores[0]] = [float(x) for x in oScores[1:]]

        # normalize for each group for this comp
        judge_avgs: List[numpy.ndarray] = []
        for i in range(num_judges):
            judge_avgs.append(numpy.mean([raw[group][i] for group in raw]))

        normal: ScoresDict = {}
        for group in raw:
            scores = raw[group]
            normal[group] = [x * 100 / judge_avgs[i] for i, x in enumerate(scores)]

    return raw, normal


def build_totals(files: List[str]) -> Tuple[ScoresDict, ScoresDict]:
    """
    Builds up all of the raw and normalized scores across the given competitions for all groups.
    :param files: list of all competition score files
    :return:
    """
    all_raw: ScoresDict = {}
    all_normal: ScoresDict = {}
    for file in files:
        raw, normal = handle_comp(file)
        # TODO there's definitely a nice lib function to do this
        for group in raw:
            if group in all_raw:
                all_raw[group] = all_raw[group] + raw[group]
            else:
                all_raw[group] = raw[group]

        for group in normal:
            if group in all_normal:
                all_normal[group] = all_normal[group] + normal[group]
            else:
                all_normal[group] = normal[group]

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

    def __init__(self, files: List[str]):
        self.files = files

        # build normals
        raw, normal = build_totals(self.files)
        self.groups = list(raw.keys())

        # evaluate numbers
        self.amed, self.amean = get_stats(raw)
        self.rmed, self.rmean = get_stats(normal)

        # get ranks
        self.amed_rank = get_ranks(self.amed)
        self.amean_rank = get_ranks(self.amean)
        self.rmed_rank = get_ranks(self.rmed)
        self.rmean_rank = get_ranks(self.rmean)

    def select_groups(self):
        while True:
            threshold = int(input("Enter threshold: "))
            selected_groups = [t for t in self.groups if
                               self.amed_rank[t] <= threshold and self.amean_rank[t] <= threshold and self.rmed_rank[
                                   t] <= threshold and
                               self.rmean_rank[t] <= threshold]
            print(selected_groups)

    def get_standings(self):
        buckets: Dict[float, List[str]] = {}
        print(f"{len(self.groups)} groups")
        for t in self.groups:
            bucket: Rank = max(self.amed_rank[t], self.amean_rank[t], self.rmed_rank[t], self.rmean_rank[t])
            buckets[bucket] = (buckets[bucket] if bucket in buckets else []) + [t]
        buckets = {key: sorted(value) for (key, value) in buckets.items()}
        ordered_buckets = collections.OrderedDict(sorted(iter(buckets.items())))

        print(ordered_buckets)
        with open("output.csv", mode="w") as outfile:
            outfile.write("Threshold,Groups\n")
            for bucket in ordered_buckets:
                outfile.write(f"{bucket},{ordered_buckets[bucket]}\n")

    def get_group_stats(self, group: str):
        print(f"{group}: Abs Median {self.amed_rank[group]}, Abs Mean {self.amean_rank[group]}, "
              f"Rel Median {self.rmed_rank[group]}, Rel Mean {self.rmean_rank[group]}")

    def create_report(self, group: str):
        pass


def main():
    # Full circuit
    files: List[str] = [f"{SCORES_DIR}{os.path.sep}{comp}.csv" for comp in COMPS]
    full = CircuitView(files)

    full.get_group_stats(input("Enter group: "))


if __name__ == '__main__':
    main()
