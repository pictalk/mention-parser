import { Result, Ok, Err } from "safe-types";
import { Tag } from "./shared";

const enum TagType {
  Text = "text",
}

const enum Token {
  Open = "{",
  Close = "}",
  Sep = ":",
}

const enum State {
  Text,
  Opening,
  Type,
  Value,
  Closing,
}

export enum ErrorCode {
  /**
   * A zero-valued error is not an error.
   * Currently unused.
   */
  None,
  /**
   * Syntax error when a tag open/close token is used inside a tag
   * as a type or value.
   */
  InvalidToken,
  /**
   * Syntax error where the parser is trying to close the tag,
   * but does not receive the correct sequence of tokens.
   */
  UnclosedTag,
  /**
   * Type error when a tag is matched that does not exist in a given
   * set of allowed tags.
   */
  UnrecognizedTag,
}

export interface ParseError {
  code: ErrorCode;
  message: string;
}

export function parse<T extends string = string>(
  message: string,
  tagsAllowed?: Set<T>,
): Result<Tag<T>[], ParseError> {
  const tags: Tag[] = [];
  let state = State.Text;
  let type: string = TagType.Text;
  let value = "";

  for (let char of Array.from(message)) {
    switch (state) {
      case State.Text:
        // Switch state on a tag opening token '{'
        if (char === Token.Open) {
          state = State.Opening;
          break;
        }

        value += char;
        break;

      case State.Opening:
        // Tag open failed--expected double curly braces '{{'
        if (char !== Token.Open) {
          state = State.Text;
          // Return the original '{' back to the value buffer
          value += Token.Open + char;
          break;
        }

        // Tag opened successfully.
        state = State.Type;

        // Flush the current tag.
        if (value.length) {
          tags.push({ type, value });
        }

        // New tag
        type = "";
        value = "";
        break;

      case State.Type:
        // We expect to parse the type, but we can encounter more open tokens
        if (char === Token.Open) {
          // If we've already buffered some of the type,
          // this is a syntax error
          if (type.length > 0) {
            return Err({
              code: ErrorCode.InvalidToken,
              message: `cannot use tag opening token '${
                Token.Open
              }' inside of tag`,
            });
          } else {
            // In this case, we haven't begun buffering the type,
            // so these open tokens should be parsed as text chars
            // that belong to the previous text tag.
            let tail_tag = tags[tags.length - 1];
            if (!tail_tag || tail_tag.type !== TagType.Text) {
              tags.push({ type: TagType.Text, value: Token.Open });
              break;
            }

            tail_tag.value += Token.Open;
            break;
          }
        }

        if (char === Token.Close) {
          return Err({
            code: ErrorCode.InvalidToken,
            message: `cannot use tag closing token '${
              Token.Close
            }' inside of tag`,
          });
        }

        // Finished consuming tag type, switch to value.
        if (char === Token.Sep) {
          state = State.Value;
          type = type.trim();
          if (tagsAllowed && !tagsAllowed.has(type as any)) {
            return Err({
              code: ErrorCode.UnrecognizedTag,
              message: `tag does not match any allowed tags`,
            });
          }
          break;
        }

        type += char;
        break;

      case State.Value:
        if (char === Token.Open) {
          return Err({
            code: ErrorCode.InvalidToken,
            message: `cannot use tag opening token '${
              Token.Open
            }' inside of tag`,
          });
        }

        // Finished consuming tag value, switch to close the tag.
        if (char === Token.Close) {
          state = State.Closing;
          value = value.trim();
          break;
        }

        value += char;
        break;

      case State.Closing:
        if (char !== Token.Close) {
          return Err({
            code: ErrorCode.UnclosedTag,
            message: `tag was not properly closed with two '${
              Token.Close
            }' tokens`,
          });
        }

        state = State.Text;

        tags.push({ type, value });
        // New text tag buffer
        type = TagType.Text;
        value = "";
        break;

      default:
        expectNever(state);
    }
  }

  if (state !== State.Text) {
    return Err({
      code: ErrorCode.UnclosedTag,
      message: "text parsed without closing a tag",
    });
  }

  // Flush the current tag.
  if (value.length) {
    tags.push({ type, value });
  }

  return Ok(tags);
}

function expectNever(_: never, msg = "unexpected code path"): never {
  throw new Error(msg);
}
