/**
 * Home Page Tests
 * Tests for the main landing page
 */

import { WebDriver } from 'selenium-webdriver';
import {
  createDriver,
  quitDriver,
  navigateToPath,
  waitForElement,
  takeScreenshot,
  elementExists
} from '../utils/webdriver';

async function runHomeTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║          🏠 Home Page Tests 🏠             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  let driver: WebDriver | undefined;
  const results: { name: string; passed: boolean }[] = [];

  try {
    driver = await createDriver();
    console.log('✓ WebDriver created\n');

    // Test 1: Load home page
    console.log('Test 1: Loading home page...');
    try {
      await navigateToPath(driver, '/');
      await driver.sleep(2000);
      
      const title = await driver.getTitle();
      const url = await driver.getCurrentUrl();
      
      console.log(`  Title: ${title}`);
      console.log(`  URL: ${url}`);
      
      await takeScreenshot(driver, 'home-page');
      console.log('  ✓ Home page loaded successfully\n');
      results.push({ name: 'Load home page', passed: true });
    } catch (error) {
      console.error('  ✗ Failed to load home page:', error);
      await takeScreenshot(driver, 'home-page-error');
      results.push({ name: 'Load home page', passed: false });
    }

    // Test 2: Check navigation
    console.log('Test 2: Checking navigation elements...');
    try {
      const hasHeader = await elementExists(driver, 'header');
      const hasNav = await elementExists(driver, 'nav');
      
      console.log(`  Header: ${hasHeader ? '✓' : '✗'}`);
      console.log(`  Nav: ${hasNav ? '✓' : '✗'}`);
      
      await takeScreenshot(driver, 'home-navigation');
      
      if (hasHeader || hasNav) {
        console.log('  ✓ Navigation elements found\n');
        results.push({ name: 'Navigation elements', passed: true });
      } else {
        console.log('  ✗ No navigation elements found\n');
        results.push({ name: 'Navigation elements', passed: false });
      }
    } catch (error) {
      console.error('  ✗ Navigation check failed:', error);
      results.push({ name: 'Navigation elements', passed: false });
    }

    // Test 3: Responsive design
    console.log('Test 3: Testing responsive views...');
    try {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        await driver.manage().window().setRect({
          width: viewport.width,
          height: viewport.height
        });
        
        await driver.sleep(500);
        await takeScreenshot(driver, `home-${viewport.name.toLowerCase()}`);
        console.log(`  ✓ ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
      
      console.log('  ✓ Responsive design tested\n');
      results.push({ name: 'Responsive design', passed: true });
    } catch (error) {
      console.error('  ✗ Responsive test failed:', error);
      await takeScreenshot(driver, 'responsive-error');
      results.push({ name: 'Responsive design', passed: false });
    }

    // Print results
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║              Test Results                  ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    results.forEach(result => {
      const symbol = result.passed ? '✓' : '✗';
      const status = result.passed ? 'PASSED' : 'FAILED';
      console.log(`${symbol} ${result.name}: ${status}`);
    });
    
    console.log('\n' + '─'.repeat(50));
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed} (${((passed/results.length) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);
    console.log('─'.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    if (driver) {
      await takeScreenshot(driver, 'home-fatal-error');
    }
  } finally {
    if (driver) {
      console.log('🧹 Closing browser...');
      await quitDriver(driver);
      console.log('✓ Browser closed\n');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  runHomeTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runHomeTests };
