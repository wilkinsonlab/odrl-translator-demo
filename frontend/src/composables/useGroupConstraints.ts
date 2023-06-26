import type {
  Action,
  Rule,
  Target,
  Assignee,
  Constraint as ConstraintContract
} from "../types";

import { ref, reactive, markRaw, unref, type Ref } from "vue";

import { ODRL } from "../../../server/src/namespaces";

import Constraint from "../components/Constraint.vue";

export interface Props {
  parentType: "rule" | "duty" | "action" | "target" | "assignee";
  additionalData?: Record<string, unknown>;
}

export function useGroupConstraints(
  { parentType, additionalData }: Props,
  parent: Ref<Rule | Action | Target | Assignee>,
  initialConstraints?: Ref<Array<ConstraintContract> | undefined>
) {
  const constraintTypes = ["Constraint", "LogicalConstraint"];
  const operands = ["xone", "or", "and", "andSequence"];

  additionalData = additionalData ?? {};

  if (["action", "target", "assignee"].includes(parentType)) {
    additionalData.rule_id = (
      parent.value as Action | Target | Assignee
    ).rule_id;
  } else {
    additionalData.rule_id = (parent.value as Rule).id;
  }

  const constraintsElement = ref<Array<typeof Constraint>>(
    initialConstraints?.value
      ? new Array(
          parent.value.operand
            ? parent.value.logical_constraints[parent.value.operand].length
            : initialConstraints.value.length
        ).fill(markRaw(Constraint))
      : []
  );
  const type = ref(
    parent.value.operand
      ? ODRL("LogicalConstraint").value
      : ODRL("Constraint").value
  );
  const operand = ref(parent.value.operand);

  const constraints = reactive<Array<ConstraintContract>>(
    unref(initialConstraints) ?? []
  );

  function addConstraint() {
    constraintsElement.value.push(markRaw(Constraint));
  }

  function removeConstraint(index: number) {
    constraintsElement.value.splice(index, 1);

    constraints.splice(index, 1);
  }

  return {
    constraintTypes,
    constraints,
    operands,
    type,
    operand,
    constraintsElement,
    addConstraint,
    removeConstraint,
    additionalData
  };
}
