export interface TextItemLike {
  str: string;
  hasEOL?: boolean;
  transform: number[]; // pdf.js TextItem.transform: [scaleX, skewX, skewY, scaleY, x, y]
}

export interface PdfLine {
  text: string;
  fontSize: number;
}

function fontSizeOf(item: TextItemLike): number {
  return Math.abs(item.transform[3]) || Math.hypot(item.transform[2], item.transform[3]);
}

// Reconstructs lines by following pdf.js's item order + hasEOL markers
// rather than re-sorting by y-coordinate. LinkedIn's PDF export is a
// two-column layout (sidebar, then main content) and the underlying content
// stream emits each column's text as one contiguous run — sorting by
// absolute y position would interleave sidebar and main-column lines that
// happen to sit at the same page height. Trusting stream order preserves
// the correct column grouping for free.
export function reconstructLines(items: TextItemLike[]): PdfLine[] {
  const hasAnyEOL = items.some((i) => i.hasEOL);
  if (!hasAnyEOL) return reconstructLinesByPosition(items);

  const lines: PdfLine[] = [];
  let buffer = "";
  let maxFontSize = 0;

  const flush = () => {
    const text = buffer.replace(/\s+/g, " ").trim();
    if (text) lines.push({ text, fontSize: maxFontSize });
    buffer = "";
    maxFontSize = 0;
  };

  for (const item of items) {
    if (item.str) {
      buffer += item.str;
      maxFontSize = Math.max(maxFontSize, fontSizeOf(item));
    }
    if (item.hasEOL) flush();
  }
  flush();

  return lines;
}

// Fallback for pdf.js builds/content without hasEOL: bucket items by
// y-coordinate. Imperfect for multi-column layouts, but better than nothing.
function reconstructLinesByPosition(items: TextItemLike[]): PdfLine[] {
  const TOLERANCE = 2;
  const buckets: { y: number; items: { x: number; str: string; fontSize: number }[] }[] = [];

  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = item.transform[5];
    let bucket = buckets.find((b) => Math.abs(b.y - y) <= TOLERANCE);
    if (!bucket) {
      bucket = { y, items: [] };
      buckets.push(bucket);
    }
    bucket.items.push({ x: item.transform[4], str: item.str, fontSize: fontSizeOf(item) });
  }

  return buckets
    .sort((a, b) => b.y - a.y)
    .map((b) => {
      const sorted = [...b.items].sort((i1, i2) => i1.x - i2.x);
      return {
        text: sorted
          .map((i) => i.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
        fontSize: Math.max(...b.items.map((i) => i.fontSize)),
      };
    })
    .filter((l) => l.text.length > 0);
}
