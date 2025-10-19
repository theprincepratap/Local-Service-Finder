import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import LocationCapture from './LocationCapture';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiNavigation,
} from 'react-icons/fi';

// Service Categories
const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Cleaner',
  'AC Repair',
  'Appliance Repair',
  'Pest Control',
  'Gardener',
  'Driver',
  'Moving & Packing',
  'Beauty & Salon',
  'Tutor',
  'Other'
];

// Indian States and Cities
const STATES_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala'],
};

const WorkerRegistrationForm = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableCities, setAvailableCities] = useState([]);

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Location Details
    state: '',
    city: '',
    pincode: '',
    address: '',
    coordinates: null, // Live location coordinates
    latitude: null,
    longitude: null,
    
    // Professional Details
    categories: [],
    skills: [],
    skillInput: '',
    experience: '',
    pricePerHour: '',
    serviceRadius: '10',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.state) {
      setAvailableCities(STATES_CITIES[formData.state] || []);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'categories') {
        setFormData(prev => ({
          ...prev,
          categories: checked
            ? [...prev.categories, value]
            : prev.categories.filter(cat => cat !== value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSkill = () => {
    if (formData.skillInput.trim() && formData.skills.length < 10) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillInput.trim()],
        skillInput: ''
      }));
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleLocationCapture = (locationData) => {
    setFormData(prev => ({
      ...prev,
      coordinates: locationData.coordinates,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
    
    // Clear location error if it exists
    if (errors.coordinates) {
      setErrors(prev => ({ ...prev, coordinates: '' }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.coordinates || !formData.latitude || !formData.longitude) {
      newErrors.coordinates = 'Please capture your live location';
      toast.error('Live location is required for worker registration');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one service category';
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Please add at least one skill';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    } else if (formData.experience < 0 || formData.experience > 50) {
      newErrors.experience = 'Experience must be between 0 and 50 years';
    }

    if (!formData.pricePerHour) {
      newErrors.pricePerHour = 'Price per hour is required';
    } else if (formData.pricePerHour < 50 || formData.pricePerHour > 10000) {
      newErrors.pricePerHour = 'Price must be between ₹50 and ₹10,000';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    } else if (formData.bio.trim().length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fix all errors before continuing');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'worker',
        location: {
          coordinates: formData.coordinates || [0, 0], // Use captured live location
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        workerData: {
          skills: formData.skills,
          categories: formData.categories,
          experience: Number(formData.experience),
          pricePerHour: Number(formData.pricePerHour),
          serviceRadius: Number(formData.serviceRadius),
          bio: formData.bio
        }
      };

      console.log('Sending worker registration data:', registrationData); // Debug log
      
      await register(registrationData);
      toast.success('Worker registration successful! Welcome aboard!');
      navigate('/worker/dashboard');
    } catch (error) {
      console.error('Worker registration error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {currentStep > step ? (
                <FiCheckCircle className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div className={`w-24 h-1 ${
                currentStep > step ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-4">
        <span className={`text-xs ${currentStep >= 1 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          Personal
        </span>
        <span className={`text-xs ${currentStep >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          Location
        </span>
        <span className={`text-xs ${currentStep >= 3 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          Professional
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Continue to Location Details
            </button>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
            
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`input ${errors.state ? 'border-red-500' : ''}`}
              >
                <option value="">Select State</option>
                {Object.keys(STATES_CITIES).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`input ${errors.city ? 'border-red-500' : ''}`}
                disabled={!formData.state}
              >
                <option value="">Select City</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={`input ${errors.pincode ? 'border-red-500' : ''}`}
                placeholder="400001"
                maxLength="6"
              />
              {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`input ${errors.address ? 'border-red-500' : ''}`}
                placeholder="House/Flat No., Street, Area"
                rows="3"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            {/* Live Location Capture */}
            <LocationCapture 
              onLocationCapture={handleLocationCapture}
              required={true}
              className="mt-4"
            />
            {errors.coordinates && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" />
                {errors.coordinates}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Continue to Professional Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Professional Details */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            
            {/* Service Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Categories <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={formData.categories.includes(category)}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {errors.categories && <p className="mt-2 text-sm text-red-600">{errors.categories}</p>}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="skillInput"
                  value={formData.skillInput}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="input flex-1"
                  placeholder="Add a skill (e.g., Pipe fitting)"
                  maxLength="50"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                  disabled={!formData.skillInput.trim() || formData.skills.length >= 10}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills}</p>}
            </div>

            {/* Experience & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.experience ? 'border-red-500' : ''}`}
                    placeholder="5"
                    min="0"
                    max="50"
                  />
                </div>
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price/Hour (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.pricePerHour ? 'border-red-500' : ''}`}
                    placeholder="500"
                    min="50"
                    max="10000"
                  />
                </div>
                {errors.pricePerHour && <p className="mt-1 text-sm text-red-600">{errors.pricePerHour}</p>}
              </div>
            </div>

            {/* Service Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (km)
              </label>
              <input
                type="number"
                name="serviceRadius"
                value={formData.serviceRadius}
                onChange={handleChange}
                className="input"
                placeholder="10"
                min="1"
                max="50"
              />
              <p className="mt-1 text-xs text-gray-500">How far are you willing to travel for jobs?</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`input ${errors.bio ? 'border-red-500' : ''}`}
                placeholder="Describe your experience, expertise, and what makes you the best choice for customers..."
                rows="4"
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Complete Worker Registration'
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have a worker account?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
            Sign in as Worker
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerRegistrationForm;
