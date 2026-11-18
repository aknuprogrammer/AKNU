// src/components/Unauthorized.js
const Unauthorized = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-3xl font-semibold text-[#525b88] mb-2">Access Restricted</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        
      </div>
    </div>
  );
};

export default Unauthorized;