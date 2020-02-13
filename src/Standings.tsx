import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import log from "loglevel";
import { CircuitView } from "./circuitView";
import { map } from "lodash";

export default function Standings() {
  const [thresholds, setThresholds] = useState(
    {} as Record<string | number, Record<string, Record<string, number>>>
  );

  useEffect(() => {
    async function fetchStuff() {
      const cv = new CircuitView(5, "19-20");
      await cv.process();
      setThresholds(cv.getFullStandings());
    }

    fetchStuff();
  }, []);

  return (
    <div>
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
