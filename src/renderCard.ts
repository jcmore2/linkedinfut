import type { CardData } from "./types.js";
import { tierColors } from "./scoring.js";

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Wraps a name onto at most 2 lines so long full names (very common outside
// short GitHub-handle-style names) don't run off the edge of the card.
function wrapName(name: string, maxCharsPerLine: number): [string] | [string, string] {
  if (name.length <= maxCharsPerLine) return [name];
  const words = name.split(" ");
  let line1 = "";
  let i = 0;
  for (; i < words.length; i++) {
    const candidate = line1 ? `${line1} ${words[i]}` : words[i];
    if (candidate.length > maxCharsPerLine && line1) break;
    line1 = candidate;
  }
  let line2 = words.slice(i).join(" ");
  if (line2.length > maxCharsPerLine) line2 = `${line2.slice(0, maxCharsPerLine - 1)}…`;
  return line2 ? [line1, line2] : [line1];
}

function nameFontSize(longestLine: number): number {
  if (longestLine <= 14) return 22;
  if (longestLine <= 18) return 18;
  return 15;
}

const STAT_LABELS: [key: keyof CardData["stats"], label: string][] = [
  ["pac", "PAC"],
  ["sho", "SHO"],
  ["pas", "PAS"],
  ["dri", "DRI"],
  ["def", "DEF"],
  ["phy", "PHY"],
];

export function renderCard(data: CardData): string {
  const colors = tierColors(data.tier);
  const nameLines = wrapName(data.name.toUpperCase(), 18).map(escapeXml);
  const fontSize = nameFontSize(Math.max(...nameLines.map((l) => l.length)));
  const extraLineOffset = nameLines.length > 1 ? 22 : 0;
  const headline = escapeXml(data.headline);
  const leftStats = STAT_LABELS.slice(0, 3);
  const rightStats = STAT_LABELS.slice(3);

  const statRow = (
    [key, label]: [keyof CardData["stats"], string],
    x: number,
    y: number,
  ) => `
    <text x="${x}" y="${y}" font-size="20" font-weight="700" fill="${colors.text}" font-family="Arial, sans-serif">${data.stats[key]}</text>
    <text x="${x + 34}" y="${y}" font-size="14" font-weight="600" fill="${colors.text}" font-family="Arial, sans-serif" opacity="0.85">${label}</text>`;

  return `<svg viewBox="0 0 340 480" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${colors.from}" />
      <stop offset="1" stop-color="${colors.to}" />
    </linearGradient>
  </defs>

  <rect x="4" y="4" width="332" height="472" rx="24" fill="url(#cardBg)" stroke="${colors.text}" stroke-opacity="0.25" stroke-width="2" />

  <text x="30" y="70" font-size="44" font-weight="800" fill="${colors.text}">${data.overall}</text>
  <text x="30" y="94" font-size="16" font-weight="700" fill="${colors.text}" opacity="0.85">${escapeXml(data.position)}</text>
  <text x="300" y="40" font-size="12" font-weight="700" fill="${colors.text}" opacity="0.7" text-anchor="end">${escapeXml(data.country)}</text>
  <text x="300" y="58" font-size="11" font-weight="700" fill="${colors.text}" opacity="0.7" text-anchor="end">${data.tier}</text>
  <text x="300" y="74" font-size="9" font-weight="700" fill="${colors.text}" opacity="0.55" text-anchor="end">${data.mode === "SCOUT" ? "PDF SCOUT" : "FULL EXPORT"}</text>

  <circle cx="170" cy="150" r="56" fill="#ffffff" fill-opacity="0.25" stroke="${colors.text}" stroke-width="2" stroke-opacity="0.4" />
  <text x="170" y="163" font-size="40" font-weight="800" fill="${colors.text}" text-anchor="middle">${escapeXml(initials(data.name))}</text>

  ${nameLines
    .map(
      (line, i) =>
        `<text x="170" y="${nameLines.length > 1 ? 224 + i * 22 : 235}" font-size="${fontSize}" font-weight="800" fill="${colors.text}" text-anchor="middle" letter-spacing="1">${line}</text>`,
    )
    .join("\n  ")}
  <text x="170" y="${256 + extraLineOffset}" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.8">${headline.length > 42 ? headline.slice(0, 39) + "…" : headline}</text>
  <text x="170" y="${276 + extraLineOffset}" font-size="12" font-weight="700" fill="${colors.text}" text-anchor="middle" opacity="0.9">${escapeXml(data.archetype)}</text>

  <line x1="40" y1="${300 + extraLineOffset}" x2="300" y2="${300 + extraLineOffset}" stroke="${colors.text}" stroke-opacity="0.3" stroke-width="1.5" />

  ${leftStats.map((s, i) => statRow(s, 45, 335 + extraLineOffset + i * 40)).join("\n")}
  ${rightStats.map((s, i) => statRow(s, 195, 335 + extraLineOffset + i * 40)).join("\n")}
</svg>`;
}
