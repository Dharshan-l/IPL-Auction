import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, UserPlus, CheckCircle, ShieldAlert } from 'lucide-react';
import { Player, PlayerRole, PlayerCountryType, PlayerPlayingStatus } from '../types';
import PlayerImage from './PlayerImage';

interface PlayerSearchProps {
  players: Player[];
  soldPlayers: Record<string, { franchise: string; priceLakhs: number }>;
  unsoldPlayerIds: string[];
  isAuctioneer: boolean;
  onAddCustomPlayer: (playerData: any) => Promise<boolean>;
}

export default function PlayerSearch({ players, soldPlayers, unsoldPlayerIds, isAuctioneer, onAddCustomPlayer }: PlayerSearchProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedCountryType, setSelectedCountryType] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All'); // All, Sold, Unsold, Available

  // Add Custom Player state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formCountryType, setFormCountryType] = useState<PlayerCountryType>(PlayerCountryType.Indian);
  const [formRole, setFormRole] = useState<PlayerRole>(PlayerRole.Batter);
  const [formBatting, setFormBatting] = useState('Right-handed');
  const [formBowling, setFormBowling] = useState('None');
  const [formPrevTeam, setFormPrevTeam] = useState('None');
  const [formBasePrice, setFormBasePrice] = useState('100'); // 1.00 Cr = 100 Lakhs
  const [formAge, setFormAge] = useState('25');
  const [formMatches, setFormMatches] = useState('10');
  const [formRuns, setFormRuns] = useState('150');
  const [formWickets, setFormWickets] = useState('0');
  const [formAvg, setFormAvg] = useState('25');
  const [formSR, setFormSR] = useState('130');
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Teams list for select filter
  const teamsList = ['All', 'RCB', 'CSK', 'MI', 'KKR', 'GT', 'RR', 'SRH', 'PBKS', 'LSG', 'DC', 'None'];

  // Filter player list
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Search term
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            player.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role
      const matchesRole = selectedRole === 'All' || player.role === selectedRole;

      // Country Type
      const matchesCountry = selectedCountryType === 'All' || player.countryType === selectedCountryType;

      // Previous Team
      const matchesTeam = selectedTeam === 'All' || player.previousTeam === selectedTeam;

      // Status (Sold / Unsold / Available)
      let matchesStatus = true;
      if (selectedStatus === 'Sold') {
        matchesStatus = !!soldPlayers[player.id];
      } else if (selectedStatus === 'Unsold') {
        matchesStatus = unsoldPlayerIds.includes(player.id);
      } else if (selectedStatus === 'Available') {
        matchesStatus = !soldPlayers[player.id] && !unsoldPlayerIds.includes(player.id);
      }

      return matchesSearch && matchesRole && matchesCountry && matchesTeam && matchesStatus;
    });
  }, [players, searchTerm, selectedRole, selectedCountryType, selectedTeam, selectedStatus, soldPlayers, unsoldPlayerIds]);

  // Handle Form Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setAddStatus({ type: 'error', message: 'Name is required' });
      return;
    }

    const customPlayerObj = {
      name: formName.trim(),
      country: formCountry.trim(),
      countryType: formCountryType,
      role: formRole,
      battingStyle: formBatting,
      bowlingStyle: formBowling,
      previousTeam: formPrevTeam,
      basePriceLakhs: parseInt(formBasePrice) || 100,
      age: parseInt(formAge) || 25,
      stats: {
        matches: parseInt(formMatches) || 0,
        runs: parseInt(formRuns) || 0,
        wickets: parseInt(formWickets) || 0,
        average: parseFloat(formAvg) || 0,
        strikeRate: parseFloat(formSR) || 0
      },
      seasons: [2026]
    };

    const success = await onAddCustomPlayer(customPlayerObj);
    if (success) {
      setAddStatus({ type: 'success', message: `${formName} added successfully to the master dataset!` });
      // Clear form
      setFormName('');
      setTimeout(() => {
        setAddStatus(null);
        setShowAddForm(false);
      }, 2500);
    } else {
      setAddStatus({ type: 'error', message: 'Failed to add player. Name might already be registered.' });
    }
  };

  const formatPrice = (lakhs: number) => {
    if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Crore`;
    return `₹${lakhs} Lakh`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-2">
            <span>IPL Master Player Database</span>
            <span className="text-xs bg-slate-800 text-yellow-400 font-mono px-2 py-0.5 rounded-full">
              {players.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-400">Search and browse careers, previous franchises, base prices, and stats (2020–2026).</p>
        </div>

        {isAuctioneer && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setAddStatus(null);
            }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition-all scale-100 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Registered Player</span>
          </button>
        )}
      </div>

      {/* Add Custom Player Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Plus className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-sm text-white">Register a New Player for 2026 Season</h3>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            {addStatus && (
              <div className={`p-3 rounded-xl border text-center ${
                addStatus.type === 'success' 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                  : 'bg-red-950/40 border-red-800 text-red-400'
              }`}>
                {addStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Player Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Virat Kohli"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Country *</label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  placeholder="India"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Country Category</label>
                <select
                  value={formCountryType}
                  onChange={(e) => {
                    const val = e.target.value as PlayerCountryType;
                    setFormCountryType(val);
                    if (val === PlayerCountryType.Overseas) {
                      setFormCountry('Australia'); // prefill default
                    } else {
                      setFormCountry('India');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value={PlayerCountryType.Indian}>Indian</option>
                  <option value={PlayerCountryType.Overseas}>Overseas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Playing Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as PlayerRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value={PlayerRole.Batter}>Batter</option>
                  <option value={PlayerRole.Bowler}>Bowler</option>
                  <option value={PlayerRole.AllRounder}>All-rounder</option>
                  <option value={PlayerRole.WicketKeeper}>Wicket Keeper</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Batting Style</label>
                <input
                  type="text"
                  value={formBatting}
                  onChange={(e) => setFormBatting(e.target.value)}
                  placeholder="Right-handed"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bowling Style</label>
                <input
                  type="text"
                  value={formBowling}
                  onChange={(e) => setFormBowling(e.target.value)}
                  placeholder="Right-arm fast"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Previous IPL Team</label>
                <select
                  value={formPrevTeam}
                  onChange={(e) => setFormPrevTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  {teamsList.filter(t => t !== 'All').map(teamName => (
                    <option key={teamName} value={teamName}>{teamName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Base Price (in Lakhs) *</label>
                <input
                  type="number"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(e.target.value)}
                  placeholder="200 for 2.00 Cr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
                <span className="text-[10px] text-slate-500 italic mt-0.5 block">100 = 1.00 Cr, 50 = 50 Lakh</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Age *</label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="27"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            {/* Stats Subgrid */}
            <div className="bg-slate-950 p-4 rounded-xl space-y-3 border border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IPL Career Stats</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Matches</label>
                  <input
                    type="number"
                    value={formMatches}
                    onChange={(e) => setFormMatches(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Runs</label>
                  <input
                    type="number"
                    value={formRuns}
                    onChange={(e) => setFormRuns(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Wickets</label>
                  <input
                    type="number"
                    value={formWickets}
                    onChange={(e) => setFormWickets(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Average</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAvg}
                    onChange={(e) => setFormAvg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Strike Rate</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formSR}
                    onChange={(e) => setFormSR(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl font-black uppercase tracking-wide shadow-lg hover:shadow-yellow-500/15 cursor-pointer"
              >
                Register Player
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by player name or country..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Category Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="All">All Roles</option>
            <option value={PlayerRole.Batter}>Batter</option>
            <option value={PlayerRole.Bowler}>Bowler</option>
            <option value={PlayerRole.AllRounder}>All-rounder</option>
            <option value={PlayerRole.WicketKeeper}>Wicket Keeper</option>
          </select>

          {/* Country Type Filter */}
          <select
            value={selectedCountryType}
            onChange={(e) => setSelectedCountryType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="All">All Countries</option>
            <option value={PlayerCountryType.Indian}>Indian</option>
            <option value={PlayerCountryType.Overseas}>Overseas</option>
          </select>

          {/* Previous IPL Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="All">All Prev Teams</option>
            {teamsList.filter(t => t !== 'All').map(teamName => (
              <option key={teamName} value={teamName}>{teamName}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available (Unbid)</option>
            <option value="Sold">Sold Players</option>
            <option value="Unsold">Unsold Players</option>
          </select>
        </div>
      </div>

      {/* Grid of filtered players */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          No matching players found in the dataset.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const soldDetails = soldPlayers[player.id];
            const isUnsold = unsoldPlayerIds.includes(player.id);
            
            return (
              <div 
                key={player.id}
                className="bg-slate-900/45 border border-slate-850 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:bg-slate-900/60"
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{player.role}</span>
                    {soldDetails ? (
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-800 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        SOLD ({soldDetails.franchise} - ₹{formatPrice(soldDetails.priceLakhs)})
                      </span>
                    ) : isUnsold ? (
                      <span className="text-[10px] bg-red-500/10 border border-red-850 text-red-400 font-bold px-2 py-0.5 rounded-full">
                        UNSOLD
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-500/10 border border-blue-900 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                        AVAILABLE
                      </span>
                    )}
                  </div>

                  {/* Header Row */}
                  <div className="flex items-center space-x-3 mt-1.5">
                    <PlayerImage 
                      player={player} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-850"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-200">{player.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                        <span>{player.country}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-yellow-400 font-semibold">{player.countryType}</span>
                      </p>
                    </div>
                  </div>

                  {/* Details Sub-grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-[10px] border-t border-slate-850/60 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Age:</span>
                      <span className="text-slate-300 font-semibold">{player.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Price:</span>
                      <span className="text-yellow-400 font-semibold">{formatPrice(player.basePriceLakhs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batting:</span>
                      <span className="text-slate-300 font-semibold truncate max-w-[60px]">{player.battingStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bowling:</span>
                      <span className="text-slate-300 font-semibold truncate max-w-[60px]">{player.bowlingStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Previous IPL:</span>
                      <span className="text-slate-300 font-semibold">{player.previousTeam}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seasons:</span>
                      <span className="text-slate-300 font-semibold text-[9px]">{player.seasons.join(',')}</span>
                    </div>
                  </div>
                </div>

                {/* Career Stats Table (mini) */}
                <div className="bg-slate-950 p-2.5 rounded-lg grid grid-cols-5 gap-1 text-[9px] text-center mt-4 border border-slate-850/40">
                  <div>
                    <div className="text-slate-500">MAT</div>
                    <div className="font-bold text-slate-300">{player.stats.matches}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">RUNS</div>
                    <div className="font-bold text-slate-300">{player.stats.runs}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">WKT</div>
                    <div className="font-bold text-slate-300">{player.stats.wickets}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">AVG</div>
                    <div className="font-bold text-slate-300">{player.stats.average > 0 ? player.stats.average.toFixed(1) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">S/R</div>
                    <div className="font-bold text-slate-300">{player.stats.strikeRate > 0 ? player.stats.strikeRate.toFixed(1) : '-'}</div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
