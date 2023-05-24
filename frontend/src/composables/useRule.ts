import type {
  Rule,
  Obligation as ObligationContract,
  Consequence as ConsequenceContract
} from "../types";

import { ref, reactive, markRaw, type Ref } from "vue";
import useGetRandomID from "./useGetRandomID";
import usePolicy from "./usePolicy";
import { ODRL } from "../../../server/src/namespaces";
import Target from "../components/Target.vue";
import Assignee from "../components/Assignee.vue";
import Action from "../components/Action.vue";
import Constraint from "../components/Constraint.vue";
import Obligation from "../components/Obligation.vue";
import Consequence from "../components/Consequence.vue";

const { policy } = usePolicy();

export const rulesMapping = {
  [ODRL("permission").value]: "permissions",
  [ODRL("prohibition").value]: "prohibitions",
  [ODRL("obligation").value]: "obligations"
} as const;

export function useRule() {
  const ruleType = ref();
  const targets = ref([markRaw(Target)]);
  const actions = ref([markRaw(Action)]);
  const assigner = ref(null);
  const assignees = ref<Array<typeof Assignee>>([]);
  const constraints = ref<Array<typeof Constraint>>([]);
  const duties = ref<Array<typeof Obligation>>([]);
  const remedies = ref<Array<typeof Obligation>>([]);
  const consequences = ref<Array<typeof Consequence>>([]);

  const rule = reactive<
    Omit<Rule, "assigner"> & {
      assigner: Ref<null>;
      duties?: Array<ObligationContract>;
      remedies?: Array<Omit<ObligationContract, "consequences">>;
      consequences?: Array<ConsequenceContract>;
    }
  >({
    id: useGetRandomID(),
    policy_id: policy.id,
    targets: [],
    actions: [],
    assigner,
    assignees: [],
    constraints: []
  });

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
    rule.actions.splice(index, 1);
  }

  function addAssignee() {
    assignees.value.push(markRaw(Assignee));
  }

  function removeAssignee(index: number) {
    assignees.value.splice(index, 1);
    rule.assignees.splice(index, 1);
  }

  function addConstraint() {
    constraints.value.push(markRaw(Constraint));
  }

  function removeConstraint(index: number) {
    constraints.value.splice(index, 1);
    rule.constraints.splice(index, 1);
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
    rulesMapping,
    ruleType,
    targets,
    actions,
    assigner,
    assignees,
    constraints,
    duties,
    remedies,
    consequences,
    addTarget,
    removeTarget,
    addAction,
    removeAction,
    addAssignee,
    removeAssignee,
    addConstraint,
    removeConstraint,
    addDuty,
    removeDuty,
    addRemedy,
    removeRemedy,
    addConsequence,
    removeConsequence,
    rule
  };
}
