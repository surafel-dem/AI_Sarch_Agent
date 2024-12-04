'use client';

import { Car, MessageCircle, Share2, Copy, MoreHorizontal } from 'lucide-react';

interface CarDetailsProps {
  title: string;
  specs: {
    model: string;
    year: string;
    price: string;
    seller: string;
  };
  features: string[];
}

export function CarDetails({ title, specs, features }: CarDetailsProps) {
  return (
    <div className="space-y-6 text-gray-300">
      {/* Car Icon and Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Car className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Model</span>
          <p className="text-lg font-medium text-white">{specs.model}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Year</span>
          <p className="text-lg font-medium text-white">{specs.year}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Price</span>
          <p className="text-lg font-medium text-white">{specs.price}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Seller</span>
          <p className="text-lg font-medium text-white">{specs.seller}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Features:</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <MessageCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Copy className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-auto">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Link Text */}
      <p className="text-sm text-gray-400">
        For more details, you can view the full listing{' '}
        <a href="#" className="text-blue-400 hover:text-blue-300">
          here
        </a>
        .
      </p>
    </div>
  );
}
