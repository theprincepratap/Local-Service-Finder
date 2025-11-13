import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiUser, FiCamera, FiMapPin, FiDollarSign, FiBriefcase, 
  FiClock, FiFileText, FiSave, FiX, FiUpload, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiImage
} from 'react-icons/fi';
import apiService from '../services/apiService';
import LocationCapture from '../components/LocationCapture';
import { useAuthStore } from '../store/authStore';

const WorkerProfileEdit = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuthStore();
  
  console.log('🔍 WorkerProfileEdit - Auth Status:', {
    user,
    isAuthenticated,
    hasToken: !!token,
    userRole: user?.role,
    tokenInLocalStorage: !!localStorage.getItem('token')
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bio: '',
    skills: [],
    categories: [],
    experience: 0,
    pricePerHour: 0,
    serviceRadius: 10,
    availability: 'available',
    location: {
      coordinates: [0, 0],
      address: '',
    },
    workingHours: {
      monday: { start: '09:00', end: '18:00', isAvailable: true },
      tuesday: { start: '09:00', end: '18:00', isAvailable: true },
      wednesday: { start: '09:00', end: '18:00', isAvailable: true },
      thursday: { start: '09:00', end: '18:00', isAvailable: true },
      friday: { start: '09:00', end: '18:00', isAvailable: true },
      saturday: { start: '09:00', end: '18:00', isAvailable: true },
      sunday: { start: '09:00', end: '18:00', isAvailable: false },
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      upiId: '',
    },
    documents: {
      idProof: '',
      addressProof: '',
      certificate: '',
    },
  });

  const [profileImage, setProfileImage] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const categories = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner',
    'AC Repair', 'Appliance Repair', 'Pest Control', 'Gardener',
    'Driver', 'Moving & Packing', 'Beauty & Salon', 'Tutor', 'Other'
  ];

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.worker.getWorkerProfile();
      const worker = response.data;
      
      setFormData({
        name: worker.userId?.name || '',
        phone: worker.userId?.phone || '',
        email: worker.userId?.email || '',
        bio: worker.bio || '',
        skills: worker.skills || [],
        categories: worker.categories || [],
        experience: worker.experience || 0,
        pricePerHour: worker.pricePerHour || 0,
        serviceRadius: worker.serviceRadius || 10,
        availability: worker.availability || 'available',
        location: worker.location || { coordinates: [0, 0], address: '' },
        workingHours: worker.workingHours || formData.workingHours,
        bankDetails: worker.bankDetails || formData.bankDetails,
        documents: worker.documents || formData.documents,
      });
      
      setProfileImage(worker.userId?.profileImage || '');
      
      toast.success('Profile loaded successfully');
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationCapture = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: locationData.coordinates,
        address: locationData.address,
        detectedAddress: locationData.address,
        capturedAt: new Date(),
      }
    }));
    toast.success('Location updated!');
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleBankDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await apiService.worker.uploadProfileImage(formData);
      setProfileImage(response.data.profileImage);
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (docType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    try {
      setUploadingDoc(prev => ({ ...prev, [docType]: true }));
      const uploadFormData = new FormData();
      uploadFormData.append('document', file);
      uploadFormData.append('docType', docType);

      const response = await apiService.worker.uploadWorkerDocument(uploadFormData);
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: response.data.documentUrl
        }
      }));
      
      toast.success(`${docType} uploaded successfully!`);
    } catch (error) {
      console.error('Document upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.categories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }
    
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      toast.error('Please set a valid price per hour');
      return;
    }

    try {
      setSaving(true);
      await apiService.worker.updateWorkerProfile(formData);
      toast.success('Profile updated successfully!');
      navigate('/worker/dashboard');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Worker Profile</h1>
              <p className="text-gray-600 mt-1">Update your professional information</p>
            </div>
            <button
              onClick={() => navigate('/worker/dashboard')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FiX className="mr-2" />
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiCamera className="mr-2 text-blue-600" />
              Profile Photo
            </h2>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100">
                    <FiUser className="text-gray-400 text-4xl" />
                  </div>
                )}
                
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <FiUpload className="mr-2" />
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiUser className="mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / About You
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                placeholder="Tell customers about yourself, your experience, and what makes you special..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>

          {/* Service Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiBriefcase className="mr-2 text-blue-600" />
              Service Categories *
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.categories.includes(category)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {formData.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Selected:</span>
                {formData.categories.map(cat => (
                  <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiCheckCircle className="mr-2 text-blue-600" />
              Skills *
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill (e.g., Pipe Fitting, Wiring, etc.)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 group hover:bg-red-50"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet. Add your professional skills above.</p>
            )}
          </div>

          {/* Pricing & Experience */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-600" />
              Pricing & Experience
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Hour (₹) *
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiMapPin className="mr-2 text-blue-600" />
              Service Location
            </h2>
            
            <LocationCapture
              onLocationCapture={handleLocationCapture}
              required={false}
            />
            
            {formData.location?.address && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Current Location: {formData.location.address}
                </p>
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiClock className="mr-2 text-blue-600" />
              Working Hours
            </h2>
            
            <div className="space-y-4">
              {Object.keys(formData.workingHours).map(day => (
                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-32">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.workingHours[day].isAvailable}
                        onChange={(e) => handleWorkingHoursChange(day, 'isAvailable', e.target.checked)}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </label>
                  </div>
                  
                  {formData.workingHours[day].isAvailable && (
                    <>
                      <input
                        type="time"
                        value={formData.workingHours[day].start}
                        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={formData.workingHours[day].end}
                        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-600" />
              Bank Details (For Payments)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountHolderName}
                  onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.upiId}
                  onChange={(e) => handleBankDetailsChange('upiId', e.target.value)}
                  placeholder="example@paytm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiFileText className="mr-2 text-blue-600" />
              Documents (Optional)
            </h2>
            
            <div className="space-y-4">
              {/* ID Proof */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">ID Proof</h3>
                    <p className="text-sm text-gray-500">Aadhaar, PAN, Driving License, etc.</p>
                    {formData.documents.idProof && (
                      <a
                        href={formData.documents.idProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View uploaded document
                      </a>
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center">
                    {uploadingDoc.idProof ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('idProof', e)}
                      className="hidden"
                      disabled={uploadingDoc.idProof}
                    />
                  </label>
                </div>
              </div>

              {/* Address Proof */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Address Proof</h3>
                    <p className="text-sm text-gray-500">Utility bill, Bank statement, etc.</p>
                    {formData.documents.addressProof && (
                      <a
                        href={formData.documents.addressProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View uploaded document
                      </a>
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center">
                    {uploadingDoc.addressProof ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('addressProof', e)}
                      className="hidden"
                      disabled={uploadingDoc.addressProof}
                    />
                  </label>
                </div>
              </div>

              {/* Professional Certificate */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Professional Certificate</h3>
                    <p className="text-sm text-gray-500">Training certificate, License, etc.</p>
                    {formData.documents.certificate && (
                      <a
                        href={formData.documents.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View uploaded document
                      </a>
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center">
                    {uploadingDoc.certificate ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleDocumentUpload('certificate', e)}
                      className="hidden"
                      disabled={uploadingDoc.certificate}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/worker/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerProfileEdit;
