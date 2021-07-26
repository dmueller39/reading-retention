// @flow
import React, { useEffect, useState, useRef } from "react";

import type {
  ReadingRetentionGame,
  GameResult,
  ReadingRetentionCheck,
} from "./types";
import Snippet from "./Snippet";

export type Props = {|
  onComplete: (GameResult) => void,
  game: ReadingRetentionGame,
|};

type State = {
  snippetIndex: number,
};

export default function Level(props: Props) {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const onSnippetComplete = (correct: boolean) => {
    const updatedMistakes = correct ? mistakes : mistakes + 1;
    setMistakes(updatedMistakes);
    if (snippetIndex + 1 >= props.game.snippets.length) {
      props.onComplete({
        mistakes: updatedMistakes,
      });
    } else {
      setSnippetIndex(snippetIndex + 1);
    }
  };

  const snippet = props.game.snippets[snippetIndex];
  return <Snippet snippet={snippet} onComplete={onSnippetComplete} />;
}
