export function LoadingDots() {
  return (
    <div className="flex items-center space-x-0.5">
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
    </div>
  );
}
