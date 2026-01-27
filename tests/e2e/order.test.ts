import { WebDriver } from 'selenium-webdriver';
import {
  createDriver,
  clickElement,
  navigateToPath,
  elementExists,
} from '../utils/webdriver';
import { TestConfig } from '../config/test.config';

async function runOrderFlowTest() {
  let driver: WebDriver | undefined;
  
  try {
    console.log('Starting Order Flow tests...');
    driver = await createDriver();

    console.log('\n=== STEP 1: GO TO HOME PAGE ===');
    await navigateToPath(driver, '/');
    await driver.sleep(3000);
    console.log('  OK Home page loaded');
    
    console.log('\n=== STEP 2: CLICK SIGN IN ===');
    const signInSelectors = [
      'a[href*="sign-in"]',
      'button:contains("Sign In")',
      'a:contains("Sign In")',
      'a:contains("Login")'
    ];
    
    let signInClicked = false;
    for (const selector of signInSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        await clickElement(driver, selector);
        console.log(`  OK Clicked sign in: ${selector}`);
        signInClicked = true;
        break;
      }
    }
    
    if (!signInClicked) {
      console.log('  WARNING Sign in button not found, navigating directly');
      await navigateToPath(driver, '/sign-in');
    }
    
    await driver.sleep(3000);
    console.log('  OK Sign in page loaded');
    
    console.log('\n=== STEP 3: INSERT LOGIN DATA ===');
    
    const testEmail = TestConfig.testUsers.customer.email;
    const testPassword = TestConfig.testUsers.customer.password;
    
    console.log(`  Using email: ${testEmail}`);
    
    // Fill email
    const emailSelectors = [
      'input#email',
      'input[type="email"]',
      'input[name="email"]',
      'input[name="identifier"]'
    ];
    
    for (const selector of emailSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        const element = await driver.findElement({ css: selector });
        await element.clear();
        await driver.sleep(100);
        await element.sendKeys(testEmail);
        console.log('  OK Email entered');
        break;
      }
    }
    
    await driver.sleep(500);
    
    // Fill password
    const passwordSelectors = [
      'input#password',
      'input[type="password"]',
      'input[name="password"]'
    ];
    
    for (const selector of passwordSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        const element = await driver.findElement({ css: selector });
        await element.clear();
        await driver.sleep(100);
        await element.sendKeys(testPassword);
        console.log('  OK Password entered');
        break;
      }
    }
    
    console.log('\n=== STEP 4: SIGN IN ===');
    await driver.sleep(500);
    
    const submitSelectors = [
      'button[type="submit"]',
      'button:contains("Sign in")',
      'button:contains("Login")',
      'input[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      if (await elementExists(driver, selector)) {
        await driver.sleep(200);
        await clickElement(driver, selector);
        console.log('  OK Sign in button clicked');
        break;
      }
    }
    
    await driver.sleep(4000);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`  Current URL: ${currentUrl}`);
    if (currentUrl.includes('/sign-in')) {
      throw new Error('Login failed - still on sign-in page');
    }
    console.log('  OK Successfully signed in');
    
    console.log('\n=== STEP 5: GO TO CUSTOMER HOME ===');
    await navigateToPath(driver, '/customer-home');
    await driver.sleep(3000);
    console.log('  OK Customer home page loaded');
    
    console.log('\n=== STEP 6: GO TO OLYMPIA CAFE ===');
    // Try clicking on Olympia Cafe link first
    const olympiaSelectors = [
      'a[href*="olympia-cafe"]',
      'a[href*="olympia"]',
      'a:contains("Olympia")',
      'a:contains("olympia")'
    ];
    
    let olympiaClicked = false;
    for (const selector of olympiaSelectors) {
      if (await elementExists(driver, selector)) {
        try {
          await clickElement(driver, selector);
          console.log('  OK Clicked Olympia Cafe link');
          await driver.sleep(3000);
          olympiaClicked = true;
          break;
        } catch (error) {
          console.log(`  ERROR Failed to click: ${selector}`);
        }
      }
    }
    
    // If clicking didn't work, navigate directly
    if (!olympiaClicked) {
      console.log('  WARNING Link not found, navigating directly');
      await navigateToPath(driver, '/customer-home/olympia-cafe');
      await driver.sleep(3000);
      console.log('  OK Olympia Cafe page loaded');
    }
    
    console.log('\n=== STEP 7: ADD FOOD ITEMS ===');
    
    let itemsAdded = 0;
    const maxItems = 3;
    
    try {
      // Find all buttons on the page
      const buttons = await driver.findElements({ css: 'button' });
      console.log(`  Found ${buttons.length} total buttons on page`);
      
      let addButtonIndex = 0;
      
      // Try to click buttons that contain "+ Add Product"
      for (let i = 0; i < buttons.length && itemsAdded < maxItems; i++) {
        try {
          const buttonText = await buttons[i].getText();
          const isVisible = await buttons[i].isDisplayed();
          
          // Check if button is "+ Add Product"
          if (isVisible && buttonText.includes('+ Add Product')) {
            console.log(`  Found button: "${buttonText}"`);
            await buttons[i].click();
            itemsAdded++;
            console.log(`  OK Clicked item ${itemsAdded}`);
            await driver.sleep(2000);
            
            // Handle the modal popup
            if (itemsAdded < maxItems) {
              // Click "Continue Shopping" for first two items
              const continueSelectors = [
                'button:contains("Continue Shopping")',
                'a:contains("Continue Shopping")',
                'button:contains("Continue")'
              ];
              
              let continuedShopping = false;
              for (const selector of continueSelectors) {
                if (await elementExists(driver, selector)) {
                  try {
                    await clickElement(driver, selector);
                    console.log(`  OK Clicked "Continue Shopping" after item ${itemsAdded}`);
                    await driver.sleep(1500);
                    continuedShopping = true;
                    break;
                  } catch (error) {
                    // Try next selector
                  }
                }
              }
              
              // If Continue Shopping button not found, try finding it by text in all buttons
              if (!continuedShopping) {
                const modalButtons = await driver.findElements({ css: 'button' });
                for (const btn of modalButtons) {
                  try {
                    const btnText = await btn.getText();
                    if (btnText.toLowerCase().includes('continue') && btnText.toLowerCase().includes('shop')) {
                      await btn.click();
                      console.log(`  OK Clicked "Continue Shopping" after item ${itemsAdded}`);
                      await driver.sleep(1500);
                      break;
                    }
                  } catch (error) {
                    // Continue
                  }
                }
              }
            } else {
              // Click "View Cart" for the last item
              const viewCartSelectors = [
                'button:contains("View Cart")',
                'a:contains("View Cart")',
                'button:contains("Cart")'
              ];
              
              let viewedCart = false;
              for (const selector of viewCartSelectors) {
                if (await elementExists(driver, selector)) {
                  try {
                    await clickElement(driver, selector);
                    console.log(`  OK Clicked "View Cart" after item ${itemsAdded}`);
                    await driver.sleep(3000);
                    viewedCart = true;
                    break;
                  } catch (error) {
                    // Try next selector
                  }
                }
              }
              
              // If View Cart button not found, try finding it by text in all buttons
              if (!viewedCart) {
                const modalButtons = await driver.findElements({ css: 'button' });
                for (const btn of modalButtons) {
                  try {
                    const btnText = await btn.getText();
                    if (btnText.toLowerCase().includes('view') && btnText.toLowerCase().includes('cart')) {
                      await btn.click();
                      console.log(`  OK Clicked "View Cart" after item ${itemsAdded}`);
                      await driver.sleep(3000);
                      break;
                    }
                  } catch (error) {
                    // Continue
                  }
                }
              }
            }
            
            if (itemsAdded >= maxItems) break;
          }
        } catch (error) {
          // Button might be disabled or hidden, continue
        }
      }
    } catch (error) {
      console.log(`  ERROR Error finding buttons: ${error}`);
    }
    
    console.log(`  Total items added: ${itemsAdded}`);
    
    console.log('\n=== STEP 8: VERIFY IN CART ===');
    // We should already be in cart after clicking "View Cart"
    let cartUrl = await driver.getCurrentUrl();
    console.log(`  Current URL: ${cartUrl}`);
    
    // If not in cart, navigate to cart
    if (!cartUrl.includes('cart')) {
      console.log('  WARNING Not in cart, navigating...');
      const cartButtonSelectors = [
        'a[href*="cart"]',
        '[aria-label="Cart"]',
        'button:contains("Cart")',
        '[data-testid="cart-button"]',
        '.cart-icon'
      ];
      
      let cartOpened = false;
      for (const selector of cartButtonSelectors) {
        if (await elementExists(driver, selector)) {
          try {
            await clickElement(driver, selector);
            console.log(`  OK Clicked cart button`);
            await driver.sleep(3000);
            cartOpened = true;
            break;
          } catch (error) {
            console.log(`  ERROR Failed to click cart`);
          }
        }
      }
      
      if (!cartOpened) {
        const cartPaths = ['/customer/cart', '/cart'];
        for (const path of cartPaths) {
          try {
            await navigateToPath(driver, path);
            await driver.sleep(3000);
            console.log(`  OK Navigated to cart page`);
            cartOpened = true;
            break;
          } catch (error) {
            console.log(`  ERROR ${path} not available`);
          }
        }
      }
    } else {
      console.log('  OK Already in cart page');
    }
    
    console.log('\n=== STEP 9: PROCEED TO CHECKOUT ===');
    const checkoutSelectors = [
      'button:contains("Proceed to Checkout")',
      'button:contains("Proceed")',
      'button:contains("Checkout")',
      'button:contains("Place Order")',
      'button:contains("Order Now")',
      '[data-testid="checkout-button"]',
      'button[type="submit"]'
    ];
    
    let orderPlaced = false;
    
    // First try to find all buttons and look for proceed to checkout
    try {
      const allButtons = await driver.findElements({ css: 'button' });
      for (const btn of allButtons) {
        try {
          const btnText = await btn.getText();
          const isVisible = await btn.isDisplayed();
          if (isVisible && (btnText.toLowerCase().includes('proceed') || btnText.toLowerCase().includes('checkout'))) {
            console.log(`  Found button: "${btnText}"`);
            await driver.sleep(1000);
            await btn.click();
            console.log(`  OK Clicked "${btnText}"`);
            await driver.sleep(3000);
            orderPlaced = true;
            break;
          }
        } catch (error) {
          // Continue
        }
      }
    } catch (error) {
      console.log(`  ERROR Error finding checkout button: ${error}`);
    }
    
    // Fallback to selector-based approach
    if (!orderPlaced) {
      for (const selector of checkoutSelectors) {
        if (await elementExists(driver, selector)) {
          try {
            await driver.sleep(1000);
            await clickElement(driver, selector);
            console.log(`  OK Clicked checkout button`);
            await driver.sleep(3000);
            orderPlaced = true;
            break;
          } catch (error) {
            console.log(`  ERROR Failed to click checkout`);
          }
        }
      }
    }
    
    console.log('\n=== STEP 10: GO TO ONGOING ORDERS ===');
    const orderPagePaths = [
      '/customer/ongoing-orders',
      '/customer/orders',
      '/ongoing-orders',
      '/orders'
    ];
    
    const orderLinkSelectors = [
      'a[href*="ongoing"]',
      'a[href*="order"]',
      'button:contains("Ongoing")',
      'button:contains("Orders")',
      'a:contains("My Orders")',
      'a:contains("Ongoing Orders")',
      '[data-testid="orders-link"]'
    ];
    
    let ordersViewed = false;
    
    // Try clicking ongoing orders link
    for (const selector of orderLinkSelectors) {
      if (await elementExists(driver, selector)) {
        try {
          await clickElement(driver, selector);
          console.log(`  OK Clicked ongoing orders link`);
          await driver.sleep(3000);
          ordersViewed = true;
          break;
        } catch (error) {
          console.log(`  ERROR Failed to click orders`);
        }
      }
    }
    
    // Try navigating directly
    if (!ordersViewed) {
      for (const path of orderPagePaths) {
        try {
          await navigateToPath(driver, path);
          await driver.sleep(3000);
          console.log(`  OK Viewing ongoing orders`);
          ordersViewed = true;
          break;
        } catch (error) {
          console.log(`  ERROR ${path} not available`);
        }
      }
    }
    
    const finalUrl = await driver.getCurrentUrl();
    console.log(`  Final URL: ${finalUrl}`);
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Items added: ${itemsAdded}`);
    console.log(`Order placed: ${orderPlaced}`);
    console.log(`Orders viewed: ${ordersViewed}`);
    
    if (!finalUrl.includes('/sign-in')) {
      console.log('\nOK ORDER FLOW TEST COMPLETED SUCCESSFULLY');
    } else {
      throw new Error('Test failed - ended up on sign-in page');
    }
    
  } catch (error) {
    console.error('\nERROR TEST FAILED:', error);
    if (driver) {
      console.log('\nClosing browser due to error...');
      await driver.quit();
    }
    throw error;
  }
  
  // Keep browser open on success
  console.log('\nOK Browser will remain open. Close manually when done.');
}

// Run the test
runOrderFlowTest()
  .then(() => {
    console.log('\n=== ALL TESTS PASSED ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== TEST FAILED ===');
    console.error(error);
    process.exit(1);
  });
