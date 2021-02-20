import React, { useState, useEffect } from "react";
import { Tabs, Tab, Typography } from "@material-ui/core";
import { DETAILS } from "../services/compIds";
import { map, get } from "lodash";
import { GSheetsScoreManager } from "../services/scoreManager";

const sm = new GSheetsScoreManager();

export default function Results({ year }: { year: string }) {
  const [comp, setComp] = useState(0);
  const [details, setDetails] = useState({} as any);

  // eslint-disable-next-line
  const handleChange = async ({}, newValue: number) => {
    setComp(newValue);
  };

  useEffect(() => {
    const fetchStuff = async () => {
      setDetails(get(await sm.get_raw_scores(year, DETAILS[year].order[comp]), "[0]"));
    };

    fetchStuff();
  }, [comp, year]);

  return (
    <div>
      <Tabs value={comp} onChange={handleChange}>
        {map(DETAILS[year].order, (c) => (
          <Tab key={c} label={c} />
        ))}
      </Tabs>
      <table>
        <tbody>
          {map(details, (scores, team) => (
            <tr key={team}>
              <td>
                <Typography>{team}</Typography>
              </td>
              {map(scores, (score, i) => (
                <td key={i}>
                  <Typography>{score}</Typography>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
