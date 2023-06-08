import type { Rule, Duty, Consequence, Assignee } from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";

import useGetRandomID from "../composables/useGetRandomID";

import { ODRL } from "../../../server/src/namespaces";

import Constraint from "../components/Constraint.vue";

export interface Props {
  //parent: Rule | Duty | Consequence;
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useAssignee(
  {
    //parent,
    parentType,
    allowRefinements,
    data
  }: Props,
  parent: Ref<Rule | Duty | Consequence>,
  initialAssignee?: Ref<Assignee | undefined>
) {
  const partyType = ref(initialAssignee?.value?.type);
  const uri = ref(
    initialAssignee?.value?.uid ?? initialAssignee?.value?.source
  );

  const rule_id =
    initialAssignee?.value?.rule_id ??
    (parentType === "rule"
      ? parent.value.id
      : ((parent as any).rule_id as number));

  if (initialAssignee?.value) {
    initialAssignee.value.uri = uri;
    initialAssignee.value.type = partyType;

    if (initialAssignee.value.type === ODRL("Party").value) {
      initialAssignee.value.uid = uri.value!;
    } else {
      initialAssignee.value.source = uri.value!;
    }
  }

  const assignee = reactive(
    unref(initialAssignee) ?? {
      id: useGetRandomID(),
      policy_id: parent.value.policy_id,
      rule_id,
      type: partyType,
      uri,
      uid: null,
      source: null, // In case it's an PartyCollection, remove `uid` and keep `source`
      refinements: [],
      operand: null,
      first: null,
      logical_constraints: {
        and: [],
        or: [],
        andSequence: [],
        xone: []
      },
      ...data
    }
  );

  const additionalData: {
    rule_id: number;
    assignee_id: number;
    duty_id?: number;
  } = {
    rule_id,
    assignee_id: assignee.id
  };

  if (!initialAssignee?.value) {
    parent.value.assignees.push(assignee as any);
  }

  if (parentType === "duty") {
    additionalData.duty_id = parent.value.id;
  }

  return {
    partyType,
    uri,
    assignee,
    additionalData
  };
}
