export type IssueSeverity = 'error' | 'warning' | 'info';

export type ValidationIssue = {
  code: string;
  severity: IssueSeverity;
  path?: string;
  message: string;
  fixHint?: string;
};

export type DeckValidationStatus = 'blocked' | 'draft' | 'playableWithWarnings' | 'playable';

export type DeckValidationResult = {
  status: DeckValidationStatus;
  issues: ValidationIssue[];
};
