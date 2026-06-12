import { useEffect, useState } from 'react';
import TopLoadingBar from './ui/TopLoadingBar';

export default function GlobalLoader({ children }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Wait for fonts + a small delay for 3D globe
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <TopLoadingBar isVisible={!loaded} />
      {children}
    </>
  );
}
