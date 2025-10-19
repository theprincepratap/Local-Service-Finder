# Testing Worker Registration - Live Location & State/City Features

## 🧪 Quick Test Guide

### Prerequisites
- Frontend server running: `npm run dev` in frontend folder
- Navigate to: `http://localhost:5173/register/worker`

---

## Test 1: Live Location Capture 📍

### Steps:
1. Fill Step 1 (Basic Info) and proceed to Step 2
2. Fill Step 2 (Service Details) and proceed to Step 3
3. Look for the blue box: "📍 Share Your Live Location"
4. Click **"Get Location"** button

### Expected Behavior:
✅ Browser shows permission prompt: "Allow LocalHost to access your location?"
✅ Button text changes to "Getting..." with spinner
✅ After 2-3 seconds, green text appears: "✓ Location captured: 19.076090, 72.877456"
✅ Address field may auto-populate with street address
✅ Pincode may auto-fill with postal code
✅ Toast notification: "Location captured successfully!"

### Test Scenarios:

#### Scenario A: Allow Permission
- **Action**: Click "Allow" on browser prompt
- **Result**: Coordinates captured, address auto-filled
- **Verify**: Check browser console for lat/lng values

#### Scenario B: Deny Permission  
- **Action**: Click "Block" or "Deny"
- **Result**: Error toast: "Location permission denied. Please enable location access."
- **Verify**: Form still usable, can manually enter address

#### Scenario C: Timeout
- **Action**: Take phone/laptop to area with poor GPS signal
- **Result**: After 10 seconds, toast: "Location request timed out."
- **Verify**: Can retry or enter manually

---

## Test 2: State Selection 🗺️

### Steps:
1. Go to Step 3 (Location Details)
2. Scroll to **State** dropdown (marked with red asterisk *)
3. Click dropdown to open

### Expected Behavior:
✅ Shows "-- Select State --" as first option
✅ Lists 33 states/UTs alphabetically
✅ Includes: Andhra Pradesh, Delhi, Maharashtra, Tamil Nadu, etc.

### Test Scenarios:

#### Scenario A: Select Maharashtra
- **Action**: Click "Maharashtra" from dropdown
- **Result**: 
  - State field shows "Maharashtra"
  - City dropdown becomes enabled (no longer gray)
  - City dropdown shows 10 cities: Mumbai, Pune, Nagpur, Thane, etc.

#### Scenario B: Select Delhi
- **Action**: Click "Delhi" from dropdown
- **Result**: City dropdown shows: New Delhi, North Delhi, South Delhi, etc.

---

## Test 3: City Selection 🏙️

### Steps:
1. First select a State (e.g., "Karnataka")
2. City dropdown becomes enabled
3. Click City dropdown

### Expected Behavior:
✅ Shows "-- Select City --" as first option
✅ Lists cities for selected state only
✅ Karnataka shows: Bangalore, Mysore, Hubli, Mangalore, etc.

### Test Scenarios:

#### Scenario A: Select City Before State
- **Action**: Try to click City dropdown without selecting State
- **Result**: 
  - Dropdown is disabled (gray background)
  - Shows placeholder: "-- Select State First --"

#### Scenario B: Change State After City Selected
- **Action**: 
  1. Select State: "Maharashtra"
  2. Select City: "Mumbai"
  3. Change State to "Karnataka"
- **Result**:
  - City field resets to empty
  - City dropdown now shows Karnataka cities

---

## Test 4: Form Validation ✅

#### Submit Without State
- **Expected**: Red error message: "State is required"

#### Submit Without City
- **Expected**: Red error message: "City is required"

#### Submit With All Fields
- **Expected**: Validation passes, API call with location data

---

## Test 5: Complete Happy Path 🎉

```
Step 1: Basic Info → Next
Step 2: Service Details → Next
Step 3: 
  1. Click "Get Location" → Allow → ✓ Captured
  2. Select State: "Maharashtra"
  3. Select City: "Mumbai"
  4. Fill Address and Pincode
  5. Click "Register as Worker"
Result: Success! Redirected to dashboard
```

---

## ✅ Success Criteria

- ✅ GPS location captured within 5 seconds
- ✅ All 33 states listed alphabetically
- ✅ City dropdown shows correct cities for state
- ✅ City disabled until state selected
- ✅ Validation errors for empty required fields
- ✅ Form submits with complete location data
- ✅ Works on Chrome, Firefox, Safari, Edge
- ✅ Mobile responsive

---

## 🐞 Common Issues

### "Location permission denied"
**Solution**: Browser settings → Location → Allow

### City dropdown empty
**Solution**: Select state first

### Coordinates show (0, 0)
**Solution**: Allow location or enter manually

---

**Happy Testing! 🚀**
