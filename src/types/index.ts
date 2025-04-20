export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    imageUrl: string;
  }
  
  export type SwipeDirection = 'left' | 'right' | 'up' | 'none';