import { memo } from 'react';

interface HeroBackgroundProps {
  shouldAnimate?: boolean;
}

export const HeroBackground = memo(({}: HeroBackgroundProps) => {
  // Background estático sin animaciones para evitar lag
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  };

  return (
    <div
      style={{
        ...baseStyle,
        background:
          'linear-gradient(-60deg, #ff8c00 0%, #ffa500 50%, #ffffff 50%, #ffffff 100%)',
        opacity: 0.7,
      }}
    />
  );
});

HeroBackground.displayName = 'HeroBackground';
