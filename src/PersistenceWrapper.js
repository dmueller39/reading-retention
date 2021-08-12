// @flow
import React, { useState, useEffect, useRef } from "react";
import type { AbstractComponent } from "react";
import { AsyncStorage } from "react-native";

type ComponentProps<T> = {
  data: T[],
  onComplete: (T) => void,
  onReady: () => void,
};

function parseArray<T>(input: string): T[] {
  try {
    const result = JSON.parse(input);
    if (Array.isArray(result)) {
      return result;
    }
  } catch (e) {
    console.error(e);
    console.error(input);
  }
  return [];
}

function safeParse<T>(input: string): ?T {
  try {
    return JSON.parse(input);
  } catch (e) {
    console.error(e);
    console.error(input);
  }
  return null;
}

function getIsInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
/* we assume that if we are in an iframe, that we are trying to store data with
 */
const IS_IN_IFRAME = getIsInIframe();

/**
 * Handles signals with the iframe wrapper (ruggedbrain.com) or the
 * AsyncStorage which provides log data for the ComposedComponent.
 */
export default function PersistenceWrapper<T>(
  ComposedComponent: AbstractComponent<ComponentProps<T>>
) {
  return () => {
    const [data, setData] = useState(([]: Array<T>));
    if (!IS_IN_IFRAME) {
      useEffect(() => {
        AsyncStorage.getItem("data").then((str) => {
          const parsed: T[] = parseArray(str);
          setData(parsed);
        });
      }, []);
    }
    const onReady = IS_IN_IFRAME
      ? () => {
          window.onmessage = function(e) {
            if (typeof e.data === "string") {
              if (e.data.startsWith(window.location.href + ";data;")) {
                // extract the data string
                const res = e.data.split(";").slice(2);
                const parsed: Array<T> = res
                  .map(safeParse)
                  .filter((item) => item != null);
                setData(parsed);
              }
            }
          };
          window.top.postMessage(window.location.href + ";ready", "*");
        }
      : () => {};

    const onComplete = (item: T) => {
      const updated = [...data, item];
      if (IS_IN_IFRAME) {
        const dataString = JSON.stringify(item);
        if (dataString != null) {
          window.top.postMessage(
            window.location.href + ";complete;" + dataString,
            "*"
          );
        }
      } else {
        AsyncStorage.setItem("data", JSON.stringify(updated));
      }
      setData(updated);
    };

    return (
      <ComposedComponent
        onComplete={onComplete}
        onReady={onReady}
        data={data}
      />
    );
  };
}
