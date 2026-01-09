import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// EYL Brand Colors
const COLORS = {
  navy: "#0E1B31",
  gold: "#C5A059",
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  darkGray: "#333333",
};

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.navy,
    backgroundColor: COLORS.white,
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "10%",
    transform: "rotate(-45deg)",
    fontSize: 60,
    color: COLORS.navy,
    opacity: 0.06,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  watermarkSecondary: {
    position: "absolute",
    top: "50%",
    left: "15%",
    transform: "rotate(-45deg)",
    fontSize: 30,
    color: COLORS.gold,
    opacity: 0.08,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: `2px solid ${COLORS.gold}`,
    paddingBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerCenter: {
    textAlign: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.navy,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gold,
    marginTop: 4,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${COLORS.gold}`,
    paddingBottom: 4,
  },
  matchDetailsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  matchDetailsLabel: {
    width: 100,
    fontWeight: "bold",
    color: COLORS.navy,
  },
  matchDetailsValue: {
    flex: 1,
    color: COLORS.darkGray,
  },
  scoreSection: {
    backgroundColor: COLORS.navy,
    padding: 20,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
    width: 150,
  },
  teamNameHome: {
    textAlign: "right",
  },
  teamNameAway: {
    textAlign: "left",
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.gold,
    marginHorizontal: 20,
    letterSpacing: 2,
  },
  eventRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 10,
  },
  eventMinute: {
    width: 35,
    fontWeight: "bold",
    color: COLORS.gold,
  },
  eventDetails: {
    flex: 1,
    color: COLORS.darkGray,
  },
  teamEventHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.navy,
    marginTop: 6,
    marginBottom: 4,
  },
  noEvents: {
    color: "#666666",
    fontStyle: "italic",
    paddingLeft: 10,
  },
  notesContent: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: 20,
    borderTop: `1px solid ${COLORS.gold}`,
    paddingTop: 15,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    color: COLORS.navy,
    marginBottom: 15,
  },
  signatureLine: {
    borderBottom: `1px solid ${COLORS.navy}`,
    marginBottom: 4,
    height: 25,
  },
  signatureName: {
    fontSize: 8,
    color: COLORS.darkGray,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: `1px solid ${COLORS.gold}`,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  footerLogo: {
    width: 30,
    height: 30,
    marginTop: 5,
    alignSelf: "center",
  },
  reportId: {
    fontSize: 9,
    color: COLORS.gold,
    fontWeight: "bold",
  },
});

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

interface PDFReportProps {
  match: MatchData;
  events: MatchEvent[];
  report: ReportData;
  refereeEmail?: string;
}

export const PDFReportTemplate = ({ match, events, report, refereeEmail }: PDFReportProps) => {
  const goals = events.filter((e) => e.event_type === "goal");
  const yellowCards = events.filter((e) => e.event_type === "yellow_card");
  const redCards = events.filter((e) => e.event_type === "red_card");
  const substitutions = events.filter((e) => e.event_type === "substitution");

  const homeGoals = goals.filter((g) => g.team?.name === match.home_team?.name);
  const awayGoals = goals.filter((g) => g.team?.name === match.away_team?.name);

  const matchDate = match.match_date ? new Date(match.match_date) : new Date();
  const reportId = `RPT-${format(matchDate, "yyyyMMdd")}-${match.id?.slice(0, 4).toUpperCase() || "0001"}`;

  const tournamentName = match.tournament?.name || "Ethiopian Youth League";
  const weatherLabel = report.weather 
    ? report.weather.charAt(0).toUpperCase() + report.weather.slice(1)
    : "Not specified";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermarks */}
        <Text style={styles.watermark}>ETHIOPIAN YOUTH LEAGUE</Text>
        <Text style={styles.watermarkSecondary}>{tournamentName}</Text>

        {/* Header */}
        <View style={styles.header}>
          <Image 
            src="/eyl-logo.png" 
            style={styles.logo}
          />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>OFFICIAL MATCH REPORT</Text>
            <Text style={styles.headerSubtitle}>{tournamentName}</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Match Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Details</Text>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Home Team:</Text>
            <Text style={styles.matchDetailsValue}>{match.home_team?.name || "TBD"}</Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Away Team:</Text>
            <Text style={styles.matchDetailsValue}>{match.away_team?.name || "TBD"}</Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Date:</Text>
            <Text style={styles.matchDetailsValue}>
              {format(matchDate, "MMMM d, yyyy")}
            </Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Time:</Text>
            <Text style={styles.matchDetailsValue}>
              {format(matchDate, "HH:mm")}
            </Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Venue:</Text>
            <Text style={styles.matchDetailsValue}>{match.venue || "Not specified"}</Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Attendance:</Text>
            <Text style={styles.matchDetailsValue}>
              {report.attendance ? report.attendance.toLocaleString() : "Not recorded"}
            </Text>
          </View>
          <View style={styles.matchDetailsRow}>
            <Text style={styles.matchDetailsLabel}>Weather:</Text>
            <Text style={styles.matchDetailsValue}>{weatherLabel}</Text>
          </View>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.teamName, styles.teamNameHome]}>
              {match.home_team?.short_name || match.home_team?.name || "HOME"}
            </Text>
            <Text style={styles.scoreText}>
              {match.home_score ?? 0} - {match.away_score ?? 0}
            </Text>
            <Text style={[styles.teamName, styles.teamNameAway]}>
              {match.away_team?.short_name || match.away_team?.name || "AWAY"}
            </Text>
          </View>
        </View>

        {/* Goal Scorers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Scorers</Text>
          {goals.length === 0 ? (
            <Text style={styles.noEvents}>No goals scored</Text>
          ) : (
            <>
              {homeGoals.length > 0 && (
                <>
                  <Text style={styles.teamEventHeader}>{match.home_team?.name}:</Text>
                  {homeGoals.map((goal) => (
                    <View key={goal.id} style={styles.eventRow}>
                      <Text style={styles.eventMinute}>{goal.minute}'</Text>
                      <Text style={styles.eventDetails}>
                        {goal.player?.name || "Unknown"} (Open Play)
                      </Text>
                    </View>
                  ))}
                </>
              )}
              {awayGoals.length > 0 && (
                <>
                  <Text style={styles.teamEventHeader}>{match.away_team?.name}:</Text>
                  {awayGoals.map((goal) => (
                    <View key={goal.id} style={styles.eventRow}>
                      <Text style={styles.eventMinute}>{goal.minute}'</Text>
                      <Text style={styles.eventDetails}>
                        {goal.player?.name || "Unknown"} (Open Play)
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>

        {/* Disciplinary Record */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disciplinary Record</Text>
          <Text style={styles.teamEventHeader}>Yellow Cards:</Text>
          {yellowCards.length === 0 ? (
            <Text style={styles.noEvents}>None</Text>
          ) : (
            yellowCards.map((card) => (
              <View key={card.id} style={styles.eventRow}>
                <Text style={styles.eventMinute}>{card.minute}'</Text>
                <Text style={styles.eventDetails}>
                  {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                </Text>
              </View>
            ))
          )}
          <Text style={[styles.teamEventHeader, { marginTop: 10 }]}>Red Cards:</Text>
          {redCards.length === 0 ? (
            <Text style={styles.noEvents}>None</Text>
          ) : (
            redCards.map((card) => (
              <View key={card.id} style={styles.eventRow}>
                <Text style={styles.eventMinute}>{card.minute}'</Text>
                <Text style={styles.eventDetails}>
                  {card.player?.name || "Unknown"} ({card.team?.short_name || card.team?.name})
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Substitutions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Substitutions</Text>
          {substitutions.length === 0 ? (
            <Text style={styles.noEvents}>No substitutions made</Text>
          ) : (
            substitutions.map((sub) => (
              <View key={sub.id} style={styles.eventRow}>
                <Text style={styles.eventMinute}>{sub.minute}'</Text>
                <Text style={styles.eventDetails}>
                  {sub.player?.name || "Unknown"} ({sub.team?.short_name || sub.team?.name})
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Referee Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referee Notes</Text>
          <View style={styles.notesContent}>
            <Text>{report.notes || "No additional notes provided."}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Referee:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Email: {refereeEmail || "Not specified"}</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Admin Approval:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Date: _______________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.reportId}>Report ID: {reportId}</Text>
          <Text style={styles.footerText}>
            Generated: {format(new Date(), "MMMM d, yyyy")} | {format(new Date(), "HH:mm")}
          </Text>
          <Text style={styles.footerText}>© 2026 Ethiopian Youth League</Text>
        </View>
      </Page>
    </Document>
  );
};
