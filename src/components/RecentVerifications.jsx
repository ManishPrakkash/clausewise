import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaFilePdf, FaFileAlt, FaEye } from 'react-icons/fa';
import reportGenerator from '../utils/reportGenerator';

const RecentVerifications = () => {
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    // Load recent verification results from localStorage
    const results = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    setRecentResults(results.slice(0, 5)); // Show only last 5 results
  }, []);

  const downloadReport = (result, format = 'pdf') => {
    if (format === 'pdf') {
      const filename = `land_verification_report_${result.documentName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      reportGenerator.downloadReport(result, filename);
    } else {
      // Download JSON report
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
    }
  };

  if (recentResults.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <FaFileAlt className="mx-auto h-12 w-12" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No verification results yet. Upload documents to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentResults.map((result) => (
        <div
          key={result.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {result.documentName}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                result.isLegal 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {result.isLegal ? 'Verified' : 'Issues'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{result.documentType}</span>
              <span>{result.surveyNumber}</span>
              <span>{result.uploadDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Link
              to={`/verification-results/${result.id}`}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              title="View Details"
            >
              <FaEye />
            </Link>
            
            <div className="relative group">
              <button
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="Download Reports"
              >
                <FaDownload />
              </button>
              
              {/* Download dropdown */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => downloadReport(result, 'pdf')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaFilePdf className="text-red-500" />
                    PDF Report
                  </button>
                  <button
                    onClick={() => downloadReport(result, 'json')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaFileAlt className="text-blue-500" />
                    JSON Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentVerifications;
