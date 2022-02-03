import React, { useState, useEffect } from "react";
import { Tabs, Tab, Typography, TableContainer, Table, TableRow, TableCell, TableHead, TableBody } from "@material-ui/core";
import DETAILS from "../data/preset.json";
import { map, get, first, values } from "lodash";
import { GSheetsScoreManager } from "../services/scoreManager";
import { SingleYear } from "../types";

const sm = new GSheetsScoreManager();

export default function Results({ year }: { year: string }) {
  const [comp, setComp] = useState(0);
  const [details, setDetails] = useState({} as any);

  // eslint-disable-next-line
  const handleChange = async ({ }, newValue: number) => {
    setComp(newValue);
  };

  useEffect(() => {
    const fetchStuff = async () => {
      setDetails(get(await sm.get_raw_scores(year, (DETAILS as Record<string, SingleYear>)[year].order[comp]), "[0]"));
    };

    fetchStuff();
  }, [comp, year]);

  return (
    <div>
      <Tabs value={comp} onChange={handleChange}>
        {map((DETAILS as Record<string, SingleYear>)[year].order, (c) => (
          <Tab key={c} label={c} />
        ))}
      </Tabs>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              {map(values(details)[0], ({ }, i) => <TableCell>Judge {i + 1}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(details, (scores, team) => (
              <TableRow key={team}>
                <TableCell>
                  <Typography>{team}</Typography>
                </TableCell>
                {map(scores, (score, i) => (
                  <TableCell key={i}>
                    <Typography>{score}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
