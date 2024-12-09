'use client';

import { useState, useEffect, useCallback } from 'react';

interface ResizableHorizontalProps {
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  initialTopHeight?: number;
  minTopHeight?: number;
  maxTopHeight?: number;
}

export function ResizableHorizontal({
  topPanel,
  bottomPanel,
  initialTopHeight = 70,
  minTopHeight = 30,
  maxTopHeight = 80
}: ResizableHorizontalProps) {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById('resizable-container-horizontal');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (newTopHeight >= minTopHeight && newTopHeight <= maxTopHeight) {
        setTopHeight(newTopHeight);
      }
    },
    [isDragging, minTopHeight, maxTopHeight]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div 
      id="resizable-container-horizontal" 
      className="flex flex-col h-full relative"
    >
      {/* Top Panel */}
      <div style={{ height: `${topHeight}%` }} className="overflow-auto">
        {topPanel}
      </div>

      {/* Draggable Separator */}
      <div
        className="h-2 bg-gray-200 hover:bg-blue-400 cursor-row-resize absolute left-0 right-0"
        style={{ top: `${topHeight}%`, transform: 'translateY(-50%)' }}
        onMouseDown={handleMouseDown}
      />

      {/* Bottom Panel */}
      <div 
        style={{ height: `${100 - topHeight}%` }} 
        className="overflow-auto"
      >
        {bottomPanel}
      </div>
    </div>
  );
}
