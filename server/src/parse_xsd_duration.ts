import { default as pxd } from "parse-xsd-duration";

import { listToString } from "./utils.js";

export default function parseXSDDuration(duration: string): string {
  const { years, months, days, hours, minutes, seconds } = pxd.default(
    duration,
    true
  );
  let strings = [];

  strings.push(years ? `${years} year(s)` : "");
  strings.push(months ? `${months} month(s)` : "");
  strings.push(days ? `${days} day(s)` : "");
  strings.push(hours ? `${hours} hour(s)` : "");
  strings.push(minutes ? `${minutes} minute(s)` : "");
  strings.push(seconds ? `${seconds} second(s)` : "");

  return strings
    .filter((string) => string !== "") // Remove empty strings
    .join(", ") // Join the strings
    .replace(/, ([^,]*)$/, " and $1"); // Remove the last comma and replace it with conjunction
}
