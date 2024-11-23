// types/index.ts
// Message Types
export interface Message {
  id: number;
  type: 'text' | 'markdown' | 'car_listing' | 'car_detail';
  content: string | CarListingContent | CarDetailContent;
  sender: 'user' | 'bot';
  searchResults?: Car[];
  isLoading?: boolean;
  explanation?: string;
}

// Car Related Types
export interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  price: string;
  location?: string;
  dealerStatus?: string;
  description?: string;
  imageUrl?: string;
  url: string;
  specifications?: { [key: string]: string };
}

export interface CarDetails {
  title: string;
  sections: {
    specifications: { [key: string]: string };
    features: string[];
    description?: string;
  };
}

export interface CarListingContent {
  listings: Car[];
}

export interface CarDetailContent {
  car: Car;
  details: CarDetails;
}

// Component Props Types
export interface CarCardProps extends Car {}

export interface CarListingProps {
  content: string | { listings: CarCardProps[] };
  viewMode?: 'grid' | 'list';
}

// AI Response Types
export interface AIResponseContent {
  type: 'text' | 'markdown' | 'car_listing' | 'car_detail';
  content: string | CarListingContent | CarDetailContent;
  explanation?: string;
}