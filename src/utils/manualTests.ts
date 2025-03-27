import { logger } from './debug';
import { performanceMonitor } from './performance';

/**
 * Run this function from the browser console to verify debugging setup
 */
export function testDebugSystem() {
  console.log('=== Running Debug System Tests ===');

  // Test logger methods
  console.log('\n1. Testing logger utility:');
  logger.info('Test info message', { someData: 'value' });
  logger.store('TestStore', 'testAction', { storeData: 123 });
  logger.api('TestAPI', 'fetchSomething', { param: 'test' });
  logger.error('TestError', new Error('This is a test error'));

  // Test performance monitoring
  console.log('\n2. Testing performance monitoring:');
  performanceMonitor.start('test-operation');

  // Simulate work with a loop
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }

  performanceMonitor.end('test-operation');
  console.log('Sum result:', sum);

  // Test function tracking
  console.log('\n3. Testing function tracking:');
  const trackedFunction = performanceMonitor.track(() => {
    let product = 1;
    for (let i = 1; i <= 100; i++) {
      product *= i;
    }
    return product;
  }, 'tracked-function');

  const result = trackedFunction();
  console.log('Tracked function result:', result);

  // Test async tracking
  console.log('\n4. Testing async function tracking:');
  const trackedAsync = performanceMonitor.track(async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('async result');
      }, 500);
    });
  }, 'tracked-async');

  trackedAsync().then(result => {
    console.log('Async result:', result);
    console.log('\n=== All tests completed ===');
    console.log('To test the Debug Panel, press Ctrl+Shift+D');
    console.log('To test error boundaries, navigate to the ErrorTest component in the UI');
  });

  // Return information for verification
  return {
    message: 'Debug tests running. Check console for results.',
    testTime: new Date().toISOString(),
  };
}
