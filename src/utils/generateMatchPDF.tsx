import React from "react";
import { pdf } from "@react-pdf/renderer";
import { PDFReportTemplate } from "@/components/PDFReportTemplate";
import { format } from "date-fns";

interface MatchEvent {
  id: string;
  minute: number;
  event_type: string;
  player?: { name: string } | null;
  team?: { name: string; short_name?: string | null } | null;
  details?: any;
}

interface MatchData {
  id: string;
  home_team?: { name: string; short_name?: string | null } | null;
  away_team?: { name: string; short_name?: string | null } | null;
  home_score?: number | null;
  away_score?: number | null;
  match_date?: string | null;
  venue?: string | null;
  tournament?: { name: string } | null;
}

interface ReportData {
  attendance?: number | null;
  weather?: string | null;
  notes?: string | null;
  referee_id?: string;
}

interface GeneratePDFOptions {
  match: MatchData;
  events: MatchEvent[];
  report: ReportData;
  refereeEmail?: string;
}

export const generateMatchReportPDF = async ({
  match,
  events,
  report,
  refereeEmail,
}: GeneratePDFOptions): Promise<Blob> => {
  const pdfDocument = (
    <PDFReportTemplate
      match={match}
      events={events}
      report={report}
      refereeEmail={refereeEmail}
    />
  );

  const blob = await pdf(pdfDocument).toBlob();
  return blob;
};

export const downloadMatchReportPDF = async (options: GeneratePDFOptions): Promise<void> => {
  const blob = await generateMatchReportPDF(options);
  
  const matchDate = options.match.match_date 
    ? format(new Date(options.match.match_date), "yyyyMMdd")
    : format(new Date(), "yyyyMMdd");
  
  const matchIdShort = options.match.id?.slice(0, 8) || "unknown";
  const filename = `EYL_MatchReport_${matchIdShort}_${matchDate}.pdf`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
