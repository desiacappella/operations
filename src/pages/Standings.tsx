import React, { useState, useEffect } from "react";
import { Grid, Slider, Typography } from "@material-ui/core";
import { CircuitView, getFullStandings } from "../services/circuitView";
import { map, join, sortBy, get, size, last } from "lodash";
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
      <Grid container>
        <Grid item xs={1}>
          <Typography>Threshold</Typography>
        </Grid>
        <Grid container item xs={11}>
          <Grid item xs>
            <Typography>Team</Typography>
          </Grid>
          <Grid item xs>
            <Typography>Abs Median</Typography>
          </Grid>
          <Grid item xs>
            <Typography>Abs Mean</Typography>
          </Grid>
          <Grid item xs>
            <Typography>Rel Median</Typography>
          </Grid>
          <Grid item xs>
            <Typography>Rel Mean</Typography>
          </Grid>
        </Grid>
      </Grid>
      {map(getFullStandings(cv), (groups, t) => (
        <Grid container alignItems="center" key={t} style={{ border: "1px solid black" }}>
          <Grid item xs={1}>
            <Typography>{t}</Typography>
          </Grid>
          <Grid item xs={11}>
            {map(groups, (ranks, group) => (
              <Grid container item xs={12} key={group}>
                <Grid item xs>
                  <Typography>{group}</Typography>
                </Grid>
                <Grid item xs>
                  <Typography>{ranks.amed}</Typography>
                </Grid>
                <Grid item xs>
                  <Typography>{ranks.amean}</Typography>
                </Grid>
                <Grid item xs>
                  <Typography>{ranks.rmed}</Typography>
                </Grid>
                <Grid item xs>
                  <Typography>{ranks.rmean}</Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </div>
  );
}
