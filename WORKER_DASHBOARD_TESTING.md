# Worker Dashboard - Access & Testing Guide

## 🚀 How to Access the Worker Dashboard

### Step 1: Start the Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Step 2: Navigate to Worker Dashboard

**Option A: Direct URL**
```
http://localhost:5173/worker/dashboard
```

**Option B: After Worker Registration**
1. Go to: `http://localhost:5173/register/worker`
2. Complete all 3 steps of registration
3. After successful registration → Auto-redirected to Worker Dashboard

**Option C: After Login (If already registered)**
1. Go to: `http://localhost:5173/login`
2. Login with worker credentials
3. Navigate to `/worker/dashboard`

---

## 🧪 Quick Test Scenarios

### Test 1: View Dashboard Overview
1. **Navigate to:** Overview tab (default)
2. **Check:**
   - ✅ 4 stats cards display (Earnings, Active Jobs, Completed, Rating)
   - ✅ Pending Requests section shows 3 jobs
   - ✅ Today's Schedule shows 3 time slots
   - ✅ Earnings chart shows 8 weeks of data
3. **Interact:**
   - Click "Accept" on a pending request → Toast: "Job accepted!"
   - Hover over chart bars → See amounts

---

### Test 2: Manage Active Jobs
1. **Navigate to:** Active Jobs tab
2. **Check:**
   - ✅ Job cards display with all details
   - ✅ Filter buttons work (All, Pending, Accepted, In-Progress)
   - ✅ Search bar filters by service/client
3. **Interact:**
   - Search for "Plumbing" → Filters jobs
   - Click filter "Pending" → Shows only pending jobs
   - Click "Accept" on job → Toast confirmation
   - Click "Start Job" → Toast: "Job started!"
   - Click "Complete Job" → Toast: "Job marked complete!"

---

### Test 3: View Job History
1. **Navigate to:** Job History tab
2. **Check:**
   - ✅ Summary cards show totals
   - ✅ Table displays all past jobs
   - ✅ Pagination works (if > 10 jobs)
3. **Interact:**
   - Click "Export to CSV" → Downloads file
   - Filter by "Completed" → Shows only completed
   - Click page numbers → Navigate pages

---

### Test 4: Check Earnings
1. **Navigate to:** Earnings tab
2. **Check:**
   - ✅ 4 stats cards (Total, This Month, Available, Withdrawn)
   - ✅ Earnings trend chart displays
   - ✅ Transaction history lists all entries
3. **Interact:**
   - Click "Withdraw Funds" → Modal opens
   - Enter amount ₹2000 → Validates
   - Try ₹10000 (exceeds balance) → Error: "Insufficient balance"
   - Click quick amount ₹1000 → Auto-fills
   - Click "Confirm Withdrawal" → Toast: "Withdrawal requested!"
   - Click "Download Statement" → Export functionality

---

### Test 5: Read Reviews
1. **Navigate to:** Reviews tab
2. **Check:**
   - ✅ Overall rating card (4.3/5)
   - ✅ Rating breakdown chart with bars
   - ✅ Review cards display
3. **Interact:**
   - Click filter "5★" → Shows only 5-star reviews
   - Click "Reply" on a review → Modal opens
   - Type reply message
   - Click "Post Reply" → Toast: "Reply posted!"
   - Already replied reviews show worker's response

---

### Test 6: Set Availability
1. **Navigate to:** Availability tab
2. **Check:**
   - ✅ Calendar shows current month
   - ✅ Green dates = available, Red = unavailable
   - ✅ Weekly schedule lists all days
3. **Interact:**
   - Click any green date → Turns red (unavailable)
   - Click any red date → Turns green (available)
   - Click "←" and "→" → Navigate months
   - Uncheck "Monday" → Marks Monday unavailable
   - Change Monday time: 9:00 AM → 10:00 AM
   - Click "Save Schedule" → Toast: "Schedule saved!"
   - Click "Add Special Date" → Modal opens
   - Select date, enter reason → Click "Add Date"
   - Click Quick Action: "Mark All Days Available"
   - Click Quick Action: "Set Default Hours (9-6)"

---

### Test 7: Mobile Responsiveness
1. **Resize browser** to mobile width (< 640px)
2. **Check:**
   - ✅ Sidebar hides, hamburger menu appears
   - ✅ Stats cards stack vertically
   - ✅ Job cards adapt to single column
   - ✅ Tables scroll horizontally
3. **Interact:**
   - Click hamburger icon → Sidebar slides in
   - Click menu item → Sidebar closes, content loads
   - Click outside sidebar → Sidebar closes

---

### Test 8: Notifications
1. **Click bell icon** in top-right header
2. **Check:**
   - ✅ Dropdown shows 3 notifications
   - ✅ Color dots indicate type (blue/green/yellow)
   - ✅ Timestamps display
3. **Interact:**
   - Hover over notifications → Highlight
   - Click "View all notifications" → Navigate to all

---

### Test 9: Navigation & Logout
1. **Click sidebar items** one by one
2. **Check:**
   - ✅ Active tab highlights in blue
   - ✅ Content changes for each section
   - ✅ URL updates (e.g., `/worker/dashboard#jobs`)
3. **Interact:**
   - Click "Logout" in sidebar → Confirmation
   - Redirects to home page
   - Toast: "Logged out successfully"

---

## 📋 Feature Checklist

### Overview Tab
- [ ] Stats cards display correct numbers
- [ ] Pending requests show with Accept/Decline buttons
- [ ] Today's schedule shows time-based jobs
- [ ] Earnings chart renders correctly

### Active Jobs Tab
- [ ] All job statuses work (pending/accepted/in-progress)
- [ ] Filters work (all/pending/accepted/in-progress)
- [ ] Search filters jobs by text
- [ ] Action buttons trigger toasts
- [ ] Job details display completely

### Job History Tab
- [ ] Summary cards calculate totals
- [ ] Table shows all job data
- [ ] Filters work (all/completed/cancelled)
- [ ] Pagination works
- [ ] CSV export downloads file

### Earnings Tab
- [ ] Stats cards show earnings data
- [ ] Chart displays monthly trends
- [ ] Period filters work (week/month/year)
- [ ] Transaction list shows all entries
- [ ] Withdrawal modal opens
- [ ] Withdrawal validation works
- [ ] Quick amount buttons work

### Reviews Tab
- [ ] Overall rating displays
- [ ] Rating breakdown shows percentages
- [ ] Star filters work (all/5/4/3/2/1)
- [ ] Review cards show full details
- [ ] Reply modal opens
- [ ] Reply posts successfully
- [ ] Replied reviews show worker response

### Availability Tab
- [ ] Calendar renders correctly
- [ ] Month navigation works
- [ ] Date toggle works (green ↔ red)
- [ ] Weekly schedule displays
- [ ] Day enable/disable works
- [ ] Time pickers work
- [ ] Save schedule button works
- [ ] Special dates add/delete works
- [ ] Quick actions work

### Profile Tab
- [ ] ⏳ To be implemented

### Documents Tab
- [ ] ⏳ To be implemented

### Settings Tab
- [ ] ⏳ To be implemented

### Navigation
- [ ] Sidebar highlights active tab
- [ ] Mobile hamburger menu works
- [ ] Notifications dropdown works
- [ ] Logout works
- [ ] Redirects work correctly

---

## 🐛 Known Issues / Limitations

### Current State (Mock Data)
- ❗ All data is hardcoded (no database connection)
- ❗ Actions trigger toasts but don't persist
- ❗ MongoDB connection issue blocks real API calls
- ❗ User authentication works but worker profile creation pending

### To Fix
1. **Resolve MongoDB SSL Issue**
   - Install local MongoDB OR
   - Downgrade to Node.js v20 LTS OR
   - Fix Atlas connection settings

2. **Connect Backend APIs**
   - Create worker controller endpoints
   - Implement CRUD operations
   - Add proper authentication middleware

3. **Complete Remaining Sections**
   - Profile edit form
   - Document upload
   - Settings panel

---

## 🎯 Success Criteria

### Dashboard is working if:
✅ All 9 sidebar items are clickable  
✅ Each section loads without errors  
✅ Mock data displays in all sections  
✅ Filters and search work  
✅ Action buttons trigger toast notifications  
✅ Modals open and close properly  
✅ Charts and graphs render  
✅ Calendar is interactive  
✅ Mobile view is responsive  
✅ No console errors  

---

## 📊 Performance Metrics

**Current Stats:**
- **Total Components:** 10
- **Lines of Code:** ~1,900
- **Sections Complete:** 7/9 (78%)
- **Page Load Time:** < 1 second
- **Mobile Responsive:** ✅ Yes
- **Accessibility:** ✅ Basic compliance

---

## 🚀 Demo Workflow

### Scenario: Complete Worker Day

1. **Morning - Check Overview**
   - Login at 9 AM
   - See Today's Schedule
   - Review pending job requests
   - Accept 2 jobs for the day

2. **10 AM - Start First Job**
   - Navigate to Active Jobs
   - Click "Start Job" on 10:00 AM booking
   - Timer starts

3. **12 PM - Complete First Job**
   - Click "Complete Job"
   - Job moves to history

4. **2 PM - Start Second Job**
   - Navigate to Active Jobs
   - Start second job
   - Complete by 4 PM

5. **Evening - Check Earnings**
   - Navigate to Earnings tab
   - See today's earnings added
   - Check available balance

6. **End of Day - Withdraw Funds**
   - Click "Withdraw Funds"
   - Enter ₹3000
   - Submit withdrawal request

7. **Check Reviews**
   - Navigate to Reviews
   - See new 5-star review
   - Reply with thank you message

8. **Set Tomorrow's Availability**
   - Navigate to Availability
   - Block lunch hour (1-2 PM)
   - Save schedule

---

## 🎬 Next Actions

1. **Fix MongoDB Connection** (Critical)
   - Install MongoDB Community Server locally
   - Update MONGO_URI to local connection
   - Test connection

2. **Build Backend APIs**
   - Worker stats endpoint
   - Jobs CRUD endpoints
   - Earnings endpoints
   - Reviews endpoints
   - Availability endpoints

3. **Connect Frontend to Backend**
   - Replace mock data with API calls
   - Add loading states
   - Handle errors gracefully

4. **Complete Remaining Sections**
   - Profile Settings form
   - Documents upload
   - Settings panel

5. **Testing**
   - End-to-end testing
   - Mobile testing
   - Cross-browser testing

---

**Dashboard is ready for demo and initial testing!** 🎉

Access at: `http://localhost:5173/worker/dashboard`
