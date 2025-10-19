import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const categories = [
    { name: 'Plumber', icon: '🔧', count: 150 },
    { name: 'Electrician', icon: '⚡', count: 120 },
    { name: 'Carpenter', icon: '🔨', count: 90 },
    { name: 'Cleaner', icon: '🧹', count: 200 },
    { name: 'Painter', icon: '🎨', count: 80 },
    { name: 'AC Repair', icon: '❄️', count: 60 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Trusted Local Workers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Hire skilled professionals for all your home service needs
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-4 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-4 bg-white">
                  <FiSearch className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    className="flex-1 py-3 outline-none text-gray-800"
                  />
                </div>
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-4 bg-white">
                  <FiMapPin className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Your location"
                    className="flex-1 py-3 outline-none text-gray-800"
                  />
                </div>
                <Link
                  to="/workers"
                  className="btn btn-primary px-8 py-3 whitespace-nowrap"
                >
                  Search Workers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-gray-600">
              Find the right professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/workers?category=${category.name}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer text-center"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count}+ workers</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600">
              Three simple steps to get your work done
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">
                Find workers near you based on service type and ratings
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Book</h3>
              <p className="text-gray-600">
                Choose your worker and book a convenient time slot
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Work Done</h3>
              <p className="text-gray-600">
                Relax while professionals handle your service needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Are you a skilled worker?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our platform and connect with customers in your area
          </p>
          <Link
            to="/register"
            className="inline-flex items-center btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Register as Worker
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
