const { Suite } = require("benchmark");
const Parser = require("../lib/parser.js");
const Reference = require("./reference.js");
const Server3 = require("./server-ref.js");

const parserSuite = new Suite("Parser", {
  onCycle(e) {
    console.log("Parser", e.target.toString());
  },
});

const referenceSuite = new Suite("reference", {
  onCycle(e) {
    console.log("Reference", e.target.toString());
  },
});

const serverSuite = new Suite("server3", {
  onCycle(e) {
    console.log("Server3", e.target.toString());
  },
});

const test = `{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.
{{hashtag:FTW}}
Hello world! My best friend is {{mention:123456789012345678901234}}, and together we love
{{hashtag:coding}}.

`;

parserSuite.add(() => {
  Parser.tokenize(test);
});

referenceSuite.add(() => {
  Reference.tokenizeMessage(test);
});

serverSuite.add(() => {
  Server3.parseMentionsTags(test);
});

parserSuite.run();
referenceSuite.run();
serverSuite.run();
