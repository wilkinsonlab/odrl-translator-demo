import type {
  Rule,
  Obligation as ObligationContract,
  Consequence as ConsequenceContract,
  Permission
} from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";
import useGetRandomID from "./useGetRandomID";
import usePolicy from "./usePolicy";
import { ODRL } from "../../../server/src/namespaces";
import Assignee from "../components/Assignee.vue";
import Action from "../components/Action.vue";
import Obligation from "../components/Obligation.vue";
import Consequence from "../components/Consequence.vue";

import Target from "../components/Target.vue";

const { policy } = usePolicy();

const cces = {
  commercial_entity: "Commercial Entity",
  geographical_area: "Geographical Area",
  regulatory_jurisdiction: "Regulatory Jurisdiction",
  research_use: "Research Use",
  clinical_care: "Clinical Care Use",
  clinical_research_use: "Clinical Research Use",
  disease_specific_use: "Disease Specific Use",
  use_as_control: "Use As Control",
  profit_motivated_use: "Profit Motivated Use",
  time_period: "Time Period",
  collaboration: "Collaboration",
  fees: "Fees",
  return_of_results: "Return Of Results",
  return_of_incidental_findings: "Return Of Incidental Findings",
  reidentification_of_individuals_without_irp:
    "(Re-)Identification Of Individuals Without Involvement Of The Resource Provider",
  reidentification_of_individuals_with_irp:
    "(Re-)Identification Of Individuals Mediated By The Resource Provider",
  publication_moratorium: "Publication Moratorium",
  publication: "Publication",
  user_authentication: "User Authentication",
  ethics_approval: "Ethics Approval"
};

export const rulesMapping = {
  [ODRL("permission").value]: "permissions",
  [ODRL("prohibition").value]: "prohibitions",
  [ODRL("obligation").value]: "obligations"
} as const;

export function useRule(initialRule?: Ref<Rule | undefined>) {
  const ruleType = ref(initialRule?.value?.type);
  const cce = ref(initialRule?.value?.cce);
  const targets = ref(
    initialRule
      ? new Array(initialRule.value?.targets.length).fill(markRaw(Target))
      : [markRaw(Target)]
  );
  const actions = ref(
    initialRule
      ? new Array(initialRule.value?.actions.length).fill(markRaw(Action))
      : [markRaw(Action)]
  );
  const assigner = ref(initialRule?.value?.assigner);
  const assignees = ref<Array<typeof Assignee>>(
    initialRule
      ? new Array(initialRule.value?.assignees.length).fill(markRaw(Assignee))
      : [markRaw(Assignee)]
  );
  const duties = ref<Array<typeof Obligation>>(
    initialRule && "duties" in initialRule
      ? new Array(initialRule.value?.duties?.length).fill(markRaw(Obligation))
      : []
  );
  const remedies = ref<Array<typeof Obligation>>([]);
  const consequences = ref<Array<typeof Consequence>>([]);

  if (initialRule?.value) {
    initialRule.value.type = ruleType;
    initialRule.value.cce = cce;
    initialRule.value.assigner = assigner;
  }

  const rule = reactive<
    Omit<Rule, "assigner"> & {
      assigner: Ref<null>;
      duties?: Array<ObligationContract>;
      remedies?: Array<Omit<ObligationContract, "consequences">>;
      consequences?: Array<ConsequenceContract>;
    }
  >(
    (unref(initialRule) as any) ?? {
      id: useGetRandomID(),
      type: ruleType,
      policy_id: policy.id,
      cce,
      targets: [],
      actions: [],
      assigner,
      assignees: [],
      constraints: [],
      operand: null,
      first: null,
      logical_constraints: {
        and: [],
        or: [],
        andSequence: [],
        xone: []
      }
    }
  );

  if (initialRule?.value && ruleType.value === ODRL("permission").value) {
    (rule as any).duties = (initialRule.value as Permission)?.duties ?? [];
  }

  function addTarget() {
    targets.value.push(markRaw(Target));
  }

  function removeTarget(index: number) {
    targets.value.splice(index, 1);
    rule.targets.splice(index, 1);
  }

  function addAction() {
    actions.value.push(markRaw(Action));
  }

  function removeAction(index: number) {
    actions.value.splice(index, 1);
    (initialRule?.value || rule).actions.splice(index, 1);
  }

  function addAssignee() {
    assignees.value.push(markRaw(Assignee));
  }

  function removeAssignee(index: number) {
    assignees.value.splice(index, 1);
    rule.assignees.splice(index, 1);
  }

  function addDuty() {
    duties.value.push(markRaw(Obligation));
  }

  function removeDuty(index: number) {
    duties.value.splice(index, 1);
    rule.duties!.splice(index, 1);
  }

  function addRemedy() {
    remedies.value.push(markRaw(Obligation));
  }

  function removeRemedy(index: number) {
    remedies.value.splice(index, 1);
    rule.remedies!.splice(index, 1);
  }

  function addConsequence() {
    consequences.value.push(markRaw(Consequence));
  }

  function removeConsequence(index: number) {
    consequences.value.splice(index, 1);
    rule.consequences!.splice(index, 1);
  }

  return {
    cces,
    cce,
    rulesMapping,
    ruleType,
    targets,
    actions,
    assigner,
    assignees,
    duties,
    remedies,
    consequences,
    addTarget,
    removeTarget,
    addAction,
    removeAction,
    addAssignee,
    removeAssignee,
    addDuty,
    removeDuty,
    addRemedy,
    removeRemedy,
    addConsequence,
    removeConsequence,
    rule
  };
}
