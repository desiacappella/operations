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
  Switch,
  Grid,
} from "@material-ui/core";
import { DETAILS } from "../services/compIds";
import { map, values } from "lodash";
import { handleGComp } from "../lib/competition";
import { CompDetail } from "../types";

// Show individual competition results. Has tabs for each competition in the season.
export default function Results({ year }: { year: string }) {
  const [compIndex, setCompIndex] = useState(0);
  const [compDetail, setCompDetail] = useState({} as CompDetail);
  const [isRaw, setIsRaw] = useState(true);

  const yearDetails = DETAILS[year];
  const comp = yearDetails.order[compIndex];
  const sheetId = yearDetails.sheetIds[comp];

  // eslint-disable-next-line
  const handleChange = ({}, newValue: number) => {
    setCompIndex(newValue);
  };

  // eslint-disable-next-line
  const handleSwitch = ({}, checked: boolean) => {
    setIsRaw(checked);
  };

  useEffect(() => {
    const fetchStuff = async () => {
      setCompDetail(await handleGComp(year, comp));
    };

    fetchStuff();
  }, [comp, year]);

  const current = isRaw ? compDetail.raw : compDetail.normal;

  return (
    <div>
      <Typography variant="h4">Raw Results from Competitions</Typography>
      <Grid component="label" container justify="center" alignItems="center" spacing={1}>
        <Grid item>
          <Typography>Normal</Typography>
        </Grid>
        <Grid item>
          <Switch checked={isRaw} onChange={handleSwitch} />
        </Grid>
        <Grid item>
          <Typography>Raw</Typography>
        </Grid>
      </Grid>
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
              {map(values(current)[0], ({}, i) => (
                <TableCell>Judge {i + 1}</TableCell>
              ))}
              <TableCell>Average</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {map(current, (scores, team) => (
              <TableRow key={team}>
                <TableCell>{team}</TableCell>
                {map(scores, (score, i) => (
                  <TableCell key={i}>{score}</TableCell>
                ))}
                <TableCell variant="head">
                  {isRaw ? compDetail.rawAverages[team] : compDetail.normalAverages[team]}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell variant="head">Judge Average</TableCell>
              {map(compDetail.judgeAvgs, (avg, i) => (
                <TableCell variant="head" key={i}>
                  {avg}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
