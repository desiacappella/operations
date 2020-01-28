import collections
import csv
import itertools
import json
import os
import pathlib
import subprocess
import sys
import time
from typing import List, Dict, Type, Tuple, Any, Union

import numpy
from jinja2 import Template
from tabulate import tabulate

from circuit_view import CircuitView, RAW, NORMAL

JUDGES_PER_ROW = 4

OUTPUT_DIR = 'output'
TEMPLATES_DIR = 'templates'

EXE = "chromium-browser"
BASE_ARGS = [
    "--no-sandbox", "--headless", "--disable-gpu", "--disable-features=VizDisplayCompositor"
]

# UTILITY


def print_sep():
    print("-" * 150)


def r(n: Union[float, numpy.ndarray]) -> str:
    return str(round(n, 2))


def t_print(*values: Any, n=1):
    print("\t" * n, *values)


def t_print_table(s: str, n=1):
    """
    Split by newline and add tabs
    """
    for line in s.split("\n"):
        t_print(line, n=n)


# RUNNER

class Runner:
    def __init__(self):
        # TODO remove and replace with details.json
        # Competitions for 2018-19
        self.comps_18_19: List[str] = ['jeena', 'anahat',
                                       'sangeet', 'mehfil', 'sahana', 'gathe', 'awaazein']
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
        if os.path.exists(f"cache/{n}.json"):
            view = CircuitView.load(f"cache/{n}.json")
        else:
            view = CircuitView(self.comps_18_19[0:n])
            pathlib.Path("cache/").mkdir(parents=True, exist_ok=True)
            view.dump(f"cache/{n}.json")

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
        print(
            f"2. Attended Competitions: [{', '.join(self.comp_names_18_19[c] for c in attended)}]")
        for comp in attended:
            print()
            details = full.comp_details[comp]
            t_print(f"{self.comp_names_18_19[comp]}:")
            t_print("Normalized stats:", n=2)
            t_print("Max score:", r(details['max']), n=3)
            t_print("Min score:", r(details['min']), n=3)

            t_print_table(
                tabulate([
                    ("Judge averages (raw)",) + tuple(r(avg)
                                                      for avg in details['judge_avgs']),
                    ("Your raw",) + tuple(r(score)
                                          for score in details[RAW][group]),
                    ("Your normalized",) + tuple(r(score)
                                                 for score in details[NORMAL][group]),
                ], headers=([
                    f"Judge {n + 1}" for n in range(len(details['judge_avgs']))
                ])), n=2
            )

        print()
        print_sep()
        print()

        # SECTION 3: Progression through the year
        print("3. Rank Progression:\n")
        rank_progression = [circuit_views[i].get_group_ranks(
            group) for i in range(len(self.comps_18_19))]
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
        print(f"{full.best_score['score']},",
              full.best_score['group'], "at", full.best_score['comp'])

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

        with open(os.path.join(TEMPLATES_DIR, "reportbase.html")) as f:
            t = Template(f.read())

        pathlib.Path(os.path.join(OUTPUT_DIR, group)).mkdir(
            parents=True, exist_ok=True)
        with open(os.path.join(OUTPUT_DIR, group, "report.html"), 'w') as f:
            f.write(
                t.render(
                    group=group,
                    group_ranks=list(ranks.values())[0:4],
                    group_scores=[r(score) for score in scores.values()][0:4],
                    comp_details=comp_details,
                    all_comps=self.comps_18_19,
                    comp_names=self.comp_names_18_19,
                    total_groups=len(full.groups),
                    avg_groups_per_comp=r(full.avg_groups_per_comp),
                    avg_judges_per_comp=r(full.avg_judges_per_comp),
                    avg_comps_per_group=r(full.avg_comps_per_group),
                )
            )

        print(group, "HTML rendered")

    @staticmethod
    def render_pdf(group: str):
        pathlib.Path(os.path.join(OUTPUT_DIR, group)).mkdir(
            parents=True, exist_ok=True)
        path = os.path.join(OUTPUT_DIR, group, "report.pdf")
        pdf_arg = f"--print-to-pdf={path}"
        html = f"http://localhost:8000/{group}/report.html"
        for n in range(5):
            ret = subprocess.run([
                EXE, *BASE_ARGS, pdf_arg, html
            ])
            if ret.returncode is 0:
                break
            print(group, f"PDF rendering failed, trying again (n={n})")
            time.sleep(1)

        print(group, "PDF rendered")

    def run(self, single_group: str = None, all_groups=False):
        # Setup
        circuit_views = [self.get_circuit_view(
            i) for i in range(1, len(self.comps_18_19) + 1)]
        full = circuit_views[-1]

        if not all_groups:
            if single_group:
                if single_group in full.groups:
                    group = single_group
                else:
                    print("Invalid group")
                    sys.exit(1)
            else:
                print("Groups: ", ", ".join(full.groups))
                while True:
                    group = "Saans"  # input("Enter group: ")
                    if group in full.groups:
                        break
                    print("Invalid group")

            self.render_html(circuit_views, group)
            self.render_pdf(group)
        else:
            for group in full.groups:
                self.render_html(circuit_views, group)
                self.render_pdf(group)

    def helper(self):
        full = self.get_circuit_view(len(self.comps_18_19))
        return sorted(({"group": group, "n": len(full.attended[group])} for group in full.groups), key=lambda x: x["n"],
                      reverse=True)


if __name__ == '__main__':
    runner = Runner()
    if len(sys.argv) is 2:
        runner.run(single_group=sys.argv[1])
    else:
        runner.run(all_groups=True)
