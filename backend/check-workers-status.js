#!/usr/bin/env node

/**
 * WORKER SEARCH DIAGNOSTIC TOOL
 * Helps identify why no workers are found in search results
 * Usage: node backend/check-workers-status.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const mongoUri = process.env.MONGO_URI;

async function diagnoseWorkerSearch() {
  try {
    console.log('🔍 WORKER SEARCH DIAGNOSTIC TOOL\n');
    console.log('📦 Connecting to MongoDB Atlas...');
    console.log('📍 URI:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const Worker = require('./models/Worker.model');

    // 1. Count total workers
    const totalWorkers = await Worker.countDocuments();
    console.log('📊 TOTAL WORKERS IN DATABASE:', totalWorkers);
    
    if (totalWorkers === 0) {
      console.log('⚠️  NO WORKERS FOUND IN DATABASE');
      console.log('   → You need to create worker accounts first!');
      console.log('   → Register as a worker at: http://localhost:5173/register/worker\n');
      process.exit(0);
    }

    // 2. Count workers by approval status
    const approvalStats = await Worker.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📋 WORKERS BY APPROVAL STATUS:');
    approvalStats.forEach(stat => {
      console.log(`   ${stat._id || 'null'}: ${stat.count}`);
    });
    
    const approvedCount = approvalStats.find(s => s._id === 'approved')?.count || 0;
    if (approvedCount === 0) {
      console.log('⚠️  NO APPROVED WORKERS');
      console.log('   → Admin must approve workers first!\n');
    }

    // 3. Count by isActive status
    const activeStats = await Worker.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('✅ WORKERS BY ACTIVE STATUS:');
    activeStats.forEach(stat => {
      console.log(`   isActive=${stat._id}: ${stat.count}`);
    });

    // 4. Check location data
    const workersWithLocation = await Worker.countDocuments({
      'location.coordinates': { $exists: true, $ne: null }
    });
    
    console.log(`📍 WORKERS WITH VALID LOCATION: ${workersWithLocation}/${totalWorkers}`);
    if (workersWithLocation < totalWorkers) {
      console.log(`   ⚠️  ${totalWorkers - workersWithLocation} workers missing location data\n`);
    }

    // 5. Show sample worker document
    const sampleWorker = await Worker.findOne().populate('userId');
    
    if (sampleWorker) {
      console.log('📄 SAMPLE WORKER DOCUMENT:');
      console.log(`   _id: ${sampleWorker._id}`);
      console.log(`   Name: ${sampleWorker.userId?.name || 'N/A'}`);
      console.log(`   Email: ${sampleWorker.userId?.email || 'N/A'}`);
      console.log(`   Category: ${sampleWorker.categories?.[0] || 'N/A'}`);
      console.log(`   Approval Status: ${sampleWorker.approvalStatus}`);
      console.log(`   Is Active: ${sampleWorker.isActive}`);
      console.log(`   Location: ${sampleWorker.location?.address || 'N/A'}`);
      console.log(`   Coordinates: [${sampleWorker.location?.coordinates?.join(', ') || 'N/A'}]`);
      console.log();
    }

    // 6. Find workers that would match search query
    const searchableWorkers = await Worker.countDocuments({
      approvalStatus: 'approved',
      isActive: true,
      'location.coordinates': { $exists: true, $ne: null }
    });
    
    console.log('🔍 SEARCHABLE WORKERS (approved + active + has location):');
    console.log(`   Count: ${searchableWorkers}`);
    
    if (searchableWorkers === 0) {
      console.log('   ⚠️  NO WORKERS MATCH SEARCH CRITERIA!\n');
      console.log('   📋 CHECKLIST TO FIX:');
      console.log('   [ ] 1. Create worker accounts (register as worker)');
      console.log('   [ ] 2. Admin approves workers (admin dashboard)');
      console.log('   [ ] 3. Workers set their location (profile setup)');
      console.log('   [ ] 4. Workers activate their account (isActive = true)');
      console.log();
    } else {
      console.log('   ✅ Workers are searchable!\n');
    }

    // 7. Show what search query looks for
    console.log('🔎 SEARCH QUERY REQUIREMENTS:');
    console.log('   ✓ approvalStatus = "approved"');
    console.log('   ✓ isActive = true');
    console.log('   ✓ location.coordinates exists');
    console.log('   ✓ Within geospatial bounds\n');

    // 8. Summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Workers: ${totalWorkers}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Active: ${activeStats.find(s => s._id === true)?.count || 0}`);
    console.log(`   With Location: ${workersWithLocation}`);
    console.log(`   Searchable: ${searchableWorkers}`);
    console.log();

    if (searchableWorkers > 0) {
      console.log('✅ Your search should work! Try searching again.');
    } else {
      console.log('❌ Need to fix worker status before search will work.');
      console.log('   See checklist above.');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseWorkerSearch();
