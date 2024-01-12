export function formatPublicationDate(published) {
  const timeDifference = new Date() - new Date(published);
  const minutesAgo = Math.floor(timeDifference / (60 * 1000));
  const hoursAgo = Math.floor(timeDifference / (60 * 60 * 1000));
  const daysAgo = Math.floor(hoursAgo / 24);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo}m`;
  if (hoursAgo < 24) return `${hoursAgo}h`;
  if (daysAgo < 365) return `${daysAgo}d`;
  return `${yearsAgo}y`;
}

export function formatDescription(description, maxLength) {
  const formattedDescription = description
    .replace(/<[^>]*>/g, "")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#160;/g, " ")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#x2018;/g, "‘")
    .replace(/&#x2019;/g, "’")
    .replace(/&#x201A;/g, "‚")
    .replace(/&#x201C;/g, "“")
    .replace(/&#x201D;/g, "”")
    .replace(/&hellip;/g, "…")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, `"`)
    .trim()
    .slice(0, maxLength);

  return formattedDescription;
}

export function chunkArray(arr, chunkSize) {
  const chunkedArray = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunkedArray.push(arr.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
