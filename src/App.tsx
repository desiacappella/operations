import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import "./App.css";
import { Link, BrowserRouter, Route, Switch } from "react-router-dom";
import log from "loglevel";
import { CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, getGapi } from "./google";
import Standings from "./Standings";
import { Grid } from "@material-ui/core";

import "typeface-roboto";
import Results from "./Results";

log.setLevel("debug");

export default function App() {
  const [isSignedIn, setSignedIn] = useState(false);

  useEffect(() => {
    getGapi().load("client:auth2", () => {
      getGapi()
        .client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        })
        .then(
          () => {
            // Listen for sign-in state changes.
            getGapi()
              .auth2.getAuthInstance()
              .isSignedIn.listen(setSignedIn);

            // Handle the initial sign-in state.
            setSignedIn(
              getGapi()
                .auth2.getAuthInstance()
                .isSignedIn.get()
            );
          },
          (error: any) => {
            log.error(JSON.stringify(error, null, 2));
          }
        );
    });
  }, []);

  const handleSignIn = () => {
    getGapi()
      .auth2.getAuthInstance()
      .signIn();
  };

  const handleSignOut = () => {
    localStorage.clear();
    getGapi()
      .auth2.getAuthInstance()
      .signOut();
  };

  return (
    <BrowserRouter>
      <div className="App">
        {isSignedIn ? (
          <>
            <Grid container justify="center" spacing={1} alignItems="center">
              <Grid item>
                <Link to="/">Standings</Link>
              </Grid>
              <Grid item>
                <Link to="/results">Comp Results</Link>
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
                    <Results />
                  </Grid>
                </Route>
                <Route path="/">
                  <Grid item xs={8} lg={5}>
                    <Standings />
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
