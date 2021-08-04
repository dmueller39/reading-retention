// @flow
import React, { useState } from "react";

import {
  Button,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import type { GameResult, ReadingRetentionGame } from "./types";

import LabelButton from "./common/LabelButton";
import Container from "./common/Container";

export type Props = {|
  options: Array<{ getGamePlan: ?() => ReadingRetentionGame, name: string }>,
  setGame: (ReadingRetentionGame) => void,
|};

export default function Menu({ setGame, options }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  if (showInfo) {
    const onClosePress = () => setShowInfo(false);
    return (
      <Container>
        <LabelButton
          label="❎"
          onPress={onClosePress}
          type="neutral"
          style={styles.infoButton}
        />
        <Text style={styles.infoText}>
          Read and retain the text.{"\n"}
          When prompted, indicate which word was at the location indicated by
          the blue dot.{"\n"}
        </Text>
      </Container>
    );
  }

  const buttons = options.map(({ getGamePlan, name }) => {
    const onPress =
      getGamePlan == null ? () => {} : () => setGame(getGamePlan());
    return (
      <LabelButton
        key={name}
        label={name}
        disabled={getGamePlan == null}
        onPress={onPress}
        type="positive"
        style={styles.labelButton}
      />
    );
  });

  const onInfoPress = () => setShowInfo(true);

  return (
    <Container>
      <LabelButton
        label="ℹ️"
        onPress={onInfoPress}
        type="neutral"
        style={styles.infoButton}
      />
      {buttons}
    </Container>
  );
}

const styles = StyleSheet.create({
  infoButton: { right: 5, position: "absolute" },
  infoText: { paddingLeft: 5, paddingRight: 30, paddingTop: 5 },
  labelButton: { alignSelf: "center" },
});
