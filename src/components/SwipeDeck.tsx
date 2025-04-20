import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';

interface SwipeDeckProps {
  products: Product[];
}

const SwipeDeck: React.FC<SwipeDeckProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  
  // Initialize refs for cards and touch handling
  const cardRef = useRef<HTMLDivElement>(null);
  const initialX = useRef<number>(0);
  const initialY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<string>('');
  const [isSwiping, setIsSwiping] = useState(false);

  // Get current product
  const currentProduct = products[currentIndex % products.length];
  
  // Reset card position when index changes
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
    }
  }, [currentIndex]);

  // Handle the start of a touch/drag
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to stop scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
    
    setIsSwiping(true);
    if ('touches' in e) {
      initialX.current = e.touches[0].clientX;
      initialY.current = e.touches[0].clientY;
    } else {
      initialX.current = e.clientX;
      initialY.current = e.clientY;
    }
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  // Handle touch/mouse movement
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to stop scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
    
    if (!isSwiping) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    currentX.current = clientX - initialX.current;
    currentY.current = clientY - initialY.current;
    
    // Only consider horizontal swipes and upward swipes (not downward)
    if (Math.abs(currentX.current) > Math.abs(currentY.current)) {
      if (currentX.current > 0) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection('left');
      }
    } else if (currentY.current < 0) {
      // Only consider upward swipes
      setSwipeDirection('up');
    } else {
      // Ignore downward swipes
      currentY.current = Math.min(0, currentY.current);
      setSwipeDirection('none');
    }
    
    // Calculate rotation based on horizontal movement
    const rotate = currentX.current * 0.1;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${currentX.current}px, ${currentY.current}px) rotate(${rotate}deg)`;
    }
  };

  // Handle the end of a touch/drag
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to stop scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
    
    setIsSwiping(false);
    
    // Determine if swipe was strong enough
    const swipeThreshold = 100;
    
    if (cardRef.current) {
      // Apply transition for the return or completion animation
      cardRef.current.style.transition = 'transform 0.5s ease';
      
      // Only consider horizontal swipes and upward swipes for action triggering
      if (Math.abs(currentX.current) > swipeThreshold || 
          (currentY.current < -swipeThreshold)) {
        // Complete the swipe
        let targetX = 0;
        let targetY = 0;
        let action = '';
        
        // Prioritize horizontal swipes
        if (Math.abs(currentX.current) > Math.abs(currentY.current)) {
          targetX = currentX.current > 0 ? window.innerWidth + 200 : -window.innerWidth - 200;
          action = currentX.current > 0 ? 'Liked' : 'Passed';
        } else if (currentY.current < -swipeThreshold) {
          // Only consider upward swipes
          targetY = -window.innerHeight - 200;
          action = 'Added to cart';
        }
        
        cardRef.current.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${currentX.current * 0.1}deg)`;
        
        // Log action and update state
        console.log(`${action} Product ID: ${currentProduct.id}`);
        setLastAction(action);
        
        // Move to next card after animation
        setTimeout(() => {
          setCurrentIndex(prevIndex => prevIndex + 1);
          setSwipeDirection('');
        }, 300);
      } else {
        // Return to initial position
        cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
        setSwipeDirection('');
      }
    }
    
    // Reset refs
    currentX.current = 0;
    currentY.current = 0;
  };

  // Get overlay styles based on swipe direction
  const getOverlayStyle = () => {
    if (swipeDirection === 'left') {
      return 'bg-red-500/30';
    } else if (swipeDirection === 'right') {
      return 'bg-green-500/30';
    } else if (swipeDirection === 'up') {
      return 'bg-blue-500/30';
    }
    return 'bg-transparent';
  };
  
  // Get action text based on swipe direction
  const getActionText = () => {
    if (swipeDirection === 'left') {
      return 'PASS';
    } else if (swipeDirection === 'right') {
      return 'LIKE';
    } else if (swipeDirection === 'up') {
      return 'ADD TO CART';
    }
    return '';
  };

  // Calculate discount
  const hasDiscount = currentProduct?.discountPercentage > 0;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-72 h-[500px]">
        {products.length > 0 && (
          <div 
            ref={cardRef}
            className="absolute w-72 h-[500px] bg-white rounded-lg shadow-xl overflow-hidden cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            {/* Card Image */}
            <div className="relative h-3/5 overflow-hidden">
              <img 
                src={currentProduct.imageUrl} 
                alt={currentProduct.name} 
                className="w-full h-full object-cover"
                draggable="false"
              />
              
              {/* Discount Tag */}
              {hasDiscount && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {currentProduct.discountPercentage}% OFF
                </div>
              )}
              
              {/* Swipe Direction Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center ${getOverlayStyle()} ${swipeDirection ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                <span className="text-white text-3xl font-bold border-2 border-white px-4 py-2 rounded-lg">
                  {getActionText()}
                </span>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4 pb-2">
              <h3 className="text-lg font-semibold capitalize">{currentProduct.name}</h3>
              <p className="text-gray-600 mb-1 capitalize">{currentProduct.brand}</p>
              
              <div className="flex items-center">
                <span className="text-xl font-bold">₹{currentProduct.price}</span>
                
                {hasDiscount && (
                  <span className="ml-2 text-gray-500 line-through text-sm">
                    ₹{currentProduct.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Last Action Info */}
      {lastAction && (
        <div className="mt-8 text-center">
          <p className="text-lg">
            <span className="font-bold">{lastAction}</span> Product ID: {currentProduct?.id}
          </p>
        </div>
      )}
    </div>
  );
};

export default SwipeDeck;