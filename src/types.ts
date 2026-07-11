export enum PlayerRole {
  Batter = 'Batter',
  Bowler = 'Bowler',
  AllRounder = 'All-rounder',
  WicketKeeper = 'Wicket Keeper'
}

export enum PlayerCountryType {
  Indian = 'Indian',
  Overseas = 'Overseas'
}

export enum PlayerPlayingStatus {
  Active = 'Active',
  Retired = 'Retired'
}

export interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  countryType: PlayerCountryType;
  role: PlayerRole;
  battingStyle: string;
  bowlingStyle: string;
  previousTeam: string;
  basePriceLakhs: number; // base price in Lakhs (e.g., 200 Lakhs = 2.00 Crore)
  status: PlayerPlayingStatus;
  age: number;
  profileImage: string;
  cricbuzzId?: number;
  stats: PlayerStats;
  seasons: number[]; // e.g. [2020, 2021, 2022, 2023, 2024, 2025, 2026]
}

export interface Franchise {
  name: string;
  fullName: string;
  logoColor: string;
  textColor: string;
  startingPurseLakhs: number; // 12000 Lakhs = 120 Crore
  remainingPurseLakhs: number;
  playersBoughtIds: string[];
  overseasCount: number;
  indianCount: number;
  remainingSlots: number; // Total max slots = 25, min 18
  starting11PlayerIds?: string[];
}

export interface BidHistoryEntry {
  franchise: string;
  amountLakhs: number;
  timestamp: string;
  id: string;
}

export interface AuctionLog {
  id: string;
  type: 'info' | 'bid' | 'sold' | 'unsold' | 'status' | 'join' | 'leave';
  message: string;
  timestamp: string;
}

export interface ActiveAuctionState {
  status: 'idle' | 'active' | 'paused' | 'completed';
  activePlayerId: string | null;
  currentBidLakhs: number;
  highestBidder: string | null;
  timerSeconds: number;
  bidHistory: BidHistoryEntry[];
  logs: AuctionLog[];
  soldPlayers: Record<string, { franchise: string; priceLakhs: number }>; // playerId -> sold details
  unsoldPlayerIds: string[];
  activeUsers: Record<string, { role: string; lastSeen: string }>; // session ID -> role
  roomCategory?: 'category1' | 'category2' | 'category3';
  maxSquadSize?: number;
  totalPurseLakhs?: number;
  isPrivate?: boolean;
  passcode?: string;
  isEnded?: boolean;
}
