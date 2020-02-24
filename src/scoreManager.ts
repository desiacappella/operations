import { getGapi } from "./google";
import { DETAILS } from "./constants";
import { findIndex, reduce, set, get } from "lodash";
import { ScoresDict } from "./types";
import log from "loglevel";

export class GSheetsScoreManager /*implements ScoreManager*/ {
  async get_raw_scores(year: string, comp: string): Promise<[ScoresDict, number]> {
    const allDetails = JSON.parse(localStorage.getItem("compDetails") || "{}");

    const localData = get(allDetails, `${year}.${comp}`);
    if (localData) {
      return localData;
    }

    log.info("Had to fetch from Google sheets");

    const spreadsheetId = DETAILS[year].sheetIds[comp];

    try {
      if (!spreadsheetId) {
        throw new Error("no spreadsheet");
      }

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

      set(allDetails, `${year}.${comp}`, [raw, judgeCount]);
      localStorage.setItem("compDetails", JSON.stringify(allDetails));

      return [raw, judgeCount];
    } catch (err) {
      log.error(err);
      return [{}, 0];
    }
  }
}
