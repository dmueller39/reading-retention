// @flow

export type ReadingRetentionCheck = {
  index: number,
  word: string,
  options: Array<string>,
};

export type ReadingRetentionSnippet = {
  // should these be constant per game?
  frameDuration: number,
  visibleHalfLength: number,
  words: Array<string>,
  check: ReadingRetentionCheck,
};

export type ReadingRetentionGame = {
  snippets: Array<ReadingRetentionSnippet>,
};

export type GameResult = {
  mistakes: number,
};
