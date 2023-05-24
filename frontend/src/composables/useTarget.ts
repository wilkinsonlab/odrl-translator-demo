import type { Rule, Duty, Consequence } from "../types";

import { ref, reactive, markRaw } from "vue";
import useGetRandomID from "../composables/useGetRandomID";

import { ODRL } from "../../../server/src/namespaces";

import Constraint from "../components/Constraint.vue";

export interface Props {
  parent: Rule | Duty | Consequence;
  parentType: "rule" | "duty" | "consequence" | "remedy";
  allowRefinements?: boolean;
  data?: Record<string, any>;
}

export function useTarget({
  parent,
  parentType,
  allowRefinements,
  data
}: Props) {
  const assetType = ref(ODRL("Asset").value);
  const uri = ref(null);
  const refinements = ref<Array<typeof Constraint>>([]);

  const rule_id =
    parentType === "rule" ? parent.id : ((parent as any).rule_id as number);

  const target = reactive({
    id: useGetRandomID(),
    policy_id: parent.policy_id,
    rule_id,
    type: assetType,
    uid: uri,
    source: uri, // In case it's an AssetCollection, remove `uid` and keep `source`
    refinements: [],
    ...data
  });

  const additionalData: {
    rule_id: number;
    target_id: number;
    duty_id?: number;
  } = {
    rule_id,
    target_id: target.id
  };

  if (parentType === "duty") {
    additionalData.duty_id = parent.id;
  }

  function addRefinement() {
    refinements.value.push(markRaw(Constraint));
  }

  function removeRefinement(index: number) {
    refinements.value.splice(index, 1);
    target.refinements.splice(index, 1);
  }

  return {
    assetType,
    uri,
    refinements,
    target,
    addRefinement,
    removeRefinement,
    additionalData
  };
}
