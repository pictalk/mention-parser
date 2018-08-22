exports.tokenizeMessage = str => {
  const regex = /\{\{(mention|hashtag):([a-zA-Z0-9_-]+)}}/g;
  const splitRegex = /\{\{(?:mention|hashtag):[a-zA-Z0-9_-]+}}/g;
  const matches = [];
  str.replace(regex, (m, type, value) => {
    matches.push({ type, value });
  });

  const textParts = str.split(splitRegex);

  const res = [];
  textParts.forEach((x, i, xs) => {
    if (x.length) {
      res.push({ type: "text", value: x });
    }
    if (i !== xs.length - 1) {
      res.push(matches[i]);
    }
  });

  return res;
};
