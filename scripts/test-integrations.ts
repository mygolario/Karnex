import { zibalRequest } from '@/lib/zibal';
import { sendEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

// Manual ENV loading
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const envConfig = fs.readFileSync(filePath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        let value = values.join('=').trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv(envPath);
loadEnv(envLocalPath);

const TEST_EMAIL = "support@karnex.ir"; // Using the support email mentioned in contact page as destination for now, or user can change it.

async function testZibal() {
  console.log("--- Testing Zibal Payment Request ---");
  const merchant = process.env.ZIBAL_MERCHANT;
  console.log(`Using Merchant ID: ${merchant ? merchant.substring(0, 4) + '...' : 'undefined'}`);
  
  const amount = 10000; // 1000 Tomans in Rials maybe? No, zibalRequest takes Rials. 1000 Rials is min.
  // Zibal min is 1000 Rials usually.
  const description = "Test Transaction - Karnex Agent";
  const callbackUrl = "http://localhost:3000/test/verify";
  
  try {
    const paymentUrl = await zibalRequest(amount, description, callbackUrl);
  
    if (paymentUrl) {
        console.log("✅ Zibal Request Successful!");
        console.log("Gateway URL:", paymentUrl);
    } else {
        console.error("❌ Zibal Request Failed (returned null).");
    }
  } catch (err) {
      console.error("❌ Zibal Request Threw Error:", err);
  }
}

async function testBrevo() {
  console.log("\n--- Testing Brevo Email Sending ---");
  const success = await sendEmail({
    to: TEST_EMAIL,
    subject: "Karnex Integration Test",
    htmlContent: "<h1>Integration Works!</h1><p>This is a test email from the Karnex agent verification process.</p>",
    templateName: 'verification', 
    name: "Karnex Admin"
  });

  if (success) {
    console.log(`✅ Brevo Email Sent Successfully to ${TEST_EMAIL}`);
  } else {
    console.error("❌ Brevo Email Failed.");
  }
}

async function runRefTests() {
  await testZibal();
  await testBrevo();
}

runRefTests();
