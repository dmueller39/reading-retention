// @flow

export type ReadingRetentionCheck = {
  index: number,
  word: string,
  options: Array<string>,
};

export type ReadingRetentionSnippet = {
  frameDuration: number,
  visibleHalfLength: number,
  words: Array<string>,
  check: ReadingRetentionCheck,
  snippetIndex: number,
};

export type ReadingRetentionGame = {
  snippets: Array<ReadingRetentionSnippet>,
  id: string,
};

export type GameResult = {
  mistakes: number,
  id: string,
  lastIndex: number,
  timestamp: number,
};
