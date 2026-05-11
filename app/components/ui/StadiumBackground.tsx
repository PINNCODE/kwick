'use client';

import Image from 'next/image';

interface StadiumBackgroundProps {
  className?: string;
}

export function StadiumBackground({ className }: StadiumBackgroundProps) {
  return (
    <div className={`relative w-full h-screen overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0">
        <Image
          src="/stadium-night.jpg"
          alt="Estadio nocturno"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="ambient-lights absolute inset-0 pointer-events-none" />
    </div>
  );
}
