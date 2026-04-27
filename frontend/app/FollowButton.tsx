'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dn_followed_retailers';

export function getFollowedRetailers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export default function FollowButton({ retailerId, retailerName }: { retailerId: string; retailerName: string }) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(getFollowedRetailers().includes(retailerId));
  }, [retailerId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = getFollowedRetailers();
    let updated: string[];
    if (current.includes(retailerId)) {
      updated = current.filter(id => id !== retailerId);
    } else {
      updated = [retailerId, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFollowing(!following);
    // Dispatch event so MyRetailers section updates without page reload
    window.dispatchEvent(new Event('dn_follow_change'));
  }

  return (
    <button
      onClick={toggle}
      title={following ? `Unfollow ${retailerName}` : `Follow ${retailerName}`}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
        following
          ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
          : 'bg-white text-gray-600 border-gray-300 hover:border-red-400 hover:text-red-600'
      }`}
    >
      <i className={`fa-${following ? 'solid' : 'regular'} fa-heart text-xs`}></i>
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
