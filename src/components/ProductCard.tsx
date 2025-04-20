import React from 'react';
import { Product, SwipeDirection } from '../types';

interface ProductCardProps {
  product: Product;
  style: React.CSSProperties;
  bindDrag: any;
  direction: SwipeDirection;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, style, bindDrag, direction }) => {
  // Calculate discount
  const hasDiscount = product.discountPercentage > 0;
  
  // Apply swipe direction visual effects
  const getActionStyles = () => {
    if (direction === 'none') return { overlay: 'bg-transparent opacity-0', text: '' };
    
    if (direction === 'left') {
      return {
        overlay: 'bg-red-500/40 opacity-100',
        text: 'PASS'
      };
    } else if (direction === 'right') {
      return {
        overlay: 'bg-green-500/40 opacity-100',
        text: 'LIKE'
      };
    } else if (direction === 'up') {
      return {
        overlay: 'bg-blue-500/40 opacity-100',
        text: 'ADD TO CART'
      };
    }
    return { overlay: 'bg-transparent opacity-0', text: '' };
  };

  const actionStyles = getActionStyles();

  return (
    <div 
      className="absolute w-72 h-[500px] bg-white rounded-lg shadow-xl overflow-hidden cursor-grab active:cursor-grabbing will-change-transform"
      style={style}
      {...bindDrag()}
      onTouchStart={(e) => {
        // Prevent scrolling while touching cards
        e.currentTarget.style.touchAction = 'none';
      }}
    >
      {/* Card Image */}
      <div className="relative h-3/5 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          draggable="false"
        />
        
        {/* Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {product.discountPercentage}% OFF
          </div>
        )}
        
        {/* Swipe Direction Overlay with smooth transition */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${actionStyles.overlay}`}
        >
          {actionStyles.text && (
            <span className="text-white text-3xl font-bold border-2 border-white px-4 py-2 rounded-lg">
              {actionStyles.text}
            </span>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 pb-2">
        <h3 className="text-lg font-semibold capitalize">{product.name}</h3>
        <p className="text-gray-600 mb-1 capitalize">{product.brand}</p>
        
        <div className="flex items-center">
          <span className="text-xl font-bold">₹{product.price}</span>
          
          {hasDiscount && (
            <span className="ml-2 text-gray-500 line-through text-sm">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;