"use client";

import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";

interface ExportOptions {
  filename?: string;
  title?: string;
}

/**
 * Exports a timetable DOM element as a high-resolution JPEG image.
 */
export async function exportScheduleToJpeg(
  element: HTMLElement,
  options?: ExportOptions
): Promise<void> {
  const filename = options?.filename || "class-schedule.jpg";

  // Hide any elements with class 'no-export' during capture
  const dataUrl = await toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains("no-export")) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement("a");
  link.download = filename.endsWith(".jpg") || filename.endsWith(".jpeg") ? filename : `${filename}.jpg`;
  link.href = dataUrl;
  link.click();
}

/**
 * Exports a timetable DOM element as an A4 Landscape PDF.
 */
export async function exportScheduleToPdf(
  element: HTMLElement,
  options?: ExportOptions
): Promise<void> {
  const filename = options?.filename || "class-schedule.pdf";

  // Render element to high quality PNG
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains("no-export")) {
        return false;
      }
      return true;
    },
  });

  // Create A4 Landscape PDF
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
  const margin = 10; // 10mm margins

  const maxImgWidth = pageWidth - margin * 2;
  const maxImgHeight = pageHeight - margin * 2;

  // Get image natural aspect ratio
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const imgRatio = img.width / img.height;
  let finalWidth = maxImgWidth;
  let finalHeight = finalWidth / imgRatio;

  if (finalHeight > maxImgHeight) {
    finalHeight = maxImgHeight;
    finalWidth = finalHeight * imgRatio;
  }

  // Center on page
  const posX = (pageWidth - finalWidth) / 2;
  const posY = (pageHeight - finalHeight) / 2;

  pdf.addImage(dataUrl, "PNG", posX, posY, finalWidth, finalHeight, undefined, "FAST");
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
