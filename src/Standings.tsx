import React, { useState, useEffect } from "react";
import { Grid, Select, MenuItem } from "@material-ui/core";
import log from "loglevel";
import { CircuitView } from "./circuitView";
import { map } from "lodash";

export default function Standings() {
  const [thresholds, setThresholds] = useState(
    {} as Record<string | number, Record<string, Record<string, number>>>
  );
  const [year, setYear] = useState("19-20");
  const [num, setNum] = useState(5);

  const fetchStuff = async () => {
    const cv = new CircuitView(num, year);
    await cv.process();
    setThresholds(cv.getFullStandings());
  };

  const handleChange = ({ target }: any) => {
    switch (target.name) {
      case "year":
        setYear(target.value);
        break;
      case "num":
        setNum(target.value);
        break;
    }
  };

  useEffect(() => {
    fetchStuff();
  }, []);

  return (
    <div>
      <Grid container>
        <Select value={year} onChange={handleChange} name="year">
          <MenuItem value="19-20">19-20</MenuItem>
        </Select>
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
        <Grid container alignItems="center" key={t}>
          <Grid item xs={1}>
            {t}
          </Grid>
          <Grid item xs={11} style={{ border: "1px solid black" }}>
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
