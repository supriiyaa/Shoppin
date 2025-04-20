import { useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { SwipeDirection } from '../types';

interface UseSwipeProps {
  onSwipe: (direction: SwipeDirection) => void;
}

export function useSwipe({ onSwipe }: UseSwipeProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<SwipeDirection>('none');
  const [swiped, setSwiped] = useState(false);

  // Define constants for swipe behavior
  const SWIPE_THRESHOLD = 100;
  const ROTATION_FACTOR = 0.15;
  const SWIPE_OUT_DISTANCE = 1500; 
  
  const bindDrag = useDrag(
    ({ active, movement: [mx, my], velocity: [vx, vy], last }) => {
      
      if (swiped) return;
      
      if (active) {
        setPosition({ x: mx, y: my });
        
        // Set visual direction indicator during drag
        if (Math.abs(mx) > Math.abs(my) * 2) {
          setDirection(mx > 0 ? 'right' : 'left');
        } else if (my < -Math.abs(mx) && my < -30) {
          setDirection('up');
        } else {
          setDirection('none');
        }
      } 
      // Handle when the drag ends
      else if (last) {
        const isHorizontalSwipe = Math.abs(mx) > Math.abs(my);
        const isHighVelocity = Math.max(Math.abs(vx), Math.abs(vy)) > 0.5;
        
        // Determine if we have a valid swipe based on distance or velocity
        if (Math.abs(mx) > SWIPE_THRESHOLD || Math.abs(my) > SWIPE_THRESHOLD || isHighVelocity) {
          if (isHorizontalSwipe) {
            // Horizontal swipe detection
            const swipeDirection = mx > 0 ? 'right' : 'left';
            const swipeOutX = mx > 0 ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
            
            // Set final position for animation out of screen
            setPosition({ x: swipeOutX, y: 0 });
            setSwiped(true);
            onSwipe(swipeDirection);
          } else if (my < -SWIPE_THRESHOLD/1.5 || (my < 0 && vy < -0.5)) {
            // Upward swipe detection (more lenient)
            setPosition({ x: 0, y: -SWIPE_OUT_DISTANCE });
            setSwiped(true);
            onSwipe('up');
          } else {
            // Reset if no clear direction
            setPosition({ x: 0, y: 0 });
            setDirection('none');
          }
        } else {
          // Reset position if the swipe wasn't strong enough
          setPosition({ x: 0, y: 0 });
          setDirection('none');
        }
      }
    },
    {
      from: () => [position.x, position.y],
      filterTaps: true,
      bounds: { top: -300, bottom: 300, left: -300, right: 300 },
      rubberband: true,
      delay: 0,
    }
  );

  const rotate = position.x * ROTATION_FACTOR;

  const transformStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotate}deg)`,
    transition: position.x === 0 && position.y === 0 ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
  };

  return {
    bindDrag,
    position,
    direction,
    style: transformStyle,
    swiped
  };
}