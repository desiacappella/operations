import {
  Card,
  Divider,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { find, last, map, range, round, size, slice, sortBy, values } from "lodash";
import React, { useEffect, useState } from "react";
import logo from "../images/logo.png";
import { CircuitView } from "../services/circuitView";
import DETAILS from "../data/preset.json";
import { SingleYear } from "../types";

function Report({ year, group, full }: { year: string; group: string; full: CircuitView }) {
  const ranks = full.getGroupRanks(group);
  const stats = full.getGroupStats(group);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <img style={{ margin: "0 auto", height: 100 }} src={logo} />
      </div>
      <Typography variant="h1">ASA Score Report {year}</Typography>
      <Typography variant="h2">{group.replace("_", " ")}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Abs. Median</TableCell>
              <TableCell>Abs. Mean</TableCell>
              <TableCell>Rel. Median</TableCell>
              <TableCell>Rel. Mean</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell variant="head">Rank</TableCell>
              <TableCell>{ranks.amed}</TableCell>
              <TableCell>{ranks.amean}</TableCell>
              <TableCell>{ranks.rmed}</TableCell>
              <TableCell>{ranks.rmean}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="head">Score</TableCell>
              <TableCell>{round(stats.amed, 2)}</TableCell>
              <TableCell>{round(stats.amean, 2)}</TableCell>
              <TableCell>{round(stats.rmed, 2)}</TableCell>
              <TableCell>{round(stats.rmean, 2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h2">Competitions</Typography>
      <Grid container spacing={2} justify="center">
        {map(full.attended[group], (comp) => {
          const det = full.compDetails[comp];

          return (
            <Grid item xs={9}>
              <Card>
                <Typography variant="h5">
                  {find((DETAILS as Record<string, SingleYear>)[year].names, (_n, k) => k === comp)}
                </Typography>
                <Grid container spacing={1} justify="center" alignItems="center">
                  <Grid item>
                    <Typography>Normalized Scores</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Max</Typography>
                    <Typography>{round(det.max, 2)}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Min</Typography>
                    <Typography>{round(det.min, 2)}</Typography>
                  </Grid>
                </Grid>
                <Divider variant="middle" />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        {map(det.judgeAvgs, (_a, i) => (
                          <TableCell>{i + 1}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell variant="head">Judge raw avg</TableCell>
                        {map(det.judgeAvgs, (a) => (
                          <TableCell>{round(a, 2)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head">Your raw</TableCell>
                        {map(det.raw[group], (score) => (
                          <TableCell>{round(score, 2)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell variant="head">Your normalized</TableCell>
                        {map(det.normal[group], (score) => (
                          <TableCell>{round(score, 2)}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Typography variant="h2">General Circuit Stats</Typography>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Groups</TableCell>
              <TableCell>Avg. Groups/Competition</TableCell>
              <TableCell>Avg. Judges/Competition</TableCell>
              <TableCell>Avg. Competitions/Group</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{size(full.groups)}</TableCell>
              <TableCell>{round(full.avgGroupsPerComp, 2)}</TableCell>
              <TableCell>{round(full.avgJudgesPerComp, 2)}</TableCell>
              <TableCell>{round(full.avgCompsPerGroup, 2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default function ReportView({ year }: { year: string }) {
  const [circuitViews, setCircuitViews] = useState<CircuitView[]>([]);
  const [group, setGroup] = useState<string>("");

  useEffect(() => {
    const fn = async () => {
      const numComps = (DETAILS as Record<string, SingleYear>)[year].order.length;

      const cvPromises = map(range(numComps), async (i) => {
        const cv = new CircuitView(i + 1, year);
        await cv.process();
        return cv;
      });
      setCircuitViews(await Promise.all(cvPromises));
    };

    fn();
  }, [year]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroup(event.target.value);
  };

  const full = last(circuitViews);
  let groups;
  if (full) {
    groups = full.groups;
  }

  return (
    <>
      <Grid container spacing={2} justify="center" alignItems="center">
        <Grid item>
          <Typography>Select a team:</Typography>
        </Grid>
        <Grid item>
          <TextField select value={group} onChange={handleChange}>
            {map(groups && groups.sort(), (g) => (
              <MenuItem value={g}>{g}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      {group && full && <Report group={group} full={full} year={year} />}
    </>
  );
}
