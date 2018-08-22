"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const safe_types_1 = require("safe-types");
var ErrorCode;
(function (ErrorCode) {
    /**
     * A zero-valued error is not an error.
     * Currently unused.
     */
    ErrorCode[ErrorCode["None"] = 0] = "None";
    /**
     * Syntax error when a tag open/close token is used inside a tag
     * as a type or value.
     */
    ErrorCode[ErrorCode["InvalidToken"] = 1] = "InvalidToken";
    /**
     * Syntax error where the parser is trying to close the tag,
     * but does not receive the correct sequence of tokens.
     */
    ErrorCode[ErrorCode["UnclosedTag"] = 2] = "UnclosedTag";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
function parse(message) {
    const tags = [];
    let state = 0 /* Text */;
    let type = "text" /* Text */;
    let value = "";
    for (let char of Array.from(message)) {
        switch (state) {
            case 0 /* Text */:
                // Switch state on a tag opening token '{'
                if (char === "{" /* Open */) {
                    state = 1 /* Opening */;
                    break;
                }
                value += char;
                break;
            case 1 /* Opening */:
                // Tag open failed--expected double curly braces '{{'
                if (char !== "{" /* Open */) {
                    state = 0 /* Text */;
                    // Return the original '{' back to the value buffer
                    value += "{" /* Open */ + char;
                    break;
                }
                // Tag opened successfully.
                state = 2 /* Type */;
                // Flush the current tag.
                if (value.length) {
                    tags.push({ type, value });
                }
                // New tag
                type = "";
                value = "";
                break;
            case 2 /* Type */:
                // We expect to parse the type, but we can encounter more open tokens
                if (char === "{" /* Open */) {
                    // If we've already buffered some of the type,
                    // this is a syntax error
                    if (type.length > 0) {
                        return safe_types_1.Err({
                            code: ErrorCode.InvalidToken,
                            message: `cannot use tag opening token '${"{" /* Open */}' inside of tag`,
                        });
                    }
                    else {
                        // In this case, we haven't begun buffering the type,
                        // so these open tokens should be parsed as text chars
                        // that belong to the previous text tag.
                        let tail_tag = tags[tags.length - 1];
                        if (!tail_tag || tail_tag.type !== "text" /* Text */) {
                            tags.push({ type: "text" /* Text */, value: "{" /* Open */ });
                            break;
                        }
                        tail_tag.value += "{" /* Open */;
                        break;
                    }
                }
                if (char === "}" /* Close */) {
                    return safe_types_1.Err({
                        code: ErrorCode.InvalidToken,
                        message: `cannot use tag closing token '${"}" /* Close */}' inside of tag`,
                    });
                }
                // Finished consuming tag type, switch to value.
                if (char === ":" /* Sep */) {
                    state = 3 /* Value */;
                    type = type.trim();
                    break;
                }
                type += char;
                break;
            case 3 /* Value */:
                if (char === "{" /* Open */) {
                    return safe_types_1.Err({
                        code: ErrorCode.InvalidToken,
                        message: `cannot use tag opening token '${"{" /* Open */}' inside of tag`,
                    });
                }
                // Finished consuming tag value, switch to close the tag.
                if (char === "}" /* Close */) {
                    state = 4 /* Closing */;
                    value = value.trim();
                    break;
                }
                value += char;
                break;
            case 4 /* Closing */:
                if (char !== "}" /* Close */) {
                    return safe_types_1.Err({
                        code: ErrorCode.UnclosedTag,
                        message: `tag was not properly closed with two '${"}" /* Close */}' tokens`,
                    });
                }
                state = 0 /* Text */;
                tags.push({ type, value });
                // New text tag buffer
                type = "text" /* Text */;
                value = "";
                break;
            default:
                expectNever(state);
        }
    }
    if (state !== 0 /* Text */) {
        return safe_types_1.Err({
            code: ErrorCode.UnclosedTag,
            message: "text parsed without closing a tag",
        });
    }
    // Flush the current tag.
    if (value.length) {
        tags.push({ type, value });
    }
    return safe_types_1.Ok(tags);
}
exports.parse = parse;
function expectNever(_, msg = "unexpected code path") {
    throw new Error(msg);
}
//# sourceMappingURL=parser.js.map