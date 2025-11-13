// Simple home page that should always work
const SimpleHome = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Find Trusted Local Workers
            </h1>
            <p className="text-xl mb-8">
              Hire skilled professionals for all your home service needs
            </p>
            <a 
              href="/workers"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Search Workers →
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Plumber', icon: '🔧' },
              { name: 'Electrician', icon: '⚡' },
              { name: 'Carpenter', icon: '🔨' },
              { name: 'Cleaner', icon: '🧹' },
              { name: 'Painter', icon: '🎨' },
              { name: 'AC Repair', icon: '❄️' },
            ].map((category) => (
              <a
                key={category.name}
                href={`/workers?category=${category.name}`}
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find a worker?</h2>
          <a 
            href="/workers"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Start Searching Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default SimpleHome;
