import { useNavigate } from 'react-router-dom';
import { FaFileContract, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const Landing = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/terms');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="mx-auto h-20 w-20 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center">
          <FaFileContract className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-gray-900">
          Welcome to ClauseWise
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          AI-Powered Legal Document Analysis Platform
        </p>
        <p className="mt-2 text-lg text-gray-500">
          Advanced contract analysis and land verification services
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="glass py-8 px-6 rounded-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <FaShieldAlt className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Legal Compliance Required
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6 text-lg">
              Before accessing our legal document analysis services, we require you to review and accept our Terms and Conditions and Privacy Policy. This ensures compliance with Indian legal requirements and protects both you and our platform.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Our platform handles sensitive legal documents and personal information. 
                    By proceeding, you acknowledge that you will review our legal terms and privacy policy.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="btn-primary flex items-center justify-center mx-auto text-lg px-8 py-3"
            >
              <FaArrowRight className="mr-2" />
              Review Terms & Continue
            </button>

            <p className="mt-4 text-sm text-gray-500">
              By clicking "Review Terms & Continue", you acknowledge that you will be presented with our Terms and Conditions and Privacy Policy for your review and acceptance.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-4 rounded-lg">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaFileContract className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Analysis</h3>
              <p className="text-sm text-gray-600">
                AI-powered contract and legal document analysis
              </p>
            </div>
            
            <div className="glass p-4 rounded-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaShieldAlt className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
              <p className="text-sm text-gray-600">
                Compliant with Indian legal framework
              </p>
            </div>
            
            <div className="glass p-4 rounded-lg">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaShieldAlt className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
              <p className="text-sm text-gray-600">
                Enterprise-grade security and privacy protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
