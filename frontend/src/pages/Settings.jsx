import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import {
  FiUser,
  FiLock,
  FiMapPin,
  FiBell,
  FiShield,
  FiCreditCard,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCamera,
} from 'react-icons/fi';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [locationData, setLocationData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingUpdates: true,
    promotions: false,
    newMessages: true,
  });

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or GIF files are allowed');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await apiService.auth.uploadProfilePhoto(file);
      
      // Update user in store
      updateUser({ profileImage: response.data.user.profileImage });
      
      // Update local state for preview
      setProfileData({
        ...profileData,
        profileImage: response.data.user.profileImage
      });
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Location updated successfully!');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'password', label: 'Password', icon: <FiLock /> },
    { id: 'location', label: 'Location', icon: <FiMapPin /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'payment', label: 'Payment', icon: <FiCreditCard /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        {profileData.profileImage && profileData.profileImage !== 'default-avatar.jpg' ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/profiles/${profileData.profileImage}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="btn btn-outline text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiCamera />
                          {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="input"
                        placeholder="9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={user?.role}
                        disabled
                        className="input bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FiSave />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          className="input pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="input pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="input"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Password requirements:</strong>
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>At least 6 characters long</li>
                        <li>Should contain letters and numbers</li>
                        <li>Avoid common passwords</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FiLock />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Settings</h2>
                  <form onSubmit={handleLocationUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={locationData.address}
                        onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                        className="input"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={locationData.city}
                          onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                          className="input"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={locationData.state}
                          onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                          className="input"
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={locationData.pincode}
                        onChange={(e) => setLocationData({ ...locationData, pincode: e.target.value })}
                        className="input"
                        placeholder="123456"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline flex items-center gap-2"
                    >
                      <FiMapPin />
                      Use Current Location
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FiSave />
                      {loading ? 'Saving...' : 'Save Location'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    <NotificationToggle
                      label="Email Notifications"
                      description="Receive updates via email"
                      checked={notificationSettings.emailNotifications}
                      onChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                    <NotificationToggle
                      label="SMS Notifications"
                      description="Receive SMS alerts for important updates"
                      checked={notificationSettings.smsNotifications}
                      onChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                      }
                    />
                    <NotificationToggle
                      label="Booking Updates"
                      description="Get notified about booking status changes"
                      checked={notificationSettings.bookingUpdates}
                      onChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, bookingUpdates: checked })
                      }
                    />
                    <NotificationToggle
                      label="Promotions & Offers"
                      description="Receive promotional emails and special offers"
                      checked={notificationSettings.promotions}
                      onChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, promotions: checked })
                      }
                    />
                    <NotificationToggle
                      label="New Messages"
                      description="Get notified when you receive a new message"
                      checked={notificationSettings.newMessages}
                      onChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, newMessages: checked })
                      }
                    />

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FiSave />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiShield className="text-green-600 text-xl" />
                        <div>
                          <h3 className="font-semibold text-green-900">Account Status</h3>
                          <p className="text-sm text-green-700">Your account is secure</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                        <button className="btn btn-outline text-sm">Enable</button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Active Sessions</h4>
                          <p className="text-sm text-gray-600">Manage your active login sessions</p>
                        </div>
                        <button className="btn btn-outline text-sm">View All</button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Login History</h4>
                          <p className="text-sm text-gray-600">Review your recent login activity</p>
                        </div>
                        <button className="btn btn-outline text-sm">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Add a payment method to make booking services easier and faster.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No payment methods added yet</p>
                        <button className="btn btn-primary">Add Payment Method</button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
                      <p className="text-gray-600 text-sm">View all your past transactions and payments</p>
                      <button className="btn btn-outline mt-4">View History</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{label}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default Settings;
