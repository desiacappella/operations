import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from "@material-ui/core";
import { DETAILS } from "../services/compIds";
import { map, get, values } from "lodash";
import { GSheetsScoreManager } from "../services/scoreManager";

const sm = new GSheetsScoreManager();

// Show individual competition results. Has tabs for each competition in the season.
export default function Results({ year }: { year: string }) {
  const [compIndex, setCompIndex] = useState(0);
  const [scores, setScores] = useState({} as any);

  const yearDetails = DETAILS[year];
  const comp = yearDetails.order[compIndex];
  const sheetId = yearDetails.sheetIds[comp];

  // eslint-disable-next-line
  const handleChange = async ({}, newValue: number) => {
    setCompIndex(newValue);
  };

  useEffect(() => {
    const fetchStuff = async () => {
      setScores(get(await sm.get_raw_scores(year, comp), "[0]"));
    };

    fetchStuff();
  }, [comp, year]);

  return (
    <div>
      <Typography variant="h4">Raw Results from Competitions</Typography>
      <Tabs value={compIndex} onChange={handleChange}>
        {map(yearDetails.order, (c) => (
          <Tab key={c} label={yearDetails.names[c]} />
        ))}
      </Tabs>
      {sheetId && (
        <Typography>
          <Link
            href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
            target="_blank"
            rel="noopener"
          >
            Original Sheet
          </Link>
        </Typography>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              {map(values(scores)[0], ({}, i) => (
                <TableCell>Judge {i + 1}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(scores, (scores, team) => (
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
