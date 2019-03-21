import sys
import itertools
import csv
import pprint
import numpy
import os

dir = 'scores'
NAME = "name"

pp = pprint.PrettyPrinter(indent=4)


def handle_comp(file):
    comp = os.path.splitext(file)[0]
    with open(os.path.join(dir, file), mode='r') as infile:
        col_reader, reader = itertools.tee(csv.reader(infile))
        num_judges = len(next(col_reader)) - 1
        del col_reader
        import sys

        # raw judges' scores
        raw = {}
        for oScores in reader:
            raw[oScores[0]] = [float(x) for x in oScores[1:]]

        # normalize for each team for this comp
        judge_avgs = []
        for i in range(num_judges):
            judge_avgs.append(numpy.mean([raw[team][i] for team in raw]))

        normal = {}
        for team in raw:
            scores = raw[team]
            normal[team] = [x * 100 / judge_avgs[i] for i, x in enumerate(scores)]

    return raw, normal


def buildTotals(files):
    all_raw = {}
    all_normal = {}
    for file in files:
        raw, normal = handle_comp(file)
        for team in raw:
            if team in all_raw:
                all_raw[team] = all_raw[team] + raw[team]
            else:
                all_raw[team] = raw[team]

        for team in normal:
            if team in all_normal:
                all_normal[team] = all_normal[team] + normal[team]
            else:
                all_normal[team] = normal[team]

    return all_raw, all_normal


def get_stats(scores):
    med = {}
    mean = {}

    for team in scores:
        med[team] = numpy.median(scores[team])
        mean[team] = numpy.mean(scores[team])

    return med, mean


def get_ranks(stats_map):
    # TODO use pandas rank
    sorted_by_value = sorted(stats_map.items(), key=lambda kv: kv[1], reverse=True)
    # start with 1
    return {tup[0]: (i+1) for i, tup in enumerate(sorted_by_value)}


def main():
    files = os.listdir(dir)

    # build normals
    raw, normal = buildTotals(files)
    teams = raw.keys()

    # evaluate numbers
    amed, amean = get_stats(raw)
    rmed, rmean = get_stats(normal)

    # get ranks
    amed_rank = get_ranks(amed)
    amean_rank = get_ranks(amean)
    rmed_rank = get_ranks(rmed)
    rmean_rank = get_ranks(rmean)

    # Work the passed-in threshold
    while True:
        threshold = int(input("Enter threshold: "))
        selected_teams = [t for t in teams if
                          amed_rank[t] <= threshold and amean_rank[t] <= threshold and rmed_rank[t] <= threshold and
                          rmean_rank[t] <= threshold]
        print(selected_teams)


if __name__ == '__main__':
    main()
