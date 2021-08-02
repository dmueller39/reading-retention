// @flow
import React, { useEffect, useState, useRef } from "react";

import {
  Button,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  View,
  Platform,
  TextInput,
  Animated,
} from "react-native";
import WebKeyboardListener from "./common/WebKeyboardListener";

import type {
  ReadingRetentionSnippet,
  GameResult,
  ReadingRetentionCheck,
} from "./types";
import LabelButton from "./common/LabelButton";
import Container from "./common/Container";

export type Props = {|
  onComplete: (boolean) => void,
  snippet: ReadingRetentionSnippet,
|};

// TODO create a TRANSITION state between reading + entry which covers the words, but doesn't
// show the options or highlight

// user should be reading
const READING_SCREEN_TYPE = 1;
// text is transition from visible to not visible
const ENTRY_TRANSITION_SCREEN_TYPE = 2;
// user provides an answer
const ENTRY_SCREEN_TYPE = 3;
// user sees whether the answer was correct
const ANSWER_SCREEN_TYPE = 4;

type ScreenType = 1 | 2 | 3 | 4;

type State = {
  screenType: ScreenType,
  selection: ?string,
};

const FRAME_DURATION = 100;

function AnimatedView({
  enableDuration = 2000,
  disableDuration = 2000,
  enabled,
  style,
}: {
  enableDuration?: number,
  disableDuration?: number,
  style: Object,
  enabled: boolean,
}) {
  const opacity = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    if (enabled) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: enableDuration,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: disableDuration,
      }).start();
    }
  }, [enabled]);
  return <Animated.View style={[style, { opacity }]} />;
}

function Obfuscator({ obfuscate }: { obfuscate: boolean }) {
  return <AnimatedView style={styles.obfuscator} enabled={obfuscate} />;
}

function Highlight({ enabled }: { enabled: boolean }) {
  return (
    <AnimatedView
      disableDuration={0}
      style={styles.highlight}
      enabled={enabled}
    />
  );
}

type OptionTextState = 0 | 1 | 2;
const OPTION_TEXT_STATE_DEFAULT = 0;
const OPTION_TEXT_STATE_INCORRECT = 1;
const OPTION_TEXT_STATE_CORRECT = 2;

function OptionText({
  word,
  onPress,
  state,
}: {
  onPress?: (string) => void,
  state: OptionTextState,
  word: string,
}) {
  const getStateStyle = (state: OptionTextState) => {
    switch (state) {
      case OPTION_TEXT_STATE_INCORRECT:
        return { color: "red" };
      case OPTION_TEXT_STATE_CORRECT:
        return { color: "green" };
      default:
      case OPTION_TEXT_STATE_DEFAULT:
        return null;
    }
  };
  return (
    <Text
      onPress={() => onPress != null && onPress(word)}
      style={[styles.option, getStateStyle(state)]}
    >
      {word}
    </Text>
  );
}

function ReadyView({
  screenType,
  onPressReady,
}: {
  screenType: ScreenType,
  onPressReady: () => void,
}) {
  switch (screenType) {
    case READING_SCREEN_TYPE:
      return (
        <LabelButton
          label="ready"
          type="positive"
          onPress={onPressReady}
          style={styles.ready}
        />
      );
    default:
    case ENTRY_SCREEN_TYPE:
    case ANSWER_SCREEN_TYPE:
      return null;
  }
}

function OptionView({
  snippet,
  screenType,
  selection,
  onPressOption,
}: {
  snippet: ReadingRetentionSnippet,
  screenType: ScreenType,
  selection: ?string,
  onPressOption: (string) => void,
}) {
  const check = snippet.check;
  if (check == null) {
    return null;
  }
  switch (screenType) {
    case ENTRY_SCREEN_TYPE: {
      const optionViews = check.options.map((word, index) => (
        <OptionText
          state={OPTION_TEXT_STATE_DEFAULT}
          key={word}
          word={word}
          onPress={onPressOption}
        />
      ));
      return <View style={styles.optionContainer}>{optionViews}</View>;
    }
    case ANSWER_SCREEN_TYPE: {
      const getState = (word: string) => {
        if (word == selection && word == check.word) {
          return OPTION_TEXT_STATE_CORRECT;
        } else if (word == selection && word != check.word) {
          return OPTION_TEXT_STATE_INCORRECT;
        } else {
          return OPTION_TEXT_STATE_DEFAULT;
        }
      };
      const optionViews = check.options.map((word, index) => (
        <OptionText key={word} word={word} state={getState(word)} />
      ));
      return <View style={styles.optionContainer}>{optionViews}</View>;
    }

    default:
    case READING_SCREEN_TYPE:
      return null;
  }
}

export default function Level(props: Props) {
  const [screenType, setScreenType] = useState(
    (READING_SCREEN_TYPE: ScreenType)
  );
  const [selection, setSelection] = useState((null: ?string));

  const timeoutRef = useRef((null: ?TimeoutID));

  useEffect(() => {
    setScreenType(READING_SCREEN_TYPE);
    setSelection(null);
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [props.snippet]);

  const onTimeout = () => {
    setScreenType(READING_SCREEN_TYPE);
    props.onComplete(selection == props.snippet.check.word);
  };

  const onPressOption = (selection: string) => {
    setSelection(selection);
    setScreenType(ANSWER_SCREEN_TYPE);
    timeoutRef.current = setTimeout(() => {
      props.onComplete(selection == props.snippet.check.word);
    }, 2000);
  };

  const onPressReady = () => {
    timeoutRef.current = setTimeout(() => {
      setScreenType(ENTRY_SCREEN_TYPE);
    }, 2000);
    setScreenType(ENTRY_TRANSITION_SCREEN_TYPE);
  };

  const check = props.snippet.check;
  const texts = props.snippet.words.map((word, i) => {
    const highlight =
      screenType != READING_SCREEN_TYPE && i == check.index ? (
        <Highlight
          enabled={
            screenType == ENTRY_SCREEN_TYPE || screenType == ANSWER_SCREEN_TYPE
          }
        />
      ) : null;
    if (i == check.index) {
      console.log(check.index);
      console.log(screenType);
      console.log(highlight);
    }
    return (
      <View key={i} style={styles.textContainer}>
        <Text style={styles.word}>{word}</Text>
        <Obfuscator
          obfuscate={
            screenType == ENTRY_SCREEN_TYPE ||
            screenType == ENTRY_TRANSITION_SCREEN_TYPE
          }
        />
        {highlight}
      </View>
    );
  });
  return (
    <Container>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{texts}</View>
      <OptionView
        snippet={props.snippet}
        screenType={screenType}
        onPressOption={onPressOption}
        selection={selection}
      />
      <ReadyView screenType={screenType} onPressReady={onPressReady} />
    </Container>
  );
}

const styles = StyleSheet.create({
  word: {
    fontSize: 20,
    marginRight: 4, // terrible hack :P
  },
  textContainer: {
    margin: 1,
  },
  optionContainer: {
    flexDirection: "row",
  },
  option: {
    margin: 5,
    fontSize: 26,
    fontWeight: "bold",
  },
  obfuscator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#CCCCCC",
  },
  highlight: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: -1,
    right: 2,
    borderColor: "green",
    borderWidth: 2,
    boxShadow: "0 0 5px green",
  },
  ready: {
    margin: 5,
    fontSize: 26,
    alignSelf: "center",
  },
});
