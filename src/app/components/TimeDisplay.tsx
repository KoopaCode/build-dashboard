'use client';

import { useEffect, useState } from 'react';

export default function TimeDisplay({ timestamp }: { timestamp: string | null }) {
  const [formattedTime, setFormattedTime] = useState<string>('Not yet updated');

  useEffect(() => {
    if (timestamp) {
      setFormattedTime(new Date(timestamp).toLocaleTimeString());
    }
  }, [timestamp]);

  return (
    <span className="text-gray-400 text-sm">
      Last updated: {formattedTime}
    </span>
  );
} 