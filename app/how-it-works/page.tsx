export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Enter Your Preferences</h2>
          <p className="text-gray-600">
            Start by selecting your preferred car specifications including make, model, year range, and price range.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. AI-Powered Search</h2>
          <p className="text-gray-600">
            Our advanced AI system searches across multiple platforms to find the best matches for your criteria.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Real-Time Results</h2>
          <p className="text-gray-600">
            View detailed car listings that match your preferences, updated in real-time with the latest available options.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Interactive Refinement</h2>
          <p className="text-gray-600">
            Refine your search through natural conversation with our AI assistant to find exactly what you're looking for.
          </p>
        </section>
      </div>
    </div>
  );
}