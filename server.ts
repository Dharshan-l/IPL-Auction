import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { playersData } from './src/data/players.js';
import { Player, ActiveAuctionState, Franchise, PlayerRole, PlayerCountryType } from './src/types.js';
import { GoogleGenAI } from '@google/genai';

const __filename = typeof __filename !== 'undefined' ? __filename : (import.meta.url ? fileURLToPath(import.meta.url) : '');
const __dirname = typeof __dirname !== 'undefined' ? __dirname : (__filename ? path.dirname(__filename) : '');

const PORT = process.env.PORT || 3000;
console.log('----------------------------------------------------');
console.log('Starting IPL Auction Server Initialization...');
console.log('Environment Loaded successfully.');
console.log(`Port Configured: ${PORT}`);
console.log('----------------------------------------------------');

// Setup global error interceptors for resilient Cloud Run startup
process.on('uncaughtException', (err) => {
  console.error('====================================================');
  console.error('CRITICAL UNCAUGHT EXCEPTION ENCOUNTERED:');
  console.error(err);
  console.error('====================================================');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('====================================================');
  console.error('CRITICAL UNHANDLED REJECTION ENCOUNTERED:');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('====================================================');
});
const STATE_FILE_PATH = path.join(process.cwd(), 'auction_state.json');

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Generate commentary from Gemini
async function generateCommentary(prompt: string): Promise<string> {
  const ai = getAI();
  if (!ai) return '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || '';
  } catch (err) {
    console.error('Gemini API Error:', err);
    return '';
  }
}

// Default Franchise data
const defaultFranchises: Record<string, Franchise> = {
  CSK: { name: 'CSK', fullName: 'Chennai Super Kings', logoColor: '#F7D117', textColor: '#000000', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  MI: { name: 'MI', fullName: 'Mumbai Indians', logoColor: '#004BA0', textColor: '#FFFFFF', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  RCB: { name: 'RCB', fullName: 'Royal Challengers Bengaluru', logoColor: '#EC1C24', textColor: '#FFFFFF', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  KKR: { name: 'KKR', fullName: 'Kolkata Knight Riders', logoColor: '#2E0854', textColor: '#F7D117', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  GT: { name: 'GT', fullName: 'Gujarat Titans', logoColor: '#1B254B', textColor: '#D4AF37', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  RR: { name: 'RR', fullName: 'Rajasthan Royals', logoColor: '#EA1A85', textColor: '#FFFFFF', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  SRH: { name: 'SRH', fullName: 'Sunrisers Hyderabad', logoColor: '#FF8225', textColor: '#000000', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  PBKS: { name: 'PBKS', fullName: 'Punjab Kings', logoColor: '#D71920', textColor: '#FFFFFF', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  LSG: { name: 'LSG', fullName: 'Lucknow Super Giants', logoColor: '#0057B8', textColor: '#FFD700', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] },
  DC: { name: 'DC', fullName: 'Delhi Capitals', logoColor: '#000080', textColor: '#FF4500', startingPurseLakhs: 15000, remainingPurseLakhs: 15000, playersBoughtIds: [], overseasCount: 0, indianCount: 0, remainingSlots: 25, starting11PlayerIds: [] }
};

interface FullServerState {
  auction: ActiveAuctionState;
  players: Player[];
}

let state: FullServerState = {
  auction: {
    status: 'idle',
    activePlayerId: null,
    currentBidLakhs: 0,
    highestBidder: null,
    timerSeconds: 30,
    bidHistory: [],
    logs: [
      {
        id: 'init-log',
        type: 'status',
        message: 'Auction system initialized. Welcome to the IPL Live Auction!',
        timestamp: new Date().toISOString()
      }
    ],
    soldPlayers: {},
    unsoldPlayerIds: [],
    activeUsers: {},
    roomCategory: 'category1',
    maxSquadSize: 25,
    totalPurseLakhs: 15000,
    isPrivate: false,
    passcode: '',
    isEnded: false
  },
  players: [...playersData]
};

// Store active franchises inside the nested state
let franchises = { ...defaultFranchises };

// Helper to load state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const fileData = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const loaded = JSON.parse(fileData);
      if (loaded.auction && loaded.players) {
        state = loaded;
        if (!state.auction.roomCategory) {
          state.auction.roomCategory = 'category1';
          state.auction.maxSquadSize = 25;
          state.auction.totalPurseLakhs = 15000;
        }
        if (state.auction.isPrivate === undefined) {
          state.auction.isPrivate = false;
        }
        if (state.auction.passcode === undefined) {
          state.auction.passcode = '';
        }
        if (state.auction.isEnded === undefined) {
          state.auction.isEnded = false;
        }
        if (loaded.franchises) {
          franchises = loaded.franchises;
        }
        // Merge missing players from playersData and synchronize existing player properties
        const existingIds = new Set(state.players.map(p => p.id));
        let addedCount = 0;
        for (const p of playersData) {
          if (!existingIds.has(p.id)) {
            state.players.push(p);
            addedCount++;
          }
        }

        // Auto-migrate and synchronize players with any corrected fields (like cricbuzzId or profileImage) from playersData
        state.players = state.players.map(p => {
          const fresh = playersData.find(fd => fd.id === p.id);
          if (fresh) {
            return {
              ...p,
              profileImage: fresh.profileImage,
              cricbuzzId: fresh.cricbuzzId
            };
          }
          return p;
        });

        if (addedCount > 0) {
          console.log(`Merged ${addedCount} new players from master dataset into existing state.`);
        }
        // Always save state to update existing files with correct properties
        saveState();
        console.log('Auction state successfully recovered from disk.');
      }
    } else {
      saveState();
    }
  } catch (err) {
    console.error('Error loading state from disk, starting fresh:', err);
  }
}

// Helper to save state
function saveState() {
  try {
    const dataToSave = {
      auction: state.auction,
      players: state.players,
      franchises: franchises
    };
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state to disk:', err);
  }
}

loadState();

// SSE SSE Clients list
let sseClients: any[] = [];

// Helper to broadcast state to all SSE clients
function broadcastState() {
  const payload = {
    auction: state.auction,
    franchises: franchises,
    players: state.players
  };
  const eventString = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(eventString);
    } catch (e) {
      // client connection already closed or dead
    }
  });
}

// Log action helper
function addLog(type: 'info' | 'bid' | 'sold' | 'unsold' | 'status' | 'join' | 'leave', message: string) {
  const logEntry = {
    id: Math.random().toString(36).substring(2, 11),
    type,
    message,
    timestamp: new Date().toISOString()
  };
  state.auction.logs.unshift(logEntry);
  if (state.auction.logs.length > 200) {
    state.auction.logs.pop();
  }
}

// Bid timer loop
let timerInterval: NodeJS.Timeout | null = null;
function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (state.auction.status === 'active') {
      if (state.auction.timerSeconds > 0) {
        state.auction.timerSeconds--;
        broadcastState();
      } else {
        // Countdown completed
        handleTimerExpiry();
      }
    }
  }, 1000);
}

// Handle what happens when timer reaches 0
function handleTimerExpiry() {
  const activePlayer = state.players.find(p => p.id === state.auction.activePlayerId);
  if (!activePlayer) return;

  if (state.auction.highestBidder && state.auction.currentBidLakhs > 0) {
    // Sold!
    const buyer = state.auction.highestBidder;
    const finalPrice = state.auction.currentBidLakhs;

    state.auction.soldPlayers[activePlayer.id] = {
      franchise: buyer,
      priceLakhs: finalPrice
    };

    // Update franchise
    const f = franchises[buyer];
    if (f) {
      f.playersBoughtIds.push(activePlayer.id);
      f.remainingPurseLakhs -= finalPrice;
      if (activePlayer.countryType === PlayerCountryType.Overseas) {
        f.overseasCount++;
      } else {
        f.indianCount++;
      }
      f.remainingSlots = (state.auction.maxSquadSize || 25) - f.playersBoughtIds.length;
    }

    addLog('sold', `SOLD! ${activePlayer.name} is acquired by ${buyer} for ₹${formatPrice(finalPrice)}.`);
    
    // Trigger AI commentary for the sale asynchronously
    triggerAiCommentary(`Write a high-energy, exciting cricket auctioneer announcement celebrating ${activePlayer.name} being sold to ${buyer} for ₹${formatPrice(finalPrice)}. Keep it brief (under 50 words) and authentic to IPL style.`);
    
  } else {
    // Unsold
    state.auction.unsoldPlayerIds.push(activePlayer.id);
    addLog('unsold', `${activePlayer.name} goes UNSOLD at a base price of ₹${formatPrice(activePlayer.basePriceLakhs)}.`);
    
    // Trigger AI commentary for unsold
    triggerAiCommentary(`Write a quick auctioneer commentary summarizing that ${activePlayer.name} has gone unsold at their base price of ₹${formatPrice(activePlayer.basePriceLakhs)}. Keep it professional and short (under 40 words).`);
  }

  // Set auction to idle
  state.auction.status = 'idle';
  state.auction.activePlayerId = null;
  state.auction.currentBidLakhs = 0;
  state.auction.highestBidder = null;
  state.auction.timerSeconds = 30;
  state.auction.bidHistory = [];

  saveState();
  broadcastState();
}

async function triggerAiCommentary(prompt: string) {
  const commentary = await generateCommentary(prompt);
  if (commentary) {
    addLog('info', `[AI Auctioneer Commentary]: "${commentary}"`);
    saveState();
    broadcastState();
  }
}

// Bidding utilities
function formatPrice(lakhs: number): string {
  if (lakhs >= 100) {
    return `${(lakhs / 100).toFixed(2)} Crore`;
  }
  return `${lakhs} Lakh`;
}

function getNextMinimumBid(currentBid: number, basePrice: number): number {
  if (currentBid === 0) return basePrice;
  if (currentBid < 50) return currentBid + 5;
  if (currentBid < 100) return currentBid + 10;
  if (currentBid < 200) return currentBid + 20;
  return currentBid + 50;
}

// Initialise timer loop if active
if (state.auction.status === 'active') {
  startTimerLoop();
}

const app = express();
app.use(express.json());

// Server outbound network status monitoring to avoid slow blocking fetches
let serverIsOffline = false;
let lastOfflineCheck = 0;

// Hand-curated mapping of player IDs to their real Cricbuzz Player IDs to deliver authentic high-quality official photos
const REAL_CRICBUZZ_IDS: Record<string, number> = {
  'virat-kohli': 1413,
  'rohit-sharma': 576,
  'ms-dhoni': 265,
  'jasprit-bumrah': 9311,
  'rishabh-pant': 10744,
  'kl-rahul': 8733,
  'hardik-pandya': 9630,
  'shubman-gill': 11813,
  'shreyas-iyer': 9428,
  'suryakumar-yadav': 11803,
  'sanju-samson': 8271,
  'ravindra-jadeja': 587,
  'yuzvendra-chahal': 7910,
  'arshdeep-singh': 13217,
  'mohammed-shami': 7909,
  'mohammed-siraj': 10808,
  'ishan-kishan': 10276,
  'rinku-singh': 10892,
  'axar-patel': 8808,
  'yashasvi-jaiswal': 13548,
  'tilak-varma': 14344,
  'travis-head': 8497,
  'pat-cummins': 7905,
  'mitchell-starc': 7906,
  'heinrich-klaasen': 8190,
  'nicholas-pooran': 9158,
  'glenn-maxwell': 1768,
  'faf-du-plessis': 1842,
  'sunil-narine': 2303,
  'rashid-khan': 10726,
  'devon-conway': 11802,
  'quinton-de-kock': 8422,
  'liam-livingstone': 10237,
  'jos-buttler': 1847,
  'david-warner': 1739,
  'mitchell-marsh': 2161,
  'marcus-stoinis': 8444,
  'sam-curran': 11210,
  'trent-boult': 1850,
  'kagiso-rabada': 9581,
  'jofra-archer': 10926,
  'lockie-ferguson': 11075,
  'josh-hazlewood': 7915,
  'naveen-ul-haq': 10866,
  'matheesha-pathirana': 15391,
  'maheesh-theekshana': 14251,
  'phil-salt': 10543,
  'tim-david': 13054,
  'dewald-brevis': 14798,
  'tristan-stubbs': 14782,
  'will-jacks': 13257,
  'harshal-patel': 7912,
  'harshit-rana': 14603,
  'mayank-yadav': 14800,
  'nitish-kumar-reddy': 13410,
  'dhruv-jurel': 13444,
  'sai-sudharsan': 14346,
  'prabhsimran-singh': 13445,
  'shashank-singh': 11151,
  'ashutosh-sharma': 12258,
  'venkatesh-iyer': 11111,
  'shivam-dube': 11114,
  'shreyas-gopal': 9421,
  'deepak-chahar': 9848,
  't-natarajan': 10893,
  'sandeep-sharma': 7916,
  'piyush-chawla': 534,
  'bhuvneshwar-kumar': 1726,
  'ajinkya-rahane': 1447,
  'shikhar-dhawan': 1446,
  'dinesh-karthik': 264,
  'ravichandran-ashwin': 1593,
  'krunal-pandya': 11307,
  'devdutt-padikkal': 11815,
  'manish-pandey': 1594,
  'vijay-shankar': 8180,
  'mohit-sharma': 7911,
  'imran-tahir': 1607,
  'kieron-pollard': 1658,
  'dwayne-bravo': 1666,
  'kane-williamson': 1854,
  'steve-smith': 2250,
  'wriddhiman-saha': 1450,
  'abhishek-sharma': 12242,
  'ayush-badoni': 13406,
  'abdul-samad': 13192,
  'aiden-markram': 9429,
  'anrich-nortje': 10544,
  'avesh-khan': 10264,
  'nitish-rana': 10271,
  'mukesh-kumar': 14197,
  'khaleel-ahmed': 10277,
  'kuldeep-yadav': 9423,
  'prithvi-shaw': 11812,
  'washington-sundar': 10894,
  'rahul-chahar': 10895,
  'rahul-tewatia': 9633,
  'r-sai-kishore': 11112,
  'varun-chakravarthy': 11113,
  'shahrukh-khan': 11115,
  'harpreet-brar': 11152,
  'vaibhav-arora': 14604,
  'suyash-sharma': 14912,
  'nehal-wadhera': 14913,
  'spencer-johnson': 14252,
  'joshua-little': 11116,
  'gerald-coetzee': 13411,
  'nuwan-thushara': 14253,
  'sameer-rizvi': 14347,
  'kumar-kushagra': 14348,
  'nandre-burger': 13412,
  'kwena-maphaka': 15392,
  'luke-wood': 10545,
  'noor-ahmad': 14252,
  'ramandeep-singh': 14350,
  'rasikh-dar': 13446,
  'angkrish-raghuvanshi': 15394
};

// API: Proxy Cricbuzz player photo to bypass browser hotlinking/CORS protection, with professional fallback badge generator
app.get('/api/player-photo/:playerIdOrCricbuzzId', async (req, res) => {
  try {
    const { playerIdOrCricbuzzId } = req.params;
    let cricbuzzId: number | null = null;
    let playerName = 'Cricket Player';
    let playerRole = 'Player';
    let playerCountry = 'India';

    // First check if the playerIdOrCricbuzzId matches a hand-curated real ID
    if (playerIdOrCricbuzzId && REAL_CRICBUZZ_IDS[playerIdOrCricbuzzId]) {
      cricbuzzId = REAL_CRICBUZZ_IDS[playerIdOrCricbuzzId];
    }

    if (playerIdOrCricbuzzId && !isNaN(Number(playerIdOrCricbuzzId))) {
      // If we are given a numeric ID directly
      if (!cricbuzzId) {
        cricbuzzId = Number(playerIdOrCricbuzzId);
      }
      // Try to find matching player in state to populate metadata for badge
      const player = state.players.find(p => p.cricbuzzId === cricbuzzId || p.id === playerIdOrCricbuzzId);
      if (player) {
        playerName = player.name;
        playerRole = player.role || 'Player';
        playerCountry = player.country || 'India';
      }
    } else if (playerIdOrCricbuzzId) {
      // Find player by ID string
      const player = state.players.find(p => p.id === playerIdOrCricbuzzId);
      if (player) {
        if (!cricbuzzId) {
          cricbuzzId = REAL_CRICBUZZ_IDS[player.id] || player.cricbuzzId || null;
        }
        playerName = player.name;
        playerRole = player.role || 'Player';
        playerCountry = player.country || 'India';
      } else {
        // Fallback initials if player not found
        playerName = playerIdOrCricbuzzId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }

    // Helper to generate a beautiful, premium vector player badge SVG
    const sendCustomBadge = () => {
      // Get initials
      const initials = playerName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      // Determine colors based on player country/role to make them feel highly personalized and unique!
      let primaryColor = '#f59e0b'; // Gold
      let secondaryColor = '#10b981'; // Emerald
      let bgGradientStart = '#0f172a'; // Deep Navy
      let bgGradientEnd = '#020617'; // Rich Black

      if (playerCountry === 'India') {
        primaryColor = '#3b82f6'; // Royal Blue
        secondaryColor = '#f97316'; // Saffron
      } else if (playerCountry === 'Australia') {
        primaryColor = '#fbbf24'; // Canary Gold
        secondaryColor = '#15803d'; // Forest Green
      } else if (playerCountry === 'England') {
        primaryColor = '#ef4444'; // Red
        secondaryColor = '#1e3a8a'; // English Navy
      } else if (playerCountry === 'South Africa') {
        primaryColor = '#16a34a'; // Proteas Green
        secondaryColor = '#fbbf24'; // Gold
      } else if (playerCountry === 'West Indies') {
        primaryColor = '#9d174d'; // Maroon
        secondaryColor = '#f59e0b'; // Gold
      } else if (playerCountry === 'Sri Lanka') {
        primaryColor = '#2563eb'; // Lion Blue
        secondaryColor = '#fbbf24'; // Yellow
      } else if (playerCountry === 'Afghanistan') {
        primaryColor = '#2563eb'; // Blue
        secondaryColor = '#ef4444'; // Red
      } else if (playerCountry === 'New Zealand') {
        primaryColor = '#e2e8f0'; // Silver/White
        secondaryColor = '#1e293b'; // Slate Black
      }

      const badgeSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${bgGradientStart}" />
              <stop offset="100%" stop-color="${bgGradientEnd}" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.15" />
              <stop offset="100%" stop-color="${bgGradientEnd}" stop-opacity="0" />
            </radialGradient>
          </defs>
          
          <!-- Background -->
          <rect width="150" height="150" rx="20" fill="url(#bgGrad)" />
          <circle cx="75" cy="75" r="60" fill="url(#glow)" />
          
          <!-- Decorative concentric circular frames -->
          <circle cx="75" cy="75" r="50" fill="none" stroke="${primaryColor}" stroke-opacity="0.1" stroke-width="6" />
          <circle cx="75" cy="75" r="48" fill="none" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="1.5" />
          <circle cx="75" cy="75" r="42" fill="none" stroke="${secondaryColor}" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="4 2" />
          
          <!-- Player Initials in stylized, super high-contrast Display typography -->
          <text x="75" y="82" font-family="'Inter', system-ui, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1.5">
            ${initials}
          </text>
          
          <!-- Miniature Player Jersey illustration at bottom of circle -->
          <path d="M 60,115 L 90,115 L 85,100 L 65,100 Z" fill="${primaryColor}" opacity="0.3" />
          
          <!-- Country Badge & Role label -->
          <rect x="25" y="112" width="100" height="14" rx="4" fill="${bgGradientStart}" stroke="${primaryColor}" stroke-width="1" />
          <text x="75" y="122" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="${primaryColor}" text-anchor="middle" letter-spacing="1">
            ${playerRole.toUpperCase()}
          </text>

          <!-- Top golden stars/crest representing premium/verified status -->
          <g transform="translate(63, 16) scale(0.5)">
            <path d="M 12,2 L 15,9 L 22,9 L 17,14 L 19,21 L 12,17 L 5,21 L 7,14 L 2,9 L 9,9 Z" fill="${primaryColor}" />
          </g>
          <g transform="translate(75, 12) scale(0.6)">
            <path d="M 12,2 L 15,9 L 22,9 L 17,14 L 19,21 L 12,17 L 5,21 L 7,14 L 2,9 L 9,9 Z" fill="${secondaryColor}" />
          </g>
          <g transform="translate(87, 16) scale(0.5)">
            <path d="M 12,2 L 15,9 L 22,9 L 17,14 L 19,21 L 12,17 L 5,21 L 7,14 L 2,9 L 9,9 Z" fill="${primaryColor}" />
          </g>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(badgeSvg);
    };

    // Check if the badge fallback is forced
    const isBadgeForced = req.query.badge === 'true' || req.query.fallback === 'true';

    if (isBadgeForced) {
      return sendCustomBadge();
    }

    if (cricbuzzId) {
      // Fetch the photo server-side through a high-performance proxy.
      // This completely avoids any CORS, sandbox iframe limitations, or browser redirect security policies.
      const cricbuzzUrl = `https://www.cricbuzz.com/a/img/v1/150x150/i1/c${cricbuzzId}/player.jpg`;
      const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cricbuzzUrl)}`;
      
      try {
        const fetchResponse = await fetch(proxiedUrl, { signal: AbortSignal.timeout(4000) });
        if (fetchResponse.ok) {
          const buffer = await fetchResponse.arrayBuffer();
          const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(Buffer.from(buffer));
        } else {
          console.warn(`Proxy fetch failed with status ${fetchResponse.status} for player ID ${playerIdOrCricbuzzId} (cricbuzz ID ${cricbuzzId})`);
        }
      } catch (fetchErr) {
        console.error(`Error server-side fetching photo for ${playerIdOrCricbuzzId}:`, fetchErr);
      }
    }

    // Otherwise, generate the premium player badge!
    return sendCustomBadge();

  } catch (err) {
    console.error('Error proxying player image:', err);
    // Ultimate fallback is always a dynamic initials badge
    const playerName = req.params.playerIdOrCricbuzzId ? req.params.playerIdOrCricbuzzId.split('-').join(' ') : 'Cricket Player';
    const initials = playerName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const fallbackSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">
        <rect width="150" height="150" rx="20" fill="#0f172a" />
        <circle cx="75" cy="75" r="50" fill="none" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2" />
        <text x="75" y="85" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(fallbackSvg);
  }
});

// API: Get Full State
app.get('/api/auction/state', (req, res) => {
  res.json({
    auction: state.auction,
    franchises: franchises,
    players: state.players
  });
});

// API: SSE Stream
app.get('/api/auction/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n');

  sseClients.push(res);

  // Send initial state immediately
  const payload = {
    auction: state.auction,
    franchises: franchises,
    players: state.players
  };
  res.write(`data: ${JSON.stringify(payload)}\n\n`);

  // Heartbeat to prevent timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      // connection died
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c !== res);
  });
});

// API: Join Room
app.post('/api/auction/join', (req, res) => {
  const { role, username, passcode } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  // Check if room has ended
  if (state.auction.isEnded && role !== 'auctioneer') {
    return res.status(403).json({ error: 'This Auction Room has been ended by the Auctioneer.' });
  }

  // Check passcode if private room
  if (state.auction.isPrivate && state.auction.passcode && role !== 'auctioneer') {
    if (passcode !== state.auction.passcode) {
      return res.status(401).json({ error: 'Incorrect passcode for this private Auction Room' });
    }
  }

  const userId = Math.random().toString(36).substring(2, 11);
  state.auction.activeUsers[userId] = {
    role,
    lastSeen: new Date().toISOString()
  };

  const displayName = role === 'auctioneer' ? 'Auctioneer (Admin)' : role;
  addLog('join', `${username || 'Someone'} joined the session as ${displayName}.`);
  saveState();
  broadcastState();

  res.json({ userId, role, status: 'success' });
});

// API: Team Owner Bidding
app.post('/api/auction/bid', (req, res) => {
  const { franchiseName, bidAmountLakhs } = req.body;

  if (state.auction.isEnded) {
    return res.status(400).json({ error: 'Bidding rejected: The Auction Room has been ended' });
  }

  if (state.auction.status !== 'active') {
    return res.status(400).json({ error: 'Auction is not currently active' });
  }

  const activePlayer = state.players.find(p => p.id === state.auction.activePlayerId);
  if (!activePlayer) {
    return res.status(400).json({ error: 'No active player selected' });
  }

  const team = franchises[franchiseName];
  if (!team) {
    return res.status(404).json({ error: 'Franchise not found' });
  }

  // Prevents: Squad limit
  const maxSquadSize = state.auction.maxSquadSize || 25;
  if (team.playersBoughtIds.length >= maxSquadSize) {
    return res.status(400).json({ error: `Bidding rejected: Your squad is already full (max ${maxSquadSize} players)` });
  }

  // Prevents: Overseas limit
  if (activePlayer.countryType === PlayerCountryType.Overseas && team.overseasCount >= 8) {
    return res.status(400).json({ error: 'Bidding rejected: Your overseas slots are full (max 8)' });
  }

  // Minimum required bid calculations
  const minRequiredBid = getNextMinimumBid(state.auction.currentBidLakhs, activePlayer.basePriceLakhs);
  const finalBid = bidAmountLakhs || minRequiredBid;

  if (finalBid < minRequiredBid) {
    return res.status(400).json({ error: `Bid must be at least ₹${formatPrice(minRequiredBid)}` });
  }

  // Prevents: Purse insufficient
  if (finalBid > team.remainingPurseLakhs) {
    return res.status(400).json({ error: `Bidding rejected: Insufficient purse. Remaining purse is ₹${formatPrice(team.remainingPurseLakhs)}` });
  }

  // Cannot bid if you are already the highest bidder
  if (state.auction.highestBidder === franchiseName) {
    return res.status(400).json({ error: 'You are already the highest bidder' });
  }

  // Place the bid!
  const bidId = Math.random().toString(36).substring(2, 11);
  const bidEntry = {
    id: bidId,
    franchise: franchiseName,
    amountLakhs: finalBid,
    timestamp: new Date().toISOString()
  };

  state.auction.bidHistory.unshift(bidEntry);
  state.auction.highestBidder = franchiseName;
  state.auction.currentBidLakhs = finalBid;
  state.auction.timerSeconds = 30; // Reset countdown to 30s on fresh bids

  addLog('bid', `${franchiseName} bids ₹${formatPrice(finalBid)} for ${activePlayer.name}.`);
  saveState();
  broadcastState();

  res.json({ success: true, state: state.auction });
});

// API: Team Owner Passes (Optional Log action)
app.post('/api/auction/pass', (req, res) => {
  const { franchiseName } = req.body;
  const activePlayer = state.players.find(p => p.id === state.auction.activePlayerId);
  if (!activePlayer) {
    return res.status(400).json({ error: 'No active player up for auction' });
  }
  
  addLog('info', `${franchiseName} decides to PASS on ${activePlayer.name}.`);
  broadcastState();
  res.json({ success: true });
});

// Helper to generate a 6-character unique uppercase alphanumeric passcode
function generateServerPasscode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// API: Auctioneer Actions (Admin Panels)
app.post('/api/auction/admin/action', async (req, res) => {
  const { action, playerId, customIncrement, category, isPrivate, passcode } = req.body;

  if (action === 'start') {
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required to start' });
    }
    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Clean up previous sale / unsold records to support re-releasing players safely at any time
    if (state.auction.soldPlayers[playerId]) {
      const sale = state.auction.soldPlayers[playerId];
      const previousBuyer = sale.franchise;
      const soldPrice = sale.priceLakhs;
      
      const f = franchises[previousBuyer];
      if (f) {
        f.playersBoughtIds = f.playersBoughtIds.filter(id => id !== playerId);
        f.remainingPurseLakhs += soldPrice;
        if (player.countryType === PlayerCountryType.Overseas) {
          f.overseasCount = Math.max(0, f.overseasCount - 1);
        } else {
          f.indianCount = Math.max(0, f.indianCount - 1);
        }
        f.remainingSlots = (state.auction.maxSquadSize || 25) - f.playersBoughtIds.length;
      }
      delete state.auction.soldPlayers[playerId];
    }

    state.auction.unsoldPlayerIds = state.auction.unsoldPlayerIds.filter(id => id !== playerId);

    state.auction.status = 'active';
    state.auction.activePlayerId = playerId;
    state.auction.currentBidLakhs = 0;
    state.auction.highestBidder = null;
    state.auction.timerSeconds = 30;
    state.auction.bidHistory = [];

    addLog('status', `Auctioneer has released ${player.name} into the bidding war! (Base Price: ₹${formatPrice(player.basePriceLakhs)}).`);
    
    // AI Player profile summary
    triggerAiCommentary(`Provide a high-energy, exciting 1-2 sentence profile of ${player.name} as he comes up in the IPL Auction. Mention his previous team ${player.previousTeam}, role ${player.role}, country ${player.country}, batting/bowling style, and highlight how useful he could be to team owners. Keep it short.`);

    startTimerLoop();
  } 
  else if (action === 'pause') {
    state.auction.status = 'paused';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    addLog('status', 'Auction has been PAUSED by the Auctioneer.');
  } 
  else if (action === 'resume') {
    state.auction.status = 'active';
    addLog('status', 'Auction has been RESUMED by the Auctioneer.');
    startTimerLoop();
  } 
  else if (action === 'mark_sold') {
    if (state.auction.status !== 'active' && state.auction.status !== 'paused') {
      return res.status(400).json({ error: 'No auction is running' });
    }
    handleTimerExpiry();
  } 
  else if (action === 'mark_unsold') {
    if (state.auction.status !== 'active' && state.auction.status !== 'paused') {
      return res.status(400).json({ error: 'No auction is running' });
    }
    // Force unsold regardless of bids
    const activePlayer = state.players.find(p => p.id === state.auction.activePlayerId);
    if (activePlayer) {
      state.auction.unsoldPlayerIds.push(activePlayer.id);
      addLog('unsold', `Forced UNSOLD: ${activePlayer.name} has been marked unsold by the Auctioneer.`);
    }

    state.auction.status = 'idle';
    state.auction.activePlayerId = null;
    state.auction.currentBidLakhs = 0;
    state.auction.highestBidder = null;
    state.auction.timerSeconds = 30;
    state.auction.bidHistory = [];

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  } 
  else if (action === 'create_room') {
    const selectedCategory = category || req.body.category;
    const selectedIsPrivate = isPrivate !== undefined ? !!isPrivate : !!req.body.isPrivate;
    // Automatically generate passcode if isPrivate is requested
    const finalPasscode = selectedIsPrivate ? (passcode || req.body.passcode || generateServerPasscode()) : '';

    if (!selectedCategory || !['category1', 'category2', 'category3'].includes(selectedCategory)) {
      return res.status(400).json({ error: 'Invalid room category selected.' });
    }

    const catDetails = {
      category1: { maxSquadSize: 25, totalPurseLakhs: 15000 },
      category2: { maxSquadSize: 20, totalPurseLakhs: 13500 },
      category3: { maxSquadSize: 15, totalPurseLakhs: 12000 }
    }[selectedCategory as 'category1' | 'category2' | 'category3'];

    state.auction = {
      status: 'idle',
      activePlayerId: null,
      currentBidLakhs: 0,
      highestBidder: null,
      timerSeconds: 30,
      bidHistory: [],
      logs: [
        {
          id: 'create-room-log',
          type: 'status',
          message: `Auction room recreated with ${selectedCategory === 'category1' ? 'Category 1' : selectedCategory === 'category2' ? 'Category 2' : 'Category 3'} rules: Squad Size = ${catDetails.maxSquadSize} Players, Purse = ₹${catDetails.totalPurseLakhs / 100} Crore. Room is ${selectedIsPrivate ? 'Private' : 'Public'}.`,
          timestamp: new Date().toISOString()
        }
      ],
      soldPlayers: {},
      unsoldPlayerIds: [],
      activeUsers: {},
      roomCategory: selectedCategory as any,
      maxSquadSize: catDetails.maxSquadSize,
      totalPurseLakhs: catDetails.totalPurseLakhs,
      isPrivate: selectedIsPrivate,
      passcode: finalPasscode,
      isEnded: false
    };
    
    state.players = JSON.parse(JSON.stringify(playersData)); // Deep copy clone of fresh player list
    
    // Reinitialize franchises with this specific category's purse & squad size
    const updatedFranchises: Record<string, Franchise> = {};
    Object.keys(defaultFranchises).forEach(key => {
      const defF = defaultFranchises[key];
      updatedFranchises[key] = {
        ...defF,
        startingPurseLakhs: catDetails.totalPurseLakhs,
        remainingPurseLakhs: catDetails.totalPurseLakhs,
        playersBoughtIds: [],
        overseasCount: 0,
        indianCount: 0,
        remainingSlots: catDetails.maxSquadSize,
        starting11PlayerIds: []
      };
    });
    franchises = updatedFranchises;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    addLog('status', `Auction room initialized as ${selectedCategory === 'category1' ? 'Category 1' : selectedCategory === 'category2' ? 'Category 2' : 'Category 3'}. Every team has been assigned ₹${catDetails.totalPurseLakhs / 100} Crore purse, max squad limit of ${catDetails.maxSquadSize}, and visibility is set to ${selectedIsPrivate ? 'Private' : 'Public'}.`);
  }
  else if (action === 'end_room') {
    state.auction.isEnded = true;
    state.auction.status = 'completed';
    state.auction.activePlayerId = null;
    state.auction.currentBidLakhs = 0;
    state.auction.highestBidder = null;
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    addLog('status', 'The Auction Room has been officially ENDED by the Auctioneer. All bidding has stopped.');
  }
  else if (action === 'reset') {
    // Hard reset of entire state preserving current room rules
    const currentCategory = state.auction.roomCategory || 'category1';
    const currentMaxSquadSize = state.auction.maxSquadSize || 25;
    const currentTotalPurseLakhs = state.auction.totalPurseLakhs || 15000;
    const currentIsPrivate = state.auction.isPrivate || false;
    // Always generate a fresh secure passcode on reset if it's private to satisfy "generate each and every time, every unique code"
    const currentPasscode = currentIsPrivate ? generateServerPasscode() : '';

    state.auction = {
      status: 'idle',
      activePlayerId: null,
      currentBidLakhs: 0,
      highestBidder: null,
      timerSeconds: 30,
      bidHistory: [],
      logs: [
        {
          id: 'reset-log',
          type: 'status',
          message: 'Auction room has been reset by the Auctioneer. Bidding history cleared.',
          timestamp: new Date().toISOString()
        }
      ],
      soldPlayers: {},
      unsoldPlayerIds: [],
      activeUsers: {},
      roomCategory: currentCategory as any,
      maxSquadSize: currentMaxSquadSize,
      totalPurseLakhs: currentTotalPurseLakhs,
      isPrivate: currentIsPrivate,
      passcode: currentPasscode,
      isEnded: false
    };
    state.players = JSON.parse(JSON.stringify(playersData)); // Deep copy clone of fresh player list
    
    // Reinitialize franchises with this specific category's purse & squad size
    const updatedFranchises: Record<string, Franchise> = {};
    Object.keys(defaultFranchises).forEach(key => {
      const defF = defaultFranchises[key];
      updatedFranchises[key] = {
        ...defF,
        startingPurseLakhs: currentTotalPurseLakhs,
        remainingPurseLakhs: currentTotalPurseLakhs,
        playersBoughtIds: [],
        overseasCount: 0,
        indianCount: 0,
        remainingSlots: currentMaxSquadSize,
        starting11PlayerIds: []
      };
    });
    franchises = updatedFranchises;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    addLog('status', 'Auctioneer has reset the IPL Auction room. All budgets and rosters are restored.');
  }

  saveState();
  broadcastState();
  res.json({ success: true, state: state.auction, franchises });
});

// API: Register Custom Player (Master List expand)
app.post('/api/players/add', (req, res) => {
  const { name, country, countryType, role, battingStyle, bowlingStyle, previousTeam, basePriceLakhs, age, stats, seasons } = req.body;

  if (!name || !country || !role || !basePriceLakhs || !age) {
    return res.status(400).json({ error: 'Missing required player attributes' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (state.players.some(p => p.id === id)) {
    return res.status(400).json({ error: 'Player with a very similar name already exists' });
  }

  const newPlayer: Player = {
    id,
    name,
    country,
    countryType: countryType || PlayerCountryType.Indian,
    role: role as PlayerRole,
    battingStyle: battingStyle || 'Right-handed',
    bowlingStyle: bowlingStyle || 'None',
    previousTeam: previousTeam || 'None',
    basePriceLakhs: Number(basePriceLakhs),
    status: 'Active' as any,
    age: Number(age),
    profileImage: 'https://images.unsplash.com/photo-1540747737956-37872404428a?w=150&h=150&fit=crop&q=80',
    stats: stats || { matches: 0, runs: 0, wickets: 0, average: 0, strikeRate: 0 },
    seasons: seasons || [2026]
  };

  state.players.push(newPlayer);
  addLog('status', `New custom player added to master list: ${name} (₹${formatPrice(Number(basePriceLakhs))} Base).`);
  saveState();
  broadcastState();

  res.json({ success: true, player: newPlayer });
});

// API: Update Franchise Starting XI
app.post('/api/franchises/:franchiseName/starting11', (req, res) => {
  const { franchiseName } = req.params;
  const { starting11PlayerIds } = req.body;

  if (!Array.isArray(starting11PlayerIds)) {
    return res.status(400).json({ error: 'starting11PlayerIds must be an array of player IDs' });
  }

  const team = franchises[franchiseName];
  if (!team) {
    return res.status(404).json({ error: 'Franchise not found' });
  }

  // Validate that all starting 11 player IDs are indeed bought by this team
  const boughtSet = new Set(team.playersBoughtIds);
  const invalidIds = starting11PlayerIds.filter(id => !boughtSet.has(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({ error: `Cannot add players to Starting XI who are not bought by this franchise: ${invalidIds.join(', ')}` });
  }

  if (starting11PlayerIds.length > 11) {
    return res.status(400).json({ error: 'Starting XI cannot exceed 11 players' });
  }

  team.starting11PlayerIds = starting11PlayerIds;
  saveState();
  broadcastState();

  res.json({ success: true, franchise: team });
});

// API: AI-driven Squad & Winner Analysis
app.post('/api/auction/ai-analysis', async (req, res) => {
  const ai = getAI();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini API is not configured or available. Please provide GEMINI_API_KEY.' });
  }

  try {
    // Build context
    let contextStr = 'Here is the detailed squad and Starting 11 data for all 10 IPL Franchises:\n\n';

    Object.values(franchises).forEach(f => {
      const spent = f.startingPurseLakhs - f.remainingPurseLakhs;
      contextStr += `### Franchise: ${f.fullName} (${f.name})\n`;
      contextStr += `- Purse Spent: ₹${(spent / 100).toFixed(2)} Crore, Remaining Purse: ₹${(f.remainingPurseLakhs / 100).toFixed(2)} Crore\n`;
      contextStr += `- Total Players Bought: ${f.playersBoughtIds.length} (Indian: ${f.indianCount}, Overseas: ${f.overseasCount})\n`;
      
      const boughtList = f.playersBoughtIds.map(id => state.players.find(p => p.id === id)).filter(Boolean) as Player[];
      const starting11List = (f.starting11PlayerIds || []).map(id => state.players.find(p => p.id === id)).filter(Boolean) as Player[];

      contextStr += `- Full Squad Roster:\n`;
      if (boughtList.length === 0) {
        contextStr += `  * No players bought yet.\n`;
      } else {
        boughtList.forEach(p => {
          contextStr += `  * ${p.name} (${p.role} | ${p.countryType} | Age: ${p.age} | Matches: ${p.stats.matches}, Runs: ${p.stats.runs}, Wickets: ${p.stats.wickets}, SR: ${p.stats.strikeRate})\n`;
        });
      }

      contextStr += `- Designated Starting XI:\n`;
      if (starting11List.length === 0) {
        contextStr += `  * No Starting XI designated yet (the franchise hasn't locked their playing 11).\n`;
      } else {
        starting11List.forEach(p => {
          contextStr += `  * [XI] ${p.name} (${p.role} | ${p.countryType} | Batting: ${p.battingStyle} | Bowling: ${p.bowlingStyle})\n`;
        });
      }
      contextStr += '\n';
    });

    const prompt = `
You are an elite, world-class IPL Cricket Analyst, strategist, and professional sports commentator.
You have been hired to analyze the final squads and designated Starting XI of the IPL franchises and declare the WINNING team of the tournament based on deep AI-driven simulation and performance analysis.

${contextStr}

Please generate a comprehensive, highly professional, exciting tournament analysis report.
Do not use generic hardcoded formulas or heuristics; instead, leverage your deep cricketing knowledge to evaluate:
1. Team Balance: Wicketkeeper presence, opening batsmen quality, depth of all-rounders, spin vs. pace variations, and death-bowling reliability in the Starting XI.
2. Overseas Cap Compliance: Highlight if any Starting XI incorrectly contains more than 4 overseas players (in IPL, a maximum of 4 overseas players is allowed in the playing XI).
3. Strengths & Weaknesses: Provide a rapid, high-impact breakdown of key franchises.
4. Final Tournament Power Rankings: A formatted ranking table from Rank 1 to Rank 10.
5. Champion Declaration: Explicitly name the single Winning Team (the Champion) and provide an in-depth breakdown of WHY they win (e.g., tactical match-ups, home-ground advantage adaptation, batting depth, core leader/captain).

Format the output in clean, eye-catching, professional Markdown with headers, bold terms, bullet points, and high-energy sports writing. Keep it concise, engaging, and professional.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const markdownText = response.text?.trim() || 'Failed to generate analysis.';
    res.json({ success: true, analysis: markdownText });

  } catch (err: any) {
    console.error('Error generating AI analysis:', err);
    res.status(500).json({ error: `AI Analysis failed: ${err.message || err}` });
  }
});

// Start express server
async function startServer() {
  try {
    console.log('Bootstrapping server: Setting up routing and static file serving...');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running in development mode. Initializing Vite middleware...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite dev middleware mounted successfully.');
    } else {
      console.log('Running in production mode. Setting up static client file server...');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log(`Serving static production files from: ${distPath}`);
    }

    console.log('Verifying state persistence layer connection...');
    if (fs.existsSync(STATE_FILE_PATH)) {
      console.log('State file (database replacement) found and verified.');
    } else {
      console.log('State file does not exist yet. It will be initialized on first write.');
    }

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 IPL Auction Server successfully started!`);
      console.log(`👉 Bound to host: 0.0.0.0`);
      console.log(`👉 Listening on port: ${PORT}`);
      console.log(`👉 Endpoint URL: http://0.0.0.0:${PORT}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('CRITICAL ERROR: Failed to start the express server during bootstrap!');
    console.error(err);
    process.exit(1);
  }
}

startServer();
