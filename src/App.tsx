import React, { useEffect, useState } from "react";
import { Button, MenuItem, TextField, Typography } from "@material-ui/core";
import "./App.css";
import { Link, BrowserRouter, Route, Switch } from "react-router-dom";
import log from "loglevel";
import { CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, getGapi } from "./services/google";
import BidSystem from "./pages/BidSystem";
import { Grid } from "@material-ui/core";
import "typeface-roboto";
import Results from "./pages/Results";
import Report from "./pages/Report";
import { BASENAME } from "./constants";

log.setLevel("debug");

export default function App() {
  const [isSignedIn, setSignedIn] = useState(false);
  const [year, setYear] = useState("2022");

  useEffect(() => {
    getGapi().load("client:auth2", () => {
      getGapi()
        .client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(
          () => {
            // Listen for sign-in state changes.
            getGapi().auth2.getAuthInstance().isSignedIn.listen(setSignedIn);

            // Handle the initial sign-in state.
            setSignedIn(getGapi().auth2.getAuthInstance().isSignedIn.get());
          },
          (error: any) => {
            log.error(JSON.stringify(error, null, 2));
          }
        );
    });
  }, []);

  const handleSignIn = () => {
    getGapi().auth2.getAuthInstance().signIn();
  };

  const handleSignOut = () => {
    localStorage.clear();
    getGapi().auth2.getAuthInstance().signOut();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYear(event.target.value);
  };

  return (
    <BrowserRouter basename={BASENAME}>
      <div className="App">
        {isSignedIn ? (
          <>
            <Grid container justify="center" spacing={1} alignItems="center">
              <Grid item>
                <TextField select label="Season" value={year} onChange={handleChange}>
                  <MenuItem value="18-19">2018-2019</MenuItem>
                  <MenuItem value="19-20">2019-2020</MenuItem>
                  <MenuItem value="2022">2022</MenuItem>
                </TextField>
              </Grid>
              <Grid item>
                <Link to={`/`}>
                  <Typography>Bid Point System</Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to={`/results`}>
                  <Typography>Comp Results</Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to={`/report`}>
                  <Typography>Team Reports</Typography>
                </Link>
              </Grid>
              <Grid item>
                <Button onClick={handleSignOut} variant="outlined">
                  Sign Out!
                </Button>
              </Grid>
            </Grid>
            <Grid container justify="center">
              <Switch>
                <Route path="/results">
                  <Grid item xs={12} lg={8}>
                    <Results year={year} />
                  </Grid>
                </Route>
                <Route path="/report">
                  <Grid item xs={12} lg={10}>
                    <Report year={year} />
                  </Grid>
                </Route>
                <Route path="/">
                  <Grid item xs={8} lg={8}>
                    <BidSystem year={year} />
                  </Grid>
                </Route>
              </Switch>
            </Grid>
          </>
        ) : (
          <Button onClick={handleSignIn} variant="outlined">
            {" "}
            Sign In!
          </Button>
        )}
      </div>
    </BrowserRouter>
  );
}
