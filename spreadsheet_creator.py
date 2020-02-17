import json
import random
import sys
import os.path
from googleapiclient.discovery import build
from typing import List

from google_helper import get_creds

SHEET_OVERVIEW = "Overview"
SHEET_OVERVIEW_ID = 0
SHEET_CALC = "Calculator"
SHEET_CALC_ID = 1


def get_protection(id):
    return {
        "editors": {
            "users": [
                "sarang@desiacappella.org",
                "eshaan@desiacappella.org",
            ]
        },
        "range": {
            "sheetId": id
        }
    }


def conv(n):
    return n/255


HEADING_COLOR = {
    "red": conv(230),
    "green": conv(184),
    "blue": conv(175)
}


VAL = "userEnteredValue"
FORM = "userEnteredFormat"
HA = "horizontalAlignment"
VA = "verticalAlignment"
TF = "textFormat"


def overview_sheet(teams: List[str], judges):
    """
    @returns SHEET 1: Just a basic list of teams
    """

    place = chr(ord('A') + 2*len(judges) + 3)

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
                    VAL: {"formulaValue": f"='{SHEET_CALC}'!{place}{idx+3}"},
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
            "title": SHEET_OVERVIEW,
            "sheetId": SHEET_OVERVIEW_ID,
            "gridProperties": {
                "columnCount": 3,
                "rowCount": len(teams) + 1
            }
        },
        "conditionalFormats": [
            {
                "ranges": [
                    {
                        "sheetId": SHEET_OVERVIEW_ID,
                        "startRowIndex": 1,
                        "startColumnIndex": 2,
                        "endRowIndex": 1 + len(teams),
                        "endColumnIndex": 3,
                    }
                ],
                "gradientRule": {
                    "minpoint": {
                        "color": {
                            "red": conv(87), "green": conv(187), "blue": conv(138)
                        },
                        "type": "MIN"
                    },
                    "midpoint": {
                        "color": {
                            "red": conv(255), "green": conv(214), "blue": conv(102)
                        },
                        "type": "PERCENTILE",
                        "value": "50",
                    },
                    "maxpoint": {
                        "color": {
                            "red": conv(230), "green": conv(124), "blue": conv(115)
                        },
                        "type": "MAX"
                    }
                }
            }
        ],
        "protectedRanges": [
            get_protection(SHEET_OVERVIEW_ID)
        ],
    }


def calculator_sheet(judges: List[str], teams: List[str]):
    header_1 = {
        "values": [
            {
                VAL: {"stringValue": "Teams"},
                FORM: {
                    HA: "CENTER", VA: "MIDDLE",
                    TF: {
                        "bold": True, "fontSize": 14
                    },
                    "backgroundColor": HEADING_COLOR,
                }
            },
            {
                VAL: {"stringValue": "Raw Scores"},
                FORM: {
                    HA: "CENTER", TF: {
                        "bold": True, "fontSize": 14},
                    "backgroundColor": HEADING_COLOR,
                    "borders": {
                        "left": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_THICK"
                        }
                    }
                }
            }
        ] + [
            {} for i in range(len(judges)-1)
        ] + [
            {
                VAL: {"stringValue": "Converted Scores"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14},
                    "backgroundColor": HEADING_COLOR,
                    "borders": {
                    "left": {
                        "color": {"red": 0, "green": 0, "blue": 0},
                        "width": 1,
                        "style": "SOLID_THICK"
                    }
                }}
            }
        ] + [
            {} for i in range(len(judges)-1)
        ] + [
            {
                VAL: {"stringValue": "Results"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14},
                    "backgroundColor": HEADING_COLOR,
                    "borders": {
                    "left": {
                        "color": {"red": 0, "green": 0, "blue": 0},
                        "width": 1,
                        "style": "SOLID_THICK"
                    }
                }
                }
            },
            {}, {}
        ]
    }
    header_2 = {
        "values": [
            {},
        ] + ([
            {
                VAL: {"formulaValue": f"='Judge {idx+1}'!$A$1"},
                FORM: {
                    HA: "CENTER", TF: {
                        "italic": True, "fontSize": 14
                    }, "backgroundColor": HEADING_COLOR,
                    "borders": {
                        "left": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_THICK"
                        }
                    } if idx == 0 else None
                }
            }
            for idx in range(len(judges))
        ] * 2) + [
            {
                VAL: {"stringValue": "Average"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}, "backgroundColor": HEADING_COLOR,
                    "borders": {
                        "left": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_THICK"
                        }
                }}
            },
            {
                VAL: {"stringValue": "Sanity"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}, "backgroundColor": HEADING_COLOR}
            },
            {
                VAL: {"stringValue": "Place"},
                FORM: {HA: "CENTER", TF: {
                    "bold": True, "fontSize": 14}, "backgroundColor": HEADING_COLOR}
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
            ({
                VAL: {
                    "formulaValue": f"=TRANSPOSE('Judge {judge_idx+1}'!$B17:${chr(ord('B') + len(teams) - 1)}17)"
                },
                FORM: {
                    HA: "CENTER"
                }
            }
                if team_idx is 0 else {
                FORM: {HA: "CENTER"}
            })
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
                    },
                    FORM: {
                        "borders": {
                            "left": {
                                "color": {"red": 0, "green": 0, "blue": 0},
                                "width": 1,
                                "style": "SOLID_THICK"
                            }
                        } if judge_idx == 0 else None,
                        HA: "CENTER"
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

    # Thus in rows 1-N, we can just have {} for the raw scores
    team_rows = [
        {
            "values": [
                {
                    VAL: {"stringValue": team},
                    FORM: {
                        HA: "CENTER", "borders": {
                            "right": {
                                "color": {"red": 0, "green": 0, "blue": 0},
                                "width": 1,
                                "style": "SOLID_THICK"
                            }
                        }
                    }
                },
            ] + get_raw_scores(team_idx) + get_converted_scores(team_idx) + [
                {
                    VAL: {
                        "formulaValue": f"={error_wrapper(get_average(team_idx))}"
                    },
                    FORM: {
                        HA: "CENTER",
                        "borders": {
                            "left": {
                                "color": {"red": 0, "green": 0, "blue": 0},
                                "width": 1,
                                "style": "SOLID_THICK"
                            }
                        }
                    }
                },
                {
                    VAL: {
                        "formulaValue": f"={get_sanity(team_idx)}"
                    },
                    FORM: {HA: "CENTER"}
                },
                {
                    VAL: {
                        "formulaValue": f"={error_wrapper(get_place(team_idx))}"
                    },
                    FORM: {HA: "CENTER"}
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
            "gridProperties": {
                "columnCount": 4 + 2*len(judges),
                "rowCount": 2 + len(teams)
            }
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
        ],
        "conditionalFormats": [
            {
                "ranges": [
                    {
                        "sheetId": SHEET_CALC_ID,
                        "startRowIndex": 2,
                        "startColumnIndex": 2 * len(judges) + 3,
                        "endRowIndex": 2 + len(teams),
                        "endColumnIndex": 2 * len(judges) + 4,
                    }
                ],
                "gradientRule": {
                    "minpoint": {
                        "color": {
                            "red": conv(87), "green": conv(187), "blue": conv(138)
                        },
                        "type": "MIN"
                    },
                    "midpoint": {
                        "color": {
                            "red": conv(255), "green": conv(214), "blue": conv(102)
                        },
                        "type": "PERCENTILE",
                        "value": "50",
                    },
                    "maxpoint": {
                        "color": {
                            "red": conv(230), "green": conv(124), "blue": conv(115)
                        },
                        "type": "MAX"
                    }
                }
            }
        ],
        "protectedRanges": [
            get_protection(SHEET_CALC_ID)
        ]
    }


CATEGORIES: List = [
    # vocal
    {"name": "Balance & Blend\n(10 Pts.)", "color": {"red": conv(
        217), "green": conv(210), "blue": conv(233)}},
    {"name": "Arrangement and Style\n(10 Pts.)", "color": {
        "red": conv(217), "green": conv(210), "blue": conv(233)}},
    {"name": "Musical Nuances\n(10 Pts.)", "color": {"red": conv(
        217), "green": conv(210), "blue": conv(233)}},
    {"name": "Solo Interpretation\n(10 Pts.)", "color": {"red": conv(
        217), "green": conv(210), "blue": conv(233)}},
    {"name": "Fusion\n(5 Pts.)", "color": {"red": conv(
        217), "green": conv(210), "blue": conv(233)}},
    # visual
    {"name": "Creativity and Visual Cohesiveness\n(10 Pts.)", "color": {
        "red": conv(234), "green": conv(209), "blue": conv(220)}},
    {"name": "Effectiveness of Presentation\n(10 Pts.)", "color": {
        "red": conv(234), "green": conv(209), "blue": conv(220)}},
    {"name": "Professionalism\n(5 Pts.)", "color": {"red": conv(
        234), "green": conv(209), "blue": conv(220)}},
    # overall
    {"name": "Overall Performance\n(10 Pts.)", "color": {"red": conv(
        207), "green": conv(225), "blue": conv(243)}},
]
VOCAL_C = {
    "red": conv(180), "green": conv(167), "blue": conv(214),
}
VISUAL_C = {
    "red": conv(213), "green": conv(166), "blue": conv(189),
}
OVERALL_C = {
    "red": conv(159), "green": conv(197), "blue": conv(232),
}

GROUPS = [
    {"name": "Vocal Performance\n(45 Pts.)", "color": VOCAL_C},
    {"name": "Visual Performance\n(25 Pts.)", "color": VISUAL_C},
    {"name": "Overall Performance\n(10 Pts.)", "color": OVERALL_C},
]
SCALED = [
    {"name": "Vocal Performance\n(50%)", "color": VOCAL_C},
    {"name": "Visual Performance\n(35%)", "color": VISUAL_C},
    {"name": "Overall Performance\n(15%)", "color": OVERALL_C},
]


def judge_sheet(judges, teams, judge_idx):
    header = {
        "values": [
            {
                VAL: {"stringValue": judges[judge_idx]},
                FORM: {HA: "CENTER", TF: {"bold": True, "fontSize": 14, "foregroundColor": {
                    "red": 1, "blue": 1, "green": 1
                }}, "backgroundColor": {
                    "red": 0.4, "blue": 0.4, "green": 0.4
                }}
            }
        ] + [
            {
                VAL: {
                    "formulaValue": f"=TRANSPOSE({SHEET_CALC}!A3:A{3 + len(teams) - 1})"},
                FORM: {HA: "CENTER", VA: "MIDDLE", TF: {"bold": True}, "backgroundColor": {
                    "red": 0.851, "blue": 0.851, "green": 0.851
                }}
            }
        ] + [
            {
                FORM: {HA: "CENTER", VA: "MIDDLE", TF: {"bold": True}, "backgroundColor": {
                    "red": 0.851, "blue": 0.851, "green": 0.851
                }}
            }
            for idx in range(1, len(teams))
        ]
    }
    categ_rows = [
        {
            "values": [
                {
                    # TODO textFormatRuns
                    VAL: {"stringValue": categ["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True},
                        "backgroundColor": categ["color"]
                    },
                }
            ] + [
                {
                    VAL: {"numberValue": 0},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"},
                        "backgroundColor": {
                            "red": conv(217), "green": conv(234), "blue": conv(211)
                    }}
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
                    VAL: {"stringValue": GROUPS[0]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": GROUPS[0]["color"],
                        "borders": {
                            "top": {
                                "color": {"red": 0, "green": 0, "blue": 0},
                                "width": 1,
                                "style": "SOLID_MEDIUM",
                            }
                        }
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=SUM({chr(ord('B') + team_idx)}2:{chr(ord('B') + team_idx)}6)"},
                    FORM: {HA: "CENTER", VA: "MIDDLE", "numberFormat": {
                        "pattern": "#,##0.00", "type": "Number"},
                        "borders": {
                        "top": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_MEDIUM",
                        }
                    }}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        },
        {
            "values": [
                {
                    VAL: {"stringValue": GROUPS[1]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": GROUPS[1]["color"]
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
                    VAL: {"stringValue": GROUPS[2]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": GROUPS[2]["color"]
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
                    VAL: {"stringValue": SCALED[0]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": SCALED[0]["color"],
                        "borders": {
                            "top": {
                                "color": {"red": 0, "green": 0, "blue": 0},
                                "width": 1,
                                "style": "SOLID_MEDIUM",
                            }
                        }
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$11/45)*50"},
                    FORM: {HA: "CENTER", VA: "MIDDLE",                         "borders": {
                        "top": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_MEDIUM",
                        }
                    }}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        }, {
            "values": [
                {
                    VAL: {"stringValue": SCALED[1]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": SCALED[1]["color"]
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$12/25)*35"},
                    FORM: {HA: "CENTER", VA: "MIDDLE"}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        },
        {
            "values": [
                {
                    VAL: {"stringValue": SCALED[2]["name"]},
                    FORM: {
                        HA: "CENTER", TF: {"bold": True}, "backgroundColor": SCALED[2]["color"]
                    }
                }
            ] + [
                {
                    VAL: {"formulaValue": f"=({chr(ord('B') + team_idx)}$13/10)*15"},
                    FORM: {HA: "CENTER", VA: "MIDDLE"}
                }
                for (team_idx, team) in enumerate(teams)
            ]
        }
    ]
    total = {
        "values": [
            {
                VAL: {
                    "stringValue": f"Total Score Judge {judge_idx}"
                }, FORM: {
                    HA: "CENTER", TF: {"bold": True},
                    "borders": {
                        "top": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_MEDIUM",
                        }
                    }
                }
            }
        ] + [
            {
                VAL: {
                    "formulaValue": f"=SUM({chr(ord('B') + team_idx)}$14:{chr(ord('B') + team_idx)}$16)"
                },
                FORM: {
                    HA: "CENTER", VA: "MIDDLE",
                    "borders": {
                        "top": {
                            "color": {"red": 0, "green": 0, "blue": 0},
                            "width": 1,
                            "style": "SOLID_MEDIUM",
                        }
                    }
                }
            }
            for (team_idx, team) in enumerate(teams)
        ]}

    protection = get_protection(2+judge_idx)
    protection["unprotectedRanges"] = [
        {
            "sheetId": 2+judge_idx,
            "startRowIndex": 1,
            "startColumnIndex": 1,
            "endRowIndex": 10,
            "endColumnIndex": 1+len(teams)
        }
    ]

    return {
        "data": [
            {
                "startColumn": 0,
                "startRow": 0,
                "rowData": [
                    header
                ] + categ_rows + group_rows + scaled_rows + [
                    total
                ],
                "columnMetadata": [
                    {
                        "pixelSize": 240
                    }
                ]
            }
        ],
        "properties": {
            "title": f"Judge {judge_idx+1}",
            "gridProperties": {
                "columnCount": 1 + len(teams),
                "rowCount": 17,
            },
            "sheetId": 2+judge_idx
        },
        "protectedRanges": [
            protection,
        ]
    }


def create_spreadsheet(sheet_service, name: str, judges: List[str], teams: List[str]):
    if len(teams) is 0 or len(judges) is 0:
        raise "Need more than 0 teams and judges"

    properties = {"title": name}
    sheets = [
        overview_sheet(teams=teams, judges=judges),
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

    # TODO make this interactive
    judges = [f"Judge {x+1}" for x in range(3)]
    teams = [f"Team {x+1}" for x in range(9)]
    name = "Test Spreadsheet"

    # Set up Google Sheets service
    # pylint: disable=no-member
    sheet = build('sheets', 'v4', credentials=creds).spreadsheets()

    result = create_spreadsheet(
        sheet, name, judges, teams
    )

    if result:
        print(
            f"https://docs.google.com/spreadsheets/d/{result}/edit")
    else:
        print("result null")


if __name__ == '__main__':
    main()
