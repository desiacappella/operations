import { getGapi } from "./google";
import DETAILS from "../data/preset.json";
import { findIndex, reduce, set, get, findLastIndex } from "lodash";
import { ScoresDict, SingleYear } from "../types";
import log from "loglevel";

const KEY_PREFIX = "compDetails";

export class GSheetsScoreManager /*implements ScoreManager*/ {
  // This stores raw scores from each competition in a dictionary with the key being the year
  async get_raw_scores(year: string, comp: string): Promise<[ScoresDict, number]> {
    const yearDetails = JSON.parse(localStorage.getItem(`${KEY_PREFIX}-${year}`) || "{}");

    const localData = get(yearDetails, comp);
    if (localData) {
      return localData;
    }

    log.info("Had to fetch from Google sheets", year, comp);

    const spreadsheetId = (DETAILS as Record<string, SingleYear>)[year].sheetIds[comp];

    try {
      if (!spreadsheetId) {
        throw new Error("no spreadsheet");
      }

      const response = await getGapi().client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Calculator",
      });

      const range: { values: string[][] } = response.result;

      // Ignore first two header rows
      const teamCount = range.values.length - 2;
      const judgeCount =
        findIndex(range.values[0], (v) => v === "Converted Scores") -
        // This can be "Raw Scores" (in the normal case) or "Scores after Time Deduction"
        findLastIndex(range.values[0], (v) => v.indexOf("Scores") >= 0 && v !== "Converted Scores");

      const raw = reduce(
        // Only look at the team rows
        range.values.slice(2, 2 + teamCount),
        (acc, row) =>
          // Per row, extract the scores in the columns to the left of the Converted Scores. -3 is for the
          // "Results" columns (avg, sanity, placing)
          set(acc, row[0], row.slice(row.length - 3 - 2 * judgeCount, row.length - 3 - judgeCount)),
        {}
      );

      set(yearDetails, comp, [raw, judgeCount]);
      localStorage.setItem(`${KEY_PREFIX}-${year}`, JSON.stringify(yearDetails));

      return [raw, judgeCount];
    } catch (err) {
      log.error(err);
      return [{}, 0];
    }
  }
}
