import React, { useState, useEffect } from "react";
import {
  Grid,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { CircuitView } from "../lib/circuitView";
import { map, join, sortBy, get, size, last, reduce, concat } from "lodash";
import { DETAILS } from "../services/compIds";

// Shows the final bid point standings
// - year: year to look at
export default function Standings({ year }: { year: string }) {
  const [cv, setCv] = useState({} as CircuitView);
  const [marks, setMarks] = useState<Array<{ value: number; label?: string }>>([]);

  const [step, setStep] = useState(0);

  useEffect(() => {
    const loader = async () => {
      const temp = new CircuitView(step, year);
      await temp.process();
      setCv(temp);
    };

    loader();
  }, [step, year]);

  // marks comes from DETAILS
  useEffect(() => {
    setMarks([
      { value: 0 },
      ...map(DETAILS[year].order, (comp, i) => ({
        value: i + 1,
        label: DETAILS[year].names[comp],
      })),
    ]);
    setStep(0);
  }, [year]);

  const handleSlide = ({}, newValue: number | number[]) => {
    setStep(newValue as number);
  };

  const fullStandings = cv.getFullStandings();
  const rows = reduce(
    fullStandings,
    (acc, groups, threshold) => {
      let first = true;
      // For each threshold, add all the teams
      const thresholdRows = map(groups, (ranks, group) => {
        const row = (
          <TableRow key={group}>
            {first && <TableCell rowSpan={size(groups)}>{threshold}</TableCell>}
            <TableCell>{group}</TableCell>
            <TableCell>{ranks.amed}</TableCell>
            <TableCell>{ranks.amean}</TableCell>
            <TableCell>{ranks.rmed}</TableCell>
            <TableCell>{ranks.rmean}</TableCell>
          </TableRow>
        );
        first = false;
        return row;
      });

      return concat(acc, ...thresholdRows);
    },
    [] as JSX.Element[]
  );

  return (
    <div>
      <Slider
        step={1}
        marks={marks}
        min={0}
        max={last(marks)?.value || 0}
        value={step}
        onChange={handleSlide}
      />
      <Grid container justify="center">
        <Grid item xs={12}>
          <Typography>
            <b>{size(get(cv, "groups"))} groups</b>: {join(sortBy(get(cv, "groups")), ", ")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            <b>{size(get(cv, "comps"))} comps</b>: {join(get(cv, "comps"), ", ")}
          </Typography>
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Threshold</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Abs Median</TableCell>
              <TableCell>Abs Mean</TableCell>
              <TableCell>Rel Median</TableCell>
              <TableCell>Rel Mean</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
