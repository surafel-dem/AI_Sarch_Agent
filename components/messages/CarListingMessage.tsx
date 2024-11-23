'use client'

import React from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Check, ExternalLink } from 'lucide-react';
import type { CarCardProps, CarDetails, CarListingProps } from '@/types';

export function CarCard({ make, model, year, price, location, dealerStatus, imageUrl, url }: CarCardProps) {
  return (
    <Card className="bg-[#000435]/30 hover:bg-[#000435]/50 transition-all duration-200 border border-white/10">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{make} {model}</h3>
            <p className="text-sm text-gray-400">{year}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-purple-300">{price}</p>
            {location && (
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                {location}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {dealerStatus && (
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
            {dealerStatus}
          </Badge>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="relative h-48 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={`${make} ${model}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* View Details Button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/50"
          >
            View Details
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </Card>
  );
}

export function CarDetailViewDetailed({ car, details }: { car: CarCardProps, details: CarDetails }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">{details.title || `${car.make} ${car.model} (${car.year})`}</h2>
        
        {/* Price and Location */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-purple-300">{car.price}</div>
          {car.location && (
            <div className="text-gray-300">
              <MapPin className="w-4 h-4 inline mr-1" />
              {car.location}
            </div>
          )}
        </div>

        {/* Specifications */}
        {car.specifications && Object.keys(car.specifications).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(car.specifications).map(([key, value]) => (
                <div key={key} className="flex items-start">
                  <div className="text-gray-400 mr-2">{key}:</div>
                  <div className="text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {details.sections?.features && details.sections.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {details.sections.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 mr-2 text-purple-400" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {details.sections?.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300">{details.sections.description}</p>
          </div>
        )}

        {/* View Listing Button */}
        <a
          href={car.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          View Full Listing
        </a>
      </div>
    </div>
  );
}

export function CarListingMessage({ content, viewMode = 'grid' }: CarListingProps) {
  if (typeof content === 'string') {
    return null;
  }

  return (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
      {content.listings.map((car) => (
        <CarCard key={car.id} {...car} />
      ))}
    </div>
  );
}