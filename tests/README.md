# Selenium Testing for UniCanteen

Simple automated tests for the UniCanteen application using Selenium WebDriver.

## Install

```bash
npm install selenium-webdriver @types/selenium-webdriver chromedriver ts-node dotenv
```

## Setup Test Credentials

Create a `.env` file in the tests folder:

```bash
cd tests
cp .env.example .env
```

Edit `tests/.env` with your test account:

```env
TEST_EMAIL=your-email@example.com
TEST_PASSWORD=YourPassword123
TEST_BASE_URL=http://localhost:3000
TEST_BROWSER=firefox
TEST_HEADLESS=false
```

**Note:** This file is gitignored and won't be committed.

## Running Tests

Make sure the dev server is running first:

```bash
npm run dev
```

Then run tests:

```bash
# Run order flow test (default)
npm test

# Run specific tests
npm run test:login
npm run test:home
npm run test:order
```

## What the Test Does

The order flow test automates:
1. Go to home page
2. Click sign in
3. Enter email and password
4. Sign in
5. Go to customer home
6. Go to Olympia Cafe
7. Add 3 food items (clicks "Continue Shopping" for first 2, "View Cart" for 3rd)
8. Verify in cart
9. Click "Proceed to Checkout"
10. Go to ongoing orders page

The browser stays open when tests pass so you can inspect the result.

## Troubleshooting

**Browser not found?**
- Install Firefox or Chrome browser
- Or set `TEST_BROWSER=chrome` in tests/.env

**Can't find elements?**
- Increase delays in the test file
- Check if selectors match your HTML

**Login fails?**
- Verify your credentials in tests/.env
- Make sure the account exists in your database

TEST_BROWSER=chrome npm test
```

## Test Structure

```
tests/
├── config/
│   └── test.config.ts       # Test configuration
├── utils/
│   └── webdriver.ts         # WebDriver utilities
├── e2e/
│   ├── login.test.ts        # Login/authentication tests
│   └── home.test.ts         # Home page tests
└── screenshots/             # Test screenshots (auto-generated)
```

## Available Tests

### Login Tests (`test:login`)
Tests the authentication flow:
- Navigate to sign-in page
- Check email input field
- Check password input field
- Check sign-in button
- Test form submission with invalid credentials
- Check Google sign-in option
- Check sign-up link

### Home Tests (`test:home`)
Tests the home page:
- Page loading
- Navigation elements
- Responsive design (desktop, tablet, mobile)

## Configuration

Edit `tests/config/test.config.ts` to configure:
- Base URL (default: http://localhost:3000)
- Browser (default: firefox)
- Headless mode
- Timeouts
- Screenshot paths

## Environment Variables

- `TEST_BASE_URL`: Base URL of the application (default: http://localhost:3000)
- `TEST_BROWSER`: Browser to use - firefox or chrome (default: firefox)
- `TEST_HEADLESS`: Run in headless mode (default: false)
- `TEST_EMAIL`: Email for login test (default: test@example.com)
- `TEST_PASSWORD`: Password for login test (default: Test@123456)

## Setting Test Credentials

### Quick Setup (Recommended)
1. Copy the example env file:
   ```bash
   cp tests/.env.example tests/.env
   ```

2. Edit `tests/.env` with your credentials:
   ```bash
   nano tests/.env
   ```

3. Add your test account:
   ```env
   TEST_EMAIL=your-test@email.com
   TEST_PASSWORD=YourPassword123
   ```

4. Run tests (credentials load automatically):
   ```bash
   npm test
   ```

### Alternative: Environment Variables
```bash
TEST_EMAIL=your@email.com TEST_PASSWORD=YourPassword npm test
```

### Alternative: Edit Config File
Edit `tests/config/test.config.ts` and update:
```typescript
testUsers: {
  customer: {
    email: 'your@email.com',
    password: 'YourPassword'
  }
}
```

**Note:** The `tests/.env` file is gitignored and safe for credentials.

## Screenshots

Screenshots are automatically saved to `tests/screenshots/`:
- On test completion
- At key test checkpoints
- On test failures

## Writing New Tests

See existing tests in `tests/e2e/` for examples.

Basic structure:
```typescript
import { WebDriver } from 'selenium-webdriver';
import { 
  createDriver, 
  quitDriver, 
  navigateToPath,
  takeScreenshot 
} from '../utils/webdriver';

async function myTest() {
  let driver: WebDriver | undefined;
  
  try {
    driver = await createDriver();
    await navigateToPath(driver, '/my-page');
    await takeScreenshot(driver, 'my-test');
  } finally {
    if (driver) await quitDriver(driver);
  }
}
```

## Troubleshooting

### Browser not found
- Firefox: `sudo apt install firefox`
- Chrome: Download from google.com/chrome

### Port conflicts
Make sure your Next.js app is running on the expected port.

### Timeouts
Increase timeout values in `test.config.ts`.
