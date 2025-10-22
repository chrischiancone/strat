#!/usr/bin/env node

/**
 * Automated UAT Helper Script
 * Tests basic connectivity and response codes for the deployed application
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://stratplan.netlify.app';
const TEST_ROUTES = [
  { path: '/', name: 'Homepage', critical: true },
  { path: '/login', name: 'Login Page', critical: true },
  { path: '/signup', name: 'Signup Page', critical: false },
  { path: '/dashboard', name: 'Dashboard', critical: true },
  { path: '/plans', name: 'Plans', critical: true },
  { path: '/admin', name: 'Admin Dashboard', critical: true },
  { path: '/admin/users', name: 'User Management', critical: true },
  { path: '/admin/settings', name: 'Admin Settings', critical: true },
  { path: '/admin/audit-logs', name: 'Audit Logs', critical: true },
  { path: '/profile/security', name: '2FA Setup', critical: true },
  { path: '/auth/2fa-required', name: '2FA Required Page', critical: true },
  { path: '/finance', name: 'Finance Module', critical: false },
  { path: '/city-manager', name: 'City Manager', critical: false }
];

class DeploymentTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async testRoute(route) {
    return new Promise((resolve) => {
      const url = `${BASE_URL}${route.path}`;
      const startTime = Date.now();
      
      const request = https.get(url, (res) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const result = {
            ...route,
            url,
            statusCode: res.statusCode,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 400,
            contentLength: data.length,
            hasContent: data.length > 0,
            timestamp: new Date().toISOString()
          };
          
          resolve(result);
        });
      });
      
      request.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          ...route,
          url,
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        resolve({
          ...route,
          url,
          statusCode: 0,
          responseTime: 10000,
          success: false,
          error: 'Request timeout',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Deployment Tests...');
    console.log(`📍 Testing: ${BASE_URL}`);
    console.log(`📊 Routes to test: ${TEST_ROUTES.length}`);
    console.log('─'.repeat(80));
    
    for (const route of TEST_ROUTES) {
      console.log(`Testing ${route.name}...`);
      const result = await this.testRoute(route);
      this.results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const critical = result.critical ? '🔴' : '🟡';
      console.log(`${status} ${critical} ${result.name}: ${result.statusCode} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const criticalFailed = this.results.filter(r => !r.success && r.critical).length;
    
    const avgResponseTime = Math.round(
      this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests
    );
    
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`🔴 Critical Failed: ${criticalFailed}`);
    console.log(`⏱️  Average Response Time: ${avgResponseTime}ms`);
    console.log(`🕒 Total Test Time: ${totalTime}s`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (criticalFailed > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      this.results
        .filter(r => !r.success && r.critical)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error || `Status ${r.statusCode}`}`);
        });
    }
    
    if (failedTests > 0) {
      console.log('\n⚠️  ALL FAILED TESTS:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error || `Status ${r.statusCode}`}`);
        });
    }
    
    console.log('\n📝 DETAILED RESULTS:');
    console.log('─'.repeat(80));
    this.results.forEach(r => {
      const status = r.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} | ${r.name.padEnd(20)} | ${r.statusCode} | ${r.responseTime}ms`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review any failed critical tests above');
    console.log('2. Manually test authentication flows');
    console.log('3. Test 2FA setup and enforcement');
    console.log('4. Validate admin controls');
    console.log('5. Check responsive design on different devices');
    console.log('6. Use the UAT_TEST_PLAN.md for comprehensive testing');
    
    if (criticalFailed === 0 && passedTests >= totalTests * 0.8) {
      console.log('\n🎉 DEPLOYMENT LOOKS GOOD! Ready for manual UAT.');
    } else {
      console.log('\n⚠️  DEPLOYMENT ISSUES DETECTED. Review failed tests before proceeding.');
    }
  }
}

// Run the tests
const tester = new DeploymentTester();
tester.runAllTests().catch(console.error);