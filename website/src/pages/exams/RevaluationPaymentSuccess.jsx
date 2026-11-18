import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Revaluation Payment Success Page for Easebuzz Payment Gateway
 * This page is displayed after a successful revaluation payment
 */
const RevaluationPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const txnid = searchParams.get("txnid");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txnid) {
        setError("Transaction ID not found");
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4567';
        const baseUrl = apiUrl.replace(/\/+$/, ''); // Remove trailing slashes
        
        // Step 1: Try to force update status from Easebuzz
        try {
          const updateResponse = await fetch(`${baseUrl}/api/revaluation-application/update-payment-status/${txnid}`, {
            method: 'POST'
          });
          
          if (!updateResponse.ok) {
            console.warn(`Update payment status endpoint returned ${updateResponse.status}. Continuing with status check...`);
          }
        } catch (updateErr) {
          console.warn("Update payment status endpoint failed, continuing with status check:", updateErr);
        }

        // Step 2: Get payment details
        const response = await fetch(`${baseUrl}/api/revaluation-application/payment-status/${txnid}`);
        
        if (!response.ok) {
          // If status endpoint also fails, try to get data from localStorage as fallback
          const storedData = localStorage.getItem(`payment_${txnid}`);
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              setData({
                transactionId: parsed.transactionId || txnid,
                amount: parsed.amount,
                status: 'SUCCESS',
                studentName: parsed.studentData?.name,
                registrationNumber: parsed.studentData?.registrationNumber,
                course: parsed.studentData?.course,
                semester: parsed.studentData?.semester,
                subjectCount: parsed.subjects?.count || 0,
              });
              localStorage.removeItem(`payment_${txnid}`);
              setLoading(false);
              return;
            } catch (parseErr) {
              console.error("Failed to parse stored payment data:", parseErr);
            }
          }
          
          throw new Error(`Payment status endpoint returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
          // Extract subjects from response if available
          if (result.data.subjects && Array.isArray(result.data.subjects)) {
            setSubjects(result.data.subjects);
          } else if (result.data.revaluation_subjects && Array.isArray(result.data.revaluation_subjects)) {
            setSubjects(result.data.revaluation_subjects);
          }
          localStorage.removeItem(`payment_${txnid}`);
        } else {
          setError(result.message || "Failed to verify transaction");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err.message || "Failed to verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [txnid]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading payment status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '50px auto', 
        padding: '30px', 
        background: 'white', 
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '80px', color: '#ef4444', marginBottom: '20px' }}>✗</div>
        <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Verification Error</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={() => navigate('/revaluation-application')}
          style={{
            padding: '12px 30px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Application
        </button>
      </div>
    );
  }

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
        <div style={{ fontSize: '80px', color: '#10b981', marginBottom: '20px' }}>✓</div>
        <h1 style={{ color: '#10b981', marginBottom: '10px' }}>Payment Successful!</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Your revaluation application payment has been processed successfully.
        </p>
        
        {data && (
          <div style={{ 
            background: '#f9fafb', 
            padding: '20px', 
            borderRadius: '8px', 
            marginTop: '20px',
            textAlign: 'left' 
          }}>
            <h3 style={{ marginBottom: '15px' }}>Payment Details:</h3>
            <p><strong>Transaction ID:</strong> {data.transactionId || txnid}</p>
            <p><strong>Amount:</strong> ₹{data.amount ? parseFloat(data.amount).toLocaleString('en-IN') : 'N/A'}</p>
            <p><strong>Status:</strong> {data.status || 'SUCCESS'}</p>
            <p><strong>Student:</strong> {data.studentName || 'N/A'}</p>
            <p><strong>Registration:</strong> {data.registrationNumber || 'N/A'}</p>
            {data.course && <p><strong>Course:</strong> {data.course}</p>}
            {data.semester && <p><strong>Semester:</strong> {data.semester}</p>}
            {subjects.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong>Subjects for Revaluation:</strong>
                <ul style={{ marginTop: '8px', marginLeft: '20px', paddingLeft: '0' }}>
                  {subjects.map((subject, index) => (
                    <li key={index} style={{ marginBottom: '5px', listStyle: 'disc' }}>
                      {subject.subjectName || subject.name || `Subject ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!subjects.length && data.subjectCount && (
              <p><strong>Subjects for Revaluation:</strong> {data.subjectCount} subject(s)</p>
            )}
          </div>
        )}
        
        <button
          onClick={() => navigate('/revaluation-application')}
          style={{
            marginTop: '30px',
            padding: '12px 30px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RevaluationPaymentSuccess;

