import type { Obligation, Permission, Prohibition } from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";
import useGetRandomID from "./useGetRandomID";
import usePolicy from "./usePolicy";
import { ODRL } from "../../../server/src/namespaces";
import Target from "../components/Target.vue";
import Assignee from "../components/Assignee.vue";
import Action from "../components/Action.vue";
import Constraint from "../components/Constraint.vue";
import Consequence from "../components/Consequence.vue";

export interface Props {
  //parent?: Permission | Prohibition;
  parentType?: "permission" | "prohibition";
  //obligation?: Obligation;
  allowConsequences?: boolean;
  data?: Record<string, any>;
}

const { policy } = usePolicy();

export function useObligation(
  {
    //parent,
    parentType,
    //obligation: initialObligation,
    allowConsequences,
    data
  }: Props,
  parent?: Ref<Permission | Prohibition | undefined>,
  initialObligation?: Ref<Obligation | undefined>
) {
  const targets = ref([markRaw(Target)]);
  const actions = ref(
    initialObligation?.value
      ? new Array(initialObligation?.value?.actions.length).fill(
          markRaw(Action)
        )
      : [markRaw(Action)]
  );
  const assignees = ref<Array<typeof Assignee>>([]);
  const constraints = ref<Array<typeof Constraint>>([]);
  const consequences = ref<Array<typeof Consequence>>([]);

  const obligation = reactive(
    unref(initialObligation) ?? {
      id: useGetRandomID(),
      policy_id: policy.id,
      targets: [],
      actions: [],
      assigner: null,
      assignees: [],
      constraints: [],
      operand: null,
      first: null,
      logical_constraints: {
        and: [],
        or: [],
        andSequence: [],
        xone: []
      },
      ...data,
      ...(allowConsequences ? { consequences: [] } : {})
    }
  );

  if (!initialObligation?.value && parent?.value) {
    if (parentType === "permission") {
      (parent.value as Permission).duties.push(obligation as any);
    } else if (parentType === "prohibition") {
      (parent.value as Prohibition).remedies.push(obligation as any);
    }
  }

  function addTarget() {
    targets.value.push(markRaw(Target));
  }

  function removeTarget(index: number) {
    targets.value.splice(index, 1);
    obligation.targets.splice(index, 1);
  }

  function addAction() {
    actions.value.push(markRaw(Action));
  }

  function removeAction(index: number) {
    actions.value.splice(index, 1);
    obligation.actions.splice(index, 1);
  }

  function addAssignee() {
    assignees.value.push(markRaw(Assignee));
  }

  function removeAssignee(index: number) {
    assignees.value.splice(index, 1);
    obligation.assignees.splice(index, 1);
  }

  function addConstraint() {
    constraints.value.push(markRaw(Constraint));
  }

  function removeConstraint(index: number) {
    constraints.value.splice(index, 1);
    obligation.constraints.splice(index, 1);
  }

  function addConsequence() {
    consequences.value.push(markRaw(Consequence));
  }

  function removeConsequence(index: number) {
    consequences.value.splice(index, 1);
    obligation.consequences!.splice(index, 1);
  }

  return {
    targets,
    actions,
    assignees,
    constraints,
    consequences,
    addTarget,
    removeTarget,
    addAction,
    removeAction,
    addAssignee,
    removeAssignee,
    addConstraint,
    removeConstraint,
    addConsequence,
    removeConsequence,
    obligation
  };
}
