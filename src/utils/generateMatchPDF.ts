import jsPDF from "jspdf";
import { format } from "date-fns";

// EYL Brand Colors
const COLORS = {
  navy: [14, 27, 49] as [number, number, number],
  gold: [197, 160, 89] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [245, 245, 245] as [number, number, number],
  darkGray: [51, 51, 51] as [number, number, number],
  mediumGray: [150, 150, 150] as [number, number, number],
};

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

const addWatermark = (doc: jsPDF) => {
  try {
    doc.saveGraphicsState();
    // @ts-ignore - GState exists on jsPDF instance
    if (doc.GState) {
      doc.setGState(doc.GState({ opacity: 0.06 }));
    }
    doc.setTextColor(...COLORS.navy);
    doc.setFontSize(50);
    doc.setFont("helvetica", "bold");
    
    // Rotate and add watermark text
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text("ETHIOPIAN YOUTH LEAGUE", pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: "center",
    });
    
    doc.restoreGraphicsState();
  } catch (e) {
    // Silently fail if watermark can't be added
    console.warn("Could not add watermark:", e);
  }
};

const drawSection = (
  doc: jsPDF,
  title: string,
  y: number,
  width: number
): number => {
  const margin = 20;
  
  // Section background
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, y, width - 2 * margin, 8, 2, 2, "F");
  
  // Section title
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), margin + 5, y + 5.5);
  
  // Underline
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y + 7, margin + 5 + doc.getTextWidth(title.toUpperCase()), y + 7);
  
  return y + 12;
};

export const generateMatchReportPDF = async ({
  match,
  events,
  report,
  refereeEmail,
}: GeneratePDFOptions): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  const matchDate = match.match_date ? new Date(match.match_date) : new Date();
  const reportId = `RPT-${format(matchDate, "yyyyMMdd")}-${match.id?.slice(0, 4).toUpperCase() || "0001"}`;
  const tournamentName = match.tournament?.name || "Ethiopian Youth League";
  
  // Categorize events
  const goals = events.filter((e) => e.event_type === "goal");
  const yellowCards = events.filter((e) => e.event_type === "yellow_card");
  const redCards = events.filter((e) => e.event_type === "red_card");
  const substitutions = events.filter((e) => e.event_type === "substitution");
  
  const homeGoals = goals.filter((g) => g.team?.name === match.home_team?.name);
  const awayGoals = goals.filter((g) => g.team?.name === match.away_team?.name);

  // Add watermark
  addWatermark(doc);

  // Header
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Header text
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL MATCH REPORT", pageWidth / 2, 18, { align: "center" });
  
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(12);
  doc.text(tournamentName, pageWidth / 2, 28, { align: "center" });

  let y = 45;

  // Match Details Section
  y = drawSection(doc, "Match Details", y, pageWidth);
  
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const details = [
    ["Home Team:", match.home_team?.name || "TBD"],
    ["Away Team:", match.away_team?.name || "TBD"],
    ["Date:", format(matchDate, "MMMM d, yyyy")],
    ["Time:", format(matchDate, "HH:mm")],
    ["Venue:", match.venue || "Not specified"],
    ["Attendance:", report.attendance ? report.attendance.toLocaleString() : "Not recorded"],
    ["Weather:", report.weather ? report.weather.charAt(0).toUpperCase() + report.weather.slice(1) : "Not specified"],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 40, y);
    y += 6;
  });
  
  y += 5;

  // Score Section
  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, "F");
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(match.home_team?.short_name || match.home_team?.name || "HOME", margin + 20, y + 15, { align: "center" });
  doc.text(match.away_team?.short_name || match.away_team?.name || "AWAY", pageWidth - margin - 20, y + 15, { align: "center" });
  
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(28);
  const scoreText = `${match.home_score ?? 0} - ${match.away_score ?? 0}`;
  doc.text(scoreText, pageWidth / 2, y + 17, { align: "center" });
  
  y += 35;

  // Goal Scorers Section
  y = drawSection(doc, "Goal Scorers", y, pageWidth);
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(9);
  
  if (goals.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.text("No goals scored", margin + 10, y);
    y += 6;
  } else {
    if (homeGoals.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.navy);
      doc.text(`${match.home_team?.name}:`, margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.darkGray);
      homeGoals.forEach((goal) => {
        doc.setTextColor(...COLORS.gold);
        doc.text(`${goal.minute}'`, margin + 10, y);
        doc.setTextColor(...COLORS.darkGray);
        doc.text(`${goal.player?.name || "Unknown"} (Open Play)`, margin + 25, y);
        y += 5;
      });
    }
    if (awayGoals.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.navy);
      doc.text(`${match.away_team?.name}:`, margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.darkGray);
      awayGoals.forEach((goal) => {
        doc.setTextColor(...COLORS.gold);
        doc.text(`${goal.minute}'`, margin + 10, y);
        doc.setTextColor(...COLORS.darkGray);
        doc.text(`${goal.player?.name || "Unknown"} (Open Play)`, margin + 25, y);
        y += 5;
      });
    }
  }
  
  y += 5;

  // Disciplinary Record Section
  y = drawSection(doc, "Disciplinary Record", y, pageWidth);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.text("Yellow Cards:", margin + 5, y);
  y += 5;
  
  if (yellowCards.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.mediumGray);
    doc.text("None", margin + 10, y);
    y += 5;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    yellowCards.forEach((card) => {
      doc.setTextColor(...COLORS.gold);
      doc.text(`${card.minute}'`, margin + 10, y);
      doc.setTextColor(...COLORS.darkGray);
      doc.text(`${card.player?.name || "Unknown"} (${card.team?.short_name || card.team?.name})`, margin + 25, y);
      y += 5;
    });
  }
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.text("Red Cards:", margin + 5, y);
  y += 5;
  
  if (redCards.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.mediumGray);
    doc.text("None", margin + 10, y);
    y += 5;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    redCards.forEach((card) => {
      doc.setTextColor(...COLORS.gold);
      doc.text(`${card.minute}'`, margin + 10, y);
      doc.setTextColor(...COLORS.darkGray);
      doc.text(`${card.player?.name || "Unknown"} (${card.team?.short_name || card.team?.name})`, margin + 25, y);
      y += 5;
    });
  }
  
  y += 5;

  // Substitutions Section
  y = drawSection(doc, "Substitutions", y, pageWidth);
  
  if (substitutions.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.mediumGray);
    doc.text("No substitutions made", margin + 10, y);
    y += 6;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    substitutions.forEach((sub) => {
      doc.setTextColor(...COLORS.gold);
      doc.text(`${sub.minute}'`, margin + 10, y);
      doc.setTextColor(...COLORS.darkGray);
      doc.text(`${sub.player?.name || "Unknown"} (${sub.team?.short_name || sub.team?.name})`, margin + 25, y);
      y += 5;
    });
  }
  
  y += 5;

  // Referee Notes Section
  y = drawSection(doc, "Referee Notes", y, pageWidth);
  
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin + 5, y, contentWidth - 10, 20, 2, 2, "F");
  
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(9);
  const notes = report.notes || "No additional notes provided.";
  const splitNotes = doc.splitTextToSize(notes, contentWidth - 20);
  doc.text(splitNotes, margin + 10, y + 5);
  
  y += 25;

  // Signatures Section
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(10);
  doc.text("SIGNATURES", margin + 5, y);
  y += 10;
  
  // Referee signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Referee:", margin + 5, y);
  doc.setDrawColor(...COLORS.navy);
  doc.setLineWidth(0.3);
  doc.line(margin + 25, y, margin + 80, y);
  doc.text("Date: ___________", margin + 90, y);
  y += 6;
  doc.setTextColor(...COLORS.mediumGray);
  doc.setFontSize(8);
  doc.text(`Email: ${refereeEmail || "Not specified"}`, margin + 5, y);
  
  y += 12;
  
  // Admin signature
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(9);
  doc.text("Admin Approval:", margin + 5, y);
  doc.line(margin + 40, y, margin + 95, y);
  doc.text("Date: ___________", margin + 105, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Report ID: ${reportId}`, pageWidth / 2, footerY, { align: "center" });
  
  doc.setTextColor(...COLORS.mediumGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${format(new Date(), "MMMM d, yyyy")} | ${format(new Date(), "HH:mm")}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );
  doc.text("© 2026 Ethiopian Youth League", pageWidth / 2, footerY + 10, { align: "center" });

  return doc.output("blob");
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
