const crypto = require('crypto');
const https = require('https');
const submerchants = require('../config/submerchants');

class EasebuzzService {
  constructor() {
    this.key = process.env.EASEBUZZ_MERCHANT_KEY || null;
    this.salt = process.env.EASEBUZZ_SALT_KEY || null;
    // API (dashboard) base is for server-to-server REST calls
    this.dashboardBaseUrl = process.env.EASEBUZZ_DASHBOARD_BASE_URL || 'https://testdashboard.easebuzz.in';
    // Pay base is used only to build the final customer payment URL
    this.payBaseUrl = process.env.EASEBUZZ_PAY_BASE_URL || 'https://testpay.easebuzz.in';
  }

  // Generate hash for Easebuzz API (payment initiation)
  generateHash(data, overrideSalt) {
    // Easebuzz hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    // Note: phone, surl, and furl are NOT included in hash calculation for initiate payment
    // UDF8, UDF9, UDF10 should always be empty
    
    // Ensure all values are strings and trimmed (as per Easebuzz requirement)
    const key = String(data.key || '').trim();
    const txnid = String(data.txnid || '').trim();
    const amount = String(data.amount || '').trim();
    const productinfo = String(data.productinfo || '').trim();
    const firstname = String(data.firstname || '').trim();
    const email = String(data.email || '').trim();
    
    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    // Note: For hash calculation, include empty strings for udf5-udf7 even if we don't send them in request
    const hashString = [
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      data.udf1 || '',
      data.udf2 || '',
      data.udf3 || '',
      data.udf4 || '',
      '', // udf5 - always empty in hash (JSON data not sent to Easebuzz)
      '', // udf6 - always empty in hash
      '', // udf7 - always empty in hash
      '', '', '', // udf8, udf9, udf10 (must be empty)
      overrideSalt || this.salt
    ].join('|');
    
    console.log('Hash string (exact Easebuzz format):', hashString);
    console.log('Salt:', overrideSalt || this.salt);
    
    const hash = crypto.createHash('sha512')
      .update(hashString)
      .digest('hex');
    
    console.log('Generated hash:', hash);
    return hash;
  }

  // Generate transaction ID
  generateTransactionId() {
    // Easebuzz txnid requirements:
    // - Allowed characters: Letters, numbers, underscore, pipe, hyphen, forward slash
    // - Match pattern: ^[a-zA-Z0-9_\|\-\/]{1,40}$
    // - Must be unique for each transaction
    // - Maximum 40 characters
    
    // Generate a completely unique ID using high precision timestamp
    const now = new Date();
    const timestamp = now.getTime(); // Milliseconds since epoch
    const microseconds = now.getMilliseconds(); // Microseconds for extra precision
    const random1 = Math.random().toString(36).substr(2, 6);
    const random2 = Math.random().toString(36).substr(2, 6);
    const random3 = Math.random().toString(36).substr(2, 6);
    const processId = process.pid || Math.floor(Math.random() * 10000);
    
    // Create a unique ID by combining all elements
    const uniqueId = `${timestamp}${microseconds}${random1}${random2}${random3}${processId}`;
    
    // Take first 40 characters and ensure it starts with EXM_ (for examination)
    const txnid = `EXM_${uniqueId}`.substr(0, 40);
    
    console.log('Generated unique transaction ID:', txnid);
    return txnid;
  }

  // Prepare payment data for initiation
  preparePaymentData(paymentDetails) {
    const txnid = paymentDetails.txnid || this.generateTransactionId();
    
    // Default to parent merchant key/salt
    let useKey = this.key;
    let useSalt = this.salt;

    // If feeType is provided and mapped, override with submerchant's key/salt
    if (paymentDetails.feeType && submerchants[paymentDetails.feeType]) {
      useKey = submerchants[paymentDetails.feeType].key || this.key;
      useSalt = submerchants[paymentDetails.feeType].salt || this.salt;
    }

    const data = {
      key: useKey,
      txnid: txnid,
      amount: String(paymentDetails.amount).trim(),
      productinfo: String(paymentDetails.productinfo || 'Examination Fee').trim(),
      firstname: String(paymentDetails.firstname).trim(),
      email: String(paymentDetails.email).trim(),
      phone: String(paymentDetails.phone).trim(),
      // Use provided URLs or fallback to default
      // IMPORTANT: These URLs must exist in your frontend router
      // Use callback endpoint that updates status before redirecting
      surl: paymentDetails.surl || `${process.env.BACKEND_URL || 'http://localhost:4567'}/api/examination-application/payment-callback`,
      furl: paymentDetails.furl || `${process.env.BACKEND_URL || 'http://localhost:4567'}/api/examination-application/payment-callback`,
      hash: ''
    };

    // Helper function to check if value looks like JSON
    const isJsonLike = (value) => {
      if (!value) return false;
      const str = String(value).trim();
      return (str.startsWith("{") || str.startsWith("[")) && str.length > 50;
    };

    // Add UDF fields if provided (but don't send JSON in udf5-udf7 as Easebuzz uses them for sub-merchant)
    if (paymentDetails.udf1) data.udf1 = String(paymentDetails.udf1).trim();
    if (paymentDetails.udf2) data.udf2 = String(paymentDetails.udf2).trim();
    if (paymentDetails.udf3) data.udf3 = String(paymentDetails.udf3).trim();
    if (paymentDetails.udf4) data.udf4 = String(paymentDetails.udf4).trim();
    
    // Don't send udf5-udf7 if they contain JSON (Easebuzz uses these for sub-merchant ID)
    // Store JSON data separately for database, but don't include in request
    if (paymentDetails.udf5 && !isJsonLike(paymentDetails.udf5)) {
      data.udf5 = String(paymentDetails.udf5).trim();
    }
    if (paymentDetails.udf6 && !isJsonLike(paymentDetails.udf6)) {
      data.udf6 = String(paymentDetails.udf6).trim();
    }
    if (paymentDetails.udf7 && !isJsonLike(paymentDetails.udf7)) {
      data.udf7 = String(paymentDetails.udf7).trim();
    }
    
    // Store JSON data separately (for database, not sent to Easebuzz)
    data._jsonData = {};
    if (paymentDetails.udf5 && isJsonLike(paymentDetails.udf5)) {
      data._jsonData.udf5 = paymentDetails.udf5;
    }
    if (paymentDetails.udf6 && isJsonLike(paymentDetails.udf6)) {
      data._jsonData.udf6 = paymentDetails.udf6;
    }
    if (paymentDetails.udf7 && isJsonLike(paymentDetails.udf7)) {
      data._jsonData.udf7 = paymentDetails.udf7;
    }

    // Optional sub-merchant attribution (does not affect initiate hash sequence)
    // Set sub_merchant_id either from explicit param or mapping by feeType
    if (paymentDetails.sub_merchant_id) {
      data.sub_merchant_id = paymentDetails.sub_merchant_id;
    } else if (paymentDetails.feeType && submerchants[paymentDetails.feeType] && submerchants[paymentDetails.feeType].id) {
      // Only set if a real id is configured in env
      data.sub_merchant_id = submerchants[paymentDetails.feeType].id;
    }

    // Generate hash
    data.hash = this.generateHash(data, useSalt);
    
    return data;
  }

  // Initiate payment with Easebuzz API using https module
  async initiatePayment(paymentDetails, retryCount = 0) {
    return new Promise((resolve, reject) => {
      try {
        // Add a small delay to ensure unique timestamps on retry
        if (retryCount > 0) {
          setTimeout(() => {
            this._makePaymentRequest(paymentDetails, retryCount, resolve, reject);
          }, 2000);
        } else {
          this._makePaymentRequest(paymentDetails, retryCount, resolve, reject);
        }
      } catch (error) {
        reject({
          success: false,
          error: error.message
        });
      }
    });
  }

  _makePaymentRequest(paymentDetails, retryCount, resolve, reject) {
    try {
      const data = this.preparePaymentData(paymentDetails);
      
      console.log(`Attempt ${retryCount + 1}: Sending data to Easebuzz:`, {
        txnid: data.txnid,
        amount: data.amount,
        hasSubMerchant: !!data.sub_merchant_id
      });

      // Easebuzz expects x-www-form-urlencoded. Only include allowed fields.
      // Exclude _jsonData (internal field) and don't send udf5-udf7 if they contain JSON
      const allowedFields = ['key','txnid','amount','productinfo','firstname','email','phone','surl','furl','hash','sub_merchant_id','udf1','udf2','udf3','udf4','udf5','udf6','udf7'];
      const params = new URLSearchParams();
      for (const k of allowedFields) {
        // Skip _jsonData (internal field)
        if (k === '_jsonData') continue;
        // Only include if value exists and is not empty
        if (data[k] !== undefined && data[k] !== null && data[k] !== '') {
          params.append(k, String(data[k]));
        }
      }

      const formDataString = params.toString();
      const url = new URL(`${this.payBaseUrl}/payment/initiateLink`);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formDataString)
        }
      };

      const req = https.request(options, (response) => {
        let responseData = '';

        response.on('data', (chunk) => {
          responseData += chunk;
        });

        response.on('end', () => {
          try {
            const parsedResponse = JSON.parse(responseData);
            console.log('Easebuzz response:', parsedResponse);

            // Handle known errors and retry scenarios
            if (parsedResponse && parsedResponse.status === 0 && parsedResponse.error_desc) {
              // If sub_merchant_id is invalid, retry once without it
              if (parsedResponse.error_desc.includes('Invalid value for sub_merchant_id') &&
                  data.sub_merchant_id && retryCount < 1) {
                console.log('Invalid sub_merchant_id detected, retrying without sub_merchant_id');
                const retryDetails = { ...paymentDetails, sub_merchant_id: undefined };
                this.initiatePayment(retryDetails, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
                return;
              }
              
              // Retry on duplicate transaction or hash mismatch
              if ((parsedResponse.error_desc.includes('Duplicate transaction id') ||
                   parsedResponse.error_desc.includes('Hash mismatch')) &&
                  retryCount < 3) {
                console.log('Transaction error detected, retrying...');
                setTimeout(() => {
                  this.initiatePayment(paymentDetails, retryCount + 1)
                    .then(resolve)
                    .catch(reject);
                }, 1000);
                return;
              }
            }

            // Validate success and construct payment URL from returned hash
            if (!parsedResponse || parsedResponse.status !== 1 || !parsedResponse.data) {
              const errorMsg = parsedResponse?.error_desc || parsedResponse?.data || 'Payment initiation rejected by gateway';
              reject({
                success: false,
                error: errorMsg
              });
              return;
            }

            const paymentUrl = `${this.payBaseUrl}/pay/${parsedResponse.data}`;
            
            console.log('Constructed payment URL:', paymentUrl);
            
            resolve({
              success: true,
              data: parsedResponse,
              paymentData: data,
              paymentUrl: paymentUrl,
              txnid: data.txnid
            });
          } catch (parseError) {
            console.error('Error parsing Easebuzz response:', parseError);
            reject({
              success: false,
              error: 'Invalid response from payment gateway',
              rawResponse: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Easebuzz payment initiation error:', error);
        reject({
          success: false,
          error: error.message
        });
      });

      req.write(formDataString);
      req.end();
    } catch (error) {
      console.error('Easebuzz payment initiation error:', error);
      reject({
        success: false,
        error: error.message
      });
    }
  }

  // Check transaction status using Transaction Status API v2.1
  async checkTransactionStatus(txnid) {
    return new Promise((resolve, reject) => {
      try {
        // Prepare data for transaction status check
        const data = {
          key: this.key,
          txnid: txnid,
          hash: ''
        };
        
        // Generate hash for status check (different format than initiate)
        data.hash = this.generateStatusHash(data);
        
        console.log('Checking transaction status for:', txnid);
        
        const statusParams = new URLSearchParams();
        statusParams.append('key', String(data.key));
        statusParams.append('txnid', String(data.txnid));
        statusParams.append('hash', String(data.hash));
        
        const paramsString = statusParams.toString();
        const url = new URL(`${this.dashboardBaseUrl}/transaction/v2.1/retrieve`);

        const options = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(paramsString)
          }
        };

        const req = https.request(options, (response) => {
          let responseData = '';

          response.on('data', (chunk) => {
            responseData += chunk;
          });

          response.on('end', () => {
            try {
              const parsedResponse = JSON.parse(responseData);
              console.log('Transaction status response:', parsedResponse);
              
              // Handle the actual API response format
              console.log('📦 Full Easebuzz API response:', JSON.stringify(parsedResponse, null, 2));
              
              if (parsedResponse.status === true && parsedResponse.msg && parsedResponse.msg.length > 0) {
                const transactionData = parsedResponse.msg[0];
                console.log('📊 Transaction data from Easebuzz:', JSON.stringify(transactionData, null, 2));
                console.log('🔍 Status field value:', transactionData.status);
                console.log('🔍 All status-related fields:', {
                  status: transactionData.status,
                  transaction_status: transactionData.transaction_status,
                  payment_status: transactionData.payment_status,
                  pg_type: transactionData.pg_type
                });
                
                resolve({
                  success: true,
                  data: {
                    status: 1, // API call successful
                    data: transactionData // First transaction record
                  }
                });
              } else {
                console.error('❌ Easebuzz API error or no data:', parsedResponse);
                resolve({
                  success: false,
                  error: parsedResponse.error_desc || parsedResponse.error || 'No transaction data found or API error',
                  response: parsedResponse
                });
              }
            } catch (parseError) {
              console.error('Error parsing transaction status response:', parseError);
              reject({
                success: false,
                error: 'Invalid response from payment gateway',
                rawResponse: responseData
              });
            }
          });
        });

        req.on('error', (error) => {
          console.error('Easebuzz transaction status error:', error);
          reject({
            success: false,
            error: error.message
          });
        });

        req.write(paramsString);
        req.end();
      } catch (error) {
        console.error('Easebuzz transaction status error:', error);
        reject({
          success: false,
          error: error.message
        });
      }
    });
  }

  // Generate hash for transaction status check
  generateStatusHash(data) {
    // For status check: key|txnid|salt
    const key = String(data.key || '').trim();
    const txnid = String(data.txnid || '').trim();
    
    const hashString = `${key}|${txnid}|${this.salt}`;
    
    console.log('Status hash string:', hashString);
    
    const hash = crypto.createHash('sha512')
      .update(hashString)
      .digest('hex');
    
    console.log('Generated status hash:', hash);
    return hash;
  }

  // Verify webhook hash for Transaction Webhook (S2S Integration)
  verifyWebhookHash(data, receivedHash) {
    try {
      // According to Easebuzz documentation, webhook hash verification
      // should exclude the 'hash' field itself from calculation
      const dataForHash = { ...data };
      delete dataForHash.hash; // Remove hash field from calculation
      
      // Create hash string from sorted parameters (excluding hash field)
      const sortedKeys = Object.keys(dataForHash).sort();
      const hashString = sortedKeys
        .map(key => `${key}=${dataForHash[key]}`)
        .join('&') + `&salt=${this.salt}`;
      
      console.log('Webhook hash string:', hashString);
      console.log('Received hash:', receivedHash);
      
      const calculatedHash = crypto.createHash('sha512')
        .update(hashString)
        .digest('hex');
      
      console.log('Calculated hash:', calculatedHash);
      
      const isValid = calculatedHash === receivedHash;
      console.log('Hash verification result:', isValid);
      
      return isValid;
    } catch (error) {
      console.error('Webhook hash verification error:', error);
      return false;
    }
  }

  // Process webhook data from Easebuzz
  processWebhookData(webhookData) {
    try {
      console.log('Processing webhook data:', webhookData);
      
      // Extract key fields from webhook
      const processedData = {
        txnid: webhookData.txnid,
        status: webhookData.status,
        amount: webhookData.amount,
        productinfo: webhookData.productinfo,
        firstname: webhookData.firstname,
        email: webhookData.email,
        phone: webhookData.phone,
        payment_mode: webhookData.payment_mode,
        payment_date: webhookData.addedon,
        transaction_id: webhookData.easepayid,
        hash: webhookData.hash,
        raw_data: webhookData
      };
      
      console.log('Processed webhook data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error processing webhook data:', error);
      throw error;
    }
  }
}

module.exports = new EasebuzzService();

