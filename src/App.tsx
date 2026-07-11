import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Shield, Users, Award, TrendingUp, DollarSign, HelpCircle, 
  Activity, Landmark, ShieldCheck, Play, Pause, ChevronRight, Gavel, 
  Sparkles, RefreshCw, LogOut, Check, ArrowRight, UserCheck, AlertTriangle, 
  Wifi, WifiOff, Search, Plus, X
} from 'lucide-react';
import { Player, ActiveAuctionState, Franchise, PlayerRole, PlayerCountryType } from './types';
import RoleSelection from './components/RoleSelection';
import PlayerSearch from './components/PlayerSearch';
import Analytics from './components/Analytics';
import FranchiseSquads from './components/FranchiseSquads';
import PlayerImage from './components/PlayerImage';

export default function App() {
  // Session details
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('ipl_userId'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('ipl_userRole'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('ipl_username'));

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'auction' | 'players' | 'squads' | 'analytics'>('auction');

  // Real-time replicated Server states
  const [auctionState, setAuctionState] = useState<ActiveAuctionState>({
    status: 'idle',
    activePlayerId: null,
    currentBidLakhs: 0,
    highestBidder: null,
    timerSeconds: 30,
    bidHistory: [],
    logs: [],
    soldPlayers: {},
    unsoldPlayerIds: [],
    activeUsers: {}
  });

  const [franchises, setFranchises] = useState<Record<string, Franchise>>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auctioneer directory search & filter state
  const [auctioneerSearchQuery, setAuctioneerSearchQuery] = useState('');
  const [auctioneerRoleFilter, setAuctioneerRoleFilter] = useState<'all' | PlayerRole>('all');
  const [auctioneerStatusFilter, setAuctioneerStatusFilter] = useState<'all' | 'unbid' | 'sold' | 'unsold'>('unbid');

  // Auction Room Config states
  const [configIsPrivate, setConfigIsPrivate] = useState(false);
  const [configPasscode, setConfigPasscode] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });

  const handleTogglePrivate = (isPriv: boolean) => {
    setConfigIsPrivate(isPriv);
    if (isPriv) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setConfigPasscode(code);
    } else {
      setConfigPasscode('');
    }
  };

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  // Fetch full state (for initial load and fallback recovery)
  const fetchState = async () => {
    try {
      const response = await fetch('/api/auction/state');
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok && isJson) {
        const data = await response.json();
        setAuctionState(data.auction);
        setFranchises(data.franchises);
        setPlayers(data.players);
        setIsConnected(true);
        setApiError(null);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.warn('Failed to fetch full state (this is normal during server restarts):', err);
      setIsConnected(false);
    }
  };

  // Connect to Real-time SSE Stream
  useEffect(() => {
    // Fetch once immediately
    fetchState();

    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      eventSource = new EventSource('/api/auction/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setAuctionState(data.auction);
          setFranchises(data.franchises);
          setPlayers(data.players);
          setIsConnected(true);
          setApiError(null);
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE disconnected, retrying...', err);
        setIsConnected(false);
        eventSource?.close();

        // Retry connection in 3 seconds
        retryTimeout = setTimeout(() => {
          connectSSE();
          fetchState();
        }, 3000);
      };
    }

    connectSSE();

    // Setup periodic polling backup every 5 seconds just in case of environment proxy sleep
    const pollingInterval = setInterval(() => {
      fetchState();
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(pollingInterval);
    };
  }, []);

  // Handle Joining Auction Room
  const handleJoin = async (role: string, name: string, passcode?: string) => {
    try {
      const response = await fetch('/api/auction/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username: name, passcode })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok && isJson) {
        const result = await response.json();
        setUserId(result.userId);
        setUserRole(result.role);
        setUsername(name);
        
        localStorage.setItem('ipl_userId', result.userId);
        localStorage.setItem('ipl_userRole', result.role);
        localStorage.setItem('ipl_username', name);
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Failed to join';
        setApiError(errorMsg || 'Failed to join');
      }
    } catch (err) {
      console.error('Join Error:', err);
      setApiError('Network error joining room');
    }
  };

  // Handle Log out
  const handleLogout = () => {
    localStorage.removeItem('ipl_userId');
    localStorage.removeItem('ipl_userRole');
    localStorage.removeItem('ipl_username');
    setUserId(null);
    setUserRole(null);
    setUsername(null);
    setActiveTab('auction');
  };

  // Submit Bid (Franchise Owners)
  const handlePlaceBid = async (customAmount?: number) => {
    if (!userRole || userRole === 'auctioneer' || userRole === 'spectator') return;

    try {
      const response = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchiseName: userRole,
          bidAmountLakhs: customAmount || null
        })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Bid rejected';
        setApiError(errorMsg || 'Bid rejected');
        setTimeout(() => setApiError(null), 4000);
      }
    } catch (err) {
      console.error('Bid Error:', err);
      setApiError('Network error placing bid');
    }
  };

  // Submit Pass (Franchise Owners)
  const handlePass = async () => {
    if (!userRole || userRole === 'auctioneer' || userRole === 'spectator') return;
    try {
      await fetch('/api/auction/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchiseName: userRole })
      });
    } catch (err) {
      console.error('Pass action failed', err);
    }
  };

  // Admin Commands (Auctioneer)
  const handleAdminAction = async (action: string, playerId?: string) => {
    if (userRole !== 'auctioneer') return;

    try {
      const response = await fetch('/api/auction/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, playerId })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Action failed';
        setApiError(errorMsg || 'Action failed');
      }
    } catch (err) {
      console.error('Admin Action Error:', err);
      setApiError('Network error running action');
    }
  };

  const handleCreateRoom = async (category: string, isPrivate: boolean = false, passcode: string = '') => {
    if (userRole !== 'auctioneer') return;
    try {
      const response = await fetch('/api/auction/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_room', category, isPrivate, passcode })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Action failed';
        setApiError(errorMsg || 'Action failed');
      }
    } catch (err) {
      console.error('Create Room Error:', err);
      setApiError('Network error creating room');
    }
  };

  const handleEndRoom = async () => {
    if (userRole !== 'auctioneer') return;
    try {
      const response = await fetch('/api/auction/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end_room' })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Action failed';
        setApiError(errorMsg || 'Action failed');
      }
    } catch (err) {
      console.error('End Room Error:', err);
      setApiError('Network error ending room');
    }
  };

  // Register custom player (Admins/Auctioneer)
  const handleAddCustomPlayer = async (playerData: any) => {
    try {
      const response = await fetch('/api/players/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      });
      return response.ok;
    } catch (err) {
      console.error('Error registering custom player:', err);
      return false;
    }
  };

  // Price styling utility
  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Crore`;
    return `₹${lakhs} Lakh`;
  };

  const activePlayer = useMemo(() => {
    return players.find(p => p.id === auctionState.activePlayerId) || null;
  }, [players, auctionState.activePlayerId]);

  // Unbid players list (for Auctioneer panel release)
  const unbidPlayers = useMemo(() => {
    return players.filter(p => 
      !auctionState.soldPlayers[p.id] && 
      !auctionState.unsoldPlayerIds.includes(p.id) &&
      p.id !== auctionState.activePlayerId
    );
  }, [players, auctionState.soldPlayers, auctionState.unsoldPlayerIds, auctionState.activePlayerId]);

  // All 333 players filtered list for Live Auctioneer Dashboard release
  const filteredAuctioneerPlayers = useMemo(() => {
    return players.filter(player => {
      // 1. Search Query
      if (auctioneerSearchQuery.trim()) {
        const query = auctioneerSearchQuery.toLowerCase();
        const matchesName = player.name.toLowerCase().includes(query);
        const matchesCountry = player.country.toLowerCase().includes(query);
        const matchesTeam = player.previousTeam.toLowerCase().includes(query);
        if (!matchesName && !matchesCountry && !matchesTeam) return false;
      }

      // 2. Role Filter
      if (auctioneerRoleFilter !== 'all' && player.role !== auctioneerRoleFilter) {
        return false;
      }

      // 3. Status Filter
      const isSold = !!auctionState.soldPlayers[player.id];
      const isUnsold = auctionState.unsoldPlayerIds.includes(player.id);
      const isActive = player.id === auctionState.activePlayerId;
      const isUnbid = !isSold && !isUnsold && !isActive;

      if (auctioneerStatusFilter === 'unbid' && !isUnbid) return false;
      if (auctioneerStatusFilter === 'sold' && !isSold) return false;
      if (auctioneerStatusFilter === 'unsold' && !isUnsold) return false;
      if (auctioneerStatusFilter === 'all' && isActive) return false; // Hide active player since they are already highlighted

      return true;
    });
  }, [players, auctionState.soldPlayers, auctionState.unsoldPlayerIds, auctionState.activePlayerId, auctioneerSearchQuery, auctioneerRoleFilter, auctioneerStatusFilter]);

  // Next Bid increments
  const getNextMinimumBid = (current: number, base: number) => {
    if (current === 0) return base;
    if (current < 50) return current + 5;
    if (current < 100) return current + 10;
    if (current < 200) return current + 20;
    return current + 50;
  };

  const nextMinBidLakhs = activePlayer ? getNextMinimumBid(auctionState.currentBidLakhs, activePlayer.basePriceLakhs) : 0;

  // Franchise object for current user (if team owner)
  const myFranchise = userRole && franchises[userRole] ? franchises[userRole] : null;

  // Check bidding eligibility for current team owner
  const biddingRuleCheck = useMemo(() => {
    if (!myFranchise || !activePlayer) return { eligible: false, reason: '' };

    if (myFranchise.playersBoughtIds.length >= 25) {
      return { eligible: false, reason: 'Your roster is full (max 25 players)' };
    }

    if (activePlayer.countryType === PlayerCountryType.Overseas && myFranchise.overseasCount >= 8) {
      return { eligible: false, reason: 'Overseas players slot full (max 8 reached)' };
    }

    if (nextMinBidLakhs > myFranchise.remainingPurseLakhs) {
      return { eligible: false, reason: 'Insufficient remaining purse' };
    }

    if (auctionState.highestBidder === userRole) {
      return { eligible: false, reason: 'You are currently the highest bidder' };
    }

    return { eligible: true, reason: '' };
  }, [myFranchise, activePlayer, nextMinBidLakhs, auctionState.highestBidder, userRole]);

  // Render selection if not logged in
  if (!userId || !userRole) {
    return (
      <RoleSelection 
        franchises={franchises} 
        activeUsers={auctionState.activeUsers} 
        onJoin={handleJoin} 
        isPrivate={auctionState.isPrivate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-2 rounded-xl shadow-md flex items-center justify-center">
            <Trophy className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span className="font-display uppercase">IPL Arena</span>
              <span className="text-[10px] bg-amber-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">LIVE 2026</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Synced Auction Panel</p>
          </div>
        </div>

        {/* Tab Selector */}
        <nav className="flex space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850/80 text-xs">
          {[
            { id: 'auction', label: 'Bidding War', icon: Gavel },
            { id: 'players', label: 'Master DB', icon: Search },
            { id: 'squads', label: 'Rosters', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-slate-900 text-yellow-400 border border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Connection status and user details */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            {isConnected ? (
              <span className="flex items-center space-x-1 text-emerald-400">
                <Wifi className="w-4 h-4" />
                <span className="font-bold">CONNECTED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="font-bold">RECONNECTING...</span>
              </span>
            )}
          </div>

          {/* Current profile summary */}
          <div className="flex items-center space-x-2.5 bg-slate-950/60 pl-3 pr-2 py-1.5 rounded-xl border border-slate-850/80">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono">PLAYING AS</div>
              <div className="text-xs font-extrabold text-slate-200">
                {userRole === 'auctioneer' ? 'Auctioneer (Admin)' : `${userRole} Owner`}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              title="Change Role"
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner Alert for Errors */}
        {apiError && (
          <div className="bg-red-950/40 border border-red-800/80 text-red-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-lg animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Dynamic Tab Render */}
        {activeTab === 'players' && (
          <PlayerSearch 
            players={players} 
            soldPlayers={auctionState.soldPlayers} 
            unsoldPlayerIds={auctionState.unsoldPlayerIds} 
            isAuctioneer={userRole === 'auctioneer'}
            onAddCustomPlayer={handleAddCustomPlayer}
          />
        )}

        {activeTab === 'squads' && (
          <FranchiseSquads 
            franchises={franchises} 
            players={players} 
            soldPlayers={auctionState.soldPlayers} 
            userRole={userRole}
            maxSquadSize={auctionState.maxSquadSize}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            players={players} 
            franchises={franchises} 
            soldPlayers={auctionState.soldPlayers} 
            unsoldPlayerIds={auctionState.unsoldPlayerIds}
            logs={auctionState.logs}
          />
        )}

        {/* Tab 1: Live Bidding Arena */}
        {activeTab === 'auction' && (
          <div className="space-y-6">
            {auctionState.isEnded ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Custom Celebration/Completion Hero Section */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-yellow-500/30 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                  
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-4">
                    <Trophy className="w-10 h-10 animate-pulse" />
                  </div>

                  <h2 className="text-3xl font-black bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent uppercase tracking-wider">
                    Auction Officially Concluded
                  </h2>
                  <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2 leading-relaxed font-medium">
                    The official Live IPL Auctioneer has brought this synchronized session to a successful close. All franchise rosters have been finalized and bidding is locked. Take a look at the final rosters and statistics!
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850/60">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Sold</div>
                      <div className="text-xl font-black font-mono text-yellow-400 mt-1">
                        {Object.keys(auctionState.soldPlayers || {}).length} <span className="text-slate-500 text-xs font-normal">Players</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850/60">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Remaining Unbid</div>
                      <div className="text-xl font-black font-mono text-slate-300 mt-1">
                        {players.filter(p => !auctionState.soldPlayers?.[p.id] && !auctionState.unsoldPlayerIds?.includes(p.id)).length} <span className="text-slate-500 text-xs font-normal">Players</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850/60">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unsold Pool</div>
                      <div className="text-xl font-black font-mono text-slate-400 mt-1">
                        {(auctionState.unsoldPlayerIds || []).length} <span className="text-slate-500 text-xs font-normal">Players</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850/60">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Teams</div>
                      <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                        10 <span className="text-slate-500 text-xs font-normal">Franchises</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setActiveTab('squads')}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Final Rosters</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Explore Squad Analytics</span>
                    </button>
                  </div>
                </div>

                {/* If auctioneer, let them see their configure/create block to reboot the room */}
                {userRole === 'auctioneer' && (
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-5">
                    <div className="flex items-center space-x-2 pb-3 border-b border-slate-850">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-extrabold text-sm text-white tracking-tight uppercase">Room Administration</h3>
                    </div>
                    <p className="text-xs text-amber-400 font-medium">
                      ⚠️ You have officially ended this Auction Room. Regular franchise owners see the "Auction Concluded" view. As the Auctioneer, you can re-create/re-configure a room below to restart/reset the auction.
                    </p>

                    {/* Predefined Categories selection & Visibility */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Landmark className="w-4 h-4 text-yellow-400" />
                          <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Create / Configure New Auction Room</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {[
                          { id: 'category1', name: 'Category 1', size: 25, purse: 150, desc: 'Large Squad' },
                          { id: 'category2', name: 'Category 2', size: 20, purse: 135, desc: 'Medium Squad' },
                          { id: 'category3', name: 'Category 3', size: 15, purse: 120, desc: 'Compact Squad' },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              triggerConfirm(
                                "Configure Auction Room",
                                `Are you sure you want to configure the Auction Room as ${cat.name}? This will HARD RESET the entire session, clearing all rosters, logs, and budgets!`,
                                () => handleCreateRoom(cat.id, configIsPrivate, configPasscode)
                              );
                            }}
                            className="flex flex-col text-left p-3 rounded-xl border bg-slate-900 border-slate-850 hover:bg-slate-900/60 hover:border-slate-750 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
                          >
                            <span className="text-[10px] font-black uppercase text-slate-200">{cat.name}</span>
                            <div className="mt-1 text-slate-200 font-mono font-bold text-xs">
                              ₹{cat.purse} Crore Purse
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              Squad Size: {cat.size} Players
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Privacy & Passcode Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900/60">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Visibility</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTogglePrivate(false)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                !configIsPrivate
                                  ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md'
                                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🌍 Public Room
                            </button>
                            <button
                              onClick={() => handleTogglePrivate(true)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                configIsPrivate
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🔑 Private Room
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Passcode</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={configIsPrivate ? configPasscode : ''}
                              readOnly={true}
                              disabled={!configIsPrivate}
                              placeholder={configIsPrivate ? "Auto-generating unique code..." : "No passcode required"}
                              className={`w-full bg-slate-900 border text-xs font-mono rounded-xl pl-3 pr-10 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all ${
                                configIsPrivate ? 'border-amber-500/40 text-amber-400' : 'border-slate-850 opacity-50 cursor-not-allowed'
                              }`}
                            />
                            {configIsPrivate && (
                              <button
                                type="button"
                                onClick={() => handleTogglePrivate(true)}
                                className="absolute right-2 text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="Generate new passcode"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Main bidding arena (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Room Configuration Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-yellow-500/20 text-yellow-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                      <span>Room:</span>
                      <span className="text-yellow-400">
                        {auctionState.roomCategory === 'category1' ? 'Category 1' : auctionState.roomCategory === 'category2' ? 'Category 2' : 'Category 3'}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-black bg-slate-950 border border-slate-800 text-slate-400">
                        {auctionState.isPrivate ? '🔑 PRIVATE' : '🌍 PUBLIC'}
                      </span>
                      {auctionState.isPrivate && userRole === 'auctioneer' && (
                        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25 font-mono">
                          PASSCODE: {auctionState.passcode}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      All teams receive identical purses and strict roster limits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center sm:text-right">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Squad Limit</div>
                    <div className="text-xs font-mono font-black text-slate-200">
                      {auctionState.maxSquadSize || 25} Players
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center sm:text-left">
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Team Purse</div>
                    <div className="text-xs font-mono font-black text-emerald-400">
                      ₹{((auctionState.totalPurseLakhs || 15000) / 100).toFixed(0)} Crore
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Up For Auction Display */}
              <div className={`p-6 rounded-3xl bg-slate-900/40 border transition-all ${
                auctionState.status === 'active' 
                  ? 'border-yellow-500/20 active-bid-card' 
                  : 'border-slate-850'
              }`}>
                {activePlayer ? (
                  <div className="space-y-6">
                    {/* Header: Status and Base price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-850">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest font-mono">Bidding in progress</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-mono">
                        <span className="text-slate-500">BASE PRICE:</span>
                        <span className="font-extrabold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {formatPrice(activePlayer.basePriceLakhs)}
                        </span>
                      </div>
                    </div>

                    {/* Body: Player profile and photo */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                      {/* Photo */}
                      <div className="sm:col-span-4 flex flex-col items-center">
                        <div className="relative">
                          <PlayerImage 
                            player={activePlayer} 
                            className="w-40 h-40 rounded-2xl object-cover border-2 border-slate-800"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-2.5 py-1 text-[10px] rounded-lg tracking-wider shadow">
                            {activePlayer.role}
                          </div>
                        </div>
                      </div>

                      {/* Info & stats */}
                      <div className="sm:col-span-8 space-y-4">
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-white font-display">{activePlayer.name}</h2>
                          <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>{activePlayer.country}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-yellow-400 font-semibold">{activePlayer.countryType}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span>Age {activePlayer.age}</span>
                          </p>
                        </div>

                        {/* Styles and Prev Team */}
                        <div className="grid grid-cols-3 gap-3 text-center bg-slate-950/60 p-3 rounded-xl border border-slate-850/60">
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Batting Style</div>
                            <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{activePlayer.battingStyle}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Bowling Style</div>
                            <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{activePlayer.bowlingStyle}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">Prev Franchise</div>
                            <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{activePlayer.previousTeam}</div>
                          </div>
                        </div>

                        {/* Detailed Cricket Statistics */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">IPL Career Stats</span>
                          <div className="grid grid-cols-5 gap-2 bg-slate-950/30 border border-slate-850 p-2 rounded-xl text-center">
                            <div>
                              <div className="text-[9px] text-slate-500">MAT</div>
                              <div className="font-extrabold text-sm text-slate-300">{activePlayer.stats.matches}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500">RUNS</div>
                              <div className="font-extrabold text-sm text-slate-300">{activePlayer.stats.runs}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500">WKT</div>
                              <div className="font-extrabold text-sm text-slate-300">{activePlayer.stats.wickets}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500">AVG</div>
                              <div className="font-extrabold text-sm text-slate-300">{activePlayer.stats.average > 0 ? activePlayer.stats.average.toFixed(1) : '-'}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500">S/R</div>
                              <div className="font-extrabold text-sm text-slate-300">{activePlayer.stats.strikeRate > 0 ? activePlayer.stats.strikeRate.toFixed(1) : '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bidding board: Current bid & Timer countdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850/80">
                      {/* Current highest bid */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Bid</span>
                        <div className="font-display font-extrabold text-2xl text-emerald-400 mt-0.5">
                          {auctionState.currentBidLakhs === 0 ? 'No Bid Placed' : formatPrice(auctionState.currentBidLakhs)}
                        </div>
                        {auctionState.highestBidder && (
                          <div className="flex items-center space-x-1.5 mt-2">
                            <span className="text-[10px] text-slate-500">HIGHEST BIDDER:</span>
                            <span 
                              className="text-[11px] font-black px-2 py-0.5 rounded border uppercase font-mono shadow"
                              style={{ 
                                backgroundColor: franchises[auctionState.highestBidder]?.logoColor || '#334155',
                                color: franchises[auctionState.highestBidder]?.textColor || '#ffffff',
                                borderColor: franchises[auctionState.highestBidder]?.logoColor || '#475569'
                              }}
                            >
                              {auctionState.highestBidder}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Timer Countdown widget */}
                      <div className={`bg-slate-950 p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        auctionState.timerSeconds <= 5 
                          ? 'border-red-500 urgent-bid-clock' 
                          : 'border-slate-850'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Bid Clock</span>
                          <span className="text-xs text-slate-400">Sold if no bid within countdown</span>
                        </div>

                        {/* Circular progress or bar visualization */}
                        <div className="relative flex items-center justify-center">
                          <div 
                            className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono font-black text-lg transition-all ${
                              auctionState.timerSeconds <= 5 
                                ? 'border-red-500 text-red-500 animate-pulse' 
                                : auctionState.timerSeconds <= 10 
                                  ? 'border-orange-500 text-orange-500' 
                                  : 'border-yellow-400 text-yellow-400'
                            }`}
                          >
                            {auctionState.timerSeconds}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE Bidding Actions (Team Owners) */}
                    {userRole !== 'auctioneer' && userRole !== 'spectator' && (
                      <div className="pt-2">
                        {biddingRuleCheck.eligible ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                              {/* Primary Place Minimum Bid Button */}
                              <button
                                onClick={() => handlePlaceBid()}
                                className="sm:col-span-8 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-98 scale-100 cursor-pointer"
                              >
                                Place Bid of ₹{formatPrice(nextMinBidLakhs)}
                              </button>

                              {/* Pass button */}
                              <button
                                onClick={handlePass}
                                className="sm:col-span-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-4 rounded-2xl text-xs transition-all cursor-pointer"
                              >
                                Decides to Pass
                              </button>
                            </div>

                            {/* Quick Bid additions */}
                            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850/80">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Bumps</span>
                              <div className="flex space-x-1.5 text-[10px]">
                                {[10, 20, 50, 100].map(bump => {
                                  const targetBumpVal = nextMinBidLakhs + bump;
                                  return (
                                    <button
                                      key={bump}
                                      onClick={() => handlePlaceBid(targetBumpVal)}
                                      className="bg-slate-900 border border-slate-800 hover:border-slate-650 text-slate-300 hover:text-yellow-400 font-mono font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                    >
                                      +{bump} Lakh
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex items-center space-x-3 text-slate-500 text-xs text-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-slate-600" />
                            <span>Bidding locked: {biddingRuleCheck.reason || 'You are currently leading.'}</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ) : (
                  /* Idle status (Waiting for Player Release) */
                  <div className="py-16 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-950 border border-slate-800 text-slate-600 animate-bounce">
                      <Gavel className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="text-lg font-extrabold text-white">Bidding Arena is Idle</h3>
                      <p className="text-xs text-slate-400">
                        {userRole === 'auctioneer' 
                          ? 'Choose a player from your unbid directory list below to start active synchronized bidding!' 
                          : 'Waiting for the Live Auctioneer to select and release the next player. Keep your budget ready!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auctioneer Dashboard (Only available to Admin / Auctioneer role) */}
              {userRole === 'auctioneer' && (
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-5">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-850">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-extrabold text-sm text-white tracking-tight uppercase">Live Auctioneer Dashboard</h3>
                  </div>

                  {/* Auction Room Configuration Section */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Landmark className="w-4 h-4 text-yellow-400" />
                        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Create / Configure Auction Room</h4>
                      </div>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-yellow-400 font-mono px-2 py-0.5 rounded-full">
                        CURRENT: {auctionState.roomCategory === 'category1' ? 'Category 1 (25 Players, ₹150Cr)' : auctionState.roomCategory === 'category2' ? 'Category 2 (20 Players, ₹135Cr)' : 'Category 3 (15 Players, ₹120Cr)'}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Select a predefined category to create/configure the room. Each category enforces consistent squad size limits and purse budgets automatically for all franchises.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {[
                        { id: 'category1', name: 'Category 1', size: 25, purse: 150, desc: 'Large Squad' },
                        { id: 'category2', name: 'Category 2', size: 20, purse: 135, desc: 'Medium Squad' },
                        { id: 'category3', name: 'Category 3', size: 15, purse: 120, desc: 'Compact Squad' },
                      ].map(cat => {
                        const isCurrent = auctionState.roomCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              triggerConfirm(
                                "Configure Auction Room",
                                `Configure the Auction Room as ${cat.name}? This will HARD RESET the entire session, clearing all rosters, logs, and budgets!`,
                                () => handleCreateRoom(cat.id, configIsPrivate, configPasscode)
                              );
                            }}
                            className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                                : 'bg-slate-900 border-slate-850 hover:bg-slate-900/60 hover:border-slate-750 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-[10px] font-black uppercase ${isCurrent ? 'text-yellow-400' : 'text-slate-200'}`}>{cat.name}</span>
                              {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                            </div>
                            <div className="mt-1 text-slate-200 font-mono font-bold text-xs">
                              ₹{cat.purse} Crore Purse
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              Squad Size: {cat.size} Players
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Privacy & Passcode Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900/60">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Visibility</label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTogglePrivate(false)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              !configIsPrivate
                                ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            🌍 Public Room
                          </button>
                          <button
                            onClick={() => handleTogglePrivate(true)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              configIsPrivate
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                                : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            🔑 Private Room
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Passcode</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={configIsPrivate ? configPasscode : ''}
                            readOnly={true}
                            disabled={!configIsPrivate}
                            placeholder={configIsPrivate ? "Auto-generating unique code..." : "No passcode required"}
                            className={`w-full bg-slate-900 border text-xs font-mono rounded-xl pl-3 pr-10 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all ${
                              configIsPrivate ? 'border-amber-500/40 text-amber-400' : 'border-slate-850 opacity-50 cursor-not-allowed'
                            }`}
                          />
                          {configIsPrivate && (
                            <button
                              type="button"
                              onClick={() => handleTogglePrivate(true)}
                              className="absolute right-2 text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                              title="Generate new passcode"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Administration Section */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-850/80">
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Session Administration</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Officially close bidding or trigger a hard session reset.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          triggerConfirm(
                            "End Auction Room",
                            "Are you absolutely sure you want to officially END this Auction Room? Bidding will be locked and a final summary will be displayed to all users.",
                            () => handleEndRoom()
                          );
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-red-500 hover:bg-red-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>End Auction Room</span>
                      </button>
                    </div>
                  </div>

                  {/* Active controls (if player up) */}
                  {activePlayer ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {auctionState.status === 'paused' ? (
                        <button
                          onClick={() => handleAdminAction('resume')}
                          className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          <span>Resume Timer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdminAction('pause')}
                          className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Pause Clock</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleAdminAction('mark_sold')}
                        className="flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-800 text-emerald-400 font-bold py-3 rounded-xl transition-all hover:bg-emerald-500/20 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Force Sold</span>
                      </button>

                      <button
                        onClick={() => handleAdminAction('mark_unsold')}
                        className="flex items-center justify-center space-x-2 bg-red-500/10 border border-red-950 text-red-400 font-bold py-3 rounded-xl transition-all hover:bg-red-500/20 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Force Unsold</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerConfirm(
                            "Reset Session",
                            "Are you absolutely sure you want to reset the entire auction? This clears all rosters and budgets!",
                            () => handleAdminAction('reset')
                          );
                        }}
                        className="flex items-center justify-center space-x-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white py-3 rounded-xl transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset Session</span>
                      </button>
                    </div>
                  ) : (
                    /* Select Next Player block */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Player Directory ({filteredAuctioneerPlayers.length} shown of {players.length})
                        </span>
                        
                        <div className="flex space-x-1">
                          {(['unbid', 'sold', 'unsold', 'all'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setAuctioneerStatusFilter(tab)}
                              className={`text-[9px] uppercase font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                auctioneerStatusFilter === tab
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-950 text-slate-400 border border-slate-900 hover:text-white'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Search Bar & Role Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-5 relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search 333 players..."
                            value={auctioneerSearchQuery}
                            onChange={(e) => setAuctioneerSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 text-slate-200 placeholder-slate-600 pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all"
                          />
                          {auctioneerSearchQuery && (
                            <button 
                              onClick={() => setAuctioneerSearchQuery('')}
                              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="sm:col-span-7 flex flex-wrap gap-1 items-center">
                          {(['all', PlayerRole.Batter, PlayerRole.Bowler, PlayerRole.AllRounder, PlayerRole.WicketKeeper] as const).map(role => (
                            <button
                              key={role}
                              onClick={() => setAuctioneerRoleFilter(role)}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                auctioneerRoleFilter === role
                                  ? 'bg-slate-800 text-yellow-400 border border-slate-700'
                                  : 'bg-slate-950 text-slate-500 border border-transparent hover:text-slate-300'
                              }`}
                            >
                              {role === 'all' ? 'All Roles' : role}
                            </button>
                          ))}
                        </div>
                      </div>

                      {filteredAuctioneerPlayers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950 rounded-2xl border border-slate-900">
                          No players matching the selected filters found.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                          {filteredAuctioneerPlayers.map(player => {
                            const isSold = !!auctionState.soldPlayers[player.id];
                            const isUnsold = auctionState.unsoldPlayerIds.includes(player.id);
                            
                            return (
                              <div 
                                key={player.id}
                                className={`bg-slate-950 p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  isSold 
                                    ? 'border-emerald-950/45 bg-emerald-950/5' 
                                    : isUnsold 
                                      ? 'border-red-950/45 bg-red-950/5' 
                                      : 'border-slate-850'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                                  <PlayerImage 
                                    player={player} 
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                                  />
                                  <div className="text-xs min-w-0 flex-1">
                                    <h4 className="font-extrabold text-slate-200 truncate">{player.name}</h4>
                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-slate-400 mt-0.5">
                                      <span className="font-semibold text-slate-500">{player.role}</span>
                                      <span>•</span>
                                      <span className="text-emerald-400 font-mono font-bold">{formatPrice(player.basePriceLakhs)}</span>
                                      {isSold && (
                                        <>
                                          <span>•</span>
                                          <span className="text-emerald-500 font-black uppercase text-[8px]">SOLD ({auctionState.soldPlayers[player.id]?.franchise})</span>
                                        </>
                                      )}
                                      {isUnsold && (
                                        <>
                                          <span>•</span>
                                          <span className="text-red-500 font-black uppercase text-[8px]">UNSOLD</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleAdminAction('start', player.id)}
                                  className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-2 rounded-lg tracking-wide hover:scale-102 transition-all flex-shrink-0 cursor-pointer"
                                >
                                  {isSold || isUnsold ? 'Re-release' : 'Release'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right: Live Feeds & Ledger (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Franchise Quick List Panel */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850/60">
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Budgets & Squads</span>
                  </h3>
                  <span className="text-[10px] text-slate-500">10 Teams</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(Object.values(franchises) as Franchise[]).map((team) => {
                    const isMyTeam = userRole === team.name;
                    return (
                      <div 
                        key={team.name}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                          isMyTeam 
                            ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-yellow-500/40 shadow-md' 
                            : 'bg-slate-950 border-slate-850'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: team.logoColor }}
                          />
                          <span className="font-bold text-slate-200">{team.name}</span>
                          {isMyTeam && (
                            <span className="text-[8px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-1 py-0.2 rounded-full font-bold">MINE</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-right">
                          <div className="font-mono text-slate-400">
                            <span className="font-bold text-yellow-400">{team.playersBoughtIds.length}</span>
                            <span className="text-slate-600 text-[10px]">/{auctionState.maxSquadSize || 25}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatPrice(team.remainingPurseLakhs)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Bid History Ledger (Scrollable list of current bidding) */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Gavel className="w-4 h-4 text-yellow-400" />
                    <span>Live Bid History</span>
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    {auctionState.bidHistory.length} Bids
                  </span>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 min-h-32 max-h-56 overflow-y-auto space-y-2">
                  {auctionState.bidHistory.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic text-center pt-8">No bids placed yet for this player.</p>
                  ) : (
                    auctionState.bidHistory.map((bid, index) => {
                      const isFirst = index === 0;
                      return (
                        <div 
                          key={bid.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-all ${
                            isFirst 
                              ? 'bg-yellow-500/10 border-yellow-500/30 shadow-md font-bold' 
                              : 'bg-slate-900/30 border-slate-850'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase"
                              style={{
                                backgroundColor: franchises[bid.franchise]?.logoColor || '#475569',
                                color: franchises[bid.franchise]?.textColor || '#ffffff',
                                borderColor: franchises[bid.franchise]?.logoColor || '#475569'
                              }}
                            >
                              {bid.franchise}
                            </span>
                            {isFirst && <span className="text-[9px] text-yellow-400 uppercase tracking-widest font-black">Leading</span>}
                          </div>

                          <span className="font-mono text-emerald-400 font-bold">
                            {formatPrice(bid.amountLakhs)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    )}

      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div id="confirm-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            id="confirm-modal-card" 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing Accent Top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 text-yellow-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  {confirmModal.title}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {confirmModal.message}
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  id="confirm-modal-cancel"
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-modal-approve"
                  type="button"
                  onClick={() => confirmModal.onConfirm()}
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/10 transition-all cursor-pointer"
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
