'use client';

import React, { useState } from 'react';
import { Shield, X, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminBannerProps {
  /** The UID currently being impersonated, or null if viewing own data. */
  impersonatedUid: string | null;
  /** Callback to set or clear the impersonated UID. */
  onSetUid: (uid: string | null) => void;
}

/**
 * A persistent banner shown only to admin users (carolynjuba@gmail.com).
 * Lets the admin enter a user's UID to view their data in the app,
 * and provides a button to return to their own view.
 */
export function AdminBanner({ impersonatedUid, onSetUid }: AdminBannerProps) {
  const [inputValue, setInputValue] = useState('');

  const handleView = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSetUid(trimmed);
      setInputValue('');
    }
  };

  const handleReset = () => {
    onSetUid(null);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleView();
  };

  return (
    <div className="w-full bg-amber-950/90 border-b border-amber-600/50 text-amber-100 no-print">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm shrink-0">
          <Shield className="w-4 h-4" />
          Admin View
        </div>

        {impersonatedUid ? (
          /* Viewing someone else's data */
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 bg-amber-800/50 rounded-lg px-3 py-1 text-sm">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-200 font-mono text-xs truncate max-w-[240px]">
                {impersonatedUid}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-7 gap-1.5 border-amber-600 text-amber-200 hover:bg-amber-800 hover:text-amber-100 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Back to my view
            </Button>
          </div>
        ) : (
          /* Input to enter a UID */
          <div className="flex items-center gap-2 flex-1">
            <Input
              id="admin-uid-input"
              placeholder="Enter a user UID to view their data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-xs bg-amber-900/50 border-amber-700 text-amber-100 placeholder:text-amber-500 max-w-sm"
            />
            <Button
              size="sm"
              onClick={handleView}
              disabled={!inputValue.trim()}
              className="h-8 gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          </div>
        )}

        <span className="text-amber-600 text-xs hidden md:block shrink-0">
          carolynjuba@gmail.com
        </span>
      </div>
    </div>
  );
}
