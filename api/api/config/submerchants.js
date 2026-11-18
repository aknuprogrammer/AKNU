// Submerchant configuration for Easebuzz payment gateway
// Examination fees use the Examination submerchant

module.exports = {
  exam: {
    // Maps to "Examination" submerchant (for Exam Fee payments)
    id: process.env.SUBMERCHANT_ID_EXAMINATION || process.env.EASEBUZZ_SUBMERCHANT_ID_EXAM || null,
    key: process.env.EASEBUZZ_KEY_EXAMINATION || process.env.EASEBUZZ_MERCHANT_KEY || null,
    salt: process.env.EASEBUZZ_SALT_EXAMINATION || process.env.EASEBUZZ_SALT_KEY || null,
    bank_account: process.env.BANK_ACCOUNT_EXAMINATION || 'Examination Bank Account - To be updated',
    bank_name: process.env.BANK_NAME_EXAMINATION || 'To be updated',
    account_number: process.env.ACCOUNT_NUMBER_EXAMINATION || '',
    ifsc_code: process.env.IFSC_CODE_EXAMINATION || ''
  }
};

