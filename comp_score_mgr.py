import abc
import itertools
import csv
import os
import json
from googleapiclient.discovery import build
from typing import Tuple

from google_helper import get_creds
from util import ScoresDict, SCORES_DIR


class ScoreManager(abc.ABC):
    @abc.abstractclassmethod
    def get_raw_scores(self, year: str, name: str) -> Tuple[ScoresDict, int]:
        pass


class LocalScoreManager(ScoreManager):
    def get_raw_scores(self, year: str, name: str) -> Tuple[ScoresDict, int]:
        with open(os.path.join(SCORES_DIR, year, f"{name}.csv"), mode='r') as infile:
            # Trick to calculate the number of judges ahead of time
            col_reader, reader = itertools.tee(csv.reader(infile))

            num_judges = len(next(col_reader)) - 1
            del col_reader

            # raw judges' scores per group
            raw = {oScores[0]: [float(x) for x in oScores[1:]]
                   for oScores in reader}

        return raw, num_judges


class GSheetsScoreManager(ScoreManager):
    """
    TODO: INCOMPLETE
    """

    def __init__(self):
        self.creds = get_creds()

    def get_raw_scores(self, year: str, name: str) -> ScoresDict:
        with open(os.path.join(SCORES_DIR, year, "sheet_ids.json")) as infile:
            sheet_ids = json.load(infile)

        sheet_id = sheet_ids[name]

        service = build('sheets', 'v4', credentials=self.creds)

        # pylint: disable=no-member
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=sheet_id,
                                    range="Calculator").execute()
        sheet_contents = result.get('values', [])

        team_count = len(sheet_contents) - 2
        judge_count = sheet_contents[0].index(
            "Converted Scores") - sheet_contents[0].index("Raw Scores")

        print("lel")
