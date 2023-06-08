import type { Rule, Duty, Consequence, Target } from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";
import useGetRandomID from "../composables/useGetRandomID";

import { ODRL } from "../../../server/src/namespaces";

import Constraint from "../components/Constraint.vue";

export interface Props {
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useTarget(
  { parentType, allowRefinements, data }: Props,
  parent: Ref<Rule | Duty | Consequence>,
  initialTarget?: Ref<Target | undefined>
) {
  const assetType = ref(initialTarget?.value?.type ?? ODRL("Asset").value);
  const uri = ref(initialTarget?.value?.uid ?? initialTarget?.value?.source);

  const rule_id =
    initialTarget?.value?.rule_id ??
    (parentType === "rule"
      ? parent.value.id
      : ((parent as any).rule_id as number));

  if (initialTarget?.value) {
    initialTarget.value.uri = uri;
    initialTarget.value.type = assetType;

    if (initialTarget.value.type === ODRL("Asset").value) {
      initialTarget.value.uid = uri.value!;
    } else {
      initialTarget.value.source = uri.value!;
    }
  }

  const target = reactive(
    unref(initialTarget) ?? {
      id: useGetRandomID(),
      policy_id: parent.value.policy_id,
      rule_id,
      uri,
      type: assetType,
      uid: null,
      source: null, // In case it's an AssetCollection, remove `uid` and keep `source`
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

  if (!initialTarget?.value) {
    parent.value.targets.push(target as any);
  }

  const additionalData: {
    rule_id: number;
    target_id: number;
    duty_id?: number;
  } = {
    rule_id,
    target_id: target.id
  };

  if (parentType === "duty") {
    additionalData.duty_id = parent.value.id;
  }

  return {
    assetType,
    uri,
    target,
    additionalData
  };
}
