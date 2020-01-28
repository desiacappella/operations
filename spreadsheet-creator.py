import json
import random
import pickle
import sys
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from typing import List

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def get_creds():
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return creds


SHEET_OVERVIEW = "Overview"
SHEET_CALC = "Calculator"
SHEET_CALC_ID = 1

HEADING_COLOR = "#e6b8af"


VAL = "userEnteredValue"
FORM = "userEnteredFormat"
HA = "horizontalAlignment"
VA = "verticalAlignment"  # TODO
TF = "textFormat"


EMPTY = {}  # {VAL: {"stringValue": ""}}


def overview_sheet(teams: List[str]):
    """
    @returns SHEET 1: Just a basic list of teams
    """

    team_rows = [
        {
            "values": [
                {
                    VAL: {"numberValue": idx+1},
                    FORM: {HA: "CENTER"}
                },
                {
                    VAL: {"formulaValue": f"='{SHEET_CALC}'!A{idx+3}"},
                    FORM: {HA: "CENTER"}
                },
                {
                    VAL: {"formulaValue": f"='{SHEET_CALC}'!L{idx+3}"},
                    FORM: {HA: "CENTER"}
                }
            ]
        }
        for
        (idx, team) in enumerate(teams)
    ]

    return {
        "data": [
            {
                "startColumn": 0,
                "startRow": 0,
                "rowData": [
                    {
                        "values": [
                            {
                                VAL: {"stringValue": "Line Up Order", },
                                FORM: {HA: "CENTER",
                                       TF: {"bold": True}}
                            },
                            {
                                VAL: {"stringValue": "Team Name", },
                                FORM: {HA: "CENTER",
                                       TF: {"bold": True}}
                            },
                            {
                                VAL: {"stringValue": "Placings", },
                                FORM: {HA: "CENTER",
                                       TF: {"bold": True}}
                            },
                        ]
                    }
                ] + team_rows
            }
        ],
        "properties": {
            "title": SHEET_OVERVIEW
        },
    }


def calculator_sheet(judges: List[str], teams: List[str]):
    header_1 = {
        "values": [
            {
                VAL: {"stringValue": "Teams"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            },
            {
                VAL: {"stringValue": "Raw Scores"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            }
        ] + [
            EMPTY for i in range(len(judges)-1)
        ] + [
            {
                VAL: {"stringValue": "Converted Scores"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            }
        ] + [
            EMPTY for i in range(len(judges)-1)
        ] + [
            {
                VAL: {"stringValue": "Results"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            },
            EMPTY, EMPTY
        ]
    }
    header_2 = {
        "values": [
            EMPTY,
        ] + ([
            {
                VAL: {"formulaValue": f"='Judge {idx+1}'!$A$1"},
                FORM: {HA: "CENTER", TF: {
                    "italic": True, "fontSize": 14
                }}
            }
            for idx in range(len(judges))
        ] * 2) + [
            {
                VAL: {"stringValue": "Average"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            },
            {
                VAL: {"stringValue": "Sanity"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            },
            {
                VAL: {"stringValue": "Place"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}}
            }
        ]
    }

    def error_wrapper(calc):
        """
        Wraps calc with IFERROR
        """
        return f"IFERROR( IF({calc}=0,\"\",{calc}), \"\")"

    def get_raw_scores(team_idx):
        return [
            ({VAL: {
                "formulaValue": f"=TRANSPOSE('Judge {judge_idx+1}'!$B17:${chr(ord('B') + len(teams) - 1)}17)"}}
                if team_idx is 0 else EMPTY)
            for (judge_idx, judge) in enumerate(judges)
        ]

    def get_converted_scores(team_idx):
        """
        team_idx: team index to create the converted scores row for
        """
        cells = []
        for judge_idx in range(len(judges)):
            # This represents the column name of the raw score that we are converting
            raw = chr(ord('B') + judge_idx)
            calc = f"100 * {raw}{3 + team_idx}/SUM({raw}$3:{raw}${3 + len(teams) - 1})*{len(teams)}"
            cells.append(
                {
                    VAL: {
                        "formulaValue": f"={error_wrapper(calc)}"
                    }
                }
            )
        return cells

    def get_average(team_idx):
        start = chr(ord('B') + len(judges))
        end = chr(ord(start) + len(judges) - 1)
        return f"AVERAGE(${start}{3 + team_idx}:${end}{3 + team_idx})"

    def get_sanity(team_idx):
        end = chr(ord('B') + len(judges) - 1)
        return f"AVERAGE($B{3 + team_idx}:${end}{3 + team_idx})"

    def get_place(team_idx):
        avg = chr(ord('B') + 2*len(judges))
        return f"RANK(${avg}{3 + team_idx}, ${avg}3:${avg}{3 + len(teams) - 1})"

    # Thus in rows 1-N, we can just have EMPTY for the raw scores
    team_rows = [
        {
            "values": [
                {VAL: {"stringValue": team}},
            ] + get_raw_scores(team_idx) + get_converted_scores(team_idx) + [
                {
                    VAL: {
                        "formulaValue": f"={error_wrapper(get_average(team_idx))}"
                    }
                },
                {
                    VAL: {
                        "formulaValue": f"={get_sanity(team_idx)}"
                    }
                },
                {
                    VAL: {
                        "formulaValue": f"={error_wrapper(get_place(team_idx))}"
                    }
                }
            ]
        }
        for (team_idx, team) in enumerate(teams)
    ]

    return {
        "data": [
            {
                "startColumn": 0,
                "startRow": 0,
                "rowData": [
                    header_1,
                    header_2,
                ] + team_rows
            }
        ],
        "properties": {
            "title": SHEET_CALC,
            "sheetId": SHEET_CALC_ID,
        },
        "merges": [
            {
                "sheetId": SHEET_CALC_ID,
                "startRowIndex": 0,
                "startColumnIndex": 0,
                "endRowIndex": 2,
                "endColumnIndex": 1,
            },
            {
                "sheetId": SHEET_CALC_ID,
                "startRowIndex": 0,
                "startColumnIndex": 1,
                "endRowIndex": 1,
                "endColumnIndex": 1 + len(judges)
            },
            {
                "sheetId": SHEET_CALC_ID,
                "startRowIndex": 0,
                "startColumnIndex": 1 + len(judges),
                "endRowIndex": 1,
                "endColumnIndex": 1 + 2*len(judges)
            },
            {
                "sheetId": SHEET_CALC_ID,
                "startRowIndex": 0,
                "startColumnIndex": 1 + 2*len(judges),
                "endRowIndex": 1,
                "endColumnIndex": 1 + 2*len(judges) + 3
            }
        ]
        # TODO add merges
    }


CATEGORIES: List[str] = [
    "Balance & Blend\n(10 Pts.)",
    "Arrangement and Style\n(10 Pts.)",
    "Musical Nuances\n(10 Pts.)",
    "Solo Interpretation\n(10 Pts.)",
    "Fusion\n(5 Pts.)",
    "Creativity and Visual Cohesiveness\n(10 Pts.)",
    "Effectiveness of Presentation\n(10 Pts.)",
    "Professionalism\n(5 Pts.)",
    "Overall Performance\n(10 Pts.)",
]
GROUPS = [
    "Vocal Performance\n(45 Pts.)",
    "Visual Performance\n(25 Pts.)",
    "Overall Performance\n(10 Pts.)",
]
SCALED = [
    "Vocal Performance\n(50%)",
    "Visual Performance\n(35%)",
    "Overall Performance\n(15%)",
]


def judge_sheet(judges, teams, judge_idx):
    header = {
        "values": [
            {
                VAL: {"stringValue": judges[judge_idx]},
                FORM: {HA: "CENTER", TF: {"bold": True, "fontSize": 14}}
            }
        ] + [
            {
                VAL: {
                    "formulaValue": f"=TRANSPOSE({SHEET_CALC}!A3:A{3 + len(teams) - 1})"},
                FORM: {HA: "CENTER", TF: {"bold": True}}
            }
        ] + [
            {
                FORM: {HA: "CENTER", TF: {"bold": True}}
            }
            for idx in range(1, len(teams))
        ]
    }
    categ_rows = [
        {
            "values": [
                {
                    # TODO textFormatRuns
                    VAL: {"stringValue": categ},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"numberValue": random.randint(1, 5)},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for team in teams
            ]
        }
        for categ in CATEGORIES
    ]
    group_rows = [
        {
            "values": [
                {
                    VAL: {"stringValue": GROUPS[0]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=SUM({chr(ord('B') + team_idx)}2:{chr(ord('B') + team_idx)}6)"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        },
        {
            "values": [
                {
                    VAL: {"stringValue": GROUPS[1]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=SUM({chr(ord('B') + team_idx)}7:{chr(ord('B') + team_idx)}9)"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        },
        {
            "values": [
                {
                    VAL: {"stringValue": GROUPS[2]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"={chr(ord('B') + team_idx)}10"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        }
    ]
    scaled_rows = [
        {
            "values": [
                {
                    VAL: {"stringValue": SCALED[0]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$11/45)*50"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        }, {
            "values": [
                {
                    VAL: {"stringValue": SCALED[1]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$12/25)*35"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        },
        {
            "values": [
                {
                    VAL: {"stringValue": SCALED[2]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$13/10)*15"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"}}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        }
    ]
    total = {"values": [{VAL: {"stringValue": f"Total Score Judge {judge_idx}"}, FORM: {HA: "CENTER", TF: {"bold": True}}}] + [{VAL: {"formulaValue": f"=SUM({chr(ord('B') + team_idx)}$14:{chr(ord('B') + team_idx)}$16)"}, FORM: {
        HA: "CENTER", VA: "MIDDLE", "numberFormat": {"pattern": "#,##0.00", "type": "Number"}}} for (team_idx, team) in enumerate(teams)]}

    return {
        "data": [
            {
                "startColumn": 0,
                "startRow": 0,
                "rowData": [
                    header
                ] + categ_rows + group_rows + scaled_rows + [
                    total
                ]
            }
        ],
        "properties": {
            "title": f"Judge {judge_idx+1}"
        }
    }


def create_sheet(sheet_service, judges: List[str], teams: List[str]):
    if len(teams) is 0 or len(judges) is 0:
        raise "Need more than 0 teams and judges"

    properties = {"title": "Test Spreadsheet"}
    sheets = [
        overview_sheet(teams=teams),
        calculator_sheet(judges=judges, teams=teams)
    ] + [
        judge_sheet(teams=teams, judges=judges, judge_idx=idx)
        for idx in range(len(judges))
    ]

    result = sheet_service.create(
        body={"properties": properties, "sheets": sheets}, fields="spreadsheetId").execute()

    return result.get('spreadsheetId') if result else None


def main():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = get_creds()
    if not creds:
        sys.stderr.write("Unable to get credentials")
        return 1

    judges = [f"JN {x+1}" for x in range(4)]
    teams = [f"Team {x+1}" for x in range(5)]

    # Set up Google Sheets service
    # pylint: disable=no-member
    sheet = build('sheets', 'v4', credentials=creds).spreadsheets()

    result = create_sheet(
        sheet, judges, teams
    )

    if result:
        print(
            f"https://docs.google.com/spreadsheets/d/{result}/edit")
    else:
        print("result null")


if __name__ == '__main__':
    main()
