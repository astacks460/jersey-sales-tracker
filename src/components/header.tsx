import React from 'react';
import { Button } from '@/components/ui/button';

export function Header({ onBack, currentPage }: { 
  onBack?: () => void;
  currentPage: string;
}) {
  return (
    <header className="bg-black p-4 border-b border-gray-800 flex items-center justify-between mb-6">
      <div className="flex items-center">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mr-4 text-gray-400 hover:text-white"
          >
            ← Back
          </Button>
        )}
        <h1 className="text-xl font-bold">{currentPage}</h1>
      </div>
      <div className="text-xl font-bold text-red-500">
        Palestine Jersey Tracker
      </div>
    </header>
  );
}
