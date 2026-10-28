import avatarImg from '../assets/images/avatar_engineer_deshmukh_1790663097119.jpg';
import gisMapBgImg from '../assets/images/gis_corridor_map_bg_1790663116532.jpg';

export const ASSETS = {
  avatar: avatarImg,
  gisMapBg: gisMapBgImg,
};

export type NavTabId =
  | 'overview'
  | 'live-grid'
  | 'transformers'
  | 'transformer-detail'
  | 'predictions'
  | 'alerts'
  | 'historical-data'
  | 'events-forecasts'
  | 'what-if-simulator'
  | 'zone-intelligence'
  | 'reports'
  | 'settings'
  | 'system-states'
  | 'login';

export interface TransformerNode {
  id: string;
  name: string;
  substation: string;
  location: string;
  zone: 'Mira Road East' | 'Mira Road West' | 'Bhayandar East' | 'Bhayandar West' | 'Kashimira' | 'Uttan';
  feeder: string;
  ratedKva: number;
  voltageKv: number;
  currentLoadKva: number;
  loadRatio: number;
  predictedLoadKva: number;
  predictedLoadRatio: number;
  predictedDeltaPct: number;
  overloadProb: number;
  peakTimeIst: string;
  coreTempC: number;
  tempRiseRate: string;
  phaseVoltageKv: number;
  currentDrawA: number;
  riskScore: number;
  healthIndex: number;
  status: 'Critical' | 'High Risk' | 'Warning' | 'Normal';
  lastUpdated: string;
  surgeEvents7d: number;
  transientFaults7d: number;
  overloadHours7d: number;
  avgLoad7d: number;
  avgTemp7d: number;
  coords: { x: number; y: number };
}

export const INITIAL_TRANSFORMERS: TransformerNode[] = [
  {
    id: 'MB-042',
    name: 'Shanti Park Substation Stn-4',
    substation: 'Shanti Park SS',
    location: 'Mira Road East • Sector 8 Feeder',
    zone: 'Mira Road East',
    feeder: 'Feeder 4A',
    ratedKva: 1000,
    voltageKv: 11,
    currentLoadKva: 914,
    loadRatio: 91.4,
    predictedLoadKva: 968,
    predictedLoadRatio: 96.8,
    predictedDeltaPct: 5.4,
    overloadProb: 87.4,
    peakTimeIst: '18:30',
    coreTempC: 84.2,
    tempRiseRate: '+3.8°C/h',
    phaseVoltageKv: 10.92,
    currentDrawA: 612,
    riskScore: 87,
    healthIndex: 72,
    status: 'Critical',
    lastUpdated: '12s ago',
    surgeEvents7d: 6,
    transientFaults7d: 1,
    overloadHours7d: 4.8,
    avgLoad7d: 78.4,
    avgTemp7d: 73.8,
    coords: { x: 520, y: 310 },
  },
  {
    id: 'MB-118',
    name: 'MIDC Sector C Distribution',
    substation: 'MIDC Sector C',
    location: 'Kashimira Industrial Zone A',
    zone: 'Kashimira',
    feeder: 'Feeder 08',
    ratedKva: 1500,
    voltageKv: 22,
    currentLoadKva: 1323,
    loadRatio: 88.2,
    predictedLoadKva: 1410,
    predictedLoadRatio: 94.0,
    predictedDeltaPct: 5.8,
    overloadProb: 81.2,
    peakTimeIst: '19:15',
    coreTempC: 79.1,
    tempRiseRate: '+2.9°C/h',
    phaseVoltageKv: 21.84,
    currentDrawA: 684,
    riskScore: 84,
    healthIndex: 78,
    status: 'High Risk',
    lastUpdated: '25s ago',
    surgeEvents7d: 4,
    transientFaults7d: 0,
    overloadHours7d: 2.1,
    avgLoad7d: 76.1,
    avgTemp7d: 71.2,
    coords: { x: 700, y: 390 },
  },
  {
    id: 'MB-009',
    name: 'APMC Market Feed Junction',
    substation: 'APMC Market Yard',
    location: 'Bhayandar East Mandi',
    zone: 'Bhayandar East',
    feeder: 'Feeder 02',
    ratedKva: 750,
    voltageKv: 11,
    currentLoadKva: 650,
    loadRatio: 86.7,
    predictedLoadKva: 712,
    predictedLoadRatio: 94.9,
    predictedDeltaPct: 8.2,
    overloadProb: 79.0,
    peakTimeIst: '18:45',
    coreTempC: 81.0,
    tempRiseRate: '+2.4°C/h',
    phaseVoltageKv: 10.88,
    currentDrawA: 498,
    riskScore: 76,
    healthIndex: 81,
    status: 'High Risk',
    lastUpdated: '1m ago',
    surgeEvents7d: 3,
    transientFaults7d: 0,
    overloadHours7d: 1.6,
    avgLoad7d: 74.0,
    avgTemp7d: 69.5,
    coords: { x: 450, y: 170 },
  },
  {
    id: 'MB-073',
    name: 'Sheetal Nagar Cross Secondary',
    substation: 'Sheetal Nagar Hub',
    location: 'Sheetal Nagar Junction',
    zone: 'Mira Road East',
    feeder: 'Feeder 05',
    ratedKva: 1000,
    voltageKv: 11,
    currentLoadKva: 841,
    loadRatio: 84.1,
    predictedLoadKva: 895,
    predictedLoadRatio: 89.5,
    predictedDeltaPct: 5.4,
    overloadProb: 68.4,
    peakTimeIst: '19:30',
    coreTempC: 76.5,
    tempRiseRate: '+0.4°C/h',
    phaseVoltageKv: 10.98,
    currentDrawA: 540,
    riskScore: 68,
    healthIndex: 88,
    status: 'Warning',
    lastUpdated: '40s ago',
    surgeEvents7d: 2,
    transientFaults7d: 0,
    overloadHours7d: 0.0,
    avgLoad7d: 70.2,
    avgTemp7d: 66.4,
    coords: { x: 540, y: 430 },
  },
  {
    id: 'MB-154',
    name: 'Silver Park Domestic Grid',
    substation: 'Silver Park Junction',
    location: 'Silver Park Feeder 2',
    zone: 'Mira Road West',
    feeder: 'Feeder 01',
    ratedKva: 500,
    voltageKv: 11,
    currentLoadKva: 412,
    loadRatio: 82.5,
    predictedLoadKva: 445,
    predictedLoadRatio: 89.0,
    predictedDeltaPct: 6.5,
    overloadProb: 62.1,
    peakTimeIst: '19:40',
    coreTempC: 74.3,
    tempRiseRate: '+0.3°C/h',
    phaseVoltageKv: 11.01,
    currentDrawA: 318,
    riskScore: 62,
    healthIndex: 91,
    status: 'Warning',
    lastUpdated: '2m ago',
    surgeEvents7d: 1,
    transientFaults7d: 0,
    overloadHours7d: 0.0,
    avgLoad7d: 68.5,
    avgTemp7d: 64.2,
    coords: { x: 320, y: 480 },
  },
  {
    id: 'MB-022',
    name: 'Navghar Central Hub',
    substation: 'Navghar Central',
    location: 'Navghar Substation',
    zone: 'Bhayandar East',
    feeder: 'Feeder 04',
    ratedKva: 1000,
    voltageKv: 22,
    currentLoadKva: 710,
    loadRatio: 71.0,
    predictedLoadKva: 730,
    predictedLoadRatio: 73.0,
    predictedDeltaPct: 2.0,
    overloadProb: 24.0,
    peakTimeIst: '18:00',
    coreTempC: 66.8,
    tempRiseRate: '+0.1°C/h',
    phaseVoltageKv: 22.02,
    currentDrawA: 412,
    riskScore: 34,
    healthIndex: 95,
    status: 'Normal',
    lastUpdated: '15s ago',
    surgeEvents7d: 0,
    transientFaults7d: 0,
    overloadHours7d: 0.0,
    avgLoad7d: 61.2,
    avgTemp7d: 59.8,
    coords: { x: 620, y: 260 },
  },
  {
    id: 'MB-088',
    name: 'Uttan Gorai Interface',
    substation: 'Uttan Coastal SS',
    location: 'Uttan Coastal Feeder',
    zone: 'Uttan',
    feeder: 'Feeder F09',
    ratedKva: 500,
    voltageKv: 11,
    currentLoadKva: 310,
    loadRatio: 62.0,
    predictedLoadKva: 325,
    predictedLoadRatio: 65.0,
    predictedDeltaPct: 3.0,
    overloadProb: 15.0,
    peakTimeIst: '20:00',
    coreTempC: 58.2,
    tempRiseRate: '+0.1°C/h',
    phaseVoltageKv: 11.04,
    currentDrawA: 215,
    riskScore: 22,
    healthIndex: 96,
    status: 'Normal',
    lastUpdated: '3m ago',
    surgeEvents7d: 0,
    transientFaults7d: 0,
    overloadHours7d: 0.0,
    avgLoad7d: 54.0,
    avgTemp7d: 55.4,
    coords: { x: 175, y: 160 },
  },
  {
    id: 'MB-191',
    name: 'Beverly Park Complex Stn',
    substation: 'Beverly Park Complex',
    location: 'Beverly Park Commercial',
    zone: 'Mira Road East',
    feeder: 'Feeder 09',
    ratedKva: 1250,
    voltageKv: 11,
    currentLoadKva: 825,
    loadRatio: 66.0,
    predictedLoadKva: 840,
    predictedLoadRatio: 67.2,
    predictedDeltaPct: 1.2,
    overloadProb: 18.2,
    peakTimeIst: '20:15',
    coreTempC: 61.4,
    tempRiseRate: '+0.2°C/h',
    phaseVoltageKv: 11.02,
    currentDrawA: 485,
    riskScore: 28,
    healthIndex: 94,
    status: 'Normal',
    lastUpdated: '30s ago',
    surgeEvents7d: 0,
    transientFaults7d: 0,
    overloadHours7d: 0.0,
    avgLoad7d: 63.1,
    avgTemp7d: 60.2,
    coords: { x: 230, y: 280 },
  },
];

export interface GridAlert {
  id: string;
  incidentId: string;
  assetId: string;
  substation: string;
  feederLocation: string;
  zone: string;
  title: string;
  severity: 'critical' | 'high' | 'warning';
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  timestampIst: string;
  relativeTime: string;
  riskFactor: number;
  evidence: string;
  metricHighlight: string;
  recommendation: string;
  assignedVan?: string;
}

export const INITIAL_ALERTS: GridAlert[] = [
  {
    id: 'alert-1',
    incidentId: 'INC-94821',
    assetId: 'MB-042',
    substation: 'Shanti Park Substation Stn-4',
    feederLocation: 'Mira Road East, Feeder 4A',
    zone: 'Mira Road',
    title: 'Predicted Overload Breach (>95% Operational Threshold)',
    severity: 'critical',
    status: 'new',
    timestampIst: '14:15:22 IST',
    relativeTime: '23m ago',
    riskFactor: 87,
    evidence: 'Sustained active load at 91.4% (914 kVA / 1000 kVA) for >42 mins. Core oil temp 84.2°C (+3.8°C/hr rise).',
    metricHighlight: 'ML Peak Forecast: 96.8% at 18:30 IST',
    recommendation: 'Recommended Action: Shed non-essential feeder branches or dispatch mobile bypass.',
    assignedVan: 'Field Van #03',
  },
  {
    id: 'alert-2',
    incidentId: 'INC-94819',
    assetId: 'MB-118',
    substation: 'Kashimira Industrial Feeder Hub',
    feederLocation: 'Kashimira Zone, 22kV Line',
    zone: 'Kashimira',
    title: 'Severe Phase B Harmonic Distortion (THD-V 6.2%)',
    severity: 'critical',
    status: 'new',
    timestampIst: '14:02:11 IST',
    relativeTime: '36m ago',
    riskFactor: 84,
    evidence: 'Non-linear industrial welding loads exceeding IEEE-519 limits. Feeder voltage unbalance 2.8%, neutral current spike 64 A.',
    metricHighlight: 'Threshold limit: 5.0% max',
    recommendation: 'Automatic active harmonic filter trip detected at 14:01:45 IST.',
    assignedVan: 'Field Van #01',
  },
  {
    id: 'alert-3',
    incidentId: 'INC-94812',
    assetId: 'MB-009',
    substation: 'Bhayandar East Vegetable Mandi',
    feederLocation: 'Station Rd Feeder 1',
    zone: 'Bhayandar East',
    title: 'Rapid Load Gradient Surge (+14.2% in 20 min)',
    severity: 'high',
    status: 'acknowledged',
    acknowledgedBy: 'R. DESHMUKH',
    timestampIst: '13:48:05 IST',
    relativeTime: '50m ago',
    riskFactor: 76,
    evidence: 'Cold storage refrigeration compressor batch activation aligned with local market lighting start. Load at 88.5%.',
    metricHighlight: 'Threshold margin: 6.5% buffer remaining',
    recommendation: 'Assigned technician notified via SMS gateway • En route.',
    assignedVan: 'Field Van #02',
  },
  {
    id: 'alert-4',
    incidentId: 'INC-94801',
    assetId: 'FEEDER-4A',
    substation: 'Mira Road Central 33kV/11kV Primary',
    feederLocation: 'Trunk Line Node #08',
    zone: 'Mira Road',
    title: '33kV/11kV Step-Down Feeder Thermal Ampacity Limit Warning',
    severity: 'high',
    status: 'acknowledged',
    acknowledgedBy: 'R. DESHMUKH',
    timestampIst: '13:25:40 IST',
    relativeTime: '1h 12m ago',
    riskFactor: 74,
    evidence: 'Feeder loading continuously at 92.3% of thermal ampacity (4.8 MW / 5.2 MW continuous rating). Conductor temp 68°C.',
    metricHighlight: 'Rated Capacity: 5.2 MW',
    recommendation: 'Automated load-balancing proposal ready for inter-tie tie-breaker FB-02.',
  },
  {
    id: 'alert-5',
    incidentId: 'INC-94788',
    assetId: 'MB-073',
    substation: 'Sheetal Nagar Junction Distribution',
    feederLocation: 'Mira Road West, Stn-02',
    zone: 'Mira Road',
    title: 'Oil Temperature Approaching Advisory Threshold (76.5°C)',
    severity: 'warning',
    status: 'new',
    timestampIst: '12:50:18 IST',
    relativeTime: '1h 48m ago',
    riskFactor: 62,
    evidence: 'Ambient temp 34.2°C, transformer load steady at 84.1%. Dissipation delta lower than baseline. Radiator fin dusting advised.',
    metricHighlight: 'Advisory trip: 85.0°C',
    recommendation: 'Maintenance schedule: Last inspected 45 days ago.',
  },
  {
    id: 'alert-6',
    incidentId: 'INC-94750',
    assetId: 'MB-154',
    substation: 'Silver Park Sector 4 Substation',
    feederLocation: 'Silver Park Feeder 2',
    zone: 'Mira Road',
    title: 'Neutral Current Displacement (48 A on Neutral Conductor)',
    severity: 'warning',
    status: 'resolved',
    timestampIst: '11:30:02 IST',
    relativeTime: '3h 08m ago',
    riskFactor: 58,
    evidence: 'Single-phase residential load unbalance between Ph-A and Ph-C corrected via dynamic phase selector switch DSS-04.',
    metricHighlight: 'Current: 11 A (Normalized)',
    recommendation: 'Incident closed automatically. Logged to regulatory compliance database.',
  },
];

export interface ReportRecord {
  id: string;
  name: string;
  hash: string;
  type: string;
  icon: string;
  generatedBy: string;
  generatedTime: string;
  period: string;
  sizeFormat: string;
  status: 'Ready' | 'Dispatched' | 'Preview only';
}

export const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: '#REP-8821',
    name: 'Mira-Bhayandar Regional Risk Summary',
    hash: 'SHA-256: 7d9a...4b1f',
    type: 'Regional Summary',
    icon: 'public',
    generatedBy: 'R. Deshmukh',
    generatedTime: 'Today 13:45 IST',
    period: 'Oct 10 - Oct 17, 2024 (7 Days)',
    sizeFormat: '4.2 MB • PDF + CSV',
    status: 'Ready',
  },
  {
    id: '#REP-8819',
    name: 'Transformer MB-042 Thermal & Load Diagnostic',
    hash: 'SHA-256: 3a1c...e890',
    type: 'Transformer Report',
    icon: 'speed',
    generatedBy: 'Auto SCADA Cron',
    generatedTime: 'Today 11:20 IST',
    period: 'Sep 17 - Oct 17, 2024 (30 Days)',
    sizeFormat: '12.8 MB • PDF + Parquet',
    status: 'Ready',
  },
  {
    id: '#REP-8794',
    name: 'Ganesh Chaturthi Procession Feeder 4A Event Plan',
    hash: 'SHA-256: 9e22...c74a',
    type: 'Event Preparedness',
    icon: 'festival',
    generatedBy: 'P. Kadam (Ops Lead)',
    generatedTime: 'Yesterday 18:00 IST',
    period: 'Sept 18 - Sept 28, 2024',
    sizeFormat: '2.1 MB • PDF Dossier',
    status: 'Ready',
  },
  {
    id: '#REP-8761',
    name: 'N-1 Bus-Tie Switch Contingency Simulation',
    hash: 'SHA-256: 4f10...9bb2',
    type: 'What-If Simulation',
    icon: 'schema',
    generatedBy: 'R. Deshmukh',
    generatedTime: '15 Oct 2024 • 16:10 IST',
    period: 'Scenario: MB-042 Trip (Peak +20%)',
    sizeFormat: '6.4 MB • PDF + Raw JSON',
    status: 'Ready',
  },
  {
    id: '#REP-8740',
    name: 'Kashimira Industrial Corridor Harmonic Distortion Audit',
    hash: 'SHA-256: bb08...63ef',
    type: 'Risk Report',
    icon: 'warning',
    generatedBy: 'V. Patil (Audit)',
    generatedTime: '14 Oct 2024 • 09:15 IST',
    period: 'Last 14 Days (Oct 01 - Oct 14)',
    sizeFormat: '8.7 MB • PDF + CSV',
    status: 'Ready',
  },
  {
    id: '#REP-8702',
    name: 'Weekly Grid Reliability & SAIDI/SAIFI Compliance',
    hash: 'SHA-256: 182a...98ff',
    type: 'Regional Summary',
    icon: 'public',
    generatedBy: 'Auto MERC Engine',
    generatedTime: '12 Oct 2024 • 00:05 IST',
    period: 'Weekly Cycle W41 (2024)',
    sizeFormat: '5.1 MB • PDF + Signed XML',
    status: 'Ready',
  },
];
