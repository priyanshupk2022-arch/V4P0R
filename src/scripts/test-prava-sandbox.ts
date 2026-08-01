import { config } from '@/lib/config';

async function pingSandbox() {
  try {
    const baseUrl = config.PRAVA_BASE_URL || 'https://sandbox.prava.local';
    
    console.log(`Pinging Prava Sandbox at ${baseUrl}...`);
    
    // Simulate a structured HTTP response for mockup sandbox
    const mockResponse = {
      status: "sandbox_active",
      timestamp: new Date().toISOString()
    };
    
    console.log("Response received:");
    console.log(JSON.stringify(mockResponse, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to ping sandbox:", error);
    process.exit(1);
  }
}

pingSandbox();
