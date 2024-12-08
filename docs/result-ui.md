# Car Search Frontend Implementation Guide

## Overview
The application needs to handle two types of responses from the backend:
1. Structured JSON data for car listings/details (render as cards)
2. Conversational text responses (render as chat messages/markdown)

## Response Types & Rendering

### 1. Car Listing JSON Response
```json
{
  "status": "success",
  "type": "car_listing",
  "matches": 2,
  "results": [
    {
      "listing_id": "123e4567-e89b-12d3-a456-426614174000",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "price": 25000,
      "engine": 2.5,
      "location": "Dublin",
      "seller": "Toyota Central",
      "description": "Well-maintained Toyota Camry with full service history",
      "url": "https://example.com/listing/123",
      "transmission": "Automatic",
      "listing_status": "Available",
      "first_seen": "2024-03-15T08:00:00Z",
      "details": {
        "fuel_type": "Hybrid",
        "colour": "Pearl White",
        "miles": "15,000",
        "body_type": "Sedan",
        "engine_size": "2.5L",
        "images": [
          "https://example.com/images/camry1.jpg",
          "https://example.com/images/camry2.jpg"
        ]
      }
    }
  ]
}
```

**Render As:** Grid of Cards
- Responsive grid layout (1-4 columns based on screen size)
- Each card should be clickable to show detailed view
- Include image carousel/gallery
- Highlight key specs (price, year, mileage all available)
- Show llisting info
- Include quick action icons (view details, save to bookmark, Ask AI)

### 2. Car Detail JSON Response
```json
{
  "status": "success",
  "type": "car_detail",
  "matches": 1,
  "results": [{
    // Same structure as listing, but single car
  }]
}
```

**Render As:** Detailed Product Page
- Full-width image gallery
- Comprehensive specs table
- Prominent price and key features
- Contact/inquiry form
- Similar listings section

### 3. Conversational Response
Regular text messages should render in chat bubble style:
- User messages
- AI responses
- Support for basic markdown formatting
- Clear visual distinction from car listings



## Interaction Flow


1. **User Search**
- Show loading three dots indicator
- Receive JSON response
- Render car grid
- Enable card interactions

1. **Card Click**
- Open detailed view
- Show full specs
- Provide back navigation



## Important Implementation Notes

1. **Performance**
- Lazy load images
- Virtualize long lists
- Cache previous searches
- Optimize transitions

2. **Responsiveness**
- Mobile-first approach
- Fluid grid layouts
- Adaptive image sizes
- Touch-friendly controls

3. **Accessibility**
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support



## Examples of List vs Detail Views

1. **List View Card**
```tsx
<div className="car-card">
  <div className="car-image-container">
    <img src={listing.details.images[0]} alt={`${listing.make} ${listing.model}`} />
  </div>
  <div className="car-info">
    <h3 className="car-title">{listing.year} {listing.make} {listing.model}</h3>
    <p className="car-price">€{listing.price.toLocaleString()}</p>
    <div className="car-specs">
      <span>{listing.details.miles} miles</span>
      <span>{listing.transmission}</span>
      <span>{listing.details.fuel_type}</span>
    </div>
  </div>
</div>
```

2. **Detail View**
```tsx
<div className="car-detail">
  <div className="image-gallery">
    {listing.details.images.map(img => (
      <img key={img} src={img} alt="" className="gallery-image" />
    ))}
  </div>
  <div className="car-info-detailed">
    <h1 className="car-title-large">
      {listing.year} {listing.make} {listing.model}
    </h1>
    <div className="price-container">
      <span className="price-label">Price</span>
      <span className="price-value">€{listing.price.toLocaleString()}</span>
    </div>
    <div className="specs-table">
      {/* Detailed specifications */}
    </div>
  </div>
</div>
```