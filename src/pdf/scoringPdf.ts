import { scale } from "../scaleCurve.js";
import type { PdfProfile, Stats } from "../types.js";

// A distinct formula from computeStats() (src/scoring.ts) — the PDF export
// has no connections/endorsements/recommendations/activity data, so those
// signals are swapped for whatever a "Save to PDF" export actually contains.
// Half-life constants are rougher guesses than the zip-based ones (smaller
// input ranges, less intuition for what's "normal"), so expect more drift.
export function computeStatsFromPdfProfile(p: PdfProfile): Stats {
  return {
    pac: scale(p.roleCount, 4), // career pace: number of roles held
    sho: scale(p.certCount, 2), // certifications earned
    pas: scale(p.languageCount, 2), // communication reach
    dri: scale(p.topSkillCount, 3), // listed skills — LinkedIn caps this list at 3
    def: scale(p.educationCount, 2), // educational foundation
    phy: scale(p.positionYears, 8), // career span, same scale as the zip-based PHY
  };
}
