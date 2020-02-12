import { getGapi } from "./google";
import { DETAILS } from "./constants";
import { findIndex, reduce, set } from "lodash";
import { ScoresDict } from "./types";

// interface ScoreManager {
//   get_raw_scores: (year: string, comp: string) => Promise<[ScoresDict, number]>;
// }

export class GSheetsScoreManager /*implements ScoreManager*/ {
  async get_raw_scores(year: string, comp: string): Promise<[ScoresDict, number]> {
    const spreadsheetId = DETAILS[year].sheetIds[comp];

    const response = await getGapi().client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Calculator"
    });

    const range: { values: string[][] } = response.result;

    const teamCount = range.values.length - 2;
    const judgeCount =
      findIndex(range.values[0], v => v === "Converted Scores") -
      findIndex(range.values[0], v => v === "Raw Scores");

    const raw = reduce(
      range.values.slice(2, 2 + teamCount),
      (acc, row) =>
        set(acc, row[0], row.slice(row.length - 3 - 2 * judgeCount, row.length - 3 - judgeCount)),
      {}
    );

    return [raw, judgeCount];
  }
}
