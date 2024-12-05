'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function RouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const removeAnnouncer = () => {
      const announcer = document.querySelector('[data-nextjs-route-announcer]');
      if (announcer) {
        announcer.remove();
      }
    };

    // Remove immediately
    removeAnnouncer();

    // And after a short delay to catch any late additions
    const timeoutId = setTimeout(removeAnnouncer, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
