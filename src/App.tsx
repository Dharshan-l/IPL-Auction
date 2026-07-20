import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Shield, Users, Award, TrendingUp, DollarSign, HelpCircle, 
  Activity, Landmark, ShieldCheck, Play, Pause, ChevronLeft, ChevronRight, Gavel, 
  Sparkles, RefreshCw, LogOut, Check, ArrowRight, UserCheck, AlertTriangle, 
  Wifi, WifiOff, Search, Plus, X, Copy, Link, Lock, Unlock
} from 'lucide-react';
import { Player, ActiveAuctionState, Franchise, PlayerRole, PlayerCountryType } from './types';
import PlayerSearch from './components/PlayerSearch';
import Analytics from './components/Analytics';
import FranchiseSquads from './components/FranchiseSquads';
import PlayerImage from './components/PlayerImage';

export default function App() {
  // Session details - We do NOT auto-restore userRole or userId to avoid auto-entering the room on refresh.
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('ipl_username'));

  // Client-side SPA routing state
  const [currentScreen, setCurrentScreen] = useState<'home' | 'create_room' | 'join_room' | 'lobby' | 'auction'>('home');
  const [cameFromScreen, setCameFromScreen] = useState<'create_room' | 'join_room' | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [preFilledRoomCode, setPreFilledRoomCode] = useState('');

  const navigateTo = (screen: 'home' | 'create_room' | 'join_room' | 'lobby' | 'auction', pushHistory = true) => {
    setCurrentScreen(screen);
    if (pushHistory) {
      window.history.pushState({ screen }, '', `#${screen}`);
    }
  };

  // Copy indicator animations
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'auction' | 'players' | 'squads' | 'analytics'>('auction');

  // Real-time replicated Server states
  const [auctionState, setAuctionState] = useState<ActiveAuctionState>({
    status: 'idle',
    activePlayerId: null,
    currentBidLakhs: 0,
    highestBidder: null,
    timerSeconds: 10,
    timerDuration: 10,
    bidHistory: [],
    logs: [],
    soldPlayers: {},
    unsoldPlayerIds: [],
    activeUsers: {},
    lastResultMessage: null,
    lastResultType: null,
    lobbyStatus: 'waiting'
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

  // Selected timer duration for the auction (3, 5, 10, or 15 seconds)
  const [auctionTimerDuration, setAuctionTimerDuration] = useState<3 | 5 | 10 | 15>(10);

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

  // Create Room Form State
  const [createRoomName, setCreateRoomName] = useState('IPL Live Bidding');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [createPasscode, setCreatePasscode] = useState('');
  const [createPoolSize, setCreatePoolSize] = useState('full');
  const [createBudgetCrores, setCreateBudgetCrores] = useState(150);
  const [createNumTeams, setCreateNumTeams] = useState(10);
  const [createAuctionMode, setCreateAuctionMode] = useState('Normal');

  // Room generation receipt state
  const [generatedRoomCode, setGeneratedRoomCode] = useState('');
  const [generatedPasscode, setGeneratedPasscode] = useState('');

  // Join Room Form State
  const [joinPlayerName, setJoinPlayerName] = useState(() => localStorage.getItem('ipl_username') || '');
  const [joinRole, setJoinRole] = useState<'auctioneer' | 'franchise_owner' | 'spectator'>('franchise_owner');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [joinInviteLinkInput, setJoinInviteLinkInput] = useState('');

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

  // Check URL pathname for deep link invitation e.g., /join/A7P9KD
  useEffect(() => {
    const parts = window.location.pathname.split('/');
    if (parts[1] === 'join' && parts[2]) {
      setPreFilledRoomCode(parts[2].toUpperCase());
      navigateTo('join_room');
    }
  }, []);

  // Clear previous session indicators from local storage on mount (guarantees landing on Home on refresh)
  useEffect(() => {
    localStorage.removeItem('ipl_userId');
    localStorage.removeItem('ipl_userRole');
  }, []);

  // Browser History and Accidental Exit Confirmation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const isAuctionActive = currentScreen === 'auction' && auctionState.lobbyStatus === 'active' && !auctionState.isEnded;
      if (isAuctionActive) {
        // Intercept browser back/forward buttons and push state back
        window.history.pushState({ screen: 'auction' }, '', '#auction');
        setShowLeaveConfirmation(true);
        return;
      }

      if (event.state && event.state.screen) {
        setCurrentScreen(event.state.screen);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (['create_room', 'join_room', 'lobby', 'auction'].includes(hash)) {
          setCurrentScreen(hash as any);
        } else {
          setCurrentScreen('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentScreen, auctionState.lobbyStatus, auctionState.isEnded]);

  // Prevent browser close / tab reload during active auction
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isAuctionActive = currentScreen === 'auction' && auctionState.lobbyStatus === 'active' && !auctionState.isEnded;
      if (isAuctionActive) {
        e.preventDefault();
        e.returnValue = 'The auction is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentScreen, auctionState.lobbyStatus, auctionState.isEnded]);

  // Transition logged in users between lobby & bidding war depending on room status
  useEffect(() => {
    if (userId && userRole) {
      if (auctionState.lobbyStatus === 'active') {
        navigateTo('auction');
      } else {
        navigateTo('lobby');
      }
    } else {
      if (currentScreen === 'lobby' || currentScreen === 'auction') {
        navigateTo('home');
      }
    }
  }, [userId, userRole, auctionState.lobbyStatus]);

  // Connect to Real-time SSE Stream
  useEffect(() => {
    // Fetch once immediately
    fetchState();

    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      const url = userId 
        ? `/api/auction/stream?userId=${encodeURIComponent(userId)}` 
        : '/api/auction/stream';
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setAuctionState(data.auction);
          setFranchises(data.franchises);
          if (data.players) {
            setPlayers(data.players);
          }
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

        // Clear any existing retry timeout to prevent duplicate connections
        if (retryTimeout) clearTimeout(retryTimeout);

        // Retry connection in 3 seconds
        retryTimeout = setTimeout(() => {
          connectSSE();
          fetchState();
        }, 3000);
      };
    }

    connectSSE();

    // Setup periodic polling backup ONLY if SSE connection breaks
    const pollingInterval = setInterval(() => {
      if (!isConnected) {
        fetchState();
      }
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(pollingInterval);
    };
  }, [userId, isConnected]);

  // Handle Joining Auction Room
  const handleJoin = async (role: string, name: string, roomCode: string, passcode?: string) => {
    try {
      const response = await fetch('/api/auction/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username: name, roomCode, passcode })
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

  // Handle Select Franchise
  const handleSelectFranchise = async (franchise: string | null) => {
    if (!userId) return;
    try {
      const response = await fetch('/api/auction/select-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, franchise })
      });
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        if (franchise) {
          setUserRole(franchise);
          localStorage.setItem('ipl_userRole', franchise);
        } else {
          setUserRole('franchise_owner');
          localStorage.setItem('ipl_userRole', 'franchise_owner');
        }
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Team selection failed';
        setApiError(errorMsg || 'Team selection failed');
      }
    } catch (err) {
      console.error('Select Franchise Error:', err);
      setApiError('Network error selecting franchise');
    }
  };

  // Handle Toggle Ready Status
  const handleToggleReady = async (isReady: boolean) => {
    if (!userId) return;
    try {
      const response = await fetch('/api/auction/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isReady })
      });
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        const errorMsg = isJson ? (await response.json()).error : 'Ready update failed';
        setApiError(errorMsg || 'Ready update failed');
      }
    } catch (err) {
      console.error('Ready Status Error:', err);
      setApiError('Network error updating ready status');
    }
  };

  // Handle Log out / Leaving the Room
  const handleLogout = async (targetScreen: 'home' | 'create_room' | 'join_room' = 'home') => {
    if (userId) {
      try {
        await fetch('/api/auction/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }
    localStorage.removeItem('ipl_userId');
    localStorage.removeItem('ipl_userRole');
    setUserId(null);
    setUserRole(null);
    navigateTo(targetScreen);
    setActiveTab('auction');
  };

  // Submit Bid (Franchise Owners) with 0ms Optimistic UI Response
  const handlePlaceBid = async (customAmount?: number) => {
    if (!userRole || userRole === 'auctioneer' || userRole === 'spectator') return;

    // Calculate bid amount
    const targetBid = customAmount || nextMinBidLakhs;

    // 0ms Optimistic local update for instantaneous visual feedback
    setAuctionState(prev => ({
      ...prev,
      currentBidLakhs: targetBid,
      highestBidder: userRole,
      timerSeconds: prev.timerDuration || 10
    }));

    try {
      const response = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchiseName: userRole,
          bidAmountLakhs: targetBid
        })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok) {
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Bid rejected';
        setApiError(errorMsg || 'Bid rejected');
        fetchState(); // Revert to official state on rejection
        setTimeout(() => setApiError(null), 4000);
      }
    } catch (err) {
      console.error('Bid Error:', err);
      setApiError('Network error placing bid');
      fetchState();
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
        body: JSON.stringify({ action, playerId, timerDuration: auctionTimerDuration })
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

  // Handle custom room creation
  const handleCreateCustomRoom = async (roomData: {
    roomName: string;
    isPrivate: boolean;
    passcode: string;
    playerPoolSize: string;
    budgetCrores: number;
    numTeams: number;
    auctionMode: string;
  }) => {
    try {
      const response = await fetch('/api/auction/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_room',
          ...roomData
        })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (response.ok && isJson) {
        const result = await response.json();
        setGeneratedRoomCode(result.state.roomCode || '');
        setGeneratedPasscode(result.state.passcode || '');
        setApiError(null);
      } else {
        const errorMsg = isJson ? (await response.json()).error : 'Failed to create room';
        setApiError(errorMsg || 'Failed to create room');
      }
    } catch (err) {
      console.error('Create Custom Room Error:', err);
      setApiError('Network error creating room');
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

  const isAuctioneerConnected = useMemo(() => {
    return Object.values(auctionState.activeUsers || {}).some(u => u.role === 'auctioneer');
  }, [auctionState.activeUsers]);

  const participatingFranchises = useMemo(() => {
    const claimedFranchiseNames = Object.values(auctionState.activeUsers || {})
      .filter(u => u.role === 'franchise_owner' && !!u.franchise)
      .map(u => u.franchise);
    
    const filtered: Record<string, Franchise> = {};
    Object.keys(franchises).forEach(key => {
      if (claimedFranchiseNames.includes(key)) {
        filtered[key] = franchises[key];
      }
    });
    return filtered;
  }, [franchises, auctionState.activeUsers]);

  const activeTeamsCount = Object.keys(participatingFranchises).length;

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
    if (!isAuctioneerConnected) return { eligible: false, reason: 'Auctioneer is disconnected' };
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

  // --- SPA SCREEN RENDERS ---

  const renderHomeScreen = () => {
    const hasActiveRoom = !!auctionState.roomCode;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Premium Background Glow Orbs */}
        <div className="ambient-glow">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
        </div>

        <div className="max-w-md w-full space-y-8 bg-slate-900/45 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_60px_rgba(0,0,0,0.65)] relative overflow-hidden z-10">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border border-yellow-500/25 p-3 px-5 rounded-2xl shadow-lg shadow-yellow-500/5 hover:scale-102 transition-transform cursor-default">
              <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="font-display font-black text-sm tracking-widest text-yellow-400 uppercase">IPL Live Auction</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display leading-tight">
              Multiplayer Arena
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Experience the authentic thrill of the IPL auction. Connect with friends to own franchises, bid for players, and analyze squads in real-time.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {apiError && (
              <div className="bg-red-950/40 border border-red-800/80 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center animate-pulse">
                {apiError}
              </div>
            )}
            
            <button
              onClick={() => {
                setApiError(null);
                navigateTo('create_room');
              }}
              className="w-full flex items-center justify-between p-4.5 rounded-2xl border bg-slate-950/80 border-slate-850 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:bg-slate-900/40 text-slate-200 hover:text-white transition-all hover:scale-101 cursor-pointer shadow-md group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-yellow-400 border border-yellow-500/20 group-hover:bg-amber-500/20 transition-colors">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm">Create Auction Room</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Host a new public or private room</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </button>
 
            <button
              onClick={() => {
                setApiError(null);
                navigateTo('join_room');
              }}
              className="w-full flex items-center justify-between p-4.5 rounded-2xl border bg-slate-950/80 border-slate-850 hover:border-indigo-500/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:bg-slate-900/40 text-slate-200 hover:text-white transition-all hover:scale-101 cursor-pointer shadow-md group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm">Join Room</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Enter with a room code or link</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            {hasActiveRoom && !auctionState.isPrivate && (
              <button
                onClick={async () => {
                  setApiError(null);
                  const randomName = 'Spectator_' + Math.random().toString(36).substring(2, 6).toUpperCase();
                  await handleJoin('spectator', randomName, auctionState.roomCode || '');
                }}
                className="w-full flex items-center justify-between p-4.5 rounded-2xl border bg-indigo-950/20 border-indigo-900/50 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(129,140,248,0.1)] hover:bg-indigo-950/30 text-slate-200 hover:text-white transition-all hover:scale-101 cursor-pointer shadow-md group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-500/25 text-indigo-400 border border-indigo-550/20">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-indigo-300">Spectate Public Room</h4>
                    <p className="text-[10px] text-indigo-450 font-semibold">Watch active room live: {auctionState.roomName}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreateRoomScreen = () => {
    const inviteLink = generatedRoomCode 
      ? `${window.location.origin}/join/${generatedRoomCode}`
      : '';

    const handleCopyCode = () => {
      navigator.clipboard.writeText(generatedRoomCode);
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    };

    const handleCopyInvite = () => {
      navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    };

    if (generatedRoomCode) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          
          {/* Premium Background Glow Orbs */}
          <div className="ambient-glow">
            <div className="glow-orb-1" />
            <div className="glow-orb-2" />
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <button 
              type="button"
              onClick={() => {
                setGeneratedRoomCode('');
                setGeneratedPasscode('');
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="max-w-md w-full space-y-6 bg-slate-900/45 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_60px_rgba(0,0,0,0.65)] relative overflow-hidden z-10">
            {/* Header Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/25 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">Room Generated!</h2>
              <p className="text-xs text-slate-400 font-medium">Invite your friends to own franchises and bid.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Room Code</span>
                <div className="flex items-center space-x-3 mt-1.5">
                  <span className="font-mono font-black text-3xl tracking-widest text-yellow-400">{generatedRoomCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                    title="Copy Code"
                  >
                    {roomCodeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {roomCodeCopied && <span className="text-[9px] text-emerald-400 font-bold mt-1.5">Copied code to clipboard!</span>}
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center">Shareable Invite Link</span>
                <div className="flex items-center space-x-2 mt-2 bg-slate-900 border border-slate-850 rounded-xl p-2 pl-3">
                  <Link className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 truncate font-mono select-all flex-1">{inviteLink}</span>
                  <button
                    onClick={handleCopyInvite}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0 flex items-center justify-center"
                    title="Copy Invite Link"
                  >
                    {inviteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {inviteCopied && <span className="text-[9px] text-emerald-400 font-bold mt-1.5 block text-center">Copied link to clipboard!</span>}
              </div>

              {generatedPasscode && (
                <div className="bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20 text-center flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Private Passcode</span>
                  <span className="text-sm font-mono font-black text-amber-400 mt-0.5">{generatedPasscode}</span>
                </div>
              )}

              <button
                onClick={async () => {
                  const name = username || 'Host';
                  const code = generatedRoomCode;
                  setGeneratedRoomCode('');
                  setGeneratedPasscode('');
                  await handleJoin('auctioneer', name, code);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase py-4 rounded-2xl transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-98 cursor-pointer text-center block"
              >
                Enter Waiting Lobby
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Premium Background Glow Orbs */}
        <div className="ambient-glow">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-md w-full space-y-6 bg-slate-900/45 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_60px_rgba(0,0,0,0.65)] relative overflow-hidden z-10">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">Configure Room</h2>
            <p className="text-xs text-slate-400 font-medium">Specify rules for this IPL Auction session.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateCustomRoom({
                roomName: createRoomName,
                isPrivate: createIsPrivate,
                passcode: createPasscode,
                playerPoolSize: createPoolSize,
                budgetCrores: createBudgetCrores,
                numTeams: createNumTeams,
                auctionMode: createAuctionMode
              });
            }}
            className="space-y-4"
          >
            {/* Room Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Name</label>
              <input
                type="text"
                required
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                placeholder="e.g. Weekend IPL Draft"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-all"
              />
            </div>

            {/* Visibility Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auction Type</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    !createIsPrivate
                      ? 'bg-slate-950 border-amber-500 text-white shadow-md font-bold'
                      : 'bg-slate-950/20 border-slate-850 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🌍 Public
                </button>
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    createIsPrivate
                      ? 'bg-slate-950 border-amber-500 text-amber-450 shadow-md font-bold'
                      : 'bg-slate-950/20 border-slate-850 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🔑 Private
                </button>
              </div>
            </div>

            {/* Private Passcode */}
            {createIsPrivate && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Private Room Passcode</label>
                <input
                  type="text"
                  required
                  value={createPasscode}
                  onChange={(e) => setCreatePasscode(e.target.value)}
                  placeholder="Enter passcode shared with joiners"
                  className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-amber-400 outline-none transition-all font-mono"
                />
              </div>
            )}

            {/* Player Pool Size */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Player Pool</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: '15', label: '15' },
                  { id: '20', label: '20' },
                  { id: '25', label: '25' },
                  { id: 'full', label: 'Full' }
                ].map(pool => (
                  <button
                    type="button"
                    key={pool.id}
                    onClick={() => {
                      setCreatePoolSize(pool.id);
                      if (pool.id === '15') {
                        setCreateBudgetCrores(120);
                      } else if (pool.id === '20') {
                        setCreateBudgetCrores(135);
                      } else if (pool.id === '25' || pool.id === 'full') {
                        setCreateBudgetCrores(150);
                      }
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      createPoolSize === pool.id
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {pool.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Crores */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auction Budget per Team</label>
              <div className="grid grid-cols-3 gap-1">
                {[120, 135, 150].map(budget => (
                  <button
                    type="button"
                    key={budget}
                    onClick={() => setCreateBudgetCrores(budget)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      createBudgetCrores === budget
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    ₹{budget} Crore
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Teams */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Number of Teams: <span className="text-yellow-400 font-extrabold">{createNumTeams}</span></label>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={createNumTeams}
                onChange={(e) => setCreateNumTeams(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 cursor-pointer h-1.5 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>2 TEAMS</span>
                <span>6 TEAMS</span>
                <span>10 TEAMS</span>
              </div>
            </div>

            {/* Mode selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auction Mode</label>
              <div className="flex space-x-2">
                {['Normal', 'Fast Draft'].map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setCreateAuctionMode(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      createAuctionMode === m
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('home')}
                className="flex-1 bg-slate-900 border border-slate-850 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-98 cursor-pointer text-center"
              >
                Generate Room
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderJoinRoomScreen = () => {
    if (preFilledRoomCode && !joinRoomCode) {
      setJoinRoomCode(preFilledRoomCode);
    }

    const handleSubmitJoin = (e: React.FormEvent) => {
      e.preventDefault();
      handleJoin(joinRole, joinPlayerName, joinRoomCode, joinPasscode);
    };

    const handleInviteLinkChange = (val: string) => {
      setJoinInviteLinkInput(val);
      try {
        const url = new URL(val);
        const parts = url.pathname.split('/');
        if (parts[1] === 'join' && parts[2]) {
          setJoinRoomCode(parts[2].toUpperCase());
        }
      } catch (e) {
        if (val.length === 6) {
          setJoinRoomCode(val.toUpperCase());
        }
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Premium Background Glow Orbs */}
        <div className="ambient-glow">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-md w-full space-y-6 bg-slate-900/45 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_60px_rgba(0,0,0,0.65)] relative overflow-hidden z-10">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">Join Auction</h2>
            <p className="text-xs text-slate-400 font-medium">Enter room credentials to participate.</p>
          </div>

          <form onSubmit={handleSubmitJoin} className="space-y-4">
            {apiError && (
              <div className="bg-red-950/40 border border-red-800/80 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center animate-pulse">
                {apiError}
              </div>
            )}

            {/* Player Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Player Name</label>
              <input
                type="text"
                required
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                placeholder="e.g. Rahul, Arjun, Parthiv"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-all"
              />
            </div>

            {/* Paste Invite Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paste Invite Link OR Room Code</label>
              <input
                type="text"
                value={joinInviteLinkInput}
                onChange={(e) => handleInviteLinkChange(e.target.value)}
                placeholder="e.g. https://mywebsite.com/join/A7P9KD"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-all font-mono"
              />
            </div>

            {/* Room Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Room Code</label>
              <input
                type="text"
                required
                readOnly={!!preFilledRoomCode}
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="A7P9KD"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono text-center tracking-widest font-black ${
                  preFilledRoomCode ? 'border-emerald-500/40 text-emerald-405 cursor-not-allowed bg-emerald-500/5' : 'border-slate-800 focus:border-amber-500 text-yellow-400'
                }`}
              />
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'franchise_owner', label: 'Owner', desc: 'Own franchise' },
                  { id: 'spectator', label: 'Spectator', desc: 'Watch live' },
                  { id: 'auctioneer', label: 'Auctioneer', desc: 'Admin' }
                ].map(r => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setJoinRole(r.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      joinRole === r.id
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase leading-tight">{r.label}</span>
                    <span className="text-[8px] text-slate-500 font-medium leading-none mt-1">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Passcode (if private) */}
            {joinRole !== 'auctioneer' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passcode (If Room is Private)</label>
                <input
                  type="password"
                  value={joinPasscode}
                  onChange={(e) => setJoinPasscode(e.target.value)}
                  placeholder="Passcode from Auctioneer"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-all font-mono text-center"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPreFilledRoomCode('');
                  setJoinRoomCode('');
                  setJoinInviteLinkInput('');
                  setCurrentScreen('home');
                }}
                className="flex-1 bg-slate-900 border border-slate-850 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!joinPlayerName || !joinRoomCode}
                className={`flex-1 font-black text-xs uppercase py-3 rounded-xl transition-all shadow-lg text-center cursor-pointer ${
                  joinPlayerName && joinRoomCode
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:shadow-yellow-500/20 active:scale-98'
                    : 'bg-slate-850 text-slate-600 cursor-not-allowed'
                }`}
              >
                Join Room
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Lobby Screen Render
  const renderLobbyScreen = () => {
    const activeUsersList = Object.values(auctionState.activeUsers || {});
    
    // Check if the current user is ready
    const myUser = activeUsersList.find(u => u.userId === userId);
    const isReady = myUser?.isReady || false;
    const myFranchiseSelection = myUser?.franchise || null;

    // Check how many teams are configured
    const maxTeamsCount = auctionState.numTeams || 10;
    const teamKeys = [
      { name: 'CSK', fullName: 'Chennai Super Kings', color: '#F7D117', textColor: '#000000' },
      { name: 'MI', fullName: 'Mumbai Indians', color: '#004BA0', textColor: '#FFFFFF' },
      { name: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24', textColor: '#FFFFFF' },
      { name: 'KKR', fullName: 'Kolkata Knight Riders', color: '#2E0854', textColor: '#F7D117' },
      { name: 'GT', fullName: 'Gujarat Titans', color: '#1B254B', textColor: '#D4AF37' },
      { name: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A85', textColor: '#FFFFFF' },
      { name: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#FF8225', textColor: '#000000' },
      { name: 'PBKS', fullName: 'Punjab Kings', color: '#D71920', textColor: '#FFFFFF' },
      { name: 'LSG', fullName: 'Lucknow Super Giants', color: '#0057B8', textColor: '#FFD700' },
      { name: 'DC', fullName: 'Delhi Capitals', color: '#000080', textColor: '#FF4500' }
    ];

    // Enforce condition for Auctioneer to start:
    // - There is at least 1 Franchise Owner
    // - Every connected Franchise Owner has selected a team
    // - Every connected Franchise Owner is Ready
    const franchiseOwners = activeUsersList.filter(u => u.role === 'franchise_owner');
    const allOwnersSelected = franchiseOwners.length > 0 && franchiseOwners.every(u => !!u.franchise);
    const allOwnersReady = franchiseOwners.length > 0 && franchiseOwners.every(u => u.isReady);
    const canStartAuction = franchiseOwners.length > 0 && allOwnersSelected && allOwnersReady;

    const lobbyInviteLink = `${window.location.origin}/join/${auctionState.roomCode || ''}`;

    const handleCopyCodeLobby = () => {
      navigator.clipboard.writeText(auctionState.roomCode || '');
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    };

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        
        {/* Lobby Header */}
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLogout(cameFromScreen || 'home')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-750 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3 border-l border-slate-850 pl-4">
              <div className="bg-amber-500/10 p-2 rounded-xl text-yellow-400 border border-yellow-500/20">
                <Landmark className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white tracking-tight uppercase font-display flex items-center gap-2">
                  <span>{auctionState.roomName}</span>
                  <span className="text-[9px] bg-amber-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">
                    {auctionState.isPrivate ? '🔑 PRIVATE LOBBY' : '🌍 PUBLIC LOBBY'}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono">Waiting Lobby System</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-400 hover:text-red-400 hover:border-red-950 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side: Room details & Connected Users panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Lobby Information Card */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Lobby Info</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Room Code</div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-black text-sm text-yellow-400">{auctionState.roomCode}</span>
                    <button
                      onClick={handleCopyCodeLobby}
                      className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      {roomCodeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Player Pool</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{auctionState.playerPoolSize === 'full' ? 'Full Pool (333)' : `${auctionState.playerPoolSize} Players`}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Team Budget</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">₹{(auctionState.totalPurseLakhs || 15000) / 100} Crore</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Franchises</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{maxTeamsCount} Teams</div>
                </div>
              </div>

              {/* Invite link snippet */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase block text-center">Share Invitation</span>
                <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1.5 pl-2 text-[10px]">
                  <span className="text-slate-400 font-mono truncate select-all flex-1">{lobbyInviteLink}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lobbyInviteLink);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  >
                    {inviteCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Connected Users panel */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Connected Players ({activeUsersList.length})</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeUsersList.map(user => {
                  const isCurrent = user.userId === userId;
                  const selectedTeam = teamKeys.find(t => t.name === user.franchise);
                  
                  return (
                    <div 
                      key={user.userId}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent 
                          ? 'bg-slate-950 border-amber-500/40 shadow-sm' 
                          : 'bg-slate-950 border-slate-850'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                        {/* Initials badge */}
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs flex-shrink-0"
                          style={{
                            backgroundColor: selectedTeam ? `${selectedTeam.color}15` : '#1e293b',
                            color: selectedTeam ? selectedTeam.color : '#94a3b8',
                            border: `1px solid ${selectedTeam ? selectedTeam.color : '#334155'}`
                          }}
                        >
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{user.username}</span>
                            {isCurrent && <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-1 py-0.2 rounded border border-yellow-500/25">YOU</span>}
                          </div>
                          <div className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">
                            {user.role === 'auctioneer' ? 'Auctioneer Admin' : user.role === 'spectator' ? 'Spectator' : user.franchise ? `${user.franchise} Owner` : 'Franchise Owner'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {user.role === 'franchise_owner' && (
                          <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${
                            user.isReady 
                              ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                              : 'bg-slate-900 text-slate-500 border border-slate-850'
                          }`}>
                            {user.isReady ? '✔ READY' : 'WAITING'}
                          </span>
                        )}
                        {user.role === 'auctioneer' && (
                          <span className="bg-amber-500/10 text-yellow-450 px-2 py-0.5 rounded-md font-black text-[9px] border border-yellow-500/20 font-bold">HOST</span>
                        )}
                        {user.role === 'spectator' && (
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-black text-[9px] border border-indigo-500/20 font-bold">WATCHING</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Side: Team Status Panel & Ready actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Team selection status */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">IPL Franchise Ownership</h3>
                <span className="text-[10px] text-slate-500">Only 1 Owner per Franchise</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamKeys.map(team => {
                  // Find owner
                  const owner = activeUsersList.find(u => u.franchise === team.name);
                  const isOwnedByMe = myFranchiseSelection === team.name;
                  const isUserFranchiseOwner = myUser?.role === 'franchise_owner';
                  
                  return (
                    <div 
                      key={team.name}
                      className="relative p-3 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between transition-all overflow-hidden"
                    >
                      {/* Left color bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: team.color }}
                      />

                      <div className="pl-3 min-w-0 mr-2">
                        <span className="font-sans font-black text-sm tracking-wide block" style={{ color: team.color }}>
                          {team.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block font-medium mt-0.5">{team.fullName}</span>
                        {owner ? (
                          <span className="text-[9px] text-amber-500 font-bold block mt-1">
                            ✔ Owned by {owner.username}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-650 italic block mt-1">Available</span>
                        )}
                      </div>

                      {isUserFranchiseOwner && (
                        <div className="flex-shrink-0">
                          {owner ? (
                            isOwnedByMe ? (
                              <button
                                onClick={() => handleSelectFranchise(null)}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-550/20 text-red-400 font-black text-[9px] uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                              >
                                Release
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-900 border border-slate-850 text-slate-650 font-black text-[9px] uppercase rounded-lg tracking-wider cursor-not-allowed font-bold">
                                Occupied
                              </span>
                            )
                          ) : (
                            <button
                              onClick={() => handleSelectFranchise(team.name)}
                              disabled={!!myFranchiseSelection || (activeUsersList.filter(u => !!u.franchise).length >= maxTeamsCount)}
                              className={`px-3 py-1 font-black text-[9px] uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                                (myFranchiseSelection || (activeUsersList.filter(u => !!u.franchise).length >= maxTeamsCount))
                                  ? 'bg-slate-900 border border-slate-850 text-slate-650 cursor-not-allowed font-bold'
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-102 active:scale-95'
                              }`}
                            >
                              Claim
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waiting/Actions panel */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col justify-center items-center text-center space-y-4">
              {myUser?.role === 'auctioneer' ? (
                // Auctioneer / Host start panel
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Start Auction Controls</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      You must wait for required franchise owners to claim teams and click ready.
                    </p>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-xs text-left space-y-2.5 max-w-sm mx-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Franchise Owner Connected:</span>
                      <span className={`font-mono font-bold ${franchiseOwners.length > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {franchiseOwners.length > 0 ? '✔ YES' : '❌ NO'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">All Owners Selected Team:</span>
                      <span className={`font-mono font-bold ${allOwnersSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {allOwnersSelected ? '✔ YES' : '⏳ PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">All Joined Owners Ready:</span>
                      <span className={`font-mono font-bold ${allOwnersReady ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {allOwnersReady ? '✔ YES' : '⏳ PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Timer Duration Selection */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 space-y-2.5 max-w-sm mx-auto">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Countdown Timer Per Player</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([3, 5, 10, 15] as const).map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setAuctionTimerDuration(dur)}
                          className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            auctionTimerDuration === dur
                              ? 'bg-amber-500/15 border-amber-500 text-yellow-400 shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 text-center font-medium">
                      Selected: <span className="text-yellow-400 font-black">{auctionTimerDuration} seconds</span> per player · Bids auto-reset the timer
                    </p>
                  </div>

                  <button
                    onClick={() => handleAdminAction('start_auction')}
                    disabled={!canStartAuction}
                    className={`w-full max-w-sm py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg mx-auto block cursor-pointer ${
                      canStartAuction
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:shadow-yellow-500/25 hover:scale-102 active:scale-98'
                        : 'bg-slate-800 border border-slate-850 text-slate-650 cursor-not-allowed font-bold'
                    }`}
                  >
                    Start Auction Live
                  </button>
                </div>
              ) : (
                // Franchise Owner / Spectator panel
                <div className="w-full space-y-4">
                  {myUser?.role === 'franchise_owner' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Ready Status Check</h3>
                        <p className="text-xs text-slate-400 font-medium">
                          Toggle your ready status. The host can only launch once everyone is checked in.
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleReady(!isReady)}
                        disabled={!myFranchiseSelection}
                        className={`w-full max-w-sm py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg mx-auto block cursor-pointer border ${
                          isReady 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
                            : myFranchiseSelection 
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-transparent hover:shadow-yellow-500/15'
                              : 'bg-slate-900 border-slate-850 text-slate-650 cursor-not-allowed font-bold'
                        }`}
                      >
                        {!myFranchiseSelection 
                          ? 'Select Franchise First' 
                          : isReady 
                            ? '✔ You are Ready' 
                            : 'Set Ready Status'}
                      </button>
                    </div>
                  )}

                  {/* Illustration/Waiting Status indicator */}
                  <div className="pt-2 flex flex-col items-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 border border-slate-800 text-yellow-400 animate-spin">
                      <RefreshCw className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Waiting for Auctioneer to start...</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    );
  };

  // Render selection if not logged in
  if (!userId || !userRole) {
    if (currentScreen === 'create_room') {
      return renderCreateRoomScreen();
    }
    if (currentScreen === 'join_room') {
      return renderJoinRoomScreen();
    }
    return renderHomeScreen();
  }

  // Render Waiting Lobby if lobby view is active
  if (currentScreen === 'lobby') {
    return renderLobbyScreen();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Leave Confirmation Modal */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Leave Bidding Arena?</h3>
              <p className="text-xs text-slate-400 font-medium">
                The auction is in progress. Are you sure you want to leave?
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="flex-1 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-750 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirmation(false);
                  handleLogout('home');
                }}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Banner Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const isAuctionActive = auctionState.lobbyStatus === 'active' && !auctionState.isEnded;
              if (isAuctionActive) {
                setShowLeaveConfirmation(true);
              } else {
                handleLogout();
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3 border-l border-slate-850 pl-4">
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
            franchises={participatingFranchises} 
            players={players} 
            soldPlayers={auctionState.soldPlayers} 
            userRole={userRole}
            maxSquadSize={auctionState.maxSquadSize}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            players={players} 
            franchises={participatingFranchises} 
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
              
              {!isAuctioneerConnected && (
                <div className="bg-red-950/40 border-2 border-red-500 text-red-400 p-6 rounded-3xl text-center space-y-2 animate-pulse shadow-lg">
                  <AlertTriangle className="w-8 h-8 mx-auto text-red-550" />
                  <h3 className="font-extrabold text-base uppercase text-white font-display">Auctioneer Disconnected</h3>
                  <p className="text-xs text-slate-300 font-bold">
                    Auctioneer disconnected. Waiting for reconnection...
                  </p>
                </div>
              )}
              
              {/* SOLD / UNSOLD Result Banner — auto-hides after 3s */}
              {auctionState.lastResultMessage && (
                <div className={`p-5 rounded-2xl border-2 text-center font-black text-sm uppercase tracking-wider transition-all animate-pulse ${
                  auctionState.lastResultType === 'sold'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400'
                    : 'bg-red-950/40 border-red-500/60 text-red-400'
                }`}>
                  {auctionState.lastResultType === 'sold' ? '🔨 ' : '❌ '}
                  {auctionState.lastResultMessage}
                </div>
              )}

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

                      {/* Timer Countdown widget — animated circular SVG */}
                      {(() => {
                        const total = auctionState.timerDuration || 10;
                        const remaining = auctionState.timerSeconds;
                        const pct = Math.max(0, Math.min(1, remaining / total));
                        const radius = 44;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference * (1 - pct);
                        const isUrgent = remaining <= 3;
                        const isWarning = remaining <= Math.ceil(total / 2) && !isUrgent;
                        const strokeColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
                        const textColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
                        return (
                          <div className={`bg-slate-950 p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            isUrgent ? 'border-red-500/60' : isWarning ? 'border-amber-500/40' : 'border-slate-850'
                          }`}>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Bid Clock</span>
                              <span className="text-xs text-slate-400">Auto result when timer expires</span>
                              <div className="text-[9px] font-mono text-slate-600">
                                Duration: <span className="text-slate-400 font-bold">{total}s / player</span>
                              </div>
                            </div>
                            <div className={`relative flex items-center justify-center ${isUrgent ? 'animate-pulse' : ''}`}>
                              <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
                                <circle
                                  cx="50" cy="50" r={radius}
                                  fill="none"
                                  stroke={strokeColor}
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  transform="rotate(-90 50 50)"
                                  style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
                                />
                                <text x="50" y="46" textAnchor="middle" fill={textColor} fontSize="22" fontWeight="900" fontFamily="monospace" style={{ transition: 'fill 0.3s ease' }}>
                                  {remaining}
                                </text>
                                <text x="50" y="62" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">SEC</text>
                              </svg>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* LIVE Bidding Actions (Team Owners) */}
                    {userRole !== 'auctioneer' && userRole !== 'spectator' && (
                      <div className="pt-2">
                        {biddingRuleCheck.eligible ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                              {/* Primary Place Minimum Bid Button */}
                              <button
                                type="button"
                                onClick={() => handlePlaceBid()}
                                className="sm:col-span-8 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase py-4 sm:py-4.5 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-95 scale-100 cursor-pointer select-none touch-manipulation w-full"
                              >
                                Place Bid of ₹{formatPrice(nextMinBidLakhs)}
                              </button>

                              {/* Pass button */}
                              <button
                                type="button"
                                onClick={handlePass}
                                className="sm:col-span-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-3.5 sm:py-4 rounded-2xl text-xs transition-all cursor-pointer select-none touch-manipulation w-full"
                              >
                                Decides to Pass
                              </button>
                            </div>

                            {/* Quick Bid additions */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-950 p-3 rounded-xl border border-slate-850/80 gap-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Bumps</span>
                              <div className="grid grid-cols-4 sm:flex space-x-0 sm:space-x-1.5 gap-1.5 text-[10px]">
                                {[10, 20, 50, 100].map(bump => {
                                  const targetBumpVal = nextMinBidLakhs + bump;
                                  return (
                                    <button
                                      key={bump}
                                      type="button"
                                      onClick={() => handlePlaceBid(targetBumpVal)}
                                      className="bg-slate-900 border border-slate-800 hover:border-slate-650 text-slate-300 hover:text-yellow-400 font-mono font-bold px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer select-none touch-manipulation text-center"
                                    >
                                      +{bump} L
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex items-center space-x-3 text-slate-500 text-xs text-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0" />
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
                    <div className="grid grid-cols-2 gap-3 text-xs">
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
                            placeholder="Search 528 players..."
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
                  <span className="text-[10px] text-slate-500">{activeTeamsCount} Teams</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(Object.values(participatingFranchises) as Franchise[]).map((team) => {
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
