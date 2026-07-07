// docs/PERFORMANCE-GUARDRAILS.md の推奨値。
// capした場合は必ずAnalyzerWarningを返す。黙って落とさない。
export const ENGINE_LIMITS = {
  maxTileDefinitionsWarning: 200,
  maxTotalTileInstancesWarning: 300,
  maxVariantsWarning: 4,
  maxWinRolesPerVariantWarning: 100,
  maxBonusesPerVariantWarning: 100,
  maxCandidateOutput: 50,
  maxPrimaryCandidates: 3,
  maxPrimaryInsights: 2,
  maxWildcardBranches: 256,
  maxPartitions: 500,
  maxImportJsonBytes: 512 * 1024,
  warnImportJsonBytes: 256 * 1024,
  maxJsonDepth: 24,
} as const;
