import log from "loglevel";

// Client ID and API key from the Developer Console
export const CLIENT_ID = "94642598479-g1na4rsqrj5vu6dram3r7k6k200s8j6m.apps.googleusercontent.com";
export const API_KEY = "AIzaSyBMZ3rGb7dWifD8QVjbidUpvxypn9XfiXA";

// Array of API discovery doc URLs for APIs used by the quickstart
export const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
export const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

export function getGapi() {
  return (window as any).gapi;
}

export const subscribe = (subscription: (val: boolean) => void) => {
  if (getGapi()) {
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
              .isSignedIn.listen(subscription);

            // Handle the initial sign-in state.
            subscription(
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
  } else {
    log.warn("gapi not loaded");
  }
};
