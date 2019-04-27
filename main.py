import collections
import itertools
import csv
import pprint
from functools import partial
from typing import List, Dict

import numpy
import os

dir = 'scores'
NAME = "name"

pp = pprint.PrettyPrinter(indent=4)


def handle_comp(file: str):
    """
    Handles a single competition. (`os.path.splitext(file)[0]`)
    :param file: CSV file with scores for the competition
    :return: raw and normalized score dictionary, mapping group to list of scores for this comp
    """
    with open(os.path.join(dir, file), mode='r') as infile:
        # Trick to calculate the number of judges ahead of time
        col_reader, reader = itertools.tee(csv.reader(infile))
        num_judges: int = len(next(col_reader)) - 1
        del col_reader

        # raw judges' scores per group
        raw: Dict[str, List[float]] = {}
        for oScores in reader:
            raw[oScores[0]] = [float(x) for x in oScores[1:]]

        # normalize for each group for this comp
        judge_avgs: List[numpy.ndarray] = []
        for i in range(num_judges):
            judge_avgs.append(numpy.mean([raw[group][i] for group in raw]))

        normal: Dict[str, List[float]] = {}
        for group in raw:
            scores = raw[group]
            normal[group] = [x * 100 / judge_avgs[i] for i, x in enumerate(scores)]

    return raw, normal


def build_totals(files: List[str]):
    """
    Builds up all of the raw and normalized scores across the given competitions for all groups.
    :param files: list of all competition score files
    :return:
    """
    all_raw = {}
    all_normal = {}
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


def get_stats(scores):
    """
    Converts dictionary of scores to dictionaries of median and mean values
    :param scores: dictionary of group to list of scores
    :return: median and mean dictionaries
    """
    med = {}
    mean = {}

    for group in scores:
        med[group] = numpy.median(scores[group])
        mean[group] = numpy.mean(scores[group])

    return med, mean


def get_ranks(stats_map):
    # TODO use pandas rank
    sorted_by_value = sorted(stats_map.items(), key=lambda kv: kv[1], reverse=True)
    # start with 1
    return {tup[0]: (i + 1) for i, tup in enumerate(sorted_by_value)}


def select_groups(groups, amed_rank, amean_rank, rmed_rank, rmean_rank):
    while True:
        threshold = int(input("Enter threshold: "))
        selected_groups = [t for t in groups if
                           amed_rank[t] <= threshold and amean_rank[t] <= threshold and rmed_rank[t] <= threshold and
                           rmean_rank[t] <= threshold]
        print(selected_groups)


def get_standings(groups: List[str], amed_rank, amean_rank, rmed_rank, rmean_rank):
    buckets = {}
    print(f"{len(groups)} groups")
    for t in groups:
        bucket = max(amed_rank[t], amean_rank[t], rmed_rank[t], rmean_rank[t])
        buckets[bucket] = (buckets[bucket] if bucket in buckets else []) + [t]
    buckets: collections.OrderedDict[int, List[str]] = collections.OrderedDict(sorted(buckets.items()))

    print(buckets)
    with open("output.csv", mode="w") as outfile:
        outfile.write("threshold,groups\n")
        for bucket in buckets:
            outfile.write(f"{bucket},{buckets[bucket]}\n")


def get_group_stats(group: str, groups: List[str], amed_rank, amean_rank, rmed_rank, rmean_rank):
    print(
        f"{group}: Abs Median {amed_rank[group]}, Abs Mean {amean_rank[group]}, Rel Median {rmed_rank[group]}, Rel Mean {rmean_rank[group]}")


def main():
    files: List[str] = os.listdir(dir)

    # build normals
    raw, normal = build_totals(files)
    groups = raw.keys()

    # evaluate numbers
    amed, amean = get_stats(raw)
    rmed, rmean = get_stats(normal)

    # get ranks
    amed_rank = get_ranks(amed)
    amean_rank = get_ranks(amean)
    rmed_rank = get_ranks(rmed)
    rmean_rank = get_ranks(rmean)

    # Work the passed-in threshold
    process_fn = get_group_stats  # get_standings  # select_groups
    process_fn = partial(process_fn, input("Enter group"))

    process_fn(groups, amed_rank, amean_rank, rmed_rank, rmean_rank)


if __name__ == '__main__':
    main()
