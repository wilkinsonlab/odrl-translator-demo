export enum RuleType {
  PERMISSION = "http://www.w3.org/ns/odrl/2/permission",
  PROHIBITION = "http://www.w3.org/ns/odrl/2/prohibition",
  OBLIGATION = "http://www.w3.org/ns/odrl/2/obligation"
}

export interface Policy {
  id: number;
  type: string;
  creator: string | null;
  description: string;
  rules: {
    permissions: Array<Permission>;
    prohibitions: Array<Prohibition>;
    obligations: Array<Obligation>;
  };
}

export interface Constraint {
  left_operand: string;
  operator: string;
  right_operand_value_iri?: string;
  right_operand_value_string?: string;
  right_operand_value_date?: string;
  right_operand_value_dateTime?: string;
  right_operand_value_float?: number;
  right_operand_value_duration?: string;
  unit: string | null;
}

export interface Rule {
  id: number;
  policy_id: number;
  actions: Array<Action>;
  targets: Array<Target>;
  assigner?: string | null;
  assignees: Array<Assignee>;
  constraints: Array<Constraint>;
  attributedParty?: string;
  attributingParty?: string;
  compensatedParty?: string;
  compensatingParty?: string;
  consentedParty?: string;
  consentingParty?: string;
  contractedParty?: string;
  contractingParty?: string;
  informedParty?: string;
  informingParty?: string;
  trackedParty?: string;
  trackingParty?: string;
}

export interface Permission extends Rule {
  duties: Array<Obligation>;
}
export interface Prohibition extends Rule {
  remedies: Array<Exclude<Obligation, "consequences">>;
}
export interface Obligation extends Rule {
  consequences: Array<Consequence>;
}
export interface Duty extends Obligation {
  rule_id: number;
}

export interface Target {
  id: number;
  policy_id: number;
  rule_id: number;
  type: string | null;
  uid: string | null;
  source: string | null;
  refinements: Array<Constraint>;
}

export interface Assignee {
  id: number;
  policy_id: number;
  rule_id: number;
  type: string | null;
  uid: string | null;
  source: string | null;
  refinements: Array<Constraint>;
}

export interface Action {
  id: number;
  policy_id: number;
  rule_id: number;
  value: string;
  refinements?: Array<Constraint>;
}

export interface Consequence {
  id: number;
  policy_id: number;
  rule_id?: number | undefined;
  duty_id?: number | undefined;
  actions: Array<Action & { consequence_id: number }>;
  targets: Array<Target & { consequence_id: number }>;
  assignees: Array<Assignee & { consequence_id: number }>;
}

export interface DutyAction extends Action {
  duty_id: number;
}
