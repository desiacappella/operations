import React, { useState, useEffect } from "react";
import { Grid, Select, MenuItem, Typography } from "@material-ui/core";
import { CircuitView } from "./circuitView";
import { map, join, sortBy } from "lodash";

export default function Standings() {
  const [thresholds, setThresholds] = useState(
    {} as Record<string | number, Record<string, Record<string, number>>>
  );
  const [cv, setCv] = useState(new CircuitView(5, "19-20"));

  const handleChange = ({ target }: any) => {
    switch (target.name) {
      case "year":
        setCv(new CircuitView(cv.num, target.value));
        break;
      case "num":
        setCv(new CircuitView(target.value, cv.year));
        break;
    }
  };

  useEffect(() => {
    const fetchStuff = async () => {
      await cv.process();
      setThresholds(cv.getFullStandings());
    };

    fetchStuff();
  }, [cv]);

  return (
    <div>
      <Grid container>
        <Grid item>
          <Select value={cv.year} onChange={handleChange} name="year">
            <MenuItem value="19-20">19-20</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <Typography>
            {join(sortBy(cv.groups), ", ")}, ({cv.groups.length})
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={1}>
          Threshold
        </Grid>
        <Grid container item xs={11}>
          <Grid item xs>
            Team
          </Grid>
          <Grid item xs>
            Abs Median
          </Grid>
          <Grid item xs>
            Abs Mean
          </Grid>
          <Grid item xs>
            Rel Median
          </Grid>
          <Grid item xs>
            Rel Mean
          </Grid>
        </Grid>
      </Grid>
      {map(thresholds, (groups, t) => (
        <Grid container alignItems="center" key={t} style={{ border: "1px solid black" }}>
          <Grid item xs={1}>
            {t}
          </Grid>
          <Grid item xs={11}>
            {map(groups, (ranks, group) => (
              <Grid container item xs={12} key={group}>
                <Grid item xs>
                  {group}
                </Grid>
                <Grid item xs>
                  {ranks.amed}
                </Grid>
                <Grid item xs>
                  {ranks.amean}
                </Grid>
                <Grid item xs>
                  {ranks.rmed}
                </Grid>
                <Grid item xs>
                  {ranks.rmean}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </div>
  );
}
