import * as Tags from "./mention-parser";

interface User {
  id: string;
  fullname: string;
}

const users: { [name: string]: User } = {
  alex: {
    id: "37a8733e1718dc73d69f53ac",
    fullname: "Alex Regan",
  },
  frankie: {
    id: "9bfb2a90d20ef5eacf28bb2b",
    fullname: "Frankie Bagnardi",
  },
  mike: {
    id: "2903c8b677279552a8561956",
    fullname: "Mike Havrilla",
  },
  // x: {
  //   id: "f7429d93d90d65d49208d115",
  //   fullname: "",
  // },
  // x: {
  //   id: "ac09d7776de894209e1e70a1",
  //   fullname: "",
  // },
  // x: {
  //   id: "54d6b784b4bb6ba8893306ab",
  //   fullname: "",
  // },
};

const db: { [id: string]: User } = {};

Object.keys(users).reduce((db, k) => {
  let u = users[k];
  db[u.id] = u;
  return db;
}, db);

const sleep: (ms: number) => Promise<void> = ms =>
  new Promise(r => setTimeout(r, ms));

describe("Mention Stringer", () => {
  it("should work", () => {
    let r = Tags.parse(
      [
        `This should stringify a message with any set of {{hashtag:tags}}.`,
        `If I mention {{mention:${
          users.alex.id
        }}}, I should see his {{bold:name}}.`,
        `Maybe even some {{html:raw html}}?`,
      ].join(" "),
    );

    r.map_err(console.error);
    expect(r.is_ok()).toBe(true);
    expect(Tags.stringify(r.unwrap())).toMatchSnapshot("Default");

    expect(
      Tags.stringify(r.unwrap(), {
        text: t => t.value,
        mention: t => db[t.value].fullname,
        html: t => `<html>${t.value}</html>`,
      }),
    ).toMatchSnapshot("Custom");
  });

  it("should work with async resolvers", async () => {
    let r = Tags.parse(
      [
        `This should stringify an async message with any set of {{hashtag:tags}}.`,
        `If I mention {{mention:${
          users.frankie.id
        }}}, I should see his {{bold:name}}.`,
        `Maybe even some {{html:raw html}}?`,
      ].join(" "),
    );
    r.map_err(console.error);
    expect(r.is_ok()).toBe(true);

    let s = await Tags.stringifyAsync(r.unwrap(), {
      text: t => t.value,
      mention: async t => sleep(50).then(() => db[t.value].fullname),
      html: async t => `<html>${t.value}</html>`,
    });

    expect(s).toMatchSnapshot("Custom Async");
  });
});
