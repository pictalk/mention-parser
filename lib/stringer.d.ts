import { Tag } from "./shared";
declare type MapFunc<T, U> = (t: T) => U;
export declare type TagToStringFunc = MapFunc<Tag, string>;
export declare type TagToStringAsyncFunc = MapFunc<Tag, string | Promise<string>>;
export interface TagMatcher {
    /**
     * Called when tag type not present in the matcher is found.
     */
    "@@unknown"?: TagToStringFunc;
    [tagType: string]: TagToStringFunc | void;
}
export declare function stringify(tags: Tag[], matcher?: TagMatcher): string;
export interface TagMatcherAsync {
    /**
     * Called when tag type not present in the matcher is found.
     */
    "@@unknown"?: TagToStringAsyncFunc;
    [tagType: string]: TagToStringAsyncFunc | void;
}
export declare function stringifyAsync(tags: Tag[], matcher?: TagMatcherAsync): Promise<string>;
export {};
