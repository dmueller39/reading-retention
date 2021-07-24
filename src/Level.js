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
  ReadingRetentionGame,
  GameResult,
  ReadingRetentionCheck,
} from "./types";
import LabelButton from "./common/LabelButton";
import Container from "./common/Container";

export type Props = {|
  onComplete: (GameResult) => void,
  game: ReadingRetentionGame,
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
  check: ?ReadingRetentionCheck,
};

const FRAME_DURATION = 100;

function Obfuscator({ obfuscate }: { obfuscate: boolean }) {
  const opacity = useRef(new Animated.Value(obfuscate ? 1 : 0)).current;

  useEffect(() => {
    if (obfuscate) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 2000,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
      }).start();
    }
  }, [obfuscate]);
  return <Animated.View style={[styles.obfuscator, { opacity }]} />;
}

function Highlight({ enabled }: { enabled: boolean }) {
  return <View style={[styles.highlight, { opacity: enabled ? 1 : 0 }]} />;
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
  // TODO work on feedback
  // make the highlight color match the answer color
  // fix showing the answer
  // advance to another segment (requires medium refactor)
  // commit and push to github
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
    check: null,
  };

  _startTimestamp = Date.now();
  _startIndex = 0;
  _intervalId: ?IntervalID = null;

  componentDidMount = () => {
    // figure out how to handle unmounting
    this._intervalId = setInterval(this._onInterval, 10);
  };

  _onInterval = () => {
    if (this.state.screenType == READING_SCREEN_TYPE) {
      // decouples the animation speed from update duration
      const index =
        (Date.now() - this._startTimestamp) / this.props.game.frameDuration +
        this._startIndex;
      // check if the index has been passed in the checks array

      if (
        index >=
        this.props.game.words.length + this.props.game.visibleHalfLength
      ) {
        const check = this.props.game.checks[0];
        this.setState({
          check,
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
  };

  renderOptionView() {
    const check = this.state.check;
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
    const check = this.state.check;
    const texts = this.props.game.words.map((word, i) => {
      const obfuscate =
        i < this.state.index - this.props.game.visibleHalfLength;
      return (
        <View key={i} style={styles.textContainer}>
          <Text style={styles.word}>{word}</Text>
          <Obfuscator obfuscate={obfuscate} />
          <Highlight enabled={check != null && i == check.index} />
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
    fontSize: 24,
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
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: "#00CC00",
    boxShadow: "0 0 5px #00CC00",
  },
});
