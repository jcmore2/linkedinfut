import { readFileSync } from "node:fs";
import { reconstructLines, type PdfLine, type TextItemLike } from "./lines.js";
import { extractPdfProfile } from "./extractPdfProfile.js";
import type { PdfProfile } from "../types.js";

export async function parseProfilePdf(pdfPath: string): Promise<PdfProfile> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  const allLines: PdfLine[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    allLines.push(...reconstructLines(content.items as unknown as TextItemLike[]));
  }

  return extractPdfProfile(allLines);
}
