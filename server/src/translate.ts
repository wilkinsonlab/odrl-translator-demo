import Reverso from "reverso-api";

const reverso = new Reverso({ insecureHTTPParser: true });

export default function translate(
  sentence: string,
  fromLanguage: string,
  targetLanguage: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    reverso.getTranslation(
      sentence,
      fromLanguage,
      targetLanguage,
      (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.translations[0]);
        }
      }
    );
  });
}
