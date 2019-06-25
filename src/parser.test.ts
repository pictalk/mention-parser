import * as Tags from "./parser";
import { Result } from "safe-types";

const stringify = (x: any) => JSON.stringify(x, null, 2);

describe("Mention Parser", () => {
  it("should work", () => {
    let r = Tags.parse(`
Hello world! My best friend is {{mention:abcdefg123456}}, and together we love
{{hashtag:coding}}.
    `);

    expect(r).toBeDefined();
    expect(r.is_ok()).toBe(true);
    expect(r.unwrap()).toMatchSnapshot();
  });

  it("should work on tags with emoji types or values", () => {
    let text = `That moment when... {{hashtag:💩}}`;
    let r = Tags.parse(text);

    let tokens = r.unwrap();
    let tag = tokens.find(t => t.type == "hashtag")!;
    expect(tag).toBeDefined();
    expect(tag.value).toBe("💩");
    expect(tag.length).toBe(1);

    text = `That moment when... {{💩:some-value}}`;
    r = Tags.parse(text);

    tokens = r.unwrap();
    tag = tokens.find(t => t.type == "💩")!;
    expect(tag).toBeDefined();
    expect(tag.type).toBe("💩");
  });

  it("should trim spaces in tag types and values", () => {
    let type = "foo";
    let value = "bar";
    let tests = [
      `Lorem ipsum dolor sit {{ ${type}:${value}}} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{ ${type} :${value}}} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{ ${type} : ${value}}} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{ ${type} : ${value} }} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{${type}: ${value}}} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{${type}: ${value} }} amet consectetur adipisicing elit.`,
      `Lorem ipsum dolor sit {{${type}:${value} }} amet consectetur adipisicing elit.`,
    ];

    for (let text of tests) {
      let tokens = Tags.parse(text).unwrap();
      let tag = tokens.find(t => t.type == type)!;
      expect(tag).toBeDefined();
      expect(tag.type).toBe(type);
      expect(tag.value).toBe(value);
      expect(tag.length).toBe(value.length);
    }
  });

  it("should work with spaces inside tag types and values", () => {
    let tests = [
      {
        type: "some type",
        value: "some value",
        text: `Now let's test {{ some type : some value }}.`,
      },
      {
        type: "another type with spaces",
        value: "a value with spaces",
        text: `Now let's test {{ another type with spaces : a value with spaces }}.`,
      },
    ];

    for (let { text, type, value } of tests) {
      let tokens = Tags.parse(text).unwrap();
      let tag = tokens.find(t => t.type == type)!;
      expect(tag).toBeDefined();
      expect(tag.type).toBe(type);
      expect(tag.value).toBe(value);
    }
  });

  it("should not trip up on curly brace tokens that aren't mustache tags", () => {
    let tests = [
      {
        type: "hashtag",
        value: "beach",
        text: JSON.stringify({
          user: {
            name: "Penelope",
            bio: "I love long walks on the {{hashtag:beach}}.",
          },
        }),
      },
      {
        type: "hashtag",
        value: "beach",
        text: "I love long walks on the {{{hashtag:beach}}}.",
      },
      {
        type: "hashtag",
        value: "beach",
        text: "I love long walks on the {{{{hashtag:beach}}}}.",
      },
      {
        type: "hashtag",
        value: "RealTalk",
        text: "{{{ hashtag : RealTalk }} I love long walks on the beach.",
        match: [
          { type: "text", value: "{", length: 1 },
          { type: "hashtag", value: "RealTalk", length: 8 },
          {
            type: "text",
            value: " I love long walks on the beach.",
            length: 32,
          },
        ],
      },
      {
        type: "hashtag",
        value: "RealTalk",
        text:
          "{{{ hashtag : RealTalk }}{{{{{mention: my husband  }}} and I love long walks on the beach.",
        match: [
          { type: "text", value: "{", length: 1 },
          { type: "hashtag", value: "RealTalk", length: 8 },
          { type: "text", value: "{{{", length: 3 },
          { type: "mention", value: "my husband", length: 10 },
          {
            type: "text",
            value: "} and I love long walks on the beach.",
            length: 37,
          },
        ],
      },
    ];

    for (let { text, type, value, match } of tests) {
      let r = Tags.parse(text);
      r.map_err(err => {
        console.error(text);
        console.error(err);
      });
      let tokens = r.unwrap();
      let tag = tokens.find(t => t.type == type)!;
      expect(tag).toBeDefined();
      expect(tag.type).toBe(type);
      expect(tag.value).toBe(value);
      if (match) {
        expect(tokens).toEqual(match);
      }
    }
  });

  it("should error when a tag is never closed", () => {
    let tests = [
      {
        label: "unclosed tag at end of string",
        text: `Let's burn this parser to the ground! {{hashtag:FuzzTesting}`,
      },
      {
        label: "unclosed tag in the middle of string",
        text: `Let's burn this {{hashtag:parser} to the ground!`,
      },
      {
        label: "invalid token inside tag",
        text: `Let's burn this {{hash{tag:parser}} to the ground!`,
      },
      {
        label: "invalid token inside tag",
        text: `Let's burn this {{hash}tag:parser}} to the ground!`,
      },
      {
        label: "tag closed before value",
        text: `Let's burn this {{hashtag}} to the ground!`,
      },
    ];

    for (let { text, label } of tests) {
      let r = Tags.parse(text);
      if (r.is_ok()) {
        console.error(`${label}:`, stringify(text));
        console.error(stringify(r));
      }
      expect(r.is_err()).toBe(true);
      let err = r.unwrap_err();

      // Ensure we provide a stable error shape
      expect(err.code).toBeDefined();
      expect(err.message).toBeDefined();
      // Ensure we provide a stable type
      expect(typeof err.message).toBe("string");
      expect(typeof err.code).toBe("number");
      // Ensure we know if our error codes change.
      // Consumers may rely on specific codes.
      expect(err.code).toMatchSnapshot(label);
    }
  });
});

describe("should error when tag does not match allowed tags", () => {
  type MyTags = "hashtag" | "mention";
  const tagsAllowed = new Set<MyTags>(["hashtag", "mention"]);

  let tests = [
    {
      label: "unknown tag 'hash'",
      text: `Let's burn this {{hash:parser}} to the ground!`,
      tagsAllowed,
    },
    {
      label: "case sensitive error for 'hashtag'",
      text: `Let's burn this {{hashTag:parser}} to the ground!`,
      tagsAllowed,
    },
  ];

  for (let { text, label, tagsAllowed } of tests) {
    it(label, () => {
      let r = Tags.parse(text, tagsAllowed);
      if (r.is_ok()) {
        console.error(`${label}:`, stringify(text));
        console.error(stringify(r));
      }
      expect(r.is_err()).toBe(true);
      let err = r.unwrap_err();

      // Ensure we provide a stable error shape
      expect(err.code).toBeDefined();
      expect(err.message).toBeDefined();
      // Ensure we provide a stable type
      expect(typeof err.message).toBe("string");
      expect(typeof err.code).toBe("number");
      // Ensure we know if our error codes change.
      // Consumers may rely on specific codes.
      expect(err.code).toMatchSnapshot(label);
    });
  }
});

describe("Grapheme counts", () => {
  const tt = [
    {
      label: `Japanese characters`,
      input: `日本語 {{hashtag:japanese}}`,
      output: [
        {
          type: "text",
          value: "日本語 ",
          length: 4,
        },
        {
          type: "hashtag",
          value: "japanese",
          length: 8,
        },
      ],
    },
    {
      label: `Emoji`,
      input: `🔥 Such a bittersweet ending to game of thrones 🐉 ⚔ {{ hashtag : GoT }}`,
      output: [
        {
          type: "text",
          value: "🔥 Such a bittersweet ending to game of thrones 🐉 ⚔ ",
          length: 51,
        },
        {
          type: "hashtag",
          value: "GoT",
          length: 3,
        },
      ],
    },
  ];

  for (let tc of tt) {
    it(tc.label, () => {
      expect(Tags.parse(tc.input)).toEqual(Result.Ok(tc.output));
    });
  }
});
