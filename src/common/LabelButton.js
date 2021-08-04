// @flow
import * as React from "react";

import { StyleSheet, Text } from "react-native";

type ButtonType = "positive" | "warning" | "negative" | "neutral";

function getStyle(type: ButtonType) {
  switch (type) {
    case "positive":
      return styles.positive;
    case "negative":
      return styles.negative;
  }
  return styles.neutral;
}

export default function LabelButton({
  onPress,
  type,
  label,
  disabled = false,
  style,
}: {
  type: ButtonType,
  onPress: () => void,
  label: string,
  disabled?: boolean,
  style?: any,
}) {
  if (disabled) {
    return <Text style={[style, styles.disabled]}>{label}</Text>;
  }
  return (
    <Text style={[style, getStyle(type)]} onPress={onPress}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  positive: {
    padding: 8,
    color: "green",
    fontSize: 24,
  },
  negative: {
    padding: 8,
    color: "red",
    fontSize: 24,
  },
  neutral: {
    padding: 8,
    color: "black",
    fontSize: 24,
  },
  disabled: {
    padding: 8,
    color: "grey",
    fontSize: 24,
  },
});
