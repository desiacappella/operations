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


def row(text: List):
    return {
        "values": [
            {
                "userEnteredValue": {
                    (x["type"] if "type" in x else "stringValue"): x["value"]
                },
                "userEnteredFormat": ({
                    "textFormat": {
                        "bold": True
                    }
                } if x["bold"] else None)
            }
            for
            x in text
        ]
    }


VAL = "userEnteredValue"
FORM = "userEnteredFormat"
HA = "horizontalAlignment"
TF = "textFormat"


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
                    VAL: {"stringValue": team},
                    FORM: {HA: "CENTER"}
                }
            ]
        }
        for
        (idx, team) in enumerate(teams)
    ]

    return {
        "properties": {
            "title": "Overview"
        },
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
        ]
    }


def create_sheet(sheet_service, judges: List[str], teams: List[str]):
    properties = {"title": "Test Spreadsheet"}
    sheets = [
        overview_sheet(teams)
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

    judges = [f"Judge {x+1}" for x in range(4)]
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
