import type { Duty, Rule, Consequence, Action } from "../types";

import { ref, reactive, markRaw, type Ref } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import useGetRandomID from "../composables/useGetRandomID";
import Constraint from "../components/Constraint.vue";

export interface Props {
  parent: Rule | Duty | Consequence;
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useAction({
  parent,
  parentType,
  allowRefinements,
  data
}: Props) {
  const actionValue = ref(ODRL("use").value);
  const refinements = ref<Array<typeof Constraint>>([]);

  const rule_id =
    parentType === "rule" ? parent.id : ((parent as any).rule_id as number);

  const action = reactive<Omit<Action, "value"> & { value: Ref<string> }>({
    id: useGetRandomID(),
    policy_id: parent.policy_id,
    rule_id,
    value: actionValue,
    ...(allowRefinements ? { refinements: [] } : {}),
    ...data
  });

  parent.actions.push(action as any);

  const additionalData: {
    rule_id: number;
    action_id: number;
    duty_id?: number;
  } = {
    rule_id,
    action_id: action.id
  };

  if (parentType === "duty") {
    additionalData.duty_id = parent.id;
  }

  function addRefinement() {
    refinements.value.push(markRaw(Constraint));
  }

  function removeRefinement(index: number) {
    refinements.value.splice(index, 1);
    action.refinements!.splice(index, 1);
  }

  return {
    actionValue,
    refinements,
    action,
    addRefinement,
    removeRefinement,
    additionalData
  };
}
