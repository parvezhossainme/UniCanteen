/**
 * WebDriver Utility Functions
 * Helper functions for creating and managing WebDriver instances
 */

import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { TestConfig } from '../config/test.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Create a new WebDriver instance
 */
export async function createDriver(): Promise<WebDriver> {
  const browserName = TestConfig.browser.name.toLowerCase();
  let driver: WebDriver;

  if (browserName === 'firefox') {
    const options = new firefox.Options();
    
    if (TestConfig.browser.headless) {
      options.addArguments('--headless');
    }
    
    options.addArguments(
      `--width=${TestConfig.browser.windowSize.width}`,
      `--height=${TestConfig.browser.windowSize.height}`
    );

    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
  } else {
    // Default to Chrome
    const options = new chrome.Options();
    
    if (TestConfig.browser.headless) {
      options.addArguments('--headless');
    }
    
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--window-size=${TestConfig.browser.windowSize.width},${TestConfig.browser.windowSize.height}`
    );

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }

  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: TestConfig.timeouts.implicit,
    pageLoad: TestConfig.timeouts.pageLoad,
    script: TestConfig.timeouts.script
  });

  return driver;
}

/**
 * Quit the WebDriver instance safely
 */
export async function quitDriver(driver: WebDriver): Promise<void> {
  if (driver) {
    try {
      await driver.quit();
    } catch (error) {
      console.error('Error quitting driver:', error);
    }
  }
}

/**
 * Take a screenshot and save it
 */
export async function takeScreenshot(
  driver: WebDriver,
  filename: string
): Promise<void> {
  try {
    const screenshot = await driver.takeScreenshot();
    const screenshotDir = TestConfig.paths.screenshots;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const filepath = path.join(screenshotDir, `${filename}.png`);
    fs.writeFileSync(filepath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filepath}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

/**
 * Wait for an element to be visible
 */
export async function waitForElement(
  driver: WebDriver,
  selector: string,
  timeout: number = TestConfig.timeouts.explicit
): Promise<void> {
  await driver.wait(
    until.elementLocated(By.css(selector)),
    timeout,
    `Element not found: ${selector}`
  );
  
  const element = await driver.findElement(By.css(selector));
  await driver.wait(
    until.elementIsVisible(element),
    timeout,
    `Element not visible: ${selector}`
  );
}

/**
 * Navigate to a path relative to base URL
 */
export async function navigateToPath(
  driver: WebDriver,
  path: string
): Promise<void> {
  const url = `${TestConfig.baseUrl}${path}`;
  await driver.get(url);
  console.log(`Navigated to: ${url}`);
}

/**
 * Click an element with wait
 */
export async function clickElement(
  driver: WebDriver,
  selector: string
): Promise<void> {
  await waitForElement(driver, selector);
  const element = await driver.findElement(By.css(selector));
  await element.click();
}

/**
 * Type text into an input field
 */
export async function typeText(
  driver: WebDriver,
  selector: string,
  text: string
): Promise<void> {
  await waitForElement(driver, selector);
  const element = await driver.findElement(By.css(selector));
  await element.clear();
  await driver.sleep(100); // Small delay after clear
  await element.sendKeys(text);
}

/**
 * Get text content of an element
 */
export async function getText(
  driver: WebDriver,
  selector: string
): Promise<string> {
  await waitForElement(driver, selector);
  const element = await driver.findElement(By.css(selector));
  return await element.getText();
}

/**
 * Check if an element exists
 */
export async function elementExists(
  driver: WebDriver,
  selector: string
): Promise<boolean> {
  try {
    await driver.findElement(By.css(selector));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for page title to contain text
 */
export async function waitForTitle(
  driver: WebDriver,
  titleText: string,
  timeout: number = TestConfig.timeouts.explicit
): Promise<void> {
  await driver.wait(
    until.titleContains(titleText),
    timeout,
    `Page title does not contain: ${titleText}`
  );
}

/**
 * Scroll to element
 */
export async function scrollToElement(
  driver: WebDriver,
  selector: string
): Promise<void> {
  const element = await driver.findElement(By.css(selector));
  await driver.executeScript('arguments[0].scrollIntoView(true);', element);
}
