import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaUserSecret, FaDatabase, FaEye, FaLock, FaTrash } from 'react-icons/fa';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/terms');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center">
        <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center">
          <FaUserSecret className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          ClauseWise - Data Protection and Privacy
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
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information to provide and improve our legal document analysis services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, contact details</li>
                <li><strong>Document Data:</strong> Legal documents, contracts, property papers uploaded for analysis</li>
                <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaDatabase className="mr-2 text-primary-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">We use your information for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Providing document analysis and land verification services</li>
                <li>Processing and analyzing legal documents using AI technology</li>
                <li>Improving our services and user experience</li>
                <li>Communicating with you about our services</li>
                <li>Ensuring platform security and preventing fraud</li>
                <li>Complying with legal obligations under Indian law</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaLock className="mr-2 text-primary-600" />
                3. Data Security and Protection
              </h2>
              <p className="text-gray-700 mb-4">
                In compliance with the Information Technology Act, 2000 and Personal Data Protection Bill:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All data is encrypted using industry-standard encryption protocols</li>
                <li>Documents are processed in secure, isolated environments</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>Regular security audits and vulnerability assessments are conducted</li>
                <li>Data is stored on secure servers with backup and disaster recovery</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaEye className="mr-2 text-primary-600" />
                4. Your Rights and Choices
              </h2>
              <p className="text-gray-700 mb-4">Under Indian data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaTrash className="mr-2 text-primary-600" />
                5. Data Retention and Deletion
              </h2>
              <p className="text-gray-700 mb-4">
                We retain your data only for as long as necessary:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account data: Retained while your account is active</li>
                <li>Document data: Retained for 7 years as per legal requirements</li>
                <li>Usage data: Retained for 2 years for service improvement</li>
                <li>Upon account deletion, data is permanently removed within 30 days</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Cloud storage and processing (AWS, Google Cloud)</li>
                <li>AI and machine learning services</li>
                <li>Payment processing</li>
                <li>Analytics and monitoring</li>
              </ul>
              <p className="text-gray-700 mb-4">
                All third-party services are bound by strict data protection agreements.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Legal Basis for Processing</h2>
              <p className="text-gray-700 mb-4">
                We process your data based on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Consent:</strong> You have explicitly agreed to our terms</li>
                <li><strong>Contract:</strong> Processing is necessary to provide our services</li>
                <li><strong>Legal Obligation:</strong> Required by Indian laws and regulations</li>
                <li><strong>Legitimate Interest:</strong> Improving our services and security</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For privacy-related inquiries or to exercise your rights:<br />
                Email: privacy@clausewise.com<br />
                Data Protection Officer: dpo@clausewise.com<br />
                Address: [Your Company Address], India
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> This Privacy Policy is part of our Terms and Conditions. By using our services, you consent to the collection and use of your information as described in this policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary flex items-center justify-center"
          >
            Back to Terms & Conditions
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This Privacy Policy is compliant with Indian data protection laws and will be updated as regulations evolve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
