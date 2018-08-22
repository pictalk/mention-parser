// @ts-check
/**
 * @param {string} text
 */
exports.parseMentionsTags = text => {
  const bracketLen = 2;
  const labelLen = 10;
  const mentionLen = 36;
  const userIdLen = 24;

  let len1 = 0;
  let len2 = 0;
  /**
   * @type {number}
   */
  let pEnd;
  /**
   * @type {number}
   */
  let pStart;
  /**
   * @type {string}
   */
  let userId;

  if (text.length >= mentionLen) {
    // Replace mentions with name
    do {
      pStart = text.indexOf("{{mention:");
      if (pStart > -1) {
        userId = text.substr(pStart + labelLen, userIdLen);
        text = `${text.slice(0, pStart)}${userId}${text.substr(
          pStart + mentionLen
        )}`;
      }
    } while (pStart > -1);

    // Replace hashtag labels
    do {
      pStart = text.indexOf("{{hashtag:");
      if (pStart > -1) {
        pEnd = text.indexOf("}}");
        if (pEnd > -1) {
          len1 = pEnd - pStart - labelLen;
          len2 = pStart + (pEnd - pStart + bracketLen);
          text = `${text.slice(0, pStart)}#${text.substr(
            pStart + labelLen,
            len1
          )}${text.substring(len2)}`;
        }
      }
    } while (pStart > -1);
  }

  return text;
};
