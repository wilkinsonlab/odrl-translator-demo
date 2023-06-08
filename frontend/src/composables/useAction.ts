import type { Duty, Rule, Consequence, Action } from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import useGetRandomID from "../composables/useGetRandomID";
import Constraint from "../components/Constraint.vue";

export interface Props {
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useAction(
  props: Props,
  parent: Ref<Rule | Duty | Consequence>,
  initialAction?: Ref<Action | undefined>
) {
  const { parentType, allowRefinements, data } = props;
  const actionValue = ref(initialAction?.value?.value ?? ODRL("use").value);

  const rule_id =
    initialAction?.value?.rule_id ??
    (parentType === "rule"
      ? parent.value.id
      : (parent.value as Duty | Consequence).rule_id!);

  if (initialAction?.value) {
    initialAction.value.value = actionValue;
  }

  const action = reactive<
    Omit<Action, "value"> & {
      value: Ref<string>;
    }
  >(
    unref(initialAction) ?? {
      id: useGetRandomID(),
      policy_id: parent.value.policy_id,
      rule_id,
      value: actionValue,
      operand: null,
      first: null,
      logical_constraints: {
        and: [],
        or: [],
        andSequence: [],
        xone: []
      },
      ...(allowRefinements ? { refinements: [] } : {}),
      ...data
    }
  );

  if (!initialAction?.value) {
    parent.value.actions.push(action as any);
  }

  const additionalData: {
    rule_id: number;
    action_id: number;
    duty_id?: number;
    consequence_id?: number;
  } = {
    rule_id,
    action_id: action.id
  };

  if (parentType === "duty") {
    additionalData.duty_id = parent.value.id;
  }

  if (parentType === "consequence") {
    additionalData.duty_id = (parent.value as Consequence).duty_id;
    additionalData.consequence_id = parent.value.id;
  }

  return {
    actionValue,
    action,
    additionalData
  };
}
