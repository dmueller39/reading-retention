// @flow
import type { ReadingRetentionGame, ReadingRetentionSnippet } from "./types";

export default function shuffle<T>(array: Array<T>): Array<T> {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const VISIBLE_HALF_LENGTH = 20;

function getUsableWords(words: Array<string>): Array<string> {
  return words
    .map((word) => word.toLowerCase())
    .map((word) => {
      // this will probably expand to encompass most punctuation
      if (word.endsWith(".") || word.endsWith(",")) {
        return word.substring(0, word.length - 1);
      } else {
        return word;
      }
    });
}

function getOptions(index: number, words: Array<string>): Array<string> {
  const targetWord = words[index];
  const otherOptions = words.filter(
    (word) => word != targetWord && word.length == targetWord.length
  );
  let uniqueOptions = new Set(otherOptions);
  return shuffle([...shuffle([...uniqueOptions]).slice(0, 2), targetWord]);
}

// game plan for reading retention should be an array of strings.
// a subset of the strings should be revealed to the player over time, with
// trailing words being obscured. The player will be quizzed on the words they
// saw previously

export function getReadingRetentionSnippet(
  snippetString: string,
  snippetIndex: number
): ReadingRetentionSnippet {
  const words: Array<string> = snippetString.split(" ");
  const checkWords: Array<string> = getUsableWords(words);

  const allChecks = checkWords
    .map((word, index) => ({
      index,
      word,
      options: getOptions(index, checkWords),
    }))
    .filter(
      // we want three options, but of words 3 letters or longer
      (check) => check.options.length == 3 && check.options[0].length > 2
    );
  const check = shuffle(allChecks)[0];

  return {
    visibleHalfLength: 20,
    words,
    check,
    frameDuration: 200,
    snippetIndex,
  };
}

export function getReadingRetentionPlan(
  stringSnippets: Array<string>,
  id: string,
  start: number
): ReadingRetentionGame {
  const snippets = stringSnippets
    .map(getReadingRetentionSnippet)
    .slice(start, start + 3);
  return {
    id,
    snippets,
  };
}
