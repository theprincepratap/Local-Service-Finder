import { useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AvailabilitySection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    Tuesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    Wednesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    Thursday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    Friday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    Saturday: { isAvailable: true, startTime: '10:00', endTime: '16:00' },
    Sunday: { isAvailable: false, startTime: '10:00', endTime: '16:00' },
  });

  const [specialDates, setSpecialDates] = useState([
    { date: '2025-10-25', type: 'unavailable', reason: 'Personal Leave' },
    { date: '2025-11-01', type: 'unavailable', reason: 'Holiday' },
  ]);

  const [showAddSpecialDate, setShowAddSpecialDate] = useState(false);
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    type: 'unavailable',
    reason: '',
  });

  // Calendar generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isDateUnavailable = (day) => {
    if (!day) return false;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return specialDates.some(sd => sd.date === dateStr && sd.type === 'unavailable');
  };

  const handleDayToggle = (day) => {
    if (!day) return;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const exists = specialDates.find(sd => sd.date === dateStr);
    if (exists) {
      setSpecialDates(specialDates.filter(sd => sd.date !== dateStr));
      toast.success('Date marked as available');
    } else {
      setSpecialDates([...specialDates, { date: dateStr, type: 'unavailable', reason: 'Unavailable' }]);
      toast.success('Date marked as unavailable');
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: { ...weeklySchedule[day], [field]: value },
    });
  };

  const handleSaveSchedule = () => {
    toast.success('Weekly schedule saved successfully!');
    // API call to save schedule
  };

  const handleAddSpecialDate = () => {
    if (!newSpecialDate.date || !newSpecialDate.reason) {
      toast.error('Please fill all fields');
      return;
    }
    setSpecialDates([...specialDates, newSpecialDate]);
    setNewSpecialDate({ date: '', type: 'unavailable', reason: '' });
    setShowAddSpecialDate(false);
    toast.success('Special date added successfully!');
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Availability & Schedule</h2>
        <p className="text-gray-600 mt-1">Manage your working hours and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiCalendar />
              Availability Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={previousMonth} className="btn btn-outline btn-sm">
                ←
              </button>
              <span className="font-semibold text-gray-900">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="btn btn-outline btn-sm">
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth(selectedDate).map((day, index) => {
              const isUnavailable = isDateUnavailable(day);
              const isToday =
                day === new Date().getDate() &&
                selectedDate.getMonth() === new Date().getMonth() &&
                selectedDate.getFullYear() === new Date().getFullYear();

              return (
                <div key={index} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => handleDayToggle(day)}
                      className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        isToday
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : isUnavailable
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={isUnavailable ? 'Click to mark available' : 'Click to mark unavailable'}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded"></div>
              <span className="text-sm text-gray-700">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded"></div>
              <span className="text-sm text-gray-700">Today</span>
            </div>
          </div>
        </div>

        {/* Special Dates */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Dates</h3>
          
          <button
            onClick={() => setShowAddSpecialDate(true)}
            className="btn btn-primary w-full mb-4"
          >
            Add Special Date
          </button>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {specialDates.map((sd, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sd.date}</p>
                    <p className="text-xs text-gray-600 mt-1">{sd.reason}</p>
                  </div>
                  <button
                    onClick={() => setSpecialDates(specialDates.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiXCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiClock />
            Weekly Schedule
          </h3>
          <button onClick={handleSaveSchedule} className="btn btn-primary flex items-center gap-2">
            <FiSave />
            Save Schedule
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(weeklySchedule).map(([day, schedule]) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 sm:w-40">
                <input
                  type="checkbox"
                  checked={schedule.isAvailable}
                  onChange={(e) => handleScheduleChange(day, 'isAvailable', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">{day}</span>
              </div>

              {schedule.isAvailable ? (
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">From:</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                      className="input py-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">To:</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                      className="input py-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FiCheckCircle />
                    <span>Available</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <FiXCircle />
                  <span>Not Available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              const newSchedule = {};
              Object.keys(weeklySchedule).forEach((day) => {
                newSchedule[day] = { ...weeklySchedule[day], isAvailable: true };
              });
              setWeeklySchedule(newSchedule);
              toast.success('All days marked as available');
            }}
            className="btn btn-outline"
          >
            Mark All Days Available
          </button>
          <button
            onClick={() => {
              const newSchedule = {};
              Object.keys(weeklySchedule).forEach((day) => {
                newSchedule[day] = {
                  ...weeklySchedule[day],
                  startTime: '09:00',
                  endTime: '18:00',
                };
              });
              setWeeklySchedule(newSchedule);
              toast.success('Reset to 9 AM - 6 PM for all days');
            }}
            className="btn btn-outline"
          >
            Set Default Hours (9-6)
          </button>
          <button
            onClick={() => {
              setSpecialDates([]);
              toast.success('All special dates cleared');
            }}
            className="btn btn-outline"
          >
            Clear Special Dates
          </button>
        </div>
      </div>

      {/* Add Special Date Modal */}
      {showAddSpecialDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Special Date</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newSpecialDate.date}
                  onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={newSpecialDate.reason}
                  onChange={(e) => setNewSpecialDate({ ...newSpecialDate, reason: e.target.value })}
                  placeholder="e.g., Personal Leave, Holiday"
                  className="input w-full"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddSpecialDate} className="btn btn-primary flex-1">
                  Add Date
                </button>
                <button
                  onClick={() => {
                    setShowAddSpecialDate(false);
                    setNewSpecialDate({ date: '', type: 'unavailable', reason: '' });
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySection;
