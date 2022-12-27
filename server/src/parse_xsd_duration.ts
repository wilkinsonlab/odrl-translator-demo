import { default as pxd } from "parse-xsd-duration";

export default function parseXSDDuration(duration: string): string {
  const { years, months, days, hours, minutes, seconds } = pxd.default(
    duration,
    true
  );
  let strings = [];

  strings.push(years ? `${years} year(s)` : "");
  strings.push(months ? `${months} months(s)` : "");
  strings.push(days ? `${days} days(s)` : "");
  strings.push(hours ? `${hours} hours(s)` : "");
  strings.push(minutes ? `${minutes} minutes(s)` : "");
  strings.push(seconds ? `${seconds} seconds(s)` : "");

  return strings
    .filter((string) => string !== "") // Remove empty strings
    .join(", ") // Join the strings
    .replace(/, ([^,]*)$/, " and $1"); // Remove the last comma and replace it with conjunction
}
