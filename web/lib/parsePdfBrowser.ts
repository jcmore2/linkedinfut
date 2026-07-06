import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { reconstructLines, type PdfLine, type TextItemLike } from "../../src/pdf/lines.js";
import { extractPdfProfile } from "../../src/pdf/extractPdfProfile.js";
import type { PdfProfile } from "../../src/types.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function parseProfilePdfFile(file: File): Promise<PdfProfile> {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const allLines: PdfLine[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    allLines.push(...reconstructLines(content.items as unknown as TextItemLike[]));
  }

  return extractPdfProfile(allLines);
}
