import React, { useState } from 'react';
import { Shield, User, Users, Trophy, Lock } from 'lucide-react';
import { Franchise } from '../types';

interface RoleSelectionProps {
  franchises: Record<string, Franchise>;
  activeUsers: Record<string, { role: string; lastSeen: string }>;
  onJoin: (role: string, username: string, passcode?: string) => void;
  isPrivate?: boolean;
}

export default function RoleSelection({ franchises, activeUsers, onJoin, isPrivate }: RoleSelectionProps) {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const activeRoles = Object.values(activeUsers).map(u => u.role);

  const teamList = [
    { name: 'CSK', fullName: 'Chennai Super Kings', color: '#F7D117', textColor: '#000000', nickname: 'Yellow Army' },
    { name: 'MI', fullName: 'Mumbai Indians', color: '#004BA0', textColor: '#FFFFFF', nickname: 'One Family' },
    { name: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24', textColor: '#FFFFFF', nickname: 'Play Bold' },
    { name: 'KKR', fullName: 'Kolkata Knight Riders', color: '#2E0854', textColor: '#F7D117', nickname: 'Korbo Lorbo Jeetbo' },
    { name: 'GT', fullName: 'Gujarat Titans', color: '#1B254B', textColor: '#D4AF37', nickname: 'Aava De' },
    { name: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A85', textColor: '#FFFFFF', nickname: 'Halla Bol' },
    { name: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#FF8225', textColor: '#000000', nickname: 'Orange Army' },
    { name: 'PBKS', fullName: 'Punjab Kings', color: '#D71920', textColor: '#FFFFFF', nickname: 'Sadda Punjab' },
    { name: 'LSG', fullName: 'Lucknow Super Giants', color: '#0057B8', textColor: '#FFD700', nickname: 'Gazab Andaz' },
    { name: 'DC', fullName: 'Delhi Capitals', color: '#000080', textColor: '#FF4500', nickname: 'Roar Macha' }
  ];

  const handleJoinClick = () => {
    if (!username.trim()) {
      setError('Please enter your name/nickname');
      return;
    }
    if (!selectedRole) {
      setError('Please select a role to join');
      return;
    }
    setError('');
    onJoin(selectedRole, username.trim(), passcode.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-400 p-2.5 rounded-2xl shadow-lg">
            <Trophy className="w-8 h-8 text-slate-950" />
            <span className="font-sans font-black text-xl tracking-wider text-slate-950 uppercase">IPL AUCTION 2026</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Multiplayer Live Bidding Room
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Experience the real IPL tension. Connect synchronously with 10 franchise owners and 1 official auctioneer.
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-300 mb-2">
              Enter Your Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Parthiv, Coach, Nita"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          {isPrivate && selectedRole && selectedRole !== 'auctioneer' && (
            <div className="space-y-2 animate-fade-in">
              <label htmlFor="passcode" className="block text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Private Room Passcode Required</span>
              </label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode shared by the Auctioneer"
                className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-mono tracking-wider text-center"
              />
              <p className="text-[10px] text-slate-500 font-medium">
                This auction room is private. You must enter the passcode to participate or spectate.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-950/40 border border-red-800 text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}
        </div>

        {/* Roles Grid */}
        <div className="space-y-6">
          <h3 className="text-md font-bold tracking-wider text-slate-400 uppercase text-center">
            Select Your Role
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Left: Special Roles */}
            <div className="md:col-span-4 space-y-3">
              {/* Auctioneer (Admin) */}
              <button
                onClick={() => setSelectedRole('auctioneer')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  selectedRole === 'auctioneer'
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Auctioneer (Admin)</h4>
                    <p className="text-xs text-slate-500">Controls player releases & status</p>
                  </div>
                </div>
                {activeRoles.includes('auctioneer') && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Active</span>
                )}
              </button>

              {/* Spectator */}
              <button
                onClick={() => setSelectedRole('spectator')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  selectedRole === 'spectator'
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Spectator (Audience)</h4>
                    <p className="text-xs text-slate-500">Watch the bidding war live</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Right: Team Owners */}
            <div className="md:col-span-8">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>10 IPL Franchises (Team Owners)</span>
                  <span className="text-[10px] text-slate-500 normal-case">Multiple users can join same team</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {teamList.map((team) => {
                    const isSelected = selectedRole === team.name;
                    const isActive = activeRoles.includes(team.name);
                    const boughtCount = franchises[team.name]?.playersBoughtIds?.length || 0;
                    
                    return (
                      <button
                        key={team.name}
                        onClick={() => setSelectedRole(team.name)}
                        className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'shadow-lg scale-[1.02]'
                            : 'hover:border-slate-700 hover:scale-[1.01]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? `${team.color}15` : '#020617',
                          borderColor: isSelected ? team.color : '#1e293b'
                        }}
                      >
                        {/* Colored left bar */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="pl-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-sm tracking-wide" style={{ color: team.color }}>
                              {team.name}
                            </span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Owner" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate leading-tight font-medium">
                            {team.fullName}
                          </p>
                          <p className="text-[9px] text-slate-500 italic truncate">
                            {team.nickname}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Join CTA */}
        <div className="pt-4 text-center">
          <button
            onClick={handleJoinClick}
            disabled={!username || !selectedRole || !!(isPrivate && selectedRole !== 'auctioneer' && !passcode)}
            className={`px-8 py-3.5 rounded-xl font-bold tracking-wider text-sm uppercase transition-all shadow-xl ${
              username && selectedRole && !(isPrivate && selectedRole !== 'auctioneer' && !passcode)
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:shadow-yellow-500/10 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Enter Bidding Arena
          </button>
        </div>

      </div>
    </div>
  );
}
