import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@material-ui/core";
import { DETAILS, NOW } from "./constants";
import { map, get } from "lodash";
import { GSheetsScoreManager } from "./scoreManager";

const sm = new GSheetsScoreManager();

export default function Results() {
  const [comp, setComp] = useState(7);
  const [details, setDetails] = useState({} as any);

  // eslint-disable-next-line
  const handleChange = async ({}, newValue: number) => {
    setComp(newValue);
  };

  useEffect(() => {
    const fetchStuff = async () => {
      setDetails(get(await sm.get_raw_scores(NOW, DETAILS[NOW].order[comp]), "[0]"));
    };

    fetchStuff();
  }, [comp]);

  return (
    <div>
      <Tabs value={comp} onChange={handleChange}>
        {map(DETAILS[NOW].order, c => (
          <Tab key={c} label={c} />
        ))}
      </Tabs>
      <table>
        <tbody>
          {map(details, (scores, team) => (
            <tr key={team}>
              <td>{team}</td>
              {map(scores, (score, i) => (
                <td key={i}>{score}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
