import { Studio as SanityStudio } from 'sanity';
import { useEffect } from 'react';
import config from '../../sanity.config';

export default function Studio() {
  useEffect(() => {
    // Apply dark theme to body when Studio is mounted
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Reset when unmounting
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <SanityStudio config={config} />
    </div>
  );
}
