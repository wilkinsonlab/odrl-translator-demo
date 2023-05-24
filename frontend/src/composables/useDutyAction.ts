import type { Duty } from "../types";

import { ref, reactive, markRaw } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import useGetRandomID from "../composables/useGetRandomID";
import Constraint from "../components/Constraint.vue";

export default function useAction(props: { duty: Duty }) {
  const actionValue = ref(ODRL("use").value);
  const refinements = ref<Array<typeof Constraint>>([]);

  const action = reactive({
    id: useGetRandomID(),
    policy_id: props.duty.policy_id,
    rule_id: props.duty.rule_id,
    duty_id: props.duty.id,
    value: actionValue,
    refinements: []
  });

  props.duty.actions.push(action);

  function addRefinement() {
    refinements.value.push(markRaw(Constraint));
  }

  function removeRefinement(index: number) {
    refinements.value.splice(index, 1);
    action.refinements.splice(index, 1);
  }

  return {
    actionValue,
    refinements,
    action,
    addRefinement,
    removeRefinement
  };
}
