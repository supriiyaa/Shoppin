import React from 'react';
import SwipeDeck from './components/SwipeDeck';
import { productData } from './data/products';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Product Discovery</h1>
      <p className="mb-6 text-center text-gray-600">Swipe cards left to pass, right to like, or up to add to cart</p>
      <SwipeDeck products={productData} />
    </div>
  );
}

export default App;