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
  tableHeader: [14, 27, 49] as [number, number, number],
  tableBorder: [197, 160, 89] as [number, number, number],
  tableAlt: [235, 235, 240] as [number, number, number],
};

interface MatchEvent {
  id: string;
  minute: number;
  event_type: string;
  player?: { name: string; jersey_number?: number | null } | null;
  team?: { name: string; short_name?: string | null } | null;
  details?: any;
}

interface PlayerData {
  id: string;
  name: string;
  jersey_number?: number | null;
  position?: string | null;
}

interface MatchData {
  id: string;
  home_team?: { name: string; short_name?: string | null; coach?: string | null; logo_url?: string | null } | null;
  away_team?: { name: string; short_name?: string | null; coach?: string | null; logo_url?: string | null } | null;
  home_score?: number | null;
  away_score?: number | null;
  match_date?: string | null;
  venue?: string | null;
  tournament?: { name: string } | null;
  stage?: string | null;
}

interface LineupData {
  home_players?: PlayerData[];
  away_players?: PlayerData[];
  home_goalkeeper?: PlayerData | null;
  away_goalkeeper?: PlayerData | null;
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
  lineups?: LineupData;
}

const addWatermark = (doc: jsPDF) => {
  try {
    doc.saveGraphicsState();
    // @ts-ignore - GState exists on jsPDF instance
    if (doc.GState) {
      doc.setGState(doc.GState({ opacity: 0.04 }));
    }
    doc.setTextColor(...COLORS.gold);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text("ETHIOPIAN YOUTH LEAGUE", pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: "center",
    });
    
    doc.restoreGraphicsState();
  } catch (e) {
    console.warn("Could not add watermark:", e);
  }
};

const drawSectionHeader = (
  doc: jsPDF,
  title: string,
  y: number,
  width: number
): number => {
  const margin = 15;
  const sectionWidth = width - 2 * margin;
  
  // Gold header background
  doc.setFillColor(...COLORS.gold);
  doc.rect(margin, y, sectionWidth, 8, "F");
  
  // Section title
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), width / 2, y + 5.5, { align: "center" });
  
  return y + 8;
};

const drawTableRow = (
  doc: jsPDF,
  y: number,
  cols: { text: string; width: number; align?: "left" | "center" | "right" }[],
  startX: number,
  rowHeight: number = 7,
  isHeader: boolean = false,
  isAlt: boolean = false
) => {
  // Background
  if (isHeader) {
    doc.setFillColor(...COLORS.navy);
  } else if (isAlt) {
    doc.setFillColor(...COLORS.tableAlt);
  } else {
    doc.setFillColor(...COLORS.white);
  }
  
  const totalWidth = cols.reduce((sum, col) => sum + col.width, 0);
  doc.rect(startX, y, totalWidth, rowHeight, "F");
  
  // Border
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.2);
  doc.rect(startX, y, totalWidth, rowHeight, "S");
  
  // Text
  doc.setFontSize(8);
  doc.setFont("helvetica", isHeader ? "bold" : "normal");
  if (isHeader) {
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  } else {
    doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
  }
  
  let currentX = startX;
  cols.forEach((col) => {
    const textX = col.align === "center" 
      ? currentX + col.width / 2 
      : col.align === "right" 
        ? currentX + col.width - 2
        : currentX + 2;
    doc.text(col.text, textX, y + rowHeight / 2 + 1.5, { 
      align: col.align || "left" 
    });
    currentX += col.width;
  });
  
  return y + rowHeight;
};

const drawEmptyTableRows = (
  doc: jsPDF,
  y: number,
  numRows: number,
  cols: { width: number }[],
  startX: number,
  rowHeight: number = 7
): number => {
  for (let i = 0; i < numRows; i++) {
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    
    const totalWidth = cols.reduce((sum, col) => sum + col.width, 0);
    doc.rect(startX, y, totalWidth, rowHeight, "F");
    
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.rect(startX, y, totalWidth, rowHeight, "S");
    
    // Draw column separators
    let currentX = startX;
    cols.forEach((col, idx) => {
      if (idx < cols.length - 1) {
        doc.line(currentX + col.width, y, currentX + col.width, y + rowHeight);
      }
      currentX += col.width;
    });
    
    y += rowHeight;
  }
  return y;
};

const addHeader = (doc: jsPDF, tournamentName: string, matchNo: string, matchDate: Date) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Navy header background
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 32, "F");
  
  // Gold accent line
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 32, pageWidth, 2, "F");
  
  // Organization name
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ETHIOPIAN YOUTH LEAGUE", pageWidth / 2, 12, { align: "center" });
  
  // Sub-header
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(tournamentName, pageWidth / 2, 20, { align: "center" });
  doc.text("Official Match Report", pageWidth / 2, 26, { align: "center" });
  
  // Match info row
  let y = 38;
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "S");
  
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("REFEREE'S MATCH REPORT", margin + 5, y + 5.5);
  doc.text(`M/NO: ${matchNo}`, pageWidth / 2, y + 5.5, { align: "center" });
  doc.text(`DATE: ${format(matchDate, "dd/MM/yyyy")}`, pageWidth - margin - 5, y + 5.5, { align: "right" });
  
  return y + 12;
};

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number, reportId: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 15;
  
  // Footer line
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);
  
  // Footer content
  doc.setTextColor(...COLORS.mediumGray);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Report ID: ${reportId}`, 15, footerY);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
  doc.text(`© ${new Date().getFullYear()} Ethiopian Youth League`, pageWidth - 15, footerY, { align: "right" });
  
  doc.setFontSize(6);
  doc.text(`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`, pageWidth / 2, footerY + 4, { align: "center" });
};

// EYL Static Content from official documentation
const EYL_ABOUT = {
  about: "The Ethiopian Youth League (EYL) is a digital tournament management system under Ramiyone administration, dedicated to the automatic management of football tournaments. It enables hosts to update information, handle operations digitally, and store data securely in collaboration with the Ethiopian Football Federation.",
  mission: "To provide a robust data management system that improves the quality of tournaments, ensures equality in data access for football governing bodies, and enhances the overall growth of football through reliable data.",
  vision: "To see Ethiopian talents identified from every corner of the country, given the opportunity they deserve, and to witness Ethiopian football grow and shine. Our long-term vision is to become Africa's leading data and talent identification platform, helping players across the continent get their chance to succeed.",
  values: [
    { title: "Integrity", desc: "Upholding the highest standards of honesty and transparency." },
    { title: "Inclusivity", desc: "Every young person deserves a chance to show their talent, regardless of location." },
    { title: "Excellence", desc: "Striving for the highest standards in data management and talent identification." },
    { title: "Innovation", desc: "Embracing modern technology to maximize football quality and talent discovery." },
    { title: "Community", desc: "Building lasting connections between players, academies, and clubs." },
  ],
  story: "Founded in 2026, the Ethiopian Youth League began with a powerful vision: to raise the quality of Ethiopian football and give every young player the opportunity to showcase their talent through data. Our founders, Yonatan Dawit and Ramin Naser, recognized Ethiopia's abundant football talent but also the critical gap in opportunities — especially for players outside the capital. Partnering with the Ethiopian Football Federation, EYL set out to close this gap. Over the past four years, we developed the Digital Scouting System (DSS), a platform for talent identification. Today, Ramiyone has partnered with the Ethiopian Football Federation to provide this digital tournament management and data handling tool to multiple host organizations.",
  footballCommunity: "Discover our talent identification platform and join the Digital Scouting System (DSS) in different roles. Be part of the future of Ethiopian football.",
  dss: {
    title: "Digital Scouting System (DSS)",
    description: "A platform for talent identification that works side by side with EYL.",
    features: [
      "Player Profiles: Detailed stats, videos, and coach comments for remote scouting.",
      "Academy/Project Profiles: Comprehensive profiles with player rosters and coach details.",
      "Scouts Premium Access: Watch videos, review stats, request trials, and call players for trials.",
      "Ramiyone Scouts: Dedicated scouts prepare detailed reports and recommend players to DSS partner clubs.",
    ],
  },
  registration: {
    teams: [
      "Academy/Project Registration: Online registration form or via dedicated Telegram bot.",
      "Coach Registration: Coaches register after the academy is approved.",
      "Player Registration: Team admins register players, manage profiles, and add new players.",
      "Digital ID Request: Admins request digital IDs linked to player profiles for tournaments and trials.",
    ],
    agents: "Ramiyone agents facilitate the entire registration process — from guiding academies, coaches, and players through forms to organizing photo sessions and issuing digital IDs.",
  },
  community: [
    "Football for All: Expanding opportunities for underserved areas to showcase talent.",
    "Scout Development: Empowering scouts to get licensed in talent identification.",
    "Teams & Coaches Exposure: Dedicated profiles for teams and coaches alongside players.",
  ],
  integration: "All academy and player profiles are linked with the Ethiopian Youth League (EYL). Tournament stats update automatically, ensuring seamless synchronization between DSS and EYL.",
};

export const generateMatchReportPDF = async ({
  match,
  events,
  report,
  refereeEmail,
  lineups,
}: GeneratePDFOptions): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  const matchDate = match.match_date ? new Date(match.match_date) : new Date();
  const matchNo = match.id?.slice(0, 6).toUpperCase() || "000001";
  const reportId = `EYL-${format(matchDate, "yyyyMMdd")}-${matchNo}`;
  const tournamentName = match.tournament?.name || "Ethiopian Youth League";
  
  // Categorize events
  const goals = events.filter((e) => e.event_type === "goal");
  const yellowCards = events.filter((e) => e.event_type === "yellow_card");
  const redCards = events.filter((e) => e.event_type === "red_card");
  const substitutions = events.filter((e) => e.event_type === "substitution");
  
  const homeGoals = goals.filter((g) => g.team?.name === match.home_team?.name);
  const awayGoals = goals.filter((g) => g.team?.name === match.away_team?.name);
  const homeYellows = yellowCards.filter((c) => c.team?.name === match.home_team?.name);
  const awayYellows = yellowCards.filter((c) => c.team?.name === match.away_team?.name);
  const homeReds = redCards.filter((c) => c.team?.name === match.home_team?.name);
  const awayReds = redCards.filter((c) => c.team?.name === match.away_team?.name);
  const homeSubs = substitutions.filter((s) => s.team?.name === match.home_team?.name);
  const awaySubs = substitutions.filter((s) => s.team?.name === match.away_team?.name);

  // ==================== PAGE 1: MATCH OFFICIALS & DETAILS ====================
  addWatermark(doc);
  let y = addHeader(doc, tournamentName, matchNo, matchDate);
  
  // MATCH OFFICIALS Section
  y = drawSectionHeader(doc, "Match Officials", y, pageWidth);
  
  const officialRows = [
    ["Centre Referee", refereeEmail || "________________________", ""],
    ["Assistant Referee 1", "________________________", ""],
    ["Assistant Referee 2", "________________________", ""],
    ["Fourth Official", "________________________", ""],
    ["Match Commissioner", "________________________", ""],
  ];
  
  doc.setFontSize(8);
  officialRows.forEach((row, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, 7, "S");
    
    doc.setTextColor(...COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.text(row[0], margin + 3, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    doc.text(row[1], margin + 55, y + 5);
    y += 7;
  });
  
  y += 5;
  
  // CLUB OFFICIALS Section
  y = drawSectionHeader(doc, "Club Officials", y, pageWidth);
  
  // Home team officials
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 7, "S");
  doc.setTextColor(...COLORS.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Host Team:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(match.home_team?.name || "TBD", margin + 35, y + 5);
  doc.text("Coach:", margin + 100, y + 5);
  doc.text(match.home_team?.coach || "________________________", margin + 120, y + 5);
  y += 7;
  
  // Away team officials
  doc.setFillColor(...COLORS.tableAlt);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 7, "S");
  doc.setTextColor(...COLORS.navy);
  doc.setFont("helvetica", "bold");
  doc.text("Visiting Team:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(match.away_team?.name || "TBD", margin + 35, y + 5);
  doc.text("Coach:", margin + 100, y + 5);
  doc.text(match.away_team?.coach || "________________________", margin + 120, y + 5);
  y += 10;
  
  // MATCH DETAILS Section
  y = drawSectionHeader(doc, "Match Details", y, pageWidth);
  
  const matchDetails = [
    ["Venue:", match.venue || "________________________"],
    ["Date:", format(matchDate, "EEEE, MMMM d, yyyy")],
    ["Kick-off Time:", format(matchDate, "HH:mm")],
    ["Match Stage:", match.stage?.replace(/_/g, " ").toUpperCase() || "GROUP STAGE"],
    ["Attendance:", report.attendance ? report.attendance.toLocaleString() : "________"],
    ["Weather:", report.weather ? report.weather.charAt(0).toUpperCase() + report.weather.slice(1) : "________"],
  ];
  
  matchDetails.forEach((detail, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 7, "S");
    
    doc.setTextColor(...COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(detail[0], margin + 3, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    doc.text(detail[1], margin + 45, y + 5);
    y += 7;
  });
  
  y += 5;
  
  // FINAL SCORE Section
  y = drawSectionHeader(doc, "Final Score", y, pageWidth);
  
  // Score display box
  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");
  
  // Team names
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(match.home_team?.name || "HOME TEAM", margin + 35, y + 12, { align: "center" });
  doc.text(match.away_team?.name || "AWAY TEAM", pageWidth - margin - 35, y + 12, { align: "center" });
  
  // Score
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(32);
  const scoreText = `${match.home_score ?? 0}  -  ${match.away_score ?? 0}`;
  doc.text(scoreText, pageWidth / 2, y + 22, { align: "center" });
  
  // Half time score placeholder
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.text("(HT: ___ - ___)", pageWidth / 2, y + 28, { align: "center" });
  
  y += 35;
  
  // GOAL SCORERS Section
  y = drawSectionHeader(doc, "Goal Scorers", y, pageWidth);
  
  // Two column layout for goals
  const halfWidth = contentWidth / 2 - 2;
  
  // Headers
  doc.setFillColor(...COLORS.navy);
  doc.rect(margin, y, halfWidth, 7, "F");
  doc.rect(margin + halfWidth + 4, y, halfWidth, 7, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(match.home_team?.short_name || "HOME", margin + halfWidth / 2, y + 5, { align: "center" });
  doc.text(match.away_team?.short_name || "AWAY", margin + halfWidth + 4 + halfWidth / 2, y + 5, { align: "center" });
  y += 7;
  
  // Goal rows (min 5 rows)
  const maxGoalRows = Math.max(5, homeGoals.length, awayGoals.length);
  for (let i = 0; i < maxGoalRows; i++) {
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    
    // Home side
    doc.rect(margin, y, halfWidth, 7, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, halfWidth, 7, "S");
    
    // Away side
    doc.rect(margin + halfWidth + 4, y, halfWidth, 7, "F");
    doc.rect(margin + halfWidth + 4, y, halfWidth, 7, "S");
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    if (homeGoals[i]) {
      doc.text(`${homeGoals[i].minute}'  ${homeGoals[i].player?.name || "Unknown"}`, margin + 3, y + 5);
    }
    if (awayGoals[i]) {
      doc.text(`${awayGoals[i].minute}'  ${awayGoals[i].player?.name || "Unknown"}`, margin + halfWidth + 7, y + 5);
    }
    
    y += 7;
  }
  
  addFooter(doc, 1, 2, reportId);
  
  // ==================== PAGE 2: TEAM SHEET & EVENTS ====================
  doc.addPage();
  addWatermark(doc);
  y = addHeader(doc, tournamentName, matchNo, matchDate);
  
  // TEAM SHEET Section
  y = drawSectionHeader(doc, "Team Sheet", y, pageWidth);
  
  // Team sheet header row
  doc.setFillColor(...COLORS.navy);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(match.home_team?.name?.toUpperCase() || "HOST TEAM", margin + contentWidth * 0.25, y + 5, { align: "center" });
  doc.text(match.away_team?.name?.toUpperCase() || "VISITING TEAM", margin + contentWidth * 0.75, y + 5, { align: "center" });
  y += 7;
  
  // Column headers
  const colWidths = [15, 60, 15, 60];
  y = drawTableRow(doc, y, [
    { text: "NO.", width: colWidths[0], align: "center" },
    { text: "PLAYER NAME", width: colWidths[1], align: "center" },
    { text: "NO.", width: colWidths[2], align: "center" },
    { text: "PLAYER NAME", width: colWidths[3], align: "center" },
  ], margin, 7, true);
  
  // Player rows (11 starting players + subs)
  const homePlayers = lineups?.home_players || [];
  const awayPlayers = lineups?.away_players || [];
  const homeGK = lineups?.home_goalkeeper;
  const awayGK = lineups?.away_goalkeeper;
  
  // Add goalkeeper first
  const allHomePlayers = homeGK ? [homeGK, ...homePlayers] : homePlayers;
  const allAwayPlayers = awayGK ? [awayGK, ...awayPlayers] : awayPlayers;
  
  for (let i = 0; i < 14; i++) {
    const isAlt = i % 2 === 1;
    const homePlayer = allHomePlayers[i];
    const awayPlayer = allAwayPlayers[i];
    
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    // Draw column separators
    let colX = margin;
    colWidths.forEach((w, idx) => {
      if (idx < colWidths.length - 1) {
        doc.line(colX + w, y, colX + w, y + 6);
      }
      colX += w;
    });
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    // Home player
    if (homePlayer) {
      doc.text(homePlayer.jersey_number?.toString() || "", margin + 7.5, y + 4, { align: "center" });
      doc.text(homePlayer.name || "", margin + colWidths[0] + 3, y + 4);
    }
    
    // Away player
    if (awayPlayer) {
      doc.text(awayPlayer.jersey_number?.toString() || "", margin + colWidths[0] + colWidths[1] + 7.5, y + 4, { align: "center" });
      doc.text(awayPlayer.name || "", margin + colWidths[0] + colWidths[1] + colWidths[2] + 3, y + 4);
    }
    
    y += 6;
  }
  
  y += 5;
  
  // SUBSTITUTIONS Section
  y = drawSectionHeader(doc, "Substitutions", y, pageWidth);
  
  // Substitution table headers
  y = drawTableRow(doc, y, [
    { text: "TIME", width: 15, align: "center" },
    { text: "NO.", width: 12, align: "center" },
    { text: "PLAYER OUT", width: 38, align: "left" },
    { text: "PLAYER IN", width: 38, align: "left" },
    { text: "TIME", width: 15, align: "center" },
    { text: "NO.", width: 12, align: "center" },
    { text: "PLAYER OUT", width: 35, align: "left" },
    { text: "PLAYER IN", width: 35, align: "left" },
  ], margin, 6, true);
  
  // Substitution rows
  const maxSubRows = Math.max(5, homeSubs.length, awaySubs.length);
  for (let i = 0; i < maxSubRows; i++) {
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    if (homeSubs[i]) {
      doc.text(`${homeSubs[i].minute}'`, margin + 7.5, y + 4, { align: "center" });
      doc.text(homeSubs[i].player?.name || "", margin + 27 + 3, y + 4);
    }
    
    if (awaySubs[i]) {
      doc.text(`${awaySubs[i].minute}'`, margin + 103 + 7.5, y + 4, { align: "center" });
      doc.text(awaySubs[i].player?.name || "", margin + 130 + 3, y + 4);
    }
    
    y += 6;
  }
  
  y += 5;
  
  // CAUTIONS Section
  y = drawSectionHeader(doc, "Cautions (Yellow Cards)", y, pageWidth);
  
  y = drawTableRow(doc, y, [
    { text: "TEAM", width: 50, align: "left" },
    { text: "NO.", width: 15, align: "center" },
    { text: "PLAYER", width: 55, align: "left" },
    { text: "MIN", width: 15, align: "center" },
    { text: "REASON", width: 45, align: "left" },
  ], margin, 6, true);
  
  const maxYellowRows = Math.max(4, yellowCards.length);
  for (let i = 0; i < maxYellowRows; i++) {
    const card = yellowCards[i];
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    if (card) {
      doc.text(card.team?.short_name || card.team?.name || "", margin + 3, y + 4);
      doc.text(card.player?.jersey_number?.toString() || "", margin + 50 + 7.5, y + 4, { align: "center" });
      doc.text(card.player?.name || "", margin + 65 + 3, y + 4);
      doc.text(`${card.minute}'`, margin + 120 + 7.5, y + 4, { align: "center" });
    }
    
    y += 6;
  }
  
  y += 5;
  
  // SEND-OFFS Section
  y = drawSectionHeader(doc, "Send-offs (Red Cards)", y, pageWidth);
  
  y = drawTableRow(doc, y, [
    { text: "TEAM", width: 50, align: "left" },
    { text: "NO.", width: 15, align: "center" },
    { text: "PLAYER", width: 55, align: "left" },
    { text: "MIN", width: 15, align: "center" },
    { text: "REASON", width: 45, align: "left" },
  ], margin, 6, true);
  
  const maxRedRows = Math.max(3, redCards.length);
  for (let i = 0; i < maxRedRows; i++) {
    const card = redCards[i];
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    
    if (card) {
      doc.text(card.team?.short_name || card.team?.name || "", margin + 3, y + 4);
      doc.text(card.player?.jersey_number?.toString() || "", margin + 50 + 7.5, y + 4, { align: "center" });
      doc.text(card.player?.name || "", margin + 65 + 3, y + 4);
      doc.text(`${card.minute}'`, margin + 120 + 7.5, y + 4, { align: "center" });
    }
    
    y += 6;
  }
  
  y += 5;
  
  // REFEREE NOTES Section
  y = drawSectionHeader(doc, "Referee Notes & Observations", y, pageWidth);
  
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, contentWidth, 25, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 25, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(8);
  const notes = report.notes || "";
  const splitNotes = doc.splitTextToSize(notes, contentWidth - 6);
  doc.text(splitNotes, margin + 3, y + 5);
  
  y += 28;
  
  // SIGNATURES Section
  y = drawSectionHeader(doc, "Signatures & Verification", y, pageWidth);
  
  const sigColWidth = contentWidth / 2 - 2;
  
  // Referee signature
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, sigColWidth, 20, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, sigColWidth, 20, "S");
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(8);
  doc.text("Centre Referee", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Signature: ___________________________", margin + 3, y + 11);
  doc.text("Date: _______________", margin + 3, y + 17);
  
  // Match Commissioner signature
  doc.setFillColor(...COLORS.white);
  doc.rect(margin + sigColWidth + 4, y, sigColWidth, 20, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin + sigColWidth + 4, y, sigColWidth, 20, "S");
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(8);
  doc.text("Match Commissioner / Admin", margin + sigColWidth + 7, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Signature: ___________________________", margin + sigColWidth + 7, y + 11);
  doc.text("Date: _______________", margin + sigColWidth + 7, y + 17);
  
  addFooter(doc, 2, 3, reportId);
  
  // Update page 1 footer
  doc.setPage(1);
  addFooter(doc, 1, 3, reportId);
  
  // ==================== PAGE 3: ABOUT EYL & DSS ====================
  doc.addPage();
  addWatermark(doc);
  
  // About EYL Header
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 28, pageWidth, 2, "F");
  
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ETHIOPIAN YOUTH LEAGUE", pageWidth / 2, 14, { align: "center" });
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("About Us & Digital Scouting System", pageWidth / 2, 23, { align: "center" });
  
  y = 38;
  
  // ABOUT EYL Section
  y = drawSectionHeader(doc, "About EYL", y, pageWidth);
  
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, contentWidth, 18, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 18, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(7);
  const aboutText = doc.splitTextToSize(EYL_ABOUT.about, contentWidth - 6);
  doc.text(aboutText, margin + 3, y + 5);
  y += 20;
  
  // MISSION & VISION Section (side by side)
  y = drawSectionHeader(doc, "Our Mission & Vision", y, pageWidth);
  
  const halfContentWidth = (contentWidth - 4) / 2;
  
  // Mission box
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, halfContentWidth, 24, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, halfContentWidth, 24, "S");
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(8);
  doc.text("Mission:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(7);
  const missionText = doc.splitTextToSize(EYL_ABOUT.mission, halfContentWidth - 6);
  doc.text(missionText, margin + 3, y + 10);
  
  // Vision box
  doc.setFillColor(...COLORS.white);
  doc.rect(margin + halfContentWidth + 4, y, halfContentWidth, 24, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin + halfContentWidth + 4, y, halfContentWidth, 24, "S");
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(8);
  doc.text("Vision:", margin + halfContentWidth + 7, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(7);
  const visionText = doc.splitTextToSize(EYL_ABOUT.vision, halfContentWidth - 6);
  doc.text(visionText, margin + halfContentWidth + 7, y + 10);
  
  y += 27;
  
  // CORE VALUES Section
  y = drawSectionHeader(doc, "Our Core Values", y, pageWidth);
  
  EYL_ABOUT.values.forEach((val, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setTextColor(...COLORS.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(`• ${val.title}:`, margin + 3, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    doc.text(val.desc, margin + 28, y + 4);
    y += 6;
  });
  
  y += 3;
  
  // OUR STORY Section
  y = drawSectionHeader(doc, "Our Story", y, pageWidth);
  
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, contentWidth, 22, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 22, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(7);
  const storyText = doc.splitTextToSize(EYL_ABOUT.story, contentWidth - 6);
  doc.text(storyText, margin + 3, y + 5);
  y += 25;
  
  // DIGITAL SCOUTING SYSTEM Section
  y = drawSectionHeader(doc, EYL_ABOUT.dss.title, y, pageWidth);
  
  doc.setFillColor(...COLORS.white);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setDrawColor(...COLORS.gold);
  doc.rect(margin, y, contentWidth, 8, "S");
  
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(7);
  doc.text(EYL_ABOUT.dss.description, margin + 3, y + 5);
  y += 10;
  
  // DSS Features
  EYL_ABOUT.dss.features.forEach((feature, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    doc.setFontSize(7);
    doc.text(`• ${feature}`, margin + 3, y + 4);
    y += 6;
  });
  
  y += 3;
  
  // COMMUNITY INITIATIVES Section
  y = drawSectionHeader(doc, "Community Initiatives", y, pageWidth);
  
  EYL_ABOUT.community.forEach((initiative, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(...COLORS.tableAlt);
    } else {
      doc.setFillColor(...COLORS.white);
    }
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setDrawColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 6, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.darkGray);
    doc.setFontSize(7);
    doc.text(`• ${initiative}`, margin + 3, y + 4);
    y += 6;
  });
  
  y += 5;
  
  // Integration Notice
  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
  
  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Integration with EYL", pageWidth / 2, y + 5, { align: "center" });
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(EYL_ABOUT.integration, pageWidth / 2, y + 11, { align: "center" });
  
  addFooter(doc, 3, 3, reportId);

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
