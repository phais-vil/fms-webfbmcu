/**
 * CSV Utilities (RFC 4180 compliant with UTF-8 BOM for Excel / Windows Thai language compatibility)
 */

export const UTF8_BOM = "\uFEFF";

export interface CsvHeader {
  key: string;
  label: string;
}

/**
 * Escapes a single cell value for CSV output according to RFC 4180.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM.
 */
export function generateCsv<T extends Record<string, unknown>>(
  headers: CsvHeader[],
  rows: T[],
  options: { includeBom?: boolean } = {}
): string {
  const includeBom = options.includeBom ?? true;
  const headerLine = headers.map((h) => escapeCsvCell(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvCell(row[h.key])).join(",")
  );

  const content = [headerLine, ...dataLines].join("\r\n");
  return includeBom ? `${UTF8_BOM}${content}` : content;
}

/**
 * Parses raw CSV text into an array of tokenized rows.
 * Correctly handles quoted fields containing commas, double quotes (""), and multiline content.
 */
export function tokenizeCsv(csvText: string): string[][] {
  const cleanText = csvText.startsWith(UTF8_BOM)
    ? csvText.slice(UTF8_BOM.length)
    : csvText;

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentCell += '"';
          i++;
        } else {
          // Closing quote
          insideQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = "";
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        currentCell = "";
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentCell += char;
      }
    }
  }

  // Push remaining cell and row if any
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses CSV text into headers and an array of objects keyed by header name.
 */
export function parseCsv(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const tokenized = tokenizeCsv(csvText);
  if (tokenized.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = tokenized[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < tokenized.length; i++) {
    const rawRow = tokenized[i];
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = rawRow[j] ?? "";
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}
