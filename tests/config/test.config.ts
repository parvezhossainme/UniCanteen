/**
 * Test Configuration
 * Central configuration for Selenium tests
 */

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load test environment variables from tests/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

export const TestConfig = {
  // Base URL for the application
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  
  // Browser settings
  browser: {
    name: process.env.TEST_BROWSER || 'firefox', // Changed default to firefox
    headless: process.env.TEST_HEADLESS === 'true',
    windowSize: {
      width: 1920,
      height: 1080
    }
  },

  // Timeouts (in milliseconds)
  timeouts: {
    implicit: 10000,      // Wait for elements
    pageLoad: 30000,      // Wait for page load
    script: 30000,        // Wait for script execution
    explicit: 15000       // Explicit wait timeout
  },

  // Test data
  testUsers: {
    customer: {
      email: process.env.TEST_EMAIL || 'test@example.com',
      password: process.env.TEST_PASSWORD || 'Test@123456'
    },
    canteen: {
      email: 'test.canteen@example.com',
      password: 'TestPassword123!'
    },
    delivery: {
      email: 'test.delivery@example.com',
      password: 'TestPassword123!'
    },
    admin: {
      email: 'test.admin@example.com',
      password: 'TestPassword123!'
    }
  },

  // Paths
  paths: {
    screenshots: './tests/screenshots',
    reports: './tests/reports'
  }
};
