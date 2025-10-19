import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Worker register now redirects to main register page
// Users will select "Register as Worker" from the selection screen
const WorkerRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main register page
    // User can select worker registration from there
    navigate('/register', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to registration...</p>
      </div>
    </div>
  );
};

export default WorkerRegister;
