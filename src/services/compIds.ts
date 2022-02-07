interface SingleYear {
  order: string[];
  names: Record<string, string>;
  sheetIds: Record<string, string>;
}

export const DETAILS: Record<string, SingleYear> = {
  "18-19": {
    order: ["jeena", "anahat", "sangeet", "mehfil", "sahana", "gathe", "awaazein"],
    names: {
      jeena: "Jeena",
      anahat: "Anahat",
      sangeet: "Sangeet Saagar",
      mehfil: "Mehfil",
      sahana: "Sahana",
      gathe: "Gathe Raho",
      awaazein: "Awaazein",
    },
    sheetIds: {
      anahat: "1iFCNADUpzFyqp5UjHsFdSJkSp5C5xU7C0YI3Asf_Q0k",
      awaazein: "1pLN6SKR444CdhzntJjDXnPMlqXtxr3dlTV5lnYWOFXI",
      gathe: "1cg6XptCMQsWfmu7RnncfWP1E5b_FSyFOrDehbwlFUFY",
      jeena: "1B1qh4kKSeAFTV1r3MO4Y5jikyYFGHOe7-c46ha3Y-qc",
      mehfil: "1k7F_gBNM1OfDta5_gT_cHovDmt32jbXw--YMoTk1yc4",
      sahana: "1m9l2EQS3h75dlXz7A8E2JKc5GMXJOHlBS3gPlrgI3b4",
      sangeet: "1pYyUIt2RvZ5AOZwwzIvZKd-KTuUE9uPOpT2BpReqkgo",
    },
  },
  "19-20": {
    order: ["jeena", "anahat", "sahana", "sangeet", "sapna", "gathe", "awaazein"],
    names: {
      jeena: "Jeena",
      anahat: "Anahat",
      sangeet: "Sangeet Saagar",
      sapna: "Steel City Sapna",
      sahana: "Sahana",
      gathe: "Gathe Raho",
      awaazein: "Awaazein",
    },
    sheetIds: {
      jeena: "1PERpK3VvawDj-lpZGupI6k5H7aRd5WUrQ5emM6O7ZiQ",
      anahat: "1paQFjuvZSip1qe56qIWT5Un86Cv8BuyG1clHMvFArxg",
      sangeet: "15ok6-LsCmh8qWpZAA_Jw8fHspOITdFYRHfOlpuF9Ous",
      sapna: "11fmeZOdIDqEE3CxT_FeJO4xJV95JGuSi8VO5tvrmiUU",
      sahana: "1xeDesKJ_J9rshPYjGUuxPNSHxbF6cVIOGDgnhm0vJqw",
      gathe: "1RAqltt5vl4uk0gq3RCe4fNWu0taGokv2UP9vjWXO8JY",
      awaazein: "1KYCn0RWMxbWabw4AuZzzsIyKZyCRnadvqcZVi9t7oDM",
    },
  },
  "2022": {
    order: ["sangeet", "sapna", "jeena", "awaazein"],
    names: {
      jeena: "Jeena",
      sangeet: "Sangeet Saagar",
      sapna: "Steel City Sapna",
      awaazein: "Awaazein",
    },
    sheetIds: {
      sangeet: "1HV0ytC_S8O1TrkPBjhH4Nnk43o_S8u-lz53krjFoDi4",
      sapna: "1x-60JJXicIrXA_m7x1652SSl7gJ_aKqDBNA22IcwF8w",
      jeena: "1Ul53wzbCMpO_nmZ-l4HDZUFHHTKNMvsHCSq1XH2mekU",
    },
  },
};
