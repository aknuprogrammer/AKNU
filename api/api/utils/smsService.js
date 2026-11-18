/**
 * Mock SMS Service
 * Since we don't have a provider, this logs to console.
 */

/**
 * Sends an SMS to a single recipient
 * @param {string} phone - Phone number
 * @param {string} message - Text message
 * @returns {Promise<{success: boolean, message: string}>}
 */
exports.sendSMS = async (phone, message) => {
  if (!phone) return { success: false, message: "No phone number" };

  // Simulation Mode
  console.log(`\n=== [SIMULATION] SMS OUT ===`);
  console.log(`To: ${phone}`);
  console.log(`Message: ${message}`);
  console.log(`============================\n`);
  
  return { success: true, message: "Simulated Sent" };
};

/**
 * Sends a batch of SMS messages
 * @param {Array<{phone: string, name: string}>} recipients 
 * @param {string} message 
 */
exports.sendBatch = async (recipients, message) => {
  console.log(`[SMS Service] Starting batch of ${recipients.length} SMS...`);
  let sent = 0;
  
  for (const r of recipients) {
    if(!r.phone) continue;
    await exports.sendSMS(r.phone, message);
    sent++;
  }
  
  return sent;
};
