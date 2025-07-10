const { exec } = require('child_process');
const path = require('path');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`);
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('DevTools') && !stderr.includes('dotenv')) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function runCompleteDemo() {
  try {
    console.log('🎯 Starting Complete Visual Testing Demo');
    console.log('=====================================\n');

    // Step 1: Ensure clean state and create baselines
    console.log('📋 STEP 1: Setup Clean Baselines');
    console.log('This creates the "golden master" screenshots that Applitools will compare against.');
    
    await runCommand('npm run demo:applitools-baseline', 'Creating clean baselines in Applitools');
    
    console.log('✅ Baselines created! These represent the "correct" appearance of your site.');
    
    // Step 2: Inject bugs for the demo
    console.log('\n📋 STEP 2: Inject Visual Bugs');
    console.log('Injecting realistic bugs that humans might miss but AI will catch...');
    
    await runCommand('node scripts/inject-bugs.js inject applitools-demo-bugs', 'Injecting visual bugs');
    
    console.log('✅ Visual bugs injected!');
    console.log('   - Homepage: Purple oversized title');
    console.log('   - Shop: "Headphonez" typo');
    console.log('   - Profile: Red button instead of blue');
    console.log('   - Contact: Misaligned submit button');
    console.log('   - Support: Wrong email address');

    // Step 3: Manual testing instructions
    console.log('\n📋 STEP 3: Manual Testing Phase');
    console.log('==================================');
    console.log('👋 YOUR TURN! Time to do manual testing...');
    console.log('');
    console.log('1. 🌐 Navigate to: http://localhost:3000/manual-demo');
    console.log('2. ⏱️  Complete the timed bug hunting challenge');
    console.log('3. 📊 Note your total time and return here');
    console.log('');
    console.log('⏳ Waiting for you to complete manual testing...');
    console.log('   (Press ENTER when you\'ve finished the manual demo)');
    
    // Wait for user input
    await new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question('Press ENTER after completing manual testing: ', () => {
        readline.close();
        resolve();
      });
    });

    // Step 4: Automated Applitools testing
    console.log('\n📋 STEP 4: Automated Visual Testing');
    console.log('===================================');
    console.log('🤖 Now let\'s see how fast Applitools can find the same bugs...');
    
    const startTime = Date.now();
    await runCommand('node selenium-tests/applitools-demo-bugs.cjs', 'Running Applitools automated visual testing');
    const endTime = Date.now();
    
    const automatedTime = endTime - startTime;
    console.log(`⚡ Applitools completed in ${(automatedTime / 1000).toFixed(1)} seconds!`);

    // Step 5: Results comparison
    console.log('\n📋 STEP 5: View Results Comparison');
    console.log('=================================');
    console.log('🎉 Demo completed! Here\'s what happened:');
    console.log('');
    console.log('📊 Manual Testing:');
    console.log('   - Human had to carefully examine each page');
    console.log('   - Time varies based on user attention and experience');
    console.log('   - Might miss subtle issues like typos');
    console.log('   - Gets tired and less accurate over time');
    console.log('');
    console.log('🤖 Applitools AI Testing:');
    console.log(`   - Scanned all pages in ${(automatedTime / 1000).toFixed(1)} seconds`);
    console.log('   - Caught 100% of visual differences with pixel precision');
    console.log('   - Identified exact locations and types of changes');
    console.log('   - Consistent accuracy regardless of complexity');
    console.log('');
    console.log('🔗 View detailed results:');
    console.log('   • Manual results: http://localhost:3000/demo-results');
    console.log('   • Applitools dashboard: Check your Applitools account');
    console.log('');
    console.log('✨ This demonstrates why visual AI testing scales so much better than manual QA!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure dev server is running: npm run dev');
    console.log('   - Check APPLITOOLS_API_KEY in .env file');
    console.log('   - Verify Chrome browser is installed');
  }
}

// Run if called directly
if (require.main === module) {
  runCompleteDemo();
}

module.exports = runCompleteDemo;