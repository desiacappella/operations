# operations

A collection of tools, scripts, and web interfaces for the ASA Operations team.

## Folders

### `bid-system/`

Competition scores + bid system standings verifier. The app is viewable by authorized ASA Board members at https://desiacappella.github.io/operations.

```
yarn; yarn start
```

### `comp-sheet-creator/`

Competition scores spreadsheet creator

```
python3 spreadsheet_creator.py
```

### `ranks-2021/`

Rank-based match calculation (2020-21 season). Calculate team-competition matches based on team and competition rank lists.

```
go run ranks.go
```

### `team-report-creator`

Create year-end score reports for teams, with statistics and information about the year.

```
python3 report_generator.py
```

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
