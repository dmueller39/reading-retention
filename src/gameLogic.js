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

// TODO make this dynamic
const INPUT_DATA = [
  "It might not seem there's much to learn about how to work hard. Anyone who's been to school knows what it entails, even if they chose not to. There are 12 year olds who work amazingly hard. And yet when I ask if I know more about working hard now than when I was in school, the answer is definitely yes.",
  "One thing I know is that if you want to do great things, you'll have to work very hard. I wasn't sure of that as a kid. Schoolwork varied in difficulty; one didn't always have to work super hard to do well. And some of the things famous adults did, they seemed to do almost effortlessly. Was there, perhaps, some way to evade hard work through sheer brilliance? Now I know the answer to that question. There isn't.",
  "The reason some subjects seemed easy was that my school had low standards. And the reason famous adults seemed to do things effortlessly was years of practice; they made it look easy.",
  "Of course, those famous adults usually had a lot of natural ability too. There are three ingredients in great work: natural ability, practice, and effort. You can do pretty well with just two, but to do the best work you need all three: you need great natural ability and to have practiced a lot and to be trying very hard. [1]",
  'Bill Gates, for example, was among the smartest people in business in his era, but he was also among the hardest working. "I never took a day off in my twenties," he said. "Not one." It was similar with Lionel Messi. He had great natural ability, but when his youth coaches talk about him, what they remember is not his talent but his dedication and his desire to win. P. G. Wodehouse would probably get my vote for best English writer of the 20th century, if I had to choose. Certainly no one ever made it look easier. But no one ever worked harder. At 74, he wrote',
  "with each new book of mine I have, as I say, the feeling that this time I have picked a lemon in the garden of literature. A good thing, really, I suppose. Keeps one up on one's toes and makes one rewrite every sentence ten times. Or in many cases twenty times.",
  "Sounds a bit extreme, you think. And yet Bill Gates sounds even more extreme. Not one day off in ten years? These two had about as much natural ability as anyone could have, and yet they also worked about as hard as anyone could work. You need both.",
  "That seems so obvious, and yet in practice we find it slightly hard to grasp. There's a faint xor between talent and hard work. It comes partly from popular culture, where it seems to run very deep, and partly from the fact that the outliers are so rare. If great talent and great drive are both rare, then people with both are rare squared. Most people you meet who have a lot of one will have less of the other. But you'll need both if you want to be an outlier yourself. And since you can't really change how much natural talent you have, in practice doing great work, insofar as you can, reduces to working very hard.",
  "It's straightforward to work hard if you have clearly defined, externally imposed goals, as you do in school. There is some technique to it: you have to learn not to lie to yourself, not to procrastinate (which is a form of lying to yourself), not to get distracted, and not to give up when things go wrong. But this level of discipline seems to be within the reach of quite young children, if they want it.",
];

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
  snippetString: string
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
  };
}

export function getReadingRetentionPlan(): ReadingRetentionGame {
  const snippets = INPUT_DATA.map(getReadingRetentionSnippet);

  return {
    snippets,
  };
}
