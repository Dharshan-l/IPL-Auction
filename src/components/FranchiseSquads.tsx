import React, { useState } from 'react';
import { Shield, Coins, Users, Award, Landmark, User, X, Check, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Franchise, Player } from '../types';
import PlayerImage from './PlayerImage';

interface FranchiseSquadsProps {
  franchises: Record<string, Franchise>;
  players: Player[];
  soldPlayers: Record<string, { franchise: string; priceLakhs: number }>;
  userRole?: string | null;
  maxSquadSize?: number;
}

export default function FranchiseSquads({ franchises, players, soldPlayers, userRole, maxSquadSize = 25 }: FranchiseSquadsProps) {
  const [selectedFranchise, setSelectedFranchise] = useState<string>('CSK');
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'lineup'>('roster');
  const [savingXi, setSavingXi] = useState(false);
  const [xiError, setXiError] = useState<string | null>(null);

  const franchiseDetails = franchises[selectedFranchise];

  const teamList = [
    { name: 'CSK', fullName: 'Chennai Super Kings', color: '#F7D117', textColor: '#000000', quote: 'Whistle Podu!' },
    { name: 'MI', fullName: 'Mumbai Indians', color: '#004BA0', textColor: '#FFFFFF', quote: 'Aala Re!' },
    { name: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24', textColor: '#FFFFFF', quote: 'Ee Sala Cup Namde!' },
    { name: 'KKR', fullName: 'Kolkata Knight Riders', color: '#2E0854', textColor: '#F7D117', quote: 'Korbo Lorbo Jeetbo!' },
    { name: 'GT', fullName: 'Gujarat Titans', color: '#1B254B', textColor: '#D4AF37', quote: 'Aava De!' },
    { name: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A85', textColor: '#FFFFFF', quote: 'Halla Bol!' },
    { name: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#FF8225', textColor: '#000000', quote: 'Play with Fire!' },
    { name: 'PBKS', fullName: 'Punjab Kings', color: '#D71920', textColor: '#FFFFFF', quote: 'Sadda Punjab!' },
    { name: 'LSG', fullName: 'Lucknow Super Giants', color: '#0057B8', textColor: '#FFD700', quote: 'Gazab Andaz!' },
    { name: 'DC', fullName: 'Delhi Capitals', color: '#000080', textColor: '#FF4500', quote: 'Roar Macha!' }
  ];

  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Crore`;
    return `₹${lakhs} Lakh`;
  };

  const currentFranchiseUI = teamList.find(t => t.name === selectedFranchise) || teamList[0];

  // Get bought players
  const boughtPlayers = (franchiseDetails?.playersBoughtIds || []).map(id => {
    const player = players.find(p => p.id === id);
    const soldPrice = soldPlayers[id]?.priceLakhs || player?.basePriceLakhs || 0;
    return player ? { ...player, soldPrice } : null;
  }).filter((p): p is (Player & { soldPrice: number }) => p !== null);

  // Filter XI players
  const starting11Ids = franchiseDetails?.starting11PlayerIds || [];
  const starting11Players = boughtPlayers.filter(p => starting11Ids.includes(p.id));

  // Determine permissions
  const canEditXi = userRole === 'auctioneer' || userRole === selectedFranchise;

  // Compute Starting XI Compliance Metrics
  const overseasXiCount = starting11Players.filter(p => p.countryType === 'Overseas').length;
  const wicketKeepersXiCount = starting11Players.filter(p => p.role === 'Wicket Keeper').length;

  const handleToggleStartingXI = async (playerId: string) => {
    if (!canEditXi) return;

    let updatedIds = [...starting11Ids];
    const isAdding = !updatedIds.includes(playerId);

    if (isAdding) {
      if (updatedIds.length >= 11) {
        setXiError('Starting XI cannot exceed 11 players. Please deselect a player first.');
        setTimeout(() => setXiError(null), 4000);
        return;
      }

      const playerToToggle = players.find(p => p.id === playerId);
      if (playerToToggle?.countryType === 'Overseas') {
        const currentOverseasCount = boughtPlayers.filter(p => updatedIds.includes(p.id) && p.countryType === 'Overseas').length;
        if (currentOverseasCount >= 4) {
          setXiError('IPL Rules violation: Maximum of 4 Overseas players allowed in the Playing XI!');
          setTimeout(() => setXiError(null), 4000);
          return;
        }
      }

      updatedIds.push(playerId);
    } else {
      updatedIds = updatedIds.filter(id => id !== playerId);
    }

    setSavingXi(true);
    setXiError(null);
    try {
      const response = await fetch(`/api/franchises/${selectedFranchise}/starting11`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starting11PlayerIds: updatedIds })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update Playing XI');
      }
    } catch (err: any) {
      setXiError(err.message || 'Error updating Playing XI');
      setTimeout(() => setXiError(null), 4000);
    } finally {
      setSavingXi(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Franchise Tabs selector */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-900">
        {teamList.map((t) => {
          const isActive = selectedFranchise === t.name;
          const boughtCount = franchises[t.name]?.playersBoughtIds?.length || 0;
          return (
            <button
              key={t.name}
              id={`franchise-tab-${t.name}`}
              onClick={() => {
                setSelectedFranchise(t.name);
                setXiError(null);
              }}
              className={`flex-1 min-w-[75px] py-2 px-1 text-center rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'shadow-lg text-slate-950 font-black scale-102 animate-pulse-subtle'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
              style={{
                backgroundColor: isActive ? t.color : 'transparent',
                color: isActive ? t.textColor : undefined,
              }}
            >
              <div>{t.name}</div>
              <div className="text-[9px] opacity-70">({boughtCount})</div>
            </button>
          );
        })}
      </div>

      {/* Roster overview & Franchise Stats */}
      {franchiseDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Panel: Stats and Playing XI Checklist (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Squad Stats Summary Card */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-850 opacity-10 blur-xl rounded-full" />
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full border border-slate-850"
                    style={{ backgroundColor: currentFranchiseUI.color }}
                  />
                  <h3 className="font-extrabold text-base text-white tracking-tight">{franchiseDetails.fullName}</h3>
                </div>
                <p className="text-xs text-slate-400 italic">"{currentFranchiseUI.quote}"</p>
              </div>

              {/* Metrics list */}
              <div className="space-y-2 text-xs">
                {/* Remaining Purse */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400">Purse Remaining</span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-400">
                    {formatPrice(franchiseDetails.remainingPurseLakhs)}
                  </span>
                </div>

                {/* Roster Strength */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-slate-400">Squad Strength</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    {franchiseDetails.playersBoughtIds.length} <span className="text-slate-500 font-normal text-[10px]">/ {maxSquadSize} max</span>
                  </span>
                </div>

                {/* splits */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <span>Indian / Overseas</span>
                    <span>{franchiseDetails.indianCount} IND • {franchiseDetails.overseasCount} OS</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="bg-yellow-400 h-full" style={{ width: `${(franchiseDetails.indianCount / Math.max(1, franchiseDetails.playersBoughtIds.length)) * 100}%` }} />
                    <div className="bg-indigo-400 h-full" style={{ width: `${(franchiseDetails.overseasCount / Math.max(1, franchiseDetails.playersBoughtIds.length)) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Roster Compliance Checklist */}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-2 text-[11px] text-slate-400 leading-normal">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Roster Compliance Checklist</span>
                <div className="flex items-center space-x-2">
                  <span className={franchiseDetails.playersBoughtIds.length >= 18 ? 'text-emerald-400' : 'text-slate-600'}>●</span>
                  <span>Min 18 players required (Squad: {franchiseDetails.playersBoughtIds.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={franchiseDetails.playersBoughtIds.length <= maxSquadSize ? 'text-emerald-400' : 'text-red-400'}>●</span>
                  <span>Max {maxSquadSize} players limit ({maxSquadSize - franchiseDetails.playersBoughtIds.length} slots left)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={franchiseDetails.overseasCount <= 8 ? 'text-emerald-400' : 'text-red-400'}>●</span>
                  <span>Max 8 Overseas players ({8 - franchiseDetails.overseasCount} slots left)</span>
                </div>
              </div>
            </div>

            {/* Playing XI Compliance Dashboard */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Playing XI Rules</span>
                </h4>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                  {starting11Players.length} / 11 Locked
                </span>
              </div>

              <div className="space-y-3 text-[11px] text-slate-400">
                {/* Rule 1: Exactly 11 players */}
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <span>Squad Count (Exactly 11)</span>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                    starting11Players.length === 11 
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40' 
                      : 'text-amber-400 bg-amber-950/20 border border-amber-900/20'
                  }`}>
                    {starting11Players.length} / 11
                  </span>
                </div>

                {/* Rule 2: Max 4 Overseas */}
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <span>Overseas Limit (Max 4)</span>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                    overseasXiCount <= 4 
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40' 
                      : 'text-red-400 bg-red-950/20 border border-red-900/20'
                  }`}>
                    {overseasXiCount} / 4
                  </span>
                </div>

                {/* Rule 3: Wicket Keeper required */}
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <span>Wicket Keeper (Min 1)</span>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                    wicketKeepersXiCount >= 1 
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40' 
                      : 'text-amber-400 bg-amber-950/20 border border-amber-900/20'
                  }`}>
                    {wicketKeepersXiCount} / 1+
                  </span>
                </div>
              </div>

              {xiError && (
                <div className="bg-red-950/30 border border-red-900/40 text-red-400 p-2.5 rounded-xl text-[10px] flex items-center space-x-1.5 animate-bounce">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{xiError}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-relaxed">
                {canEditXi 
                  ? "👉 You represent this franchise! Toggle any player on the right to lock your Playing XI."
                  : "🔒 Read-only view. Only CSU/MI owners or the Auctioneer can modify this Playing XI."}
              </p>
            </div>
          </div>

          {/* Right Panel: Playing XI Pitch or Roster Listing (8 Columns) */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-5">
            
            {/* Header sub-tabs: Lineup or List */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex space-x-2">
                <button
                  id="tab-roster-list"
                  onClick={() => setActiveSubTab('roster')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeSubTab === 'roster'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Manage Playing XI
                </button>
                <button
                  id="tab-lineup-pitch"
                  onClick={() => setActiveSubTab('lineup')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeSubTab === 'lineup'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Visual 3D Pitch Lineup</span>
                </button>
              </div>

              {savingXi && (
                <span className="text-[10px] text-yellow-400 font-semibold animate-pulse">Saving Playing XI...</span>
              )}
            </div>

            {/* RENDER TAB 1: Roster checklist */}
            {activeSubTab === 'roster' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white">Squad Players & Starting XI Toggles</h4>
                  <span className="text-[10px] text-slate-500">Click a card to add or remove players from the Starting XI</span>
                </div>

                {boughtPlayers.length === 0 ? (
                  <div className="p-16 text-center border border-dashed border-slate-850 rounded-2xl text-xs text-slate-500">
                    This franchise has not bought any players yet in this auction.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {boughtPlayers.map((player) => {
                      const isSelected = starting11Ids.includes(player.id);
                      return (
                        <div 
                          key={player.id}
                          onClick={() => canEditXi && handleToggleStartingXI(player.id)}
                          className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                            canEditXi ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'
                          } ${
                            isSelected 
                              ? 'bg-slate-900 border-yellow-500/30 shadow-lg shadow-yellow-500/[0.02]' 
                              : 'bg-slate-950 border-slate-850'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <PlayerImage 
                                player={player} 
                                className={`w-11 h-11 rounded-xl object-cover border ${
                                  isSelected ? 'border-yellow-500/40' : 'border-slate-800'
                                }`}
                              />
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-200 flex items-center gap-1.5">
                                  <span>{player.name}</span>
                                  {player.countryType === 'Overseas' && (
                                    <span className="text-[8px] bg-indigo-950/60 text-indigo-400 px-1 py-0.5 rounded border border-indigo-900/30">OS</span>
                                  )}
                                </h5>
                                <p className="text-[10px] text-slate-500">{player.role} • {player.country}</p>
                              </div>
                            </div>

                            {canEditXi && (
                              <button
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                  isSelected 
                                    ? 'bg-yellow-400 border-yellow-500 text-slate-950' 
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          {/* Mini details list */}
                          <div className="grid grid-cols-2 gap-y-1 gap-x-2 mt-3 pt-2.5 border-t border-slate-900 text-[10px] text-slate-500 font-medium">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Batting:</span>
                              <span className="text-slate-400 truncate max-w-[80px]">{player.battingStyle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Bowling:</span>
                              <span className="text-slate-400 truncate max-w-[80px]">{player.bowlingStyle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Matches:</span>
                              <span className="text-slate-400">{player.stats.matches}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Runs/Wickets:</span>
                              <span className="text-slate-400">{player.stats.runs}R / {player.stats.wickets}W</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RENDER TAB 2: Lineup cricket pitch */}
            {activeSubTab === 'lineup' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Designated Playing XI Lineup</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total: {starting11Players.length} / 11 Players
                  </span>
                </div>

                {/* The Cricket Pitch container */}
                <div className="relative bg-gradient-to-b from-emerald-950 to-slate-950 rounded-2xl border border-emerald-800/40 p-6 flex flex-col justify-between overflow-hidden min-h-[460px]">
                  
                  {/* Boundary lines */}
                  <div className="absolute inset-4 rounded-full border border-white/[0.04] flex items-center justify-center pointer-events-none">
                    <div className="absolute w-36 h-36 rounded-full border border-white/[0.02]" />
                  </div>
                  {/* Pitch representation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-36 border border-white/[0.05] bg-amber-950/15 pointer-events-none rounded flex flex-col justify-between p-1">
                    <div className="w-full h-1 border-t border-white/10" />
                    <div className="w-full h-1 border-b border-white/10" />
                  </div>

                  {/* Pitch sections overlay */}
                  <div className="relative z-10 space-y-8 flex-1 flex flex-col justify-between py-2">
                    
                    {/* Position 1: Top Order / Batters */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase block text-center">Top Order / Batsmen</span>
                      <div className="flex flex-wrap justify-center gap-4">
                        {starting11Players.filter(p => p.role === 'Batter').length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic">No Batsmen selected in Starting XI</div>
                        ) : (
                          starting11Players.filter(p => p.role === 'Batter').map(player => (
                            <div key={player.id} className="bg-slate-900/90 backdrop-blur border border-emerald-500/20 rounded-xl px-2.5 py-1.5 flex items-center space-x-2 text-xs shadow-md">
                              <PlayerImage player={player} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                              <div className="text-left">
                                <p className="font-extrabold text-[10px] text-white leading-tight">{player.name}</p>
                                <p className="text-[8px] text-slate-400">Batter • {player.country}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Position 2: Keepers & All-Rounders */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase block text-center">Middle Order & All-Rounders</span>
                      <div className="flex flex-wrap justify-center gap-4">
                        {starting11Players.filter(p => p.role === 'All-rounder' || p.role === 'Wicket Keeper').length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic">No All-rounders or Keepers selected in Starting XI</div>
                        ) : (
                          starting11Players.filter(p => p.role === 'All-rounder' || p.role === 'Wicket Keeper').map(player => (
                            <div key={player.id} className="bg-slate-900/90 backdrop-blur border border-yellow-500/20 rounded-xl px-2.5 py-1.5 flex items-center space-x-2 text-xs shadow-md">
                              <PlayerImage player={player} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                              <div className="text-left">
                                <p className="font-extrabold text-[10px] text-white leading-tight flex items-center gap-1">
                                  <span>{player.name}</span>
                                  {player.role === 'Wicket Keeper' && <span className="text-[8px] text-yellow-400">🧤</span>}
                                </p>
                                <p className="text-[8px] text-slate-400">{player.role} • {player.country}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Position 3: Bowlers */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase block text-center">Bowling Attack</span>
                      <div className="flex flex-wrap justify-center gap-4">
                        {starting11Players.filter(p => p.role === 'Bowler').length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic">No Bowlers selected in Starting XI</div>
                        ) : (
                          starting11Players.filter(p => p.role === 'Bowler').map(player => (
                            <div key={player.id} className="bg-slate-900/90 backdrop-blur border border-indigo-500/20 rounded-xl px-2.5 py-1.5 flex items-center space-x-2 text-xs shadow-md">
                              <PlayerImage player={player} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                              <div className="text-left">
                                <p className="font-extrabold text-[10px] text-white leading-tight">{player.name}</p>
                                <p className="text-[8px] text-slate-400">{player.bowlingStyle} • {player.country}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Empty state overlay warning if playing XI is incomplete */}
                  {starting11Players.length < 11 && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                      <h5 className="font-black text-sm text-white">Playing XI Incomplete</h5>
                      <p className="text-xs text-slate-400 max-w-[280px]">
                        Select exactly **11 players** from your squad list on the "Manage Playing XI" tab to render the complete visual pitch lineup!
                      </p>
                      <button 
                        onClick={() => setActiveSubTab('roster')}
                        className="bg-slate-800 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-750 transition-all mt-2 cursor-pointer"
                      >
                        Add Players Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
