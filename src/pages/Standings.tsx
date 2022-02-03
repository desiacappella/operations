import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@material-ui/core";
import { CircuitView, getFullStandings } from "../services/circuitView";
import { map, join, sortBy, get, size } from "lodash";

export default function Standings({ year, comps }: { year: string; comps: number }) {
  const [cv, setCv] = useState({} as CircuitView);

  useEffect(() => {
    const loader = async () => {
      const temp = new CircuitView(comps, year);
      await temp.process();
      setCv(temp);
    };

    loader();
  }, [comps, year]);

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
