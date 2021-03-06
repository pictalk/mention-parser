// @flow
import { type Result } from "safe-types";

type MapFunc<T, U> = (t: T) => U;

declare module "@pictalk/mention-parser" {
  declare export interface Tag {
    type: string;
    value: string;
  }

  declare export type ErrorCode = {
    /**
     * A zero-valued error is not an error.
     * Currently unused.
     */
    None: 0,
    "0": "None",
    /**
     * Syntax error when a tag open/close token is used inside a tag
     * as a type or value.
     */
    InvalidToken: 1,
    "1": "InvalidToken",
    /**
     * Syntax error where the parser is trying to close the tag,
     * but does not receive the correct sequence of tokens.
     */
    UnclosedTag: 2,
    "2": "UnclosedTag",
  };

  declare export interface ParseError {
    code:
      | $PropertyType<ErrorCode, "None">
      | $PropertyType<ErrorCode, "InvalidToken">
      | $PropertyType<ErrorCode, "UnclosedTag">;
    message: string;
  }

  declare export function parse(message: string): Result<Tag[], ParseError>;

  declare export type TagToStringFunc = MapFunc<Tag, string>;
  declare export type TagToStringAsyncFunc = MapFunc<
    Tag,
    string | Promise<string>,
  >;

  declare export function stringify(
    tags: Tag[],
    matcher?: {
      /**
       * Called when tag type not present in the matcher is found.
       */
      unknown?: TagToStringFunc,
      [tagType: string]: TagToStringFunc | void,
    },
  ): string;

  declare export function stringifyAsync(
    tags: Tag[],
    matcher?: {
      /**
       * Called when tag type not present in the matcher is found.
       */
      unknown?: TagToStringFunc,
      [tagType: string]: TagToStringAsyncFunc | void,
    },
  ): Promise<string>;
}
