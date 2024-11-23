export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000724] to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] mb-8">
          About Car Search AI
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>
            Welcome to Car Search AI, your intelligent companion in finding the perfect car in Ireland.
            Our platform combines advanced AI technology with comprehensive car listings to make your
            car search experience seamless and efficient.
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>AI-powered car search assistant</li>
              <li>Comprehensive Irish car marketplace coverage</li>
              <li>Real-time market insights and recommendations</li>
              <li>Intelligent filtering and sorting options</li>
              <li>Natural language conversation interface</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
            <p>
              Simply start a conversation with our AI assistant or use the filter options to specify
              your preferences. Our system will analyze the Irish car market to find the best matches
              for your requirements, providing you with detailed information and insights about each
              vehicle.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p>
              We aim to revolutionize the car buying experience in Ireland by leveraging artificial
              intelligence to provide personalized, accurate, and timely car recommendations. Our
              platform is designed to save you time and help you make informed decisions about your
              next vehicle purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}