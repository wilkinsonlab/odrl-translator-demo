import * as $rdf from "rdflib";
import fetch from "node-fetch";

import { isValidUrl } from "./utils.js";

export default async function fetchIRI(
  iri: string
): Promise<$rdf.Formula | null> {
  if (!isValidUrl(iri)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    (async () => {
      const store = $rdf.graph();

      const regex = new RegExp(
        "ICO_|NCIT_|HP_|UBERON_|MP_|SYMP_|SIO_|DUO_|EFO_|T4FS_|EDAM_",
        "g"
      );
      const phenotype = iri.match(regex);

      let _iri = iri;
      let response = null;

      if (phenotype && phenotype.length > 0) {
        _iri = `https://ontobee.org/ontology/${phenotype[0].replace(
          "_",
          ""
        )}?iri=${iri}`;
      }

      response = await fetch(_iri, {
        headers: {
          Accept: "text/turtle",
        },
      });

      if (response) {
        const contentType = response.headers
          .get("Content-Type")
          ?.split(";")[0]
          .toLowerCase();

        $rdf.parse(
          await response.text(),
          store,
          iri,
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
