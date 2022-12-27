import * as $rdf from "rdflib";

export default class StatementsMatcher {
  #subject: any = undefined;

  #predicate: any = undefined;

  #object: any = undefined;

  constructor(private kb: $rdf.Formula) {}

  public subject(subject: any) {
    this.#subject = subject;

    return this;
  }

  public predicate(predicate: any) {
    this.#predicate = predicate;

    return this;
  }

  public object(object: any) {
    this.#object = object;

    return this;
  }

  public execute() {
    const result = this.kb.statementsMatching(
      this.#subject,
      this.#predicate,
      this.#object
    );

    if (result && result.length > 0) {
      return result;
    }
  }
}
