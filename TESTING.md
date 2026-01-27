# Selenium Test Suite - Clean Setup ✅

## What's Available

### Test Files
- **`tests/e2e/login.test.ts`** - Complete login/authentication flow tests ✨
- **`tests/e2e/home.test.ts`** - Home page and responsive design tests

### Configuration
- **`tests/config/test.config.ts`** - Centralized test configuration
- **`tests/utils/webdriver.ts`** - Helper functions for WebDriver

### Documentation
- **`tests/README.md`** - Full testing guide
- **`tests/QUICK_REFERENCE.md`** - Quick command reference

## Quick Commands

```bash
# Run login tests (default)
npm test

# Or explicitly
npm run test:login

# Run home page tests
npm run test:home

# Run in headless mode
TEST_HEADLESS=true npm test

# Use Chrome instead of Firefox
TEST_BROWSER=chrome npm test
```

## Login Test Coverage

The login test checks:
1. ✅ Navigate to sign-in page
2. ✅ Email input field exists
3. ✅ Password input field exists
4. ✅ Sign-in button exists
5. ✅ Google sign-in option (optional)
6. ✅ Form submission with invalid credentials
7. ✅ Sign-up link exists

## Usage

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Run tests (in another terminal):**
   ```bash
   npm test
   ```

3. **View screenshots:**
   Check `tests/screenshots/` folder

## Environment Variables

- `TEST_BASE_URL` - Base URL (default: http://localhost:3000)
- `TEST_BROWSER` - Browser: firefox or chrome (default: firefox)
- `TEST_HEADLESS` - Headless mode: true or false (default: false)

## Browser Support

- **Firefox** ✅ (Default, already installed on your system)
- **Chrome** ⚠️ (Need to install: see SELENIUM_SETUP.md)

## Screenshots

All screenshots are saved to `tests/screenshots/`:
- `login-page.png` - Sign-in page loaded
- `login-form-elements.png` - Form elements
- `login-form-filled.png` - Filled form
- `login-error-message.png` - Error after submission
- `login-final.png` - Final state
- Error screenshots when tests fail

## Next Steps

1. Start your dev server: `npm run dev`
2. Run the login test: `npm test`
3. Check screenshots: `ls tests/screenshots/`
4. Add more tests as needed

## Notes

- Tests use Firefox by default (installed on your system)
- All unnecessary test files have been removed
- Focus is on essential authentication testing
- Easy to extend with more tests

---

**Ready to test!** 🚀
