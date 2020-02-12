import React, { useEffect, useState } from "react";

import "./App.css";
import log from "loglevel";
import { CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, getGapi } from "./google";
import Standings from "./Standings";

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
    getGapi()
      .auth2.getAuthInstance()
      .signOut();
  };

  return (
    <div className="App">
      {isSignedIn ? (
        <>
          <button onClick={handleSignOut}>Sign Out!</button>
          <Standings />
        </>
      ) : (
        <button onClick={handleSignIn}> Sign In!</button>
      )}
    </div>
  );
}
