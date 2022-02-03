import { Typography } from "@material-ui/core";
import { map } from "lodash";
import { string } from "mathjs";
import React, { useEffect, useState } from "react";
import preset from "../data/preset.json";
import { SingleYear } from "../types";

export default function Home() {
  const [allYears, setAllYears] = useState({} as Record<string, SingleYear>);

  useEffect(() => {
    setAllYears(preset);
  }, []);

  return (
    <div>
      <Typography>Select a year below</Typography>
      {map(allYears, (yearDetails, year) => {

      })}
    </div>
  );
}
