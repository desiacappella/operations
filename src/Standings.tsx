import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import { CircuitView, processCV, getFullStandings } from "./circuitView";
import { NOW } from "./constants";
import { map, join, sortBy, get, size } from "lodash";

export default function Standings() {
  const [cv, setCv] = useState({} as CircuitView);

  useEffect(() => {
    const loader = async () => {
      const temp = new CircuitView(6, NOW);
      await processCV(temp);
      setCv(temp);
    };

    loader();
  }, []);

  return (
    <div>
      <Grid container justify="center">
        <Grid item>
          <Typography>
            {join(sortBy(get(cv, "groups")), ", ")}: <b>{size(get(cv, "groups"))} groups</b>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {join(get(cv, "comps"), ", ")}: <b>{size(get(cv, "comps"))} comps</b>
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
      {map(getFullStandings(cv), (groups, t) => (
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
