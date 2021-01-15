# operations

A collection of tools, scripts, and web interfaces for the ASA Operations team.

| Tool                                                                                                                                                   | Files                                                                                                      | How-To                        | TODO                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------ |
| Competition scores + bid system standings verifier. The app is viewable by authorized ASA Board members at https://desiacappella.github.io/operations. | `src/`, `public/`, `package.json`, `ts(config\|lint).json`                                                 | `yarn; yarn start`            |
| Rank-based match calculation (2020-21 season). Calculate team-competition matches based on team and competition rank lists.                            | `ranks.go`                                                                                                 | `go run ranks.go`             |                                |
| Create year-end score reports for teams, with statistics and information about the year.                                                               | `report_generator.py`, `circuit_view.py`, `comp_score_mgr.py`, `requirements.txt`, `templates/`, `output/` | `python3 report_generator.py` | Move this to the React web app |
| Competition scores spreadsheet creator                                                                                                                 | `spreadsheet_creator.py`, `google_helper.py`, `credentials.json`                                           | `python3 report_generator.py` |

## Setup help

### React

```
yarn
```

### Python

Python 3.7+

```
python -m venv env
```
