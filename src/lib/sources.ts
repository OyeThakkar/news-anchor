import type { AnchorId } from "./anchors";

export type SourceTier = "Primary" | "Wire" | "Data" | "Analysis" | "Fact-check";
export type OutputFormat = "Shorts" | "Episode" | "Weekly";
export type CheckFrequency = "Live" | "Hourly" | "Twice daily" | "Daily" | "On release" | "Weekly";
export type Monitor = "Tool" | "Researcher" | "Both";

export type Source = {
  name: string;
  url: string;
  owner: AnchorId | "shared";
  group: string;
  tier: SourceTier;
  beat: string;
  formats: OutputFormat[];
  frequency: CheckFrequency;
  monitor: Monitor;
  note?: string;
};

type Defaults = Pick<Source, "owner" | "group" | "tier" | "formats" | "frequency" | "monitor">;
type Row = { name: string; url: string; beat: string; note?: string } & Partial<Defaults>;

function group(defaults: Defaults, rows: Row[]): Source[] {
  return rows.map((row) => ({ ...defaults, ...row }));
}

const ALL: OutputFormat[] = ["Shorts", "Episode", "Weekly"];
const DEEP: OutputFormat[] = ["Episode", "Weekly"];

export const sources: Source[] = [
  // Shared layer: both anchors start from the same facts.
  ...group(
    { owner: "shared", group: "Wires", tier: "Wire", formats: ALL, frequency: "Live", monitor: "Tool" },
    [
      { name: "Reuters", url: "https://www.reuters.com", beat: "Breaking, global, business" },
      { name: "AP", url: "https://apnews.com", beat: "Breaking, global" },
      { name: "PTI", url: "https://www.ptinews.com", beat: "Breaking, national" },
      { name: "ANI", url: "https://www.aninews.in", beat: "Breaking, national" },
      { name: "Bloomberg", url: "https://www.bloomberg.com", beat: "Business, markets" },
    ],
  ),
  ...group(
    { owner: "shared", group: "Primary documents", tier: "Primary", formats: DEEP, frequency: "Daily", monitor: "Both" },
    [
      { name: "Supreme Court of India", url: "https://www.sci.gov.in", beat: "Courts", note: "Judgments and orders" },
      { name: "Parliament (Sansad)", url: "https://sansad.in", beat: "Legislature", note: "Bills, debates, transcripts" },
      { name: "RBI", url: "https://www.rbi.org.in", beat: "Monetary policy, banking", note: "Circulars, policy statements" },
      { name: "SEBI", url: "https://www.sebi.gov.in", beat: "Markets regulation", note: "Orders and circulars" },
      { name: "PIB", url: "https://pib.gov.in", beat: "Government", frequency: "Twice daily", note: "Press releases" },
      { name: "Union Budget", url: "https://www.indiabudget.gov.in", beat: "Fiscal policy", frequency: "On release", note: "Budget & Economic Survey" },
      { name: "Gazette of India", url: "https://egazette.gov.in", beat: "Government", note: "Notifications" },
      { name: "Election Commission", url: "https://www.eci.gov.in", beat: "Elections", frequency: "On release" },
    ],
  ),
  ...group(
    { owner: "shared", group: "Data", tier: "Data", formats: ALL, frequency: "On release", monitor: "Both" },
    [
      { name: "MOSPI / NSO", url: "https://www.mospi.gov.in", beat: "Economy", note: "GDP, CPI, IIP, PLFS" },
      { name: "RBI DBIE", url: "https://data.rbi.org.in", beat: "Economy, banking", note: "Database on Indian Economy" },
      { name: "NSE", url: "https://www.nseindia.com", beat: "Markets", frequency: "Live", monitor: "Tool", note: "Filings and index data" },
      { name: "BSE", url: "https://www.bseindia.com", beat: "Markets", frequency: "Live", monitor: "Tool", note: "Filings and index data" },
      { name: "Trading Economics", url: "https://tradingeconomics.com", beat: "Macro indicators", frequency: "Daily", monitor: "Tool" },
      { name: "IMF Data", url: "https://www.imf.org/en/Data", beat: "Global economy", formats: DEEP },
      { name: "World Bank Data", url: "https://data.worldbank.org", beat: "Development", formats: DEEP },
      { name: "Our World in Data", url: "https://ourworldindata.org", beat: "Global comparisons", formats: DEEP },
      { name: "NFHS", url: "https://rchiips.org/nfhs", beat: "Health, households", formats: DEEP, note: "National Family Health Survey" },
      { name: "Census of India", url: "https://censusindia.gov.in", beat: "Demographics", formats: DEEP },
    ],
  ),
  ...group(
    { owner: "shared", group: "Fact-checks", tier: "Fact-check", formats: ALL, frequency: "Twice daily", monitor: "Researcher" },
    [
      { name: "Factly", url: "https://factly.in", beat: "Verification" },
      { name: "BOOM", url: "https://www.boomlive.in", beat: "Verification" },
      { name: "Alt News", url: "https://www.altnews.in", beat: "Verification" },
      { name: "PIB Fact Check", url: "https://factcheck.pib.gov.in", beat: "Verification" },
      { name: "Reuters Fact Check", url: "https://www.reuters.com/fact-check", beat: "Verification" },
    ],
  ),

  // Siddharth
  ...group(
    { owner: "siddharth", group: "Business & policy", tier: "Analysis", formats: ALL, frequency: "Twice daily", monitor: "Both" },
    [
      { name: "Mint", url: "https://www.livemint.com", beat: "Economy, policy" },
      { name: "Business Standard", url: "https://www.business-standard.com", beat: "Economy, policy" },
      { name: "Financial Express", url: "https://www.financialexpress.com", beat: "Economy, industry" },
      { name: "The Economic Times", url: "https://economictimes.indiatimes.com", beat: "Business, industry" },
      { name: "The Hindu BusinessLine", url: "https://www.thehindubusinessline.com", beat: "Business, agriculture" },
      { name: "The Economist", url: "https://www.economist.com", beat: "Global policy", formats: DEEP, frequency: "Weekly", monitor: "Researcher" },
      { name: "Financial Times", url: "https://www.ft.com", beat: "Global business", frequency: "Daily" },
      { name: "Wall Street Journal", url: "https://www.wsj.com", beat: "Global business", frequency: "Daily" },
    ],
  ),
  ...group(
    { owner: "siddharth", group: "Institutional & think-tank", tier: "Analysis", formats: DEEP, frequency: "Weekly", monitor: "Researcher" },
    [
      { name: "Observer Research Foundation", url: "https://www.orfonline.org", beat: "Strategy, foreign policy" },
      { name: "Carnegie India", url: "https://carnegieindia.org", beat: "Tech, foreign policy" },
      { name: "Takshashila Institution", url: "https://takshashila.org.in", beat: "Public policy, geopolitics" },
      { name: "Gateway House", url: "https://www.gatewayhouse.in", beat: "Foreign policy, trade" },
    ],
  ),
  ...group(
    { owner: "siddharth", group: "Context & history", tier: "Analysis", formats: ALL, frequency: "Daily", monitor: "Both" },
    [
      { name: "ThePrint", url: "https://theprint.in", beat: "Politics, governance" },
      { name: "Indian Express Explained", url: "https://indianexpress.com/section/explained/", beat: "Explainers, chronology", formats: DEEP },
      { name: "Times of India", url: "https://timesofindia.indiatimes.com", beat: "Mainstream framing", monitor: "Tool" },
      { name: "Hindustan Times", url: "https://www.hindustantimes.com", beat: "Mainstream framing", monitor: "Tool" },
      { name: "Swarajya", url: "https://swarajyamag.com", beat: "Opinion", formats: DEEP, monitor: "Researcher", note: "Perspective outlet; read for the argument" },
    ],
  ),

  // Reema
  ...group(
    { owner: "reema", group: "Markets desk", tier: "Analysis", formats: ALL, frequency: "Hourly", monitor: "Tool" },
    [
      { name: "Moneycontrol", url: "https://www.moneycontrol.com", beat: "Markets, personal finance" },
      { name: "CNBC-TV18", url: "https://www.cnbctv18.com", beat: "Markets, corporate" },
      { name: "NDTV Profit", url: "https://www.ndtvprofit.com", beat: "Markets, corporate", note: "Formerly BQ Prime" },
      { name: "Reuters Markets", url: "https://www.reuters.com/markets", beat: "Global markets", frequency: "Live" },
      { name: "Bloomberg Markets", url: "https://www.bloomberg.com/markets", beat: "Global markets", frequency: "Live" },
      { name: "ET Markets", url: "https://economictimes.indiatimes.com/markets", beat: "Markets" },
    ],
  ),
  ...group(
    { owner: "reema", group: "Accountability & investigations", tier: "Analysis", formats: DEEP, frequency: "Daily", monitor: "Both" },
    [
      { name: "The Wire", url: "https://thewire.in", beat: "Politics, governance" },
      { name: "Scroll", url: "https://scroll.in", beat: "Politics, society" },
      { name: "The Caravan", url: "https://caravanmagazine.in", beat: "Long-form investigations", frequency: "Weekly", monitor: "Researcher" },
      { name: "Newslaundry", url: "https://www.newslaundry.com", beat: "Media, politics" },
      { name: "Article 14", url: "https://article-14.com", beat: "Law, civil liberties", monitor: "Researcher" },
      { name: "The Hindu", url: "https://www.thehindu.com", beat: "Courts, investigations", formats: ALL, frequency: "Twice daily" },
      { name: "The Ken", url: "https://the-ken.com", beat: "Business, tech", monitor: "Researcher" },
    ],
  ),
  ...group(
    { owner: "reema", group: "Welfare & social data", tier: "Analysis", formats: DEEP, frequency: "Weekly", monitor: "Researcher" },
    [
      { name: "IndiaSpend", url: "https://www.indiaspend.com", beat: "Data journalism", formats: ALL, frequency: "Daily", monitor: "Both" },
      { name: "PRS Legislative Research", url: "https://prsindia.org", beat: "Legislation", frequency: "Daily", monitor: "Both", note: "Bill tracking" },
      { name: "Vidhi Centre for Legal Policy", url: "https://vidhilegalpolicy.in", beat: "Law, policy" },
      { name: "Internet Freedom Foundation", url: "https://internetfreedom.in", beat: "Digital rights" },
      { name: "State of Working India", url: "https://cse.azimpremjiuniversity.edu.in", beat: "Jobs, wages", frequency: "On release", note: "Azim Premji University" },
    ],
  ),
  ...group(
    { owner: "reema", group: "International comparison", tier: "Analysis", formats: DEEP, frequency: "Daily", monitor: "Tool" },
    [
      { name: "The Guardian", url: "https://www.theguardian.com", beat: "Global, accountability" },
      { name: "BBC", url: "https://www.bbc.com/news", beat: "Global" },
      { name: "Al Jazeera", url: "https://www.aljazeera.com", beat: "Global" },
      { name: "ProPublica", url: "https://www.propublica.org", beat: "Investigations", frequency: "Weekly", monitor: "Researcher" },
    ],
  ),
];

export function sourcesFor(anchor: AnchorId) {
  return sources.filter((s) => s.owner === anchor || s.owner === "shared");
}
