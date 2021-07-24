// @flow

export type ReadingRetentionCheck = {
  index: number,
  word: string,
  options: Array<string>,
};

export type ReadingRetentionGame = {
  words: Array<string>,
  // blob of text
  frameDuration: number,
  checks: Array<ReadingRetentionCheck>,
  visibleHalfLength: number,
};

export type GameResult = {
  mistakes: number,
  speed: number,
};
