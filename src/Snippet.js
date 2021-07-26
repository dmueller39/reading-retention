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

// user should be reading
const READING_SCREEN_TYPE = 1;
// user provides an answer
const ENTRY_SCREEN_TYPE = 2;
// user sees whether the answer was correct
const ANSWER_SCREEN_TYPE = 3;

type ScreenType = 0 | 1 | 2 | 3;

type State = {
  index: number,
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

export default class Level extends React.Component<Props, State> {
  state = {
    index: 0,
    screenType: READING_SCREEN_TYPE,
    selection: null,
  };

  _startTimestamp = Date.now();
  _startIndex = 0;
  _intervalId: ?IntervalID = null;
  _timeoutId: ?TimeoutID = null;

  componentDidMount = () => {
    this._intervalId = setInterval(this._onInterval, 10);
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.snippet != this.props.snippet) {
      this.setState({
        index: 0,
        screenType: READING_SCREEN_TYPE,
        selection: null,
      });
      this._startTimestamp = Date.now();
      this._startIndex = 0;
      this._intervalId = setInterval(this._onInterval, 10);
    }
  }

  componentWillUnmount() {
    if (this._intervalId != null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    if (this._timeoutId != null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  _onInterval = () => {
    if (this.state.screenType == READING_SCREEN_TYPE) {
      // decouples the animation speed from update duration
      const index =
        (Date.now() - this._startTimestamp) / this.props.snippet.frameDuration +
        this._startIndex;
      // check if the index has been passed in the checks array

      if (
        index >=
        this.props.snippet.words.length + this.props.snippet.visibleHalfLength
      ) {
        const check = this.props.snippet.check;
        this.setState({
          screenType: ENTRY_SCREEN_TYPE,
        });
        clearInterval(this._intervalId);
        this._intervalId = null;
      } else {
        // TODO pull the animation index out of the state entirely
        this.setState({
          index,
        });
      }
    }
  };

  _onPressOption = (selection: string) => {
    this.setState({ selection, screenType: ANSWER_SCREEN_TYPE });
    this._timeoutId = setTimeout(() => {
      this.props.onComplete(selection == this.props.snippet.check.word);
    }, 2000);
  };

  renderOptionView() {
    const check = this.props.snippet.check;
    if (check == null) {
      return null;
    }
    switch (this.state.screenType) {
      case ENTRY_SCREEN_TYPE: {
        const optionViews = check.options.map((word, index) => (
          <OptionText
            state={OPTION_TEXT_STATE_DEFAULT}
            key={word}
            word={word}
            onPress={this._onPressOption}
          />
        ));
        return <View style={styles.optionContainer}>{optionViews}</View>;
      }
      case ANSWER_SCREEN_TYPE: {
        const getState = (word: string) => {
          if (word == this.state.selection && word == check.word) {
            return OPTION_TEXT_STATE_CORRECT;
          } else if (word == this.state.selection && word != check.word) {
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

  render() {
    const { screenType } = this.state;
    const check = this.props.snippet.check;
    const texts = this.props.snippet.words.map((word, i) => {
      const obfuscate =
        screenType != ANSWER_SCREEN_TYPE &&
        i < this.state.index - this.props.snippet.visibleHalfLength;
      const highlight =
        i == check.index ? (
          <Highlight enabled={screenType != READING_SCREEN_TYPE} />
        ) : null;
      return (
        <View key={i} style={styles.textContainer}>
          <Text style={styles.word}>{word}</Text>
          <Obfuscator obfuscate={obfuscate} />
          {highlight}
        </View>
      );
    });
    const optionView = this.renderOptionView();
    return (
      <Container>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{texts}</View>
        {optionView}
      </Container>
    );
  }
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
});
