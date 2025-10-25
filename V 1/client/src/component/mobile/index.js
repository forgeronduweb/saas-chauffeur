// Navigation et layout
export { default as MobileBottomNav } from './MobileBottomNav';
export { default as FloatingActionButton, FloatingActionMenu } from './FloatingActionButton';
export { default as MobileDrawer, MobileFilterDrawer } from './MobileDrawer';

// Grilles et cartes
export { 
  default as ResponsiveGrid, 
  ResponsiveCard, 
  ResponsiveList, 
  ResponsiveListItem 
} from './ResponsiveGrid';

// Composants de contenu
export { default as MobileOfferCard, MobileOfferList } from './MobileOfferCard';
export { 
  default as MobileStatsCard, 
  MobileStatsGrid, 
  useFormattedStats 
} from './MobileStatsCard';

// Recherche et filtres
export { default as MobileSearch } from './MobileSearch';

// Notifications
export { 
  default as MobileNotification, 
  MobileNotificationStack, 
  useMobileNotifications 
} from './MobileNotification';

import { useState, useEffect } from 'react';

// Utilitaires et hooks mobiles
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export const useMobileOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  return orientation;
};

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });
  
  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };
    
    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);
  
  return safeArea;
};
