/**
 * CSV Parser Utility
 * Parses CSV files into arrays of objects with header mapping
 */

export interface ParsedCSVResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  successRows: number;
}

/**
 * Parse CSV text into array of objects
 * @param csvText - Raw CSV text content
 * @param columnMapping - Maps CSV headers to object keys
 * @param requiredFields - Array of required field names
 */
export function parseCSV<T extends Record<string, any>>(
  csvText: string,
  columnMapping: Record<string, keyof T>,
  requiredFields: (keyof T)[] = []
): ParsedCSVResult<T> {
  const lines = csvText.trim().split(/\r?\n/);
  const errors: string[] = [];
  const data: T[] = [];

  if (lines.length < 2) {
    return { data: [], errors: ["CSV must have a header row and at least one data row"], totalRows: 0, successRows: 0 };
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const headerIndexMap: Record<string, number> = {};
  
  headers.forEach((header, index) => {
    const cleanHeader = header.trim().toLowerCase();
    headerIndexMap[cleanHeader] = index;
  });

  // Validate required columns exist
  const missingColumns: string[] = [];
  for (const [csvHeader] of Object.entries(columnMapping)) {
    const cleanHeader = csvHeader.toLowerCase();
    if (headerIndexMap[cleanHeader] === undefined) {
      // Check if it's a required field
      const mappedField = columnMapping[csvHeader];
      if (requiredFields.includes(mappedField)) {
        missingColumns.push(csvHeader);
      }
    }
  }

  if (missingColumns.length > 0) {
    return { 
      data: [], 
      errors: [`Missing required columns: ${missingColumns.join(", ")}`], 
      totalRows: lines.length - 1, 
      successRows: 0 
    };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const row = {} as T;

    // Map columns to object properties
    for (const [csvHeader, objectKey] of Object.entries(columnMapping)) {
      const cleanHeader = csvHeader.toLowerCase();
      const columnIndex = headerIndexMap[cleanHeader];
      
      if (columnIndex !== undefined && values[columnIndex] !== undefined) {
        const value = values[columnIndex].trim();
        (row as any)[objectKey] = value || null;
      }
    }

    // Validate required fields
    const rowErrors: string[] = [];
    for (const field of requiredFields) {
      if (!row[field]) {
        rowErrors.push(`Missing ${String(field)}`);
      }
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join(", ")}`);
    } else {
      data.push(row);
    }
  }

  return {
    data,
    errors,
    totalRows: lines.length - 1,
    successRows: data.length,
  };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Generate CSV template for teams
 */
export function generateTeamsCSVTemplate(): string {
  return `name,short_name,coach,stadium,founded_year,group_name
Team Name,TN,Coach Name,Stadium Name,2020,Group A
Another Team,AT,Coach Two,Field B,2018,Group B`;
}

/**
 * Generate CSV template for players
 */
export function generatePlayersCSVTemplate(): string {
  return `name,team_name,jersey_number,position,nationality,fayda_number
Player Name,Team Name,10,Forward,Ethiopian,FN001
Another Player,Team Name,7,Midfielder,Ethiopian,FN002`;
}

/**
 * Download text content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType = "text/csv") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
