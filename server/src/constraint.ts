import * as $rdf from "rdflib";

import Rule from "./rule.js";
import { ODRL, RDFS, SKOS, XSD, RDF } from "./namespaces.js";
import { listToString, getSentenceOrLabel } from "./utils.js";
import fetchIRI from "./fetch_iri.js";
import Exception from "./exception.js";
import Action from "./action.js";
import StatementsMatcher from "./statements_matcher.js";
import numericTypes from "./numeric_types.js";
import parseXSDDuration from "./parse_xsd_duration.js";

export default class Constraint {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  /**
   * The unique ID of the constraint.
   */
  public uid: string | undefined;

  /**
   * The unit of the constraint.
   */
  #unit: $rdf.Statement | undefined;

  /**
   * The operator of the constraint.
   */
  #operator: $rdf.Statement;

  /**
   * The rightOperand of the constraint.
   */
  #rightOperands: Array<RightOperand> = [];

  /**
   * The rightOperandReference of the constraint.
   */
  #rightOperandReference: $rdf.Statement | undefined;

  /**
   * The leftOperand of the constraint.
   */
  #leftOperand: $rdf.Statement;

  /**
   * The status of the constraint.
   */
  #status: $rdf.Statement | undefined;

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    private kb: $rdf.Formula,
    private statement: $rdf.Statement | $rdf.NamedNode,
    private _rule: Rule
  ) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setLeftOperand();
    this.#setOperator();
    this.#setRightOperand();
    this.#setUnit();
  }

  /****************************** GETTERS ******************************/

  /**
   * Get the left operand of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get leftOperand() {
    return this.#leftOperand;
  }

  /**
   * Get the operator of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get operator() {
    return this.#operator;
  }

  /**
   * Get the right operand of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get rightOperands() {
    return this.#rightOperands;
  }

  /**
   * Get the unit of the right operand.
   *
   * @readonly
   * @memberof Constraint
   */
  public get unit() {
    return this.#unit;
  }

  public get rule() {
    return this._rule;
  }

  /****************************** METHODS ******************************/

  public async leftOperandLabel(): Promise<string> {
    const leftOperand = this.#leftOperand;
    let label = await getSentenceOrLabel(leftOperand, this.kb);

    if (typeof label[0] === "object") {
      return label[0][this.#operator.object.value];
    }

    return label[0] ?? leftOperand.object.value;
  }

  public async rightOperandLabels() {
    const labels = await Promise.all(
      this.#rightOperands.map(async (rightOperand) => {
        const leftOperandIRI = this.#leftOperand.object.value;
        const isRightOperandIRI = rightOperand.isIRI;
        let label = await rightOperand.label();

        if (
          !isRightOperandIRI &&
          rightOperand.isOfDataType(XSD("duration").value)
        ) {
          label = parseXSDDuration(label!.toString());
        } else if (leftOperandIRI === ODRL("percentage").value) {
          label += "%";
        }

        return label?.toString();
      })
    );

    return listToString(labels.filter(Boolean));
  }

  #setLeftOperand() {
    const leftOperand = this.#statementsMatcher
      .subject(
        "termType" in this.statement ? this.statement : this.statement.object
      )
      .predicate(ODRL("leftOperand"))
      .execute();

    if (leftOperand) {
      this.#leftOperand = leftOperand[0];
    } else {
      throw new Exception(
        `The constraint must have a "leftOperand" property defined: ${this.statement.object.value}`,
        500,
        "E_NO_LEFT_OPERAND_DEFINED"
      );
    }
  }

  #setOperator() {
    const operator = this.#statementsMatcher
      .subject(
        "termType" in this.statement ? this.statement : this.statement.object
      )
      .predicate(ODRL("operator"))
      .execute();

    if (operator) {
      this.#operator = operator[0];
    } else {
      throw new Exception(
        `The constraint must have an "operator" property defined`,
        500,
        "E_NO_OPERATOR_DEFINED"
      );
    }
  }

  #setRightOperand() {
    const rightOperands = this.#statementsMatcher
      .subject(
        "termType" in this.statement ? this.statement : this.statement.object
      )
      .predicate(ODRL("rightOperand"))
      .execute();

    if (rightOperands) {
      this.#rightOperands = rightOperands.map(
        (rightOperand) => new RightOperand(this.kb, rightOperand)
      );
    } else {
      throw new Exception(
        `The constraint must have a "rightOperand" property defined`,
        500,
        "E_NO_RIGHT_OPERAND_DEFINED"
      );
    }
  }

  #setUnit() {
    const unit = this.#statementsMatcher
      .subject(
        "termType" in this.statement ? this.statement : this.statement.object
      )
      .predicate(ODRL("unit"))
      .execute();

    if (unit) {
      this.#unit = unit[0];
    }
  }
}

class RightOperand {
  #statement: $rdf.Statement;

  #value: string | number;

  #dataType: string | undefined;

  #isIRI: boolean;

  constructor(private kb: $rdf.Formula, statement: $rdf.Statement) {
    this.#statement = statement;

    if (statement.object instanceof $rdf.Literal) {
      this.#dataType = statement.object.datatype.value;
    } else {
      this.#isIRI = true;
    }

    this.#value = statement.object.value;
  }

  get statement() {
    return this.#statement;
  }

  get value() {
    return this.#value;
  }

  get dataType() {
    return this.#dataType;
  }

  get isIRI() {
    return this.#isIRI;
  }

  public async label(): Promise<string | number> {
    const rightOperand = this.#statement;

    let label: string | number = (
      await getSentenceOrLabel(rightOperand, this.kb)
    )[0];

    if (!this.#isIRI) {
      if (
        numericTypes.map((type) => XSD(type).value).includes(this.#dataType!)
      ) {
        label = Number(this.#value);
      } else {
        label = String(this.#value);
      }
    }

    return label;
  }

  /**
   * Check if the right operand has the given data type.
   * @param dataType DataType to check
   * @returns boolean
   */
  public isOfDataType(dataType: string): boolean {
    return this.dataType == dataType;
  }
}
