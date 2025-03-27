import { logger } from './debug';
import { performanceMonitor } from './performance';

/**
 * Run this function from the browser console to verify debugging setup
 * Example: window.testDebugSystem()
 */
export function testDebugSystem() {
  // Assuming 'no-console' rule is relaxed for this file via config
  console.log('%c=== Running Debug System Tests ===', 'color: blue; font-size: 1.2em;');

  // Test logger methods
  console.log('\n1. Testing logger utility:');
  logger.info('Test info message', { someData: 'value', timestamp: new Date() });
  logger.store('TestStore', 'testAction', { storeData: 123, status: 'pending' });
  logger.api('TestAPI', 'fetchSomething', { param: 'test', id: 42 });
  logger.error('TestErrorSource', new Error('This is a test error generated manually.'));
  logger.debug('Detailed debug step', { detail: 'foo', count: 5 });

  // Test performance monitoring
  console.log('\n2. Testing performance monitoring:');
  performanceMonitor.start('test-sync-operation');

  // Simulate work with a loop
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i % 100; // Slightly modified work
  }

  performanceMonitor.end('test-sync-operation');
  console.log('Sync operation sum result:', sum);

  // Test function tracking
  console.log('\n3. Testing sync function tracking:');
  const trackedFunction = performanceMonitor.track(() => {
    let product = 1;
    // Calculate a smaller factorial to avoid potential performance issues in console
    for (let i = 1; i <= 10; i++) {
      product *= i;
    }
    return product;
  }, 'tracked-factorial-function');

  const syncResult = trackedFunction();
  // Log result using logger or allowed console method
  logger.info('Tracked sync function result:', { result: syncResult });

  // Test async tracking
  console.log('\n4. Testing async function tracking:');
  const trackedAsync = performanceMonitor.track(async () => {
    logger.debug('Tracked async function started');
    await new Promise(resolve => setTimeout(resolve, 450)); // Simulate async work
    logger.debug('Tracked async function finished delay');
    return 'async-result-' + Math.random().toFixed(3);
  }, 'tracked-async-operation');

  // Using .then for clarity in this manual test script
  trackedAsync()
    .then(asyncResult => {
      logger.info('Tracked async function result:', { result: asyncResult });
      console.log('\n%c=== Debug System Tests Completed ===', 'color: green; font-size: 1.2em;');
      console.info('Hints:');
      console.info(
        '- Check the browser console for detailed logger outputs and performance marks.'
      );
      console.info('- To test the Debug Panel overlay, press Ctrl+Shift+D (or Cmd+Shift+D).');
      console.info(
        '- To test Error Boundaries, use the "Test Debug System" button in the UI (if available) or manually trigger an error.'
      );
    })
    .catch(err => {
      logger.error('Error during tracked async function test', err);
      console.log(
        '\n%c=== Debug System Tests Completed with ERROR ===',
        'color: red; font-size: 1.2em;'
      );
    });

  // Return information for verification if needed immediately
  return {
    message: 'Debug tests initiated. Check console for detailed results and timings.',
    testInitiatedAt: new Date().toISOString(),
  };
}
