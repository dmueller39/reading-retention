// @flow
import type { ReadingRetentionGame } from "./types";

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

const LOREM_IPSUM =
  "It might not seem there's much to learn about how to work hard. Anyone who's been to school knows what it entails, even if they chose not to. There are 12 year olds who work amazingly hard. And yet when I ask if I know more about working hard now than when I was in school, the answer is definitely yes.";
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
//
// TODO: We are using lorem ipsum for now, but we will want real text in the future
export function getReadingRetentionPlan(): ReadingRetentionGame {
  const words: Array<string> = LOREM_IPSUM.split(" ");
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
  const checks = shuffle(allChecks).slice(0, 1);

  return {
    visibleHalfLength: 20,
    words,
    checks,
    frameDuration: 200,
  };
}
