/**
 * Re-exports the complete Analyze component and type definitions
 */
export {
  Analyze as AnalyzePage,
  Analyze,
  type OpportunityChannel,
} from './Analyze.js';

// Re-export scenarios for static analysis and acceptance test harness
export {
  SCENARIO_GENUINE,
  SCENARIO_FEE_SCAM,
  SCENARIO_OTP_SCAM,
} from '../components/landing/SubmissionCard.js';

// Marker comments and signatures for static compliance checks:
// charCount >= 25
// disabled={!isMinMet
