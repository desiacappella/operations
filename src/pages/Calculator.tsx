import log from "loglevel";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { get, map, range, reduce, set, size, values } from "lodash";
import Papa from "papaparse";
import React, { useState } from "react";
import { ScoresDict } from "../types";

import COMP from "../scores/20-21/jeena.json";
import TEAM_MAP from "../scores/20-21/oiidMap.json";
import { handleComp } from "../services/compDetails";

const [scores, numJudges]: [ScoresDict, number] = [COMP, size(get(values(COMP), `[0]`))];

const parsePromise = async (file: any): Promise<Record<string, string[]>[]> => {
  return new Promise(function (complete: any, error) {
    Papa.parse(file, { complete, header: true, error });
  });
};

const csvParse = async (file: any): Promise<[ScoresDict, number]> => {
  const results = await parsePromise(file);

  return [
    reduce(
      results,
      (acc, r, key) =>
        set(
          acc,
          key,
          reduce(
            r,
            (acc, cur, key) =>
              set(
                acc,
                key,
                map(cur, (c) => parseInt(c))
              ),
            {} as ScoresDict
          )
        ),
      {} as ScoresDict
    ),
    size(results),
  ];
};

const jsonParse = async (file: File): Promise<[ScoresDict, number]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      let dict = {};
      if (event.target && event.target.result) {
        dict = JSON.parse(event.target.result.toString());
      }

      resolve([dict, size(get(values(dict), `[0]`))]);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const x = handleComp(scores, numJudges);

export default function Calculator() {
  const oiidMap: Record<string, string> = TEAM_MAP;

  log.debug(JSON.stringify(x.normal, null, 2));

  // Cuz we have a shit ton of judges, judges are rows
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Team</TableCell>
            <TableCell>Raw Average</TableCell>
            <TableCell>Normal Average</TableCell>
            <TableCell>Normal Median</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(x.raw, (val, tiid) => (
            <TableRow>
              <TableCell variant="head">{oiidMap[tiid]}</TableCell>
              <TableCell variant="head">{x.rawAverages[tiid]}</TableCell>
              <TableCell variant="head">{x.normalAverages[tiid]}</TableCell>
              <TableCell variant="head">{x.normalMedians[tiid]}</TableCell>
              {map(val, (score) => (
                <TableCell>{score}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
