import React, { useState, useEffect } from "react";
import { map } from "lodash";
import { Grid, Typography, Slider } from "@material-ui/core";

import details from "./details.json";
import log from "loglevel";

const valuetext = (value: number) => details.order[value];

const App: React.FC = () => {
  const [num, setNum] = useState(details.order.length);
  const [allViews, setAllViews] = useState([[]] as any[]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:5000");
      const t: Record<number, string[]>[] = await res.json();
      log.debug(t);
      const mapped = map(t, thresholds =>
        map(thresholds, (teams, threshold) => ({
          threshold,
          teams
        }))
      );
      log.debug(mapped);
      setAllViews(mapped);
    };

    fetchData();
  }, []);

  const handleChange = ({}, newValue: number | number[]) => {
    setNum(newValue as number);
  };

  // currentView is an array of { threshold: T, teams: [] } objects
  const currentView = num < allViews.length ? allViews[num] : [];

  return (
    <div style={{ textAlign: "center", padding: "0 40%", margin: "5px" }}>
      <Typography variant="h2">ASA Standings 2018-19</Typography>
      <Slider
        value={num}
        onChange={handleChange}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={1}
        marks={details.order.map((label, i) => ({ value: i + 1, label }))}
        min={0}
        max={details.order.length}
      />
      <Grid container>
        <Grid xs={1} item>
          <Typography>T</Typography>
        </Grid>
        <Grid xs item>
          <Typography>Teams</Typography>
        </Grid>
      </Grid>
      {currentView.map((t: { threshold: number; teams: string[] }) => (
        <Grid container>
          <Grid xs={1} item>
            <Typography>{t.threshold}</Typography>
          </Grid>
          {t.teams.map((g: any) => (
            <Grid xs item style={{ border: "1px solid black" }}>
              <Typography>{g}</Typography>
            </Grid>
          ))}
        </Grid>
      ))}
    </div>
  );
};

export default App;
