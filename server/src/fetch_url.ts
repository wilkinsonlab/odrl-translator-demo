import * as $rdf from "rdflib";
import fetch from "node-fetch";

export default async function fetchUrl(
  url: string
): Promise<$rdf.Formula | null> {
  return new Promise((resolve, reject) => {
    (async () => {
      const store = $rdf.graph();

      const regex = new RegExp("ICO_|NCIT_|HP_|UBERON_|MP_|SYMP_|SIO_", "g");
      const phenotype = url.match(regex);

      let _url = url;
      let response = null;

      if (phenotype && phenotype.length > 0) {
        _url = `https://ontobee.org/ontology/${phenotype[0].replace(
          "_",
          ""
        )}?iri=${url}`;
      }

      response = await fetch(_url, {
        headers: {
          Accept: "text/turtle"
        }
      });

      if (response) {
        const contentType = response.headers
          .get("Content-Type")
          ?.split(";")[0]
          .toLowerCase();

        $rdf.parse(
          await response.text(),
          store,
          url,
          contentType === "text/xml" ? "application/rdf+xml" : contentType,
          (err, kb) => {
            if (err) {
              reject(err);
            } else {
              resolve(kb);
            }
          }
        );
      }
    })();
  });
}
