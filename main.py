import collections
import csv
import itertools
import json
import os
from typing import List, Dict, Type, Tuple, Any, Union

import numpy
from jinja2 import Template
from tabulate import tabulate
from weasyprint import HTML, CSS

JUDGES_PER_ROW = 4

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
    # TODO judge names

    return {RAW: raw, NORMAL: normal, 'final_scores': final_scores, 'max': comp_max, 'min': comp_min,
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

            # compute misc. stats
            self.attended: Dict[Group, List[str]] = {
                group: [comp for comp in self.comps if group in self.comp_details[comp][RAW]]
                for group in self.groups
            }
            self.avg_groups_per_comp = numpy.mean([len(self.comp_details[comp][RAW]) for comp in self.comp_details])
            self.avg_judges_per_comp = numpy.mean(
                [len(self.comp_details[comp]["judge_avgs"]) for comp in self.comp_details])
            self.avg_comps_per_group = numpy.mean([len(self.attended[group]) for group in self.groups])
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
            "amed": self.amed_rank[group] if group in self.amed_rank else len(self.groups) + 1,
            "amean": self.amean_rank[group] if group in self.amean_rank else len(self.groups) + 1,
            "rmed": self.rmed_rank[group] if group in self.rmed_rank else len(self.groups) + 1,
            "rmean": self.rmean_rank[group] if group in self.rmean_rank else len(self.groups) + 1,
            "total": len(self.groups),
        }


# UTILITY

def print_sep():
    print("-" * 150)


def r(n: Union[float, numpy.ndarray]) -> str:
    return str(round(n, 2))


def tprint(*values: Any, n=1):
    print("\t" * n, *values)


def tprinttable(s: str, n=1):
    """
    Split by newline and add tabs
    """
    for line in s.split("\n"):
        tprint(line, n=n)


class Runner:
    def __init__(self):
        # Competitions for 2018-19
        self.comps_18_19: List[str] = ['jeena', 'anahat', 'sangeet', 'mehfil', 'sahana', 'gathe', 'awaazein']
        self.comp_names_18_19 = {
            comp: comp.capitalize() for comp in self.comps_18_19
        }
        self.comp_names_18_19['sangeet'] = 'Sangeet Saagar'
        self.comp_names_18_19['gathe'] = 'Gathe Raho'

    def get_circuit_view(self, n: int) -> CircuitView:
        """
        :param n: n is number of competitions to consider
        :return:
        """
        if os.path.exists(f"{n}.json"):
            view = CircuitView.load(f"{n}.json")
        else:
            view = CircuitView(self.comps_18_19[0:n])
            view.dump(f"{n}.json")

        return view

    def print_text_report(self, circuit_views: List[CircuitView], group: str):
        full = circuit_views[-1]

        print_sep()
        print(f"ASA SCORE REPORT 2018-19 FOR {group.upper()}")
        print_sep()
        print()

        # SECTION 1: Final details
        print("1. Year-End Scores:\n")
        ranks = full.get_group_ranks(group)
        scores = full.get_group_stats(group)
        print(tabulate([
            ("Rank",) + (*ranks.values(),),
            ("Score",) + tuple(r(score) for score in scores.values())
        ], headers=["", "Abs Median", "Abs Mean", "Rel Median", "Rel Mean"]))

        print()
        print_sep()
        print()

        # SECTION 2: Per-comp details
        attended = full.attended[group]
        print(f"2. Attended Competitions: [{', '.join(self.comp_names_18_19[c] for c in attended)}]")
        for comp in attended:
            print()
            details = full.comp_details[comp]
            tprint(f"{self.comp_names_18_19[comp]}:")
            tprint("Normalized stats:", n=2)
            tprint("Max score:", r(details['max']), n=3)
            tprint("Min score:", r(details['min']), n=3)

            tprinttable(
                tabulate([
                    ("Judge averages (raw)",) + tuple(r(avg) for avg in details['judge_avgs']),
                    ("Your raw",) + tuple(r(score) for score in details[RAW][group]),
                    ("Your normalized",) + tuple(r(score) for score in details[NORMAL][group]),
                ], headers=([
                    f"Judge {n + 1}" for n in range(len(details['judge_avgs']))
                ])), n=2
            )

        print()
        print_sep()
        print()

        # SECTION 3: Progression through the year
        print("3. Rank Progression:\n")
        rank_progression = [circuit_views[i].get_group_ranks(group) for i in range(len(self.comps_18_19))]
        print(tabulate([
            ('Abs Median', *(stat['amed'] for stat in rank_progression)),
            ('Abs Mean', *(stat['amean'] for stat in rank_progression)),
            ('Rel Median', *(stat['rmed'] for stat in rank_progression)),
            ('Rel Mean', *(stat['rmean'] for stat in rank_progression)),
            ('Total', *(stat['total'] for stat in rank_progression)),
        ], headers=(["Rank after:"] + [(self.comp_names_18_19[comp] + ("*" if comp in attended else "")) for comp in
                                       self.comps_18_19])))

        print()
        print_sep()
        print()

        print("4. General 2018-19 Circuit Stats:\n")
        print("Total groups:", len(full.groups))
        print("Average groups per competition:", r(full.avg_groups_per_comp))
        print("Average judges per competition:", r(full.avg_judges_per_comp))
        print("Average competitions per group:", r(full.avg_comps_per_group))
        print(f"Best single-judge raw score: ", end="")
        print(f"{full.best_score['score']},", full.best_score['group'], "at", full.best_score['comp'])

        print()
        print_sep()

    def render_html(self, circuit_views: List[CircuitView], group: str):
        # Compile numbers
        full = circuit_views[-1]
        ranks = full.get_group_ranks(group)
        scores = full.get_group_stats(group)
        comp_details = {
        }
        for comp in full.attended[group]:
            comp_details_processed = {
                "name": self.comp_names_18_19[comp],
                "max": r(full.comp_details[comp]['max']),
                "min": r(full.comp_details[comp]['min']),
            }
            all_rows = {
                "judges": [n + 1 for n in range(len(full.comp_details[comp]['judge_avgs']))],
                "judge_avgs": [r(avg) for avg in full.comp_details[comp]['judge_avgs']],
                "raw": [r(score) for score in full.comp_details[comp]["raw"][group]],
                "normal": [r(score) for score in full.comp_details[comp]["normal"][group]],
            }
            total_judges = len(all_rows["judges"])
            rows = [
                {
                    "judges": all_rows["judges"][n:min(n + JUDGES_PER_ROW, total_judges)],
                    "judge_avgs": all_rows["judge_avgs"][n:min(n + JUDGES_PER_ROW, total_judges)],
                    "raw": all_rows["raw"][n:min(n + JUDGES_PER_ROW, total_judges)],
                    "normal": all_rows["normal"][n:min(n + JUDGES_PER_ROW, total_judges)],
                }
                for n in range(0, total_judges, JUDGES_PER_ROW)
            ]
            comp_details_processed["rows"] = rows

            comp_details[comp] = comp_details_processed

        rank_progression = [circuit_views[i].get_group_ranks(group) for i in range(len(self.comps_18_19))]
        rank_table = [
            [stat['amed'] for stat in rank_progression],
            [stat['amean'] for stat in rank_progression],
            [stat['rmed'] for stat in rank_progression],
            [stat['rmean'] for stat in rank_progression],
            [stat['total'] for stat in rank_progression],
        ]

        with open("templates/reportbase.html") as f:
            t = Template(f.read())

        with open("output/report.html", 'w') as f:
            f.write(
                t.render(
                    group=group,
                    group_ranks=list(ranks.values())[0:4],
                    group_scores=[r(score) for score in scores.values()][0:4],
                    comp_details=comp_details,
                    all_comps=self.comps_18_19,
                    comp_names=self.comp_names_18_19,
                    rank_table=rank_table,
                    total_groups=len(full.groups),
                    avg_groups_per_comp=r(full.avg_groups_per_comp),
                    avg_judges_per_comp=r(full.avg_judges_per_comp),
                    avg_comps_per_group=r(full.avg_comps_per_group),
                )
            )

        HTML("output/report.html").write_pdf("output/report.pdf", stylesheets=[CSS("output/reportbase.css")])

    def run(self):
        # Setup
        circuit_views = [self.get_circuit_view(i) for i in range(1, len(self.comps_18_19) + 1)]
        full = circuit_views[-1]

        print("Groups: ", ", ".join(full.groups))
        while True:
            group = input("Enter group: ")
            if group in full.groups:
                break
            print("Invalid group")

        # self.print_text_report(circuit_views, group)
        self.render_html(circuit_views, group)

    def helper(self):
        full = self.get_circuit_view(len(self.comps_18_19))
        return sorted(({"group": group, "n": len(full.attended[group])} for group in full.groups), key=lambda x: x["n"],
                      reverse=True)


if __name__ == '__main__':
    runner = Runner()
    runner.run()
