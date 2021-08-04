// @flow
import React, { useState, useEffect } from "react";

import type { GameResult, ReadingRetentionGame } from "./types";
import { getReadingRetentionPlan } from "./gameLogic";
import DATA from "./gameData";
import Level from "./Level";
import Menu from "./Menu";

function parseData(data: ?string): GameResult[] {
  if (data == null) {
    return [];
  }
  const results = JSON.parse(data);
  if (Array.isArray(results)) {
    return results;
  }
  return [];
}

function getContinueGame(
  results: GameResult[]
): ?{ name: string, getGamePlan: () => ReadingRetentionGame } {
  let latest: ?GameResult = null;
  results.forEach((current) => {
    if (
      current.timestamp != null &&
      (latest == null ||
        latest.timestamp == null ||
        latest.timestamp < current.timestamp)
    ) {
      latest = current;
    }
  });

  if (latest != null) {
    const result = latest;
    const option = DATA.find(
      (option) =>
        option.id == result.id && option.id != null && result.id != null
    );
    if (option != null) {
      return {
        name: "Continue",
        getGamePlan: () =>
          getReadingRetentionPlan(
            option.snippets,
            option.id,
            result.lastIndex + 1
          ),
      };
    }
  }

  return null;
}

function getOptions(
  results: GameResult[]
): Array<{ name: string, getGamePlan: () => ReadingRetentionGame }> {
  const options = DATA.map((option) => {
    return {
      name: option.title,
      getGamePlan: () => getReadingRetentionPlan(option.snippets, option.id, 0),
    };
  });

  const continueGame = getContinueGame(results);
  if (continueGame != null) {
    options.unshift(continueGame);
  }
  return options;
}

export default function ReadingRetention({
  onComplete,
  onReady,
  data,
}: {
  onComplete: (GameResult) => void,
  onReady: () => void,
  data: GameResult[],
}) {
  const [game, setGame] = useState((null: ?ReadingRetentionGame));

  useEffect(() => {
    onReady();
  }, []);

  const options = getOptions(data);

  if (game == null) {
    return <Menu options={options} setGame={setGame} />;
  } else {
    const wrappedOnComplete = (result: GameResult) => {
      onComplete(result);
      setGame(null);
    };

    return <Level game={game} onComplete={wrappedOnComplete} />;
  }
}
