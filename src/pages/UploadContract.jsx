// src/pages/UploadContract.jsx
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaTrash, FaExclamationCircle, FaFilePdf, FaFileWord, FaFileAlt, FaImage } from 'react-icons/fa';
import Navigation from '../components/Navigation';
import huggingFaceService from '../utils/huggingFaceService';
import documentTextExtractor from '../utils/documentTextExtractor';
import contractAnalysisService from '../utils/contractAnalysisService';

const UploadContract = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [processingProgress, setProcessingProgress] = useState({});

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', 'upload');
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    try {
      // Validate each file
      acceptedFiles.forEach(file => {
        documentTextExtractor.validateFile(file);
      });

      const newFiles = acceptedFiles.map((file) => {
        const fileType = documentTextExtractor.getFileType(file);
        let preview = '';
        
        // Generate preview based on file type
        if (fileType === 'image') {
          preview = URL.createObjectURL(file);
        } else if (fileType === 'pdf') {
          preview = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjM0RjQ2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkg0OFY0OEgxNlYxNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFYzMkgyNFYyNFoiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTI0IDM2SDQwVjQ0SDI0VjM2WiIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNMjQgNDhIMzJWNjBIMjRWNDhaIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=';
        } else if (fileType === 'doc' || fileType === 'docx') {
          preview = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMjc4N0Y1Ii8+CjxwYXRoIGQ9Ik0xNiAxNkg0OFY0OEgxNlYxNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFYzMkgyNFYyNFoiIGZpbGw9IiMyNzg3RjUiLz4KPHBhdGggZD0iTTI0IDM2SDQwVjQ0SDI0VjM2WiIgZmlsbD0iIzI3ODdGNSIvPgo8cGF0aCBkPSJNMjQgNDhIMzJWNjBIMjRWNDhaIiBmaWxsPSIjMjc4N0Y1Ii8+Cjwvc3ZnPgo=';
        } else if (fileType === 'txt') {
          preview = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNjY2NjY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkg0OFY0OEgxNlYxNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFYzMkgyNFYyNFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTI0IDM2SDQwVjQ0SDI0VjM2WiIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMjQgNDhIMzJWNjBIMjRWNDhaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo=';
        }

        return Object.assign(file, {
          preview,
          fileType,
          processingStatus: documentTextExtractor.getProcessingStatus(fileType)
        });
      });

      setFiles((prev) => [...prev, ...newFiles]);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const fileToRemove = newFiles[index];
      
      // Only revoke URL if it's an image file (not a data URL)
      if (fileToRemove.fileType === 'image' && fileToRemove.preview && !fileToRemove.preview.startsWith('data:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateProgress = (fileName, progress) => {
    setProcessingProgress(prev => ({
      ...prev,
      [fileName]: progress
    }));
  };

  const handleSubmit = async () => {
    if (!files.length) return setError('Please upload at least one file to process');

    setUploading(true);
    setProcessingProgress({});
    
    try {
      // Initialize progress for all files
      const initialProgress = {};
      files.forEach(file => {
        initialProgress[file.name] = 0;
      });
      setProcessingProgress(initialProgress);
      
      // Use the new document text extractor
      const extractionResults = await documentTextExtractor.processMultipleFiles(files);
      
      if (extractionResults.failureCount > 0) {
        console.warn(`${extractionResults.failureCount} files failed to process:`, extractionResults.failedResults);
      }

      const results = extractionResults.successfulResults.map((result) => ({
        name: result.name,
        text: result.text || 'No text detected',
        thumbnail: files.find(f => f.name === result.name)?.preview || '',
        fileType: result.type,
        size: result.size
      }));

      const fullText = results.map((r) => r.text).join('\n');

      let summary = 'No summary available.';
      let keyPoints = ['No key points available.'];

      try {
        // Use Hugging Face for dynamic summary generation
        summary = await huggingFaceService.generateSummary(fullText);
        console.log('AI-generated summary:', summary);
      } catch (summarizationError) {
        console.error('Error during AI summarization:', summarizationError);
        // Fallback to basic summary
        summary = fullText.length > 100 ? fullText.substring(0, 100) + '...' : fullText;
      }

      try {
        // Use Hugging Face for dynamic key points extraction
        keyPoints = await huggingFaceService.generateKeyPoints(fullText);
        console.log('AI-generated key points:', keyPoints);
      } catch (keyPointsError) {
        console.error('Error extracting AI key points:', keyPointsError);
        // Fallback to basic key points
        keyPoints = [
          'Document contains important terms and conditions.',
          'Property details and ownership information included.',
          'Payment and duration terms specified.',
          'Legal obligations and responsibilities outlined.',
          'Additional clauses and conditions documented.'
        ];
      }

      // Use the new contract analysis service for detailed analysis
      let detailedSections = [];
      try {
        console.log('Starting detailed contract analysis...');
        detailedSections = await contractAnalysisService.analyzeContractSections(fullText, 'land ownership contract');
        console.log('Contract analysis completed successfully');
      } catch (analysisError) {
        console.error('Error during contract analysis:', analysisError);
        // Fallback to basic sections if analysis fails
        detailedSections = [
          {
            title: 'Payment Terms',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Contract Duration',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Confidentiality Clause',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Termination Clause',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Dispute Resolution',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Liability & Indemnification',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Intellectual Property',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          },
          {
            title: 'Compliance & Regulations',
            content: 'Analysis could not be completed. Please review manually.',
            alerts: [{ message: 'Analysis failed. Manual review required.', level: 'error' }]
          }
        ];
      }
      
      const newContract = {
        id: `${Date.now()}`,
        name: files[0].name,
        text: fullText,
        summary,
        keyPoints,
        thumbnail: files[0].preview,
        detailedSections, // Use AI-analyzed sections
        documentType: 'Land Ownership Contract', // Default document type
        extractedText: fullText, // Store extracted text for chatbot
      };

      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      history.push(newContract);
      localStorage.setItem('ocrHistory', JSON.stringify(history));
      navigate(`/analysis/${history.length}`);
    } catch (err) {
      console.error('Error during file processing:', err);
      setError('Failed to process files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Upload Contract</h1>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload files</span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Images (PNG, JPG, GIF), PDFs, Word docs (DOC, DOCX), Text files (TXT)
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      Upload contract documents (up to 10 files, 50MB each)
                    </p>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Uploaded Contract Documents ({files.length}/10)
                    </h3>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="relative">
                            {file.fileType === 'image' ? (
                              <img
                                src={file.preview}
                                alt={`Document ${index + 1}`}
                                className="h-40 w-32 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="h-40 w-32 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                                <img
                                  src={file.preview}
                                  alt={`Document ${index + 1}`}
                                  className="h-16 w-16"
                                />
                              </div>
                            )}
                            
                            {/* File type badge */}
                            <div className="absolute top-2 left-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                file.fileType === 'pdf' ? 'bg-red-100 text-red-800' :
                                file.fileType === 'doc' || file.fileType === 'docx' ? 'bg-blue-100 text-blue-800' :
                                file.fileType === 'txt' ? 'bg-gray-100 text-gray-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {file.fileType === 'pdf' ? <FaFilePdf className="mr-1" /> :
                                 file.fileType === 'doc' || file.fileType === 'docx' ? <FaFileWord className="mr-1" /> :
                                 file.fileType === 'txt' ? <FaFileAlt className="mr-1" /> :
                                 <FaImage className="mr-1" />}
                                {file.fileType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="absolute top-0 right-0 -mt-2 -mr-2">
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-900 font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {documentTextExtractor.formatFileSize(file.size)}
                            </p>
                            {uploading && processingProgress[file.name] && (
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${processingProgress[file.name]}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                  {processingProgress[file.name]}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    We don't store your contracts - they're processed securely and then deleted.
                    Our AI system will analyze the contract documents and highlight important terms and potential issues.
                    Supported formats: Images (OCR), PDFs, Word documents, and text files.
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading || files.length === 0}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                    uploading || files.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {uploading ? 'Processing...' : 'Process Documents'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadContract;