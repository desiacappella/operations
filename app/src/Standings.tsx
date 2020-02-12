import React, { useState } from "react";
import { CircuitView } from "./circuitView";

export default function Standings() {
  const [content, setContent] = useState("");

  const x = async () => {
    const cv = new CircuitView(2, "19-20");
    await cv.process();
    setContent(JSON.stringify(cv.get_standings(), null, 2));
  };

  return (
    <div>
      <button onClick={x}>anahat</button>
      <pre>{content}</pre>
    </div>
  );
}
