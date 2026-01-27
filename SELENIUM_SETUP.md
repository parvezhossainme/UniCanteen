# Selenium Testing Setup Complete! 🎉

## What's Been Added

Your UniCanteen project now has a complete Selenium WebDriver testing suite!

### 📁 Directory Structure
```
tests/
├── config/
│   └── test.config.ts           # Central test configuration
├── utils/
│   └── webdriver.ts             # WebDriver helper functions
├── e2e/
│   ├── home.test.ts             # Home page tests
│   ├── customer.test.ts         # Customer journey tests
│   ├── canteen.test.ts          # Canteen owner tests
│   ├── delivery.test.ts         # Delivery person tests
│   └── admin.test.ts            # Admin panel tests
├── examples/
│   └── comprehensive.test.ts    # Advanced testing examples
├── screenshots/                  # Auto-generated screenshots
├── run-tests.ts                 # Main test runner
├── QUICKSTART.ts                # Quick reference guide
├── README.md                    # Full documentation
└── .gitignore                   # Ignores test artifacts
```

### 📦 Installed Packages
- `selenium-webdriver` - Browser automation framework
- `@types/selenium-webdriver` - TypeScript definitions
- `chromedriver` - Chrome browser driver
- `ts-node` - TypeScript execution (already present)

### 🚀 Available Commands

Run all tests:
```bash
npm run test:selenium
```

Run specific test suites:
```bash
npm run test:home          # Home page tests
npm run test:customer      # Customer flow tests
npm run test:canteen       # Canteen flow tests
npm run test:delivery      # Delivery flow tests
npm run test:admin         # Admin panel tests
npm run test:comprehensive # Comprehensive example tests
```

Run in headless mode (no browser window):
```bash
TEST_HEADLESS=true npm run test:selenium
```

Run against different environment:
```bash
TEST_BASE_URL=http://localhost:4000 npm run test:selenium
```

## 🎯 Quick Start

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run tests:**
   ```bash
   npm run test:selenium
   ```

3. **View screenshots:**
   Check `tests/screenshots/` for test screenshots

## ⚙️ Configuration

Edit [tests/config/test.config.ts](tests/config/test.config.ts) to customize:
- Base URL (default: http://localhost:3000)
- Browser settings (Chrome, headless mode)
- Timeouts
- Test credentials
- Screenshot paths

## 📝 Writing New Tests

Create a new test file in `tests/e2e/` or use the comprehensive example:

```typescript
import { WebDriver } from 'selenium-webdriver';
import {
  createDriver,
  quitDriver,
  navigateToPath,
  takeScreenshot
} from '../utils/webdriver';

(async () => {
  let driver: WebDriver;
  try {
    driver = await createDriver();
    await navigateToPath(driver, '/your-page');
    await driver.sleep(2000);
    await takeScreenshot(driver, 'your-test');
    console.log('✓ Test passed!');
  } catch (error) {
    console.error('✗ Test failed:', error);
    await takeScreenshot(driver, 'your-test-error');
  } finally {
    await quitDriver(driver);
  }
})();
```

## 🛠️ Helper Functions

Available in `tests/utils/webdriver.ts`:

- `createDriver()` - Initialize WebDriver
- `quitDriver(driver)` - Close browser
- `navigateToPath(driver, path)` - Go to URL
- `waitForElement(driver, selector)` - Wait for element
- `clickElement(driver, selector)` - Click element
- `typeText(driver, selector, text)` - Type into input
- `getText(driver, selector)` - Get element text
- `elementExists(driver, selector)` - Check if element exists
- `takeScreenshot(driver, filename)` - Save screenshot
- `scrollToElement(driver, selector)` - Scroll to element

## 📸 Screenshots

Screenshots are automatically saved to `tests/screenshots/`:
- On test failures
- At key points in tests
- For responsive design testing

## 🐛 Troubleshooting

**Chrome driver issues?**
```bash
npm install --save-dev chromedriver@latest
```

**Port conflicts?**
Make sure your Next.js app is running on port 3000 (or update TEST_BASE_URL)

**Timeouts?**
Increase timeout values in `tests/config/test.config.ts`

**Element not found?**
- Use `waitForElement()` before interacting
- Check your selector is correct
- Increase explicit timeout

## 📚 Documentation

- Full guide: [tests/README.md](tests/README.md)
- Quick reference: [tests/QUICKSTART.ts](tests/QUICKSTART.ts)
- Examples: [tests/examples/comprehensive.test.ts](tests/examples/comprehensive.test.ts)

## 🔄 CI/CD Integration

To run in CI/CD pipelines:

1. Install Chrome in your CI environment
2. Run in headless mode:
   ```bash
   TEST_HEADLESS=true npm run test:selenium
   ```
3. Archive screenshots as artifacts

## 📊 Test Coverage

Current test files cover:
- ✅ Home page loading and navigation
- ✅ Customer journeys (browsing, cart, orders)
- ✅ Canteen management (dashboard, foods, orders)
- ✅ Delivery person flows (dashboard, active, history)
- ✅ Admin panel access
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Performance monitoring
- ✅ Browser console error detection

## 🎓 Next Steps

1. Customize test credentials in `test.config.ts`
2. Add authentication tests if needed
3. Create tests for your specific features
4. Add data-testid attributes to key elements
5. Set up CI/CD integration
6. Create page object models for complex pages

## 💡 Tips

- Use descriptive screenshot names
- Test one feature per test case
- Keep tests independent
- Use proper waits instead of sleep() in production
- Run in headless mode in CI/CD
- Review screenshots after test failures

---

**Happy Testing! 🚀**

For questions or issues, check:
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [WebDriver API](https://www.selenium.dev/selenium/docs/api/javascript/)
- Project README: [tests/README.md](tests/README.md)
