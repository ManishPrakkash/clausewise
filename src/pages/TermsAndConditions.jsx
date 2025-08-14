import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaShieldAlt, FaFileContract, FaUserShield, FaLock } from 'react-icons/fa';
import { acceptTerms } from '../utils/termsManager';

const TermsAndConditions = ({ onAccept, onDecline }) => {
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);

  const handleAccept = () => {
    if (hasRead) {
      acceptTerms();
      onAccept && onAccept();
      // Set the terms as accepted in localStorage so user doesn't need to check again
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      navigate('/login');
    }
  };

  const handleDecline = () => {
    onDecline && onDecline();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center">
        <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center">
          <FaFileContract className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          ClauseWise - Legal Document Analysis Platform
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Effective Date: {new Date().toLocaleDateString('en-IN')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="glass py-8 px-6 rounded-2xl max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-primary-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using ClauseWise ("the Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions ("Terms"). This Platform is designed for legal document analysis and land verification services in compliance with Indian legal framework.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUserShield className="mr-2 text-primary-600" />
                2. Service Description
              </h2>
              <p className="text-gray-700 mb-4">
                ClauseWise provides AI-powered legal document analysis, contract review, and land verification services. Our services include but are not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Contract analysis and clause identification</li>
                <li>Legal document text extraction and processing</li>
                <li>Land verification and property document analysis</li>
                <li>Risk assessment and compliance checking</li>
                <li>Document comparison and similarity analysis</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaLock className="mr-2 text-primary-600" />
                3. Data Privacy and Security
              </h2>
              <p className="text-gray-700 mb-4">
                In accordance with the Information Technology Act, 2000 and the Personal Data Protection Bill:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All uploaded documents are processed securely using encryption</li>
                <li>Personal data is collected, processed, and stored in compliance with Indian data protection laws</li>
                <li>Documents are retained only for the duration necessary to provide services</li>
                <li>Users have the right to access, correct, or delete their personal data</li>
                <li>We implement appropriate technical and organizational measures to protect data</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Ensure you have the legal right to upload and analyze documents</li>
                <li>Not upload malicious content or violate intellectual property rights</li>
                <li>Use the platform for lawful purposes only</li>
                <li>Maintain the confidentiality of your account credentials</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Legal Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> ClauseWise provides AI-assisted analysis tools and should not be considered as legal advice. Users should:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Consult qualified legal professionals for legal advice</li>
                <li>Verify all analysis results independently</li>
                <li>Not rely solely on automated analysis for critical legal decisions</li>
                <li>Understand that AI analysis may have limitations and inaccuracies</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                ClauseWise shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our services. Our total liability shall not exceed the amount paid by you for the services in the preceding 12 months.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our{' '}
                <a href="/privacy" className="text-primary-600 hover:underline font-medium">
                  Privacy Policy
                </a>{' '}
                which explains how we collect, use, and protect your personal information in compliance with Indian data protection laws.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions regarding these Terms, please contact us at:<br />
                Email: legal@clausewise.com<br />
                Address: [Your Company Address], India
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> By accepting these terms, you acknowledge that you have read and understood all provisions, including the legal disclaimers and limitations of liability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="read-terms"
                name="read-terms"
                type="checkbox"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="read-terms" className="text-gray-700">
                I have read and understood the Terms and Conditions
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={handleAccept}
            disabled={!hasRead}
            className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheck className="mr-2" />
            Accept Terms & Continue
          </button>
          
          <button
            type="button"
            onClick={handleDecline}
            className="btn-secondary flex items-center justify-center"
          >
            <FaTimes className="mr-2" />
            Decline & Exit
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By accepting these terms, you agree to be bound by all provisions and acknowledge that you have the authority to enter into this agreement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
