import { Result } from "safe-types";
import { Tag } from "./shared";
export declare enum ErrorCode {
    /**
     * A zero-valued error is not an error.
     * Currently unused.
     */
    None = 0,
    /**
     * Syntax error when a tag open/close token is used inside a tag
     * as a type or value.
     */
    InvalidToken = 1,
    /**
     * Syntax error where the parser is trying to close the tag,
     * but does not receive the correct sequence of tokens.
     */
    UnclosedTag = 2
}
interface ParseError {
    code: ErrorCode;
    message: string;
}
export declare function parse(message: string): Result<Tag[], ParseError>;
export {};
