"use client";

import Image from "next/image";

export function LoadingScreen({ fullScreen = true }: { fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16 animate-pulse-glow rounded-full">
        <Image 
          src="/icon.png" 
          alt="Loading..." 
          fill 
          className="object-contain animate-[spin_3s_linear_infinite]" 
        />
      </div>
      <div className="text-tempora-cyan/80 font-medium tracking-widest text-sm uppercase animate-pulse">
        Loading
      </div>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tempora-dark/80 backdrop-blur-md">
      {content}
    </div>
  );
}
