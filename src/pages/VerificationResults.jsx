import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDownload, FaArrowLeft } from 'react-icons/fa';

const VerificationResults = ({ setIsAuthenticated }) => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load verification result from localStorage
    const results = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    const foundResult = results.find(r => r.id === id);
    setResult(foundResult);
    setLoading(false);
  }, [id]);

  const downloadReport = () => {
    if (!result) return;

    const reportData = {
      documentName: result.documentName,
      verificationDate: new Date().toLocaleDateString(),
      status: result.status,
      ...result
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `land_verification_report_${result.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <Navigation setIsAuthenticated={setIsAuthenticated} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading verification results...</p>
          </div>
        </div>
      </>
    );
  }

  if (!result) {
    return (
      <>
        <Navigation setIsAuthenticated={setIsAuthenticated} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaTimesCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Result Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The requested verification result could not be found.
            </p>
            <Link
              to="/land-verification"
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              Start New Verification
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link
              to="/history"
              className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verification Results
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Document: {result.documentName}
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verification Status
              </h2>
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                <FaDownload />
                Download Report
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  result.isLegal ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {result.isLegal ? (
                    <FaCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
                  ) : (
                    <FaTimesCircle className="text-red-600 dark:text-red-400 text-2xl" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Document Legality</h3>
                <p className={`text-sm ${result.isLegal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.isLegal ? 'Legal & Valid' : 'Issues Found'}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <FaCheckCircle className="text-blue-600 dark:text-blue-400 text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ownership Type</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {result.ownershipType}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <span className="text-gray-600 dark:text-gray-300 text-xl font-bold">
                    {result.confidence}%
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Confidence Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verification Accuracy
                </p>
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Document Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type</label>
                  <p className="text-gray-900 dark:text-white">{result.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Survey Number</label>
                  <p className="text-gray-900 dark:text-white">{result.surveyNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Area</label>
                  <p className="text-gray-900 dark:text-white">{result.area}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</label>
                  <p className="text-gray-900 dark:text-white">{result.owner}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">District</label>
                  <p className="text-gray-900 dark:text-white">{result.district}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Taluk</label>
                  <p className="text-gray-900 dark:text-white">{result.taluk}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Village</label>
                  <p className="text-gray-900 dark:text-white">{result.village}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Date</label>
                  <p className="text-gray-900 dark:text-white">{result.uploadDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Verification Checks
            </h2>
            
            <div className="space-y-3">
              {Object.entries(result.verificationDetails).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    {value === true || value === 'Registered' || value === 'Current' ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : value === false ? (
                      <FaTimesCircle className="text-red-500" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-500" />
                    )}
                    <span className={`text-sm ${
                      value === true || value === 'Registered' || value === 'Current' 
                        ? 'text-green-600 dark:text-green-400' 
                        : value === false 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {typeof value === 'boolean' ? (value ? 'Verified' : 'Failed') : value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discrepancies (if any) */}
          {result.discrepancies && result.discrepancies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500" />
                Discrepancies Found
              </h2>
              
              <div className="space-y-3">
                {result.discrepancies.map((discrepancy, index) => (
                  <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">{discrepancy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default VerificationResults;
