// @flow
import * as React from "react";
import ReadingRetention from "./src/ReadingRetention.js";
import PersistenceWrapper from "./src/PersistenceWrapper.js";

const ReadingRetentionWrapped = PersistenceWrapper(ReadingRetention);

export default function App(props: any) {
  return <ReadingRetentionWrapped {...props} />;
}
