import React, { useState, useMemo, useEffect } from 'react';
import { Award, Zap, TrendingDown, DollarSign, Users, HelpCircle, Activity, ChevronRight, Sparkles, AlertCircle, RefreshCw, Trophy, Crown, Medal } from 'lucide-react';
import { Player, Franchise } from '../types';
import PlayerImage from './PlayerImage';

interface AnalyticsProps {
  players: Player[];
  franchises: Record<string, Franchise>;
  soldPlayers: Record<string, { franchise: string; priceLakhs: number }>;
  unsoldPlayerIds: string[];
  logs: any[];
}

export default function Analytics({ players, franchises, soldPlayers, unsoldPlayerIds, logs }: AnalyticsProps) {
  const [subTab, setSubTab] = useState<'stats' | 'ai'>('stats');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(() => localStorage.getItem('ipl_ai_report'));
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Rotate loading text for better UX engagement
  const loadingSteps = [
    "Spinning up the Gemini cricket strategist model...",
    "Analyzing franchise squad depths and roster balance...",
    "Computing designated Starting XI batsman vs bowler match-ups...",
    "Evaluating strike rates, bowling economies, and age distributions...",
    "Checking IPL playing rules compliance (Max 4 Overseas players)...",
    "Running 10,000 simulated tournament match progressions...",
    "Constructing final Power Rankings and crowning the Champion..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loadingAi) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingAi]);

  // Format Lakhs to Crore or Lakh
  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Crore`;
    return `₹${lakhs} Lakh`;
  };

  // 1. Most expensive player
  const mostExpensivePlayer = useMemo(() => {
    const soldEntries = Object.entries(soldPlayers);
    if (soldEntries.length === 0) return null;

    let maxPrice = -1;
    let maxPlayerId = '';
    let buyingTeam = '';

    soldEntries.forEach(([playerId, detail]) => {
      if (detail.priceLakhs > maxPrice) {
        maxPrice = detail.priceLakhs;
        maxPlayerId = playerId;
        buyingTeam = detail.franchise;
      }
    });

    const player = players.find(p => p.id === maxPlayerId);
    return player ? { ...player, soldPrice: maxPrice, team: buyingTeam } : null;
  }, [players, soldPlayers]);

  // 2. Highest bidding war
  const highestBiddingWar = useMemo(() => {
    const soldEntries = Object.entries(soldPlayers);
    if (soldEntries.length === 0) return null;

    let maxDiff = -1;
    let maxPlayerId = '';
    let buyingTeam = '';
    let finalPrice = 0;

    soldEntries.forEach(([playerId, detail]) => {
      const player = players.find(p => p.id === playerId);
      if (player) {
        const diff = detail.priceLakhs - player.basePriceLakhs;
        if (diff > maxDiff) {
          maxDiff = diff;
          maxPlayerId = playerId;
          buyingTeam = detail.franchise;
          finalPrice = detail.priceLakhs;
        }
      }
    });

    const player = players.find(p => p.id === maxPlayerId);
    return player ? { ...player, premium: maxDiff, team: buyingTeam, finalPrice } : null;
  }, [players, soldPlayers]);

  // 3. Franchise spending and purse rankings
  const franchiseStats = useMemo(() => {
    return Object.values(franchises).map(f => {
      const spent = f.startingPurseLakhs - f.remainingPurseLakhs;
      return {
        ...f,
        spentLakhs: spent,
        percentSpent: (spent / f.startingPurseLakhs) * 100
      };
    }).sort((a, b) => b.remainingPurseLakhs - a.remainingPurseLakhs);
  }, [franchises]);

  // 4. Role distribution & overseas vs Indian counts
  const roleDistribution = useMemo(() => {
    const stats = { Batter: 0, Bowler: 0, 'All-rounder': 0, 'Wicket Keeper': 0 };
    let overseasTotal = 0;
    let indianTotal = 0;

    Object.keys(soldPlayers).forEach(playerId => {
      const player = players.find(p => p.id === playerId);
      if (player) {
        if (player.role === 'Batter') stats.Batter++;
        else if (player.role === 'Bowler') stats.Bowler++;
        else if (player.role === 'All-rounder') stats['All-rounder']++;
        else if (player.role === 'Wicket Keeper') stats['Wicket Keeper']++;

        if (player.countryType === 'Overseas') overseasTotal++;
        else indianTotal++;
      }
    });

    return { ...stats, overseasTotal, indianTotal };
  }, [players, soldPlayers]);

  // 5. Unsold players list
  const unsoldPlayersList = useMemo(() => {
    return players.filter(p => unsoldPlayerIds.includes(p.id));
  }, [players, unsoldPlayerIds]);

  // 6. Timeline of auction based on logs
  const auctionTimeline = useMemo(() => {
    return logs
      .filter(l => l.type === 'sold' || l.type === 'unsold' || l.type === 'status')
      .slice(0, 8);
  }, [logs]);

  // Count total sold players
  const totalSoldPlayers = Object.keys(soldPlayers).length;

  const handleSimulateChampionship = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/auction/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate AI analysis report.');
      }
      const data = await response.json();
      setAiReport(data.analysis);
      localStorage.setItem('ipl_ai_report', data.analysis);
    } catch (err: any) {
      setAiError(err.message || 'Server error communicating with Gemini AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Helper to parse simple markdown to HTML styled blocks
  const parseMarkdownToJSX = (md: string) => {
    const lines = md.split('\n');
    let insideList = false;

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('###')) {
        return (
          <h5 key={idx} className="text-xs font-black text-slate-100 uppercase tracking-wider mt-5 mb-2 flex items-center space-x-2 border-b border-slate-800 pb-1">
            <span className="w-1.5 h-3 bg-yellow-400 rounded-sm" />
            <span>{trimmed.replace(/^###\s*/, '')}</span>
          </h5>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h4 key={idx} className="text-sm font-black text-amber-400 uppercase tracking-wider mt-6 mb-3 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{trimmed.replace(/^##\s*/, '')}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('#')) {
        return (
          <h3 key={idx} className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 uppercase tracking-widest mt-6 mb-4">
            {trimmed.replace(/^#\s*/, '')}
          </h3>
        );
      }

      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const content = trimmed.replace(/^[\-\*]\s*/, '');
        return (
          <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 my-1.5 pl-3 leading-relaxed">
            <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
            <span>{renderFormattedText(content)}</span>
          </div>
        );
      }

      // Empty Lines
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Default paragraphs
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-2">
          {renderFormattedText(trimmed)}
        </p>
      );
    });
  };

  // Format bold formatting (**text**) inside markdown strings
  const renderFormattedText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Tab selection (Traditional vs AI Predictor) */}
      <div className="flex space-x-2 p-1 bg-slate-950 rounded-xl border border-slate-900 w-fit">
        <button
          id="btn-traditional-stats"
          onClick={() => setSubTab('stats')}
          className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            subTab === 'stats'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Traditional Stats
        </button>
        <button
          id="btn-ai-win-predictor"
          onClick={() => setSubTab('ai')}
          className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
            subTab === 'ai'
              ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>AI Championship Predictor</span>
        </button>
      </div>

      {/* SUB-TAB 1: TRADITIONAL STATS */}
      {subTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Cards Row: Most Expensive & Bidding War */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Most Expensive */}
            <div className="bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Award className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Most Expensive Signing</span>
                </div>

                {mostExpensivePlayer ? (
                  <div className="flex items-center space-x-4">
                    <PlayerImage 
                      player={mostExpensivePlayer} 
                      className="w-14 h-14 rounded-xl object-cover border border-amber-500/20"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{mostExpensivePlayer.name}</h3>
                      <p className="text-xs text-slate-400">Acquired by <span className="text-yellow-400 font-bold">{mostExpensivePlayer.team}</span></p>
                      <p className="text-lg font-black text-amber-400 mt-0.5">{formatPrice(mostExpensivePlayer.soldPrice)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-3">No players sold yet in this session.</p>
                )}
              </div>
              {mostExpensivePlayer && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                  <span>Base Price: {formatPrice(mostExpensivePlayer.basePriceLakhs)}</span>
                  <span className="text-amber-400 font-bold">Premium: {formatPrice(mostExpensivePlayer.soldPrice - mostExpensivePlayer.basePriceLakhs)}</span>
                </div>
              )}
            </div>

            {/* Highest Bidding War */}
            <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Biggest Auction Escalation</span>
                </div>

                {highestBiddingWar ? (
                  <div className="flex items-center space-x-4">
                    <PlayerImage 
                      player={highestBiddingWar} 
                      className="w-14 h-14 rounded-xl object-cover border border-indigo-500/20"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{highestBiddingWar.name}</h3>
                      <p className="text-xs text-slate-400">Pushed to <span className="text-indigo-400 font-bold">{formatPrice(highestBiddingWar.finalPrice)}</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">Escalated by <span className="text-indigo-300 font-semibold">+{formatPrice(highestBiddingWar.premium)}</span> from base</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-3">No bidding wars recorded yet.</p>
                )}
              </div>
              {highestBiddingWar && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                  <span>Base: {formatPrice(highestBiddingWar.basePriceLakhs)}</span>
                  <span className="text-indigo-400 font-bold">Buyer: {highestBiddingWar.team}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Grid: Rankings & Teamwise spending */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Purse Rankings Table (Left 7 Columns) */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-sm text-white">Remaining Purse Rankings</h3>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">Sorted High-Low</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Rank</th>
                      <th className="pb-3">Franchise</th>
                      <th className="pb-3">Budget Remaining</th>
                      <th className="pb-3">Spent</th>
                      <th className="pb-3 text-center">Squad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {franchiseStats.map((team, index) => {
                      return (
                        <tr key={team.name} className="hover:bg-slate-900/30">
                          <td className="py-3 pl-2 font-mono font-bold text-slate-400 text-center w-8">
                            {index + 1}
                          </td>
                          <td className="py-3 flex items-center space-x-2">
                            <div 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: team.logoColor }}
                            />
                            <span className="font-bold text-slate-200">{team.name}</span>
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-400">
                            {formatPrice(team.remainingPurseLakhs)}
                          </td>
                          <td className="py-3 font-mono text-slate-400">
                            {formatPrice(team.spentLakhs)}
                          </td>
                          <td className="py-3 text-center font-mono text-slate-300">
                            <span className="font-bold text-yellow-400">{team.playersBoughtIds.length}</span>
                            <span className="text-slate-600">/25</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Squad Compositions & Categories (Right 5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Spending and Ratios */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-extrabold text-sm text-white">Sold Categories & Origin</h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Origin bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Indian vs Overseas (Count)</span>
                      <span className="font-mono text-slate-300">{roleDistribution.indianTotal} IND / {roleDistribution.overseasTotal} OS</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      {roleDistribution.indianTotal + roleDistribution.overseasTotal === 0 ? (
                        <div className="w-full bg-slate-800" />
                      ) : (
                        <>
                          <div 
                            className="bg-yellow-400 h-full transition-all" 
                            style={{ width: `${(roleDistribution.indianTotal / (roleDistribution.indianTotal + roleDistribution.overseasTotal)) * 100}%` }}
                            title="Indian"
                          />
                          <div 
                            className="bg-indigo-400 h-full transition-all" 
                            style={{ width: `${(roleDistribution.overseasTotal / (roleDistribution.indianTotal + roleDistribution.overseasTotal)) * 100}%` }}
                            title="Overseas"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Roles list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role Distribution</span>
                    
                    {[
                      { name: 'Batters', count: roleDistribution.Batter, color: 'bg-blue-400' },
                      { name: 'Bowlers', count: roleDistribution.Bowler, color: 'bg-emerald-400' },
                      { name: 'All-rounders', count: roleDistribution['All-rounder'], color: 'bg-amber-400' },
                      { name: 'Wicket Keepers', count: roleDistribution['Wicket Keeper'], color: 'bg-pink-400' }
                    ].map(role => {
                      const total = Object.keys(soldPlayers).length;
                      const pct = total > 0 ? (role.count / total) * 100 : 0;
                      return (
                        <div key={role.name} className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span className="flex items-center space-x-1.5">
                              <span className={`w-2 h-2 rounded-full ${role.color}`} />
                              <span>{role.name}</span>
                            </span>
                            <span className="font-mono text-slate-300">{role.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${role.color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Unsold Players Tracking */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-slate-400">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  <h3 className="font-extrabold text-sm text-white">Unsold Board ({unsoldPlayersList.length})</h3>
                </div>
                
                {unsoldPlayersList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No players are currently marked unsold.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {unsoldPlayersList.map(p => (
                      <span 
                        key={p.id}
                        className="text-[10px] bg-red-950/20 text-red-400 px-2 py-1 rounded-lg border border-red-900/30"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Recent Milestones Timeline */}
          <div className="bg-slate-900/45 border border-slate-850 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-slate-400">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm text-white">Auction Milestone Timeline</h3>
            </div>

            {auctionTimeline.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No milestones registered yet. Begin bidding or control the auction to update the timeline.</p>
            ) : (
              <div className="space-y-3">
                {auctionTimeline.map((log) => {
                  const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  let typeLabel = '';
                  let badgeColor = '';
                  if (log.type === 'sold') {
                    typeLabel = 'Sold Deal';
                    badgeColor = 'bg-emerald-500/15 border-emerald-900/40 text-emerald-400';
                  } else if (log.type === 'unsold') {
                    typeLabel = 'Unsold';
                    badgeColor = 'bg-red-500/15 border-red-900/40 text-red-400';
                  } else {
                    typeLabel = 'Admin Command';
                    badgeColor = 'bg-slate-800 border-slate-750 text-slate-300';
                  }

                  return (
                    <div key={log.id} className="flex items-start space-x-3 text-xs">
                      <span className="font-mono text-[10px] text-slate-600 pt-0.5">{formattedTime}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${badgeColor} uppercase tracking-wider`}>
                        {typeLabel}
                      </span>
                      <p className="text-slate-300 leading-normal flex-1">
                        {log.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI CHAMPIONSHIP PREDICTOR */}
      {subTab === 'ai' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Predictor CTA Box */}
          <div className="bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-3xl relative overflow-hidden space-y-6">
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <h3 className="text-base font-black text-white flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Gemini AI IPL Championship Predictor</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Analyze squad chemistry, player performance stats, designated Starting Playing 11 rosters, and overall spent balance to predict the **IPL Tournament Champion** completely driven by high-intelligence AI algorithms.
                </p>
              </div>

              <button
                id="btn-simulate-tournament"
                onClick={handleSimulateChampionship}
                disabled={loadingAi || totalSoldPlayers === 0}
                className={`py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all active:scale-98 cursor-pointer self-start md:self-auto ${
                  totalSoldPlayers === 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-102'
                }`}
              >
                {loadingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Squads...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Simulate & Predict Winner</span>
                  </>
                )}
              </button>
            </div>

            {totalSoldPlayers === 0 ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-850 flex items-center space-x-3 text-xs text-slate-500">
                <AlertCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <span>
                  No players have been sold in the auction yet! Release and acquire players in the <strong>Live Bidding Arena</strong> first to build the franchise squads before running the AI Win simulation.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{totalSoldPlayers} Players Sold</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span>Designated Playing 11s Loaded</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Gemini 2.5 Flash Engine Active</span>
                </span>
              </div>
            )}
          </div>

          {/* LOADING STATE DISPLAY */}
          {loadingAi && (
            <div className="bg-slate-900/30 border border-slate-850 p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-ping" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Tournament Simulation In Progress</h4>
              <p className="text-xs text-slate-400 font-mono max-w-md">
                "{loadingSteps[loadingStep]}"
              </p>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {aiError && (
            <div className="bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-2xl flex items-center space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* COMPLETED REPORT DISPLAY */}
          {aiReport && !loadingAi && (
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden shadow-xl shadow-black/30">
              
              {/* Report Header Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent border-b border-slate-850 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500/15 rounded-xl border border-amber-500/20 text-amber-400">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white uppercase tracking-wider">Gemini Win Prediction Report</h4>
                    <p className="text-[10px] text-slate-500">Deep Squad Chemistry & Playing XI Heuristics Analysis</p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateChampionship}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Re-run Simulation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Parsed report block */}
              <div className="p-6 md:p-8 space-y-4 prose-invert max-w-none text-left">
                {parseMarkdownToJSX(aiReport)}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
