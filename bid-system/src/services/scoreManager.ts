import { getGapi } from "./google";
import { DETAILS } from "./compIds";
import { findIndex, reduce, set, get, findLastIndex } from "lodash";
import { ScoresDict } from "../types";
import log from "loglevel";

const KEY_PREFIX = "compDetails";

export class GSheetsScoreManager /*implements ScoreManager*/ {
  parseV1(cells: string[][]): [ScoresDict, number] {
    // Ignore first two header rows
    const teamCount = cells.length - 2;
    const convertedScoresStart = findIndex(cells[0], (v) => v.startsWith("Converted Scores"));
    // This can be "Raw Scores" (in the normal case) or "Scores after Time Deduction"
    const rawScoresStart = findLastIndex(
      cells[0],
      (v) => v.indexOf("Scores") >= 0 && v.indexOf("Converted Scores") < 0
    );
    const judgeCount = convertedScoresStart - rawScoresStart;

    // How much stuff is at the end of each row?
    // - Some sheets have 3 columns: avg, sanity, placing
    // - Some sheets have 5 columns:

    const raw = reduce(
      // Only look at the team rows
      cells.slice(2, 2 + teamCount),
      (acc, row) =>
        // Per row, extract the scores in the columns to the left of the Converted Scores. -3 is for the
        // "Results" columns (avg, sanity, placing)
        set(acc, row[0], row.slice(rawScoresStart, convertedScoresStart)),
      {}
    );

    return [raw, judgeCount];
  }

  // This stores raw scores from each competition in a dictionary with the key being the year
  async get_raw_scores(year: string, comp: string): Promise<[ScoresDict, number]> {
    const yearStr = localStorage.getItem(`${KEY_PREFIX}-${year}`);
    const yearDetails = yearStr ? JSON.parse(yearStr) : {};

    const localData = get(yearDetails, comp);
    if (localData) {
      return localData;
    }

    log.info("Had to fetch from Google sheets", year, comp);

    const spreadsheetId = DETAILS[year].sheetIds[comp];

    try {
      if (!spreadsheetId) {
        throw new Error("no spreadsheet");
      }

      const response = await getGapi().client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Calculator",
      });

      // Parse v1
      const [raw, judgeCount] = this.parseV1(response.result.values);

      set(yearDetails, comp, [raw, judgeCount]);
      localStorage.setItem(`${KEY_PREFIX}-${year}`, JSON.stringify(yearDetails));

      return [raw, judgeCount];
    } catch (err) {
      log.error(err);
      return [{}, 0];
    }
  }
}
