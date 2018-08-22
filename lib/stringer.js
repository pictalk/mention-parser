"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unknownHandler = t => t.value;
function stringify(tags, matcher = {}) {
    let def = matcher["@@unknown"] || unknownHandler;
    return tags.reduce((s, t) => s + (matcher[t.type] || def)(t), "");
}
exports.stringify = stringify;
function stringifyAsync(tags, matcher = {}) {
    let def = matcher["@@unknown"] || unknownHandler;
    return Promise.all(tags.map(t => Promise.resolve((matcher[t.type] || def)(t)))).then(substrs => substrs.join(""));
}
exports.stringifyAsync = stringifyAsync;
//# sourceMappingURL=stringer.js.map