import { Tag } from "./shared";

type MapFunc<T, U> = (t: T) => U;
export type TagToStringFunc = MapFunc<Tag, string>;
export type TagToStringAsyncFunc = MapFunc<Tag, string | Promise<string>>;

const unknownHandler: TagToStringFunc = t => t.value;

export interface TagMatcher {
  /**
   * Called when tag type not present in the matcher is found.
   */
  unknown?: TagToStringFunc;
  [tagType: string]: TagToStringFunc | void;
}

export function stringify(tags: Tag[], matcher: TagMatcher = {}): string {
  let def = matcher.unknown || unknownHandler;

  return tags.reduce((s, t) => s + (matcher[t.type] || def)(t), "");
}

export interface TagMatcherAsync {
  /**
   * Called when tag type not present in the matcher is found.
   */
  unknown?: TagToStringAsyncFunc;
  [tagType: string]: TagToStringAsyncFunc | void;
}

export function stringifyAsync(
  tags: Tag[],
  matcher: TagMatcherAsync = {},
): Promise<string> {
  let def = matcher.unknown || unknownHandler;

  return Promise.all(
    tags.map(t => Promise.resolve((matcher[t.type] || def)(t))),
  ).then(substrs => substrs.join(""));
}
