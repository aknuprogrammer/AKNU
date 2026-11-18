import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Payment Failure Page for Easebuzz Payment Gateway
 * This page is displayed when payment fails or is cancelled
 */
const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txnid = searchParams.get("txnid");
  const error = searchParams.get("error") || "Payment was not completed";

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '30px', 
      background: 'white', 
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', color: '#ef4444', marginBottom: '20px' }}>✗</div>
        <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Payment Failed</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Your payment could not be processed. Please try again.
        </p>
        
        {txnid && (
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
            Transaction ID: {txnid}
          </p>
        )}
        
        {error && (
          <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '20px' }}>
            Error: {error}
          </p>
        )}
        
        <button
          onClick={() => navigate('/examination-application')}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;

