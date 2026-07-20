import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface PlayerImageProps {
  player: Player;
  className?: string;
}

export default function PlayerImage({ player, className = "w-12 h-12 rounded-xl object-cover border border-slate-850" }: PlayerImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return `/api/player-photo/${player.id}?v=3`;
  });

  // Synchronize when player changes
  useEffect(() => {
    setImgSrc(`/api/player-photo/${player.id}?v=3`);
  }, [player.id]);

  const handleError = () => {
    // If the proxy load fails (e.g., player ID doesn't have a valid photo or network is offline),
    // we fall back to our server-side generated custom vector badge
    if (!imgSrc.includes('badge=true')) {
      setImgSrc(`/api/player-photo/${player.id}?badge=true`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={player.name}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
      id={`player-img-${player.id}`}
    />
  );
}
