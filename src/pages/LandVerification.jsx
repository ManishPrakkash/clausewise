import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FaUpload, FaSpinner, FaFileAlt, FaTimes, FaDownload, FaHistory } from 'react-icons/fa';
import documentExtractor from '../utils/documentExtractor';
import RecentVerifications from '../components/RecentVerifications';

const LandVerification = ({ setIsAuthenticated }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      setError('Some files were rejected. Please ensure all files are images or PDFs under 10MB.');
    } else {
      setError('');
    }

    setFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, 10));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const processLandDocuments = async () => {
    if (files.length === 0) {
      setError('Please upload at least one land document.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Process each document using OCR and data extraction
          const verificationResult = await documentExtractor.processDocument(file);
          results.push(verificationResult);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          // Create fallback result for failed documents
          results.push({
            id: Date.now().toString() + i,
            documentName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            status: 'Processing Failed',
            isLegal: false,
            ownershipType: 'Unknown',
            documentType: 'Unknown',
            surveyNumber: 'Unknown',
            district: 'Unknown',
            taluk: 'Unknown',
            village: 'Unknown',
            area: 'Unknown',
            owner: 'Unknown',
            classification: 'Unknown',
            discrepancies: ['Failed to extract document information'],
            confidence: 0,
            verificationDetails: {
              registrationStatus: 'Failed',
              portalMatch: false,
              ownershipVerified: false,
              boundariesConfirmed: false,
              taxStatus: 'Unknown'
            }
          });
        }
      }

      // Store all results in localStorage
      const existingResults = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
      results.forEach(result => {
        existingResults.unshift(result);
      });
      localStorage.setItem('landVerificationResults', JSON.stringify(existingResults));

      // Navigate to results page for the first document
      navigate(`/verification-results/${results[0].id}`);

    } catch (err) {
      console.error('Error processing land documents:', err);
      setError('Error processing documents. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      <div className="min-h-screen py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              Land Document Verification
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your Tamil Nadu land documents for automated verification against government records
            </p>
          </div>

          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Land Documents
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            )}

            {/* File Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop your land documents here
              </div>
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                or drag and drop
              </div>

              <label className="cursor-pointer">
                <span className="btn-primary px-6 py-3 inline-block">
                  Choose Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={isProcessing}
                />
              </label>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                PDF, PNG, JPG up to 10 documents, 10MB each
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Supported documents: Patta, Chitta, A-Register Extract, FMB, Title Deeds
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Uploaded Documents ({files.length}/10)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <FaFileAlt className="text-primary-500 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-3 text-red-400 hover:text-red-600 flex-shrink-0"
                        disabled={isProcessing}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={processLandDocuments}
                disabled={files.length === 0 || isProcessing}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Verify Documents'
                )}
              </button>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-blue-50/70 dark:bg-blue-900/40 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Verification Process:</strong> Your documents will be automatically processed and verified against Tamil Nadu Land Records e-Service Portal. We check document authenticity, ownership status, and cross-reference with government databases.
              </p>
            </div>
          </div>

          {/* Recent Verification Results */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Verifications
              </h2>
              <Link
                to="/history"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <FaHistory />
                View All
              </Link>
            </div>
            
            <RecentVerifications />
          </div>
        </div>
      </div>
    </>
  );
};

export default LandVerification;
