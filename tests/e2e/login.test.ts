import { WebDriver } from 'selenium-webdriver';
import {
  createDriver,
  navigateToPath,
  clickElement,
  elementExists
} from '../utils/webdriver';
import { TestConfig } from '../config/test.config';

async function runLoginTests() {
  console.log('\n=== Login Test ===\n');

  let driver: WebDriver | undefined;

  try {
    console.log('Starting browser...');
    driver = await createDriver();
    console.log('Browser started\n');

    console.log('Going to sign-in page...');
    await navigateToPath(driver, '/sign-in');
    await driver.sleep(3000);
    console.log('Sign-in page loaded\n');

    const testEmail = TestConfig.testUsers.customer.email;
    const testPassword = TestConfig.testUsers.customer.password;

    console.log(`Using email: ${testEmail}`);

    // Fill email
    console.log('Filling email...');
    const emailSelectors = [
      'input#email',
      'input[type="email"]',
      'input[name="email"]',
      'input[name="identifier"]'
    ];

    let emailFilled = false;
    for (const selector of emailSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        const element = await driver.findElement({ css: selector });
        await element.clear();
        await driver.sleep(100);
        await element.sendKeys(testEmail);
        await driver.sleep(200);
        console.log('Email entered');
        emailFilled = true;
        break;
      }
    }

    if (!emailFilled) {
      throw new Error('Could not fill email field');
    }

    await driver.sleep(500);

    // Fill password
    console.log('Filling password...');
    const passwordSelectors = [
      'input#password',
      'input[type="password"]',
      'input[name="password"]'
    ];

    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        const element = await driver.findElement({ css: selector });
        await element.clear();
        await driver.sleep(100);
        await element.sendKeys(testPassword);
        await driver.sleep(200);
        console.log('Password entered');
        passwordFilled = true;
        break;
      }
    }

    if (!passwordFilled) {
      throw new Error('Could not fill password field');
    }

    await driver.sleep(500);

    // Submit form
    console.log('Clicking sign in button...');
    const submitSelectors = [
      'button[type="submit"]',
      'button:contains("Sign in")',
      'button:contains("Login")',
      'input[type="submit"]'
    ];

    let submitted = false;
    for (const selector of submitSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        await clickElement(driver, selector);
        console.log('Sign in button clicked');
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      throw new Error('Could not find submit button');
    }

    await driver.sleep(4000);

    const currentUrl = await driver.getCurrentUrl();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/sign-in')) {
      throw new Error('Login failed - still on sign-in page');
    }

    console.log('\n=== Login Successful ===\n');
    console.log('Browser will remain open. Close manually when done.\n');

  } catch (error) {
    console.error('\nLogin test failed:', error);
    if (driver) {
      console.log('\nClosing browser due to error...');
      await driver.quit();
    }
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runLoginTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runLoginTests };
