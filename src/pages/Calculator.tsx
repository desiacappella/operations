import { Button, Table, TableCell, TableContainer, TableHead } from "@material-ui/core";
import { map, reduce, set, size } from "lodash";
import Papa from "papaparse";
import React, { useState } from "react";
import { ScoresDict } from "../types";

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

export default function Calculator() {
  const [scores, setScore] = useState<[ScoresDict, number]>([{}, 0]);

  const handleUpload = async ({ target }: any) => {
    if (target.files.length) {
      setScore(await csvParse(target.files[0]));
    }
  };

  // Cuz we have a shit ton of judges, judges are rows
  return (
    <div>
      <Button variant="contained" color="primary" component="span" onChange={handleUpload}>
        <input hidden accept="text/csv" type="file" />
        Upload
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            {map(scores[0], (_raw, teamName) => (
              <TableCell>{teamName}</TableCell>
            ))}
          </TableHead>
        </Table>
      </TableContainer>
    </div>
  );
}
