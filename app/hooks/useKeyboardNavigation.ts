// Keyboard navigation hook for menu and player controls

import { useEffect, useCallback, useState } from 'react';

interface UseKeyboardNavigationProps {
  onToggleMenu: () => void;
  onMoveNext: () => void;
  onMovePrevious: () => void;
  onMoveNextCategory: () => void;
  onMovePreviousCategory: () => void;
  onSelect: () => void;
  onClose: () => void;
  isMenuOpen: boolean;
}

export function useKeyboardNavigation({
  onToggleMenu,
  onMoveNext,
  onMovePrevious,
  onMoveNextCategory,
  onMovePreviousCategory,
  onSelect,
  onClose,
  isMenuOpen,
}: UseKeyboardNavigationProps) {
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const keyDelay = 150; // Minimum delay between key presses

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTime < keyDelay) return;

      switch (event.key) {
        case 'm':
        case 'M':
        case 'Escape':
          event.preventDefault();
          onToggleMenu();
          setLastKeyTime(now);
          break;

        case 'ArrowUp':
          if (isMenuOpen) {
            event.preventDefault();
            onMovePrevious();
            setLastKeyTime(now);
          }
          break;

        case 'ArrowDown':
          if (isMenuOpen) {
            event.preventDefault();
            onMoveNext();
            setLastKeyTime(now);
          }
          break;

        case 'ArrowLeft':
          if (isMenuOpen) {
            event.preventDefault();
            onMovePreviousCategory();
            setLastKeyTime(now);
          }
          break;

        case 'ArrowRight':
          if (isMenuOpen) {
            event.preventDefault();
            onMoveNextCategory();
            setLastKeyTime(now);
          }
          break;

        case 'Enter':
          if (isMenuOpen) {
            event.preventDefault();
            onSelect();
            setLastKeyTime(now);
          }
          break;
      }
    },
    [
      onToggleMenu,
      onMoveNext,
      onMovePrevious,
      onMoveNextCategory,
      onMovePreviousCategory,
      onSelect,
      isMenuOpen,
      lastKeyTime,
      keyDelay,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isNavigating: isMenuOpen,
  };
}
