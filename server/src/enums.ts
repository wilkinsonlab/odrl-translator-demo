export enum RuleType {
  PERMISSION = "permission",
  DUTY = "duty",
  PROHIBITION = "prohibition",
}

export enum Functions {
  ASSIGNEE = "assignee",
  ASSIGNER = "assigner",
  ATTRIBUTED_PARTY = "attributedParty",
  ATTRIBUTING_PARTY = "attributingParty",
  COMPENSATED_PARTY = "compensatedParty",
  COMPENSATING_PARTY = "compensatingParty",
  CONSENTED_PARTY = "consentedParty",
  CONSENTING_PARTY = "consentingParty",
  CONTRACTED_PARTY = "contractedParty",
  CONTRACTING_PARTY = "contractingParty",
  INFORMED_PARTY = "informedParty",
  INFORMING_PARTY = "informingParty",
  TRACKED_PARTY = "trackedParty",
  TRACKING_PARTY = "trackingParty",
  SHARING_PARTY = "sharingParty",
  SHARED_PARTY = "sharedParty",
  ACKNOWLEDGING_PARTY = "acknowledgingParty",
  ACKNOWLEDGED_PARTY = "acknowledgedParty",
  COLLABORATING_PARTY = "collaboratingParty",
  COLLABORATED_PARTY = "collaboratedParty",
  NEGOTIATING_PARTY = "negotiatingParty",
  NEGOTIATED_PARTY = "negotiatedParty",
}

export enum LogicalConstraintOperands {
  XONE = "xone",
  OR = "or",
  AND = "and",
  AND_SEQUENCE = "andSequence",
}
