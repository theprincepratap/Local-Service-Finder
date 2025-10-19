const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">LocalWorker</h3>
            <p className="text-gray-400 text-sm">
              Find and hire trusted local workers for all your home service needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/workers" className="hover:text-white transition">Find Workers</a></li>
              <li><a href="/register" className="hover:text-white transition">Become a Worker</a></li>
              <li><a href="/about" className="hover:text-white transition">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Plumber</li>
              <li>Electrician</li>
              <li>Carpenter</li>
              <li>Cleaner</li>
              <li>And More...</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@localworker.com</li>
              <li>Phone: +91 1234567890</li>
              <li>Location: India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LocalWorker. Developed by Prince Kumar.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
