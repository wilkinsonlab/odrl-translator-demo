import type { Rule, Duty, Consequence } from "../types";

import { ref, reactive, markRaw } from "vue";

import useGetRandomID from "../composables/useGetRandomID";

import Constraint from "../components/Constraint.vue";

export interface Props {
  parent: Rule | Duty | Consequence;
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useAssignee({
  parent,
  parentType,
  allowRefinements,
  data
}: Props) {
  const partyType = ref(null);
  const uri = ref(null);
  const refinements = ref<Array<typeof Constraint>>([]);

  const rule_id =
    parentType === "rule" ? parent.id : ((parent as any).rule_id as number);

  const assignee = reactive({
    id: useGetRandomID(),
    policy_id: parent.policy_id,
    rule_id,
    type: partyType,
    uid: uri,
    source: uri, // In case it's an PartyCollection, remove `uid` and keep `source`
    refinements: [],
    ...data
  });

  const additionalData: {
    rule_id: number;
    assignee_id: number;
    duty_id?: number;
  } = {
    rule_id,
    assignee_id: assignee.id
  };

  if (parentType === "duty") {
    additionalData.duty_id = parent.id;
  }

  function addRefinement() {
    refinements.value.push(markRaw(Constraint));
  }

  function removeRefinement(index: number) {
    refinements.value.splice(index, 1);
    assignee.refinements.splice(index, 1);
  }

  return {
    partyType,
    uri,
    refinements,
    assignee,
    addRefinement,
    removeRefinement,
    additionalData
  };
}
