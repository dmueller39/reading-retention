// @flow
import React, { useState, useEffect } from "react";

import type { GameResult, ReadingRetentionGame } from "./types";
import { getReadingRetentionPlan } from "./gameLogic";
import Level from "./Level";
import Menu from "./Menu";

const OPTIONS = [
  {
    name: "100 WPM",
    getGamePlan: () => getReadingRetentionPlan(100),
  },
  {
    name: "150 WPM",
    getGamePlan: () => getReadingRetentionPlan(150),
  },
  {
    name: "200 WPM",
    getGamePlan: () => getReadingRetentionPlan(200),
  },
  {
    name: "300 WPM",
    getGamePlan: () => getReadingRetentionPlan(300),
  },
];

export default function ReadingRetention() {
  const [results, setResults] = useState(([]: GameResult[]));
  useEffect(() => {
    window.onmessage = function(e) {
      if (typeof e.data === "string") {
        //
        if (e.data.startsWith(window.location.href + ";data;")) {
          // extract the data string
          const res = e.data
            .split(";")
            .slice(2)
            .map((data) => JSON.parse(data));
          setResults(res);
        }
      }
    };
    window.top.postMessage(window.location.href + ";ready", "*");
  }, []);

  const [game, setGame] = useState((null: ?ReadingRetentionGame));
  if (game == null) {
    return <Menu options={OPTIONS} setGame={setGame} />;
  } else {
    const onComplete = (result: GameResult) => {
      window.top.postMessage(
        window.location.href + ";complete;" + JSON.stringify(result),
        "*"
      );

      setGame(null);
    };

    return <Level game={game} onComplete={onComplete} />;
  }
}
