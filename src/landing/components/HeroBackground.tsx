import { memo } from 'react';
import { motion } from 'framer-motion';

interface HeroBackgroundProps {
  shouldAnimate?: boolean;
}

export const HeroBackground = memo(
  ({ shouldAnimate = true }: HeroBackgroundProps) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      willChange: shouldAnimate ? 'transform, opacity' : 'auto',
    };

    return (
      <motion.div
        style={{
          ...baseStyle,
          background:
            'linear-gradient(-60deg, #ff8c00 0%, #ff6600 50%, #000000 50%, #000000 100%)',
          opacity: 1,
        }}
        initial={
          shouldAnimate
            ? { x: '-100%', y: '-100%', opacity: 0 }
            : { x: 0, y: 0, opacity: 1 }
        }
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={
          shouldAnimate
            ? {
                duration: 1.0,
                ease: [0.25, 0.1, 0.25, 1],
              }
            : { duration: 0 }
        }
      />
    );
  }
);

HeroBackground.displayName = 'HeroBackground';
