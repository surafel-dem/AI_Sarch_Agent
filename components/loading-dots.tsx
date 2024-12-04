'use client';

export function LoadingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite]" />
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
    </div>
  );
}
