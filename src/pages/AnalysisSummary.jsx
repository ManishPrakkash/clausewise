// src/pages/AnalysisSummary.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaDownload, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import Navigation from '../components/Navigation';
import sampleImage from '../assets/sample.png'; // Import the sample image
import jsPDF from 'jspdf'; // Ensure this import is correct
import { generateDetailedSections, getAlertSummary } from '../utils/contractAlerts';
import DocumentChatbot from '../components/DocumentChatbot';

const AnalysisSummary = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem('lastVisitedPage', `analysis-summary/${id}`); // Store the current page in localStorage
      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      const contractDetails = history.find((_, index) => `${index + 1}` === id);

      if (contractDetails) {
        const totalAlerts = contractDetails.detailedSections?.reduce(
          (count, section) => count + section.alerts.length,
          0
        ) || 0;

        // Adjust confidence score dynamically based on alerts
        const confidenceScore = Math.max(100 - totalAlerts * 5, 0); // Deduct 5% per alert, minimum 0%

        // Generate random alerts based on document type and content
        const documentType = contractDetails.documentType || 'default';
        const documentText = contractDetails.extractedText || contractDetails.text || '';
        const detailedSections = generateDetailedSections(documentType, documentText);
        const alertSummary = getAlertSummary(detailedSections);
        
        setContract({
          id,
          title: contractDetails.name || 'Untitled Contract', // Fallback for missing title
          uploadDate: new Date().toLocaleDateString(),
          status: 'Completed',
          pages: history.length,
          thumbnail: contractDetails.thumbnail || sampleImage, // Fallback for missing thumbnail
          confidenceScore: Math.max(100 - alertSummary.totalAlerts * 5, 0), // Dynamically calculated confidence score
          alertsCount: alertSummary.totalAlerts, // Total alerts count
          summary: contractDetails.summary || 'No summary available.', // Use summarized text
          keyPoints: contractDetails.keyPoints || [], // Fallback for missing key points
          detailedSections: detailedSections, // Use generated sections with random alerts
          documentData: contractDetails, // Pass document data for chatbot
          documentText: contractDetails.extractedText || '', // Pass extracted text for chatbot
        });
      } else {
        setContract(null);
      }
    } catch (err) {
      console.error('Error fetching contract details:', err); // Debugging: Log the error
      setContract(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections({
      ...expandedSections,
      [index]: !expandedSections[index]
    });
  };

  const downloadPDF = () => {
    if (!contract) return;

    const doc = new jsPDF();
    let y = 10; // Start vertical position

    // Add title
    doc.setFontSize(18);
    doc.text('Contract Analysis Report', 10, y);
    y += 10; // Add spacing

    // Add contract details
    doc.setFontSize(12);
    doc.text(`Title: ${contract.title}`, 10, y);
    y += 10;
    doc.text(`Uploaded Date: ${contract.uploadDate}`, 10, y);
    y += 10;
    doc.text(`Status: ${contract.status}`, 10, y);
    y += 10;
    doc.text(`Confidence Score: ${contract.confidenceScore}%`, 10, y);
    y += 10;

    // Add summary
    doc.setFontSize(14);
    doc.text('Summary:', 10, y);
    y += 10;
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(contract.summary, 190); // Wrap text to fit within the page width
    summaryLines.forEach((line) => {
      doc.text(line, 10, y);
      y += 10; // Add spacing for each line
    });

    // Add key points
    if (contract.keyPoints?.length) {
      doc.setFontSize(14);
      doc.text('Key Points:', 10, y);
      y += 10;
      doc.setFontSize(12);
      contract.keyPoints.forEach((point) => {
        const keyPointLines = doc.splitTextToSize(`- ${point}`, 190);
        keyPointLines.forEach((line) => {
          doc.text(line, 10, y);
          y += 10;
        });
      });
    }

    // Add alerts
    if (contract.alertsCount > 0) {
      doc.setFontSize(14);
      doc.text('Alerts:', 10, y);
      y += 10;
      doc.setFontSize(12);
      contract.detailedSections.forEach((section) => {
        section.alerts.forEach((alert) => {
          const alertLines = doc.splitTextToSize(`- ${section.title}: ${alert.message}`, 190);
          alertLines.forEach((line) => {
            doc.text(line, 10, y);
            y += 10;
          });
        });
      });
    }

    // Add detailed sections
    doc.setFontSize(14);
    doc.text('Detailed Analysis:', 10, y);
    y += 10;
    contract.detailedSections.forEach((section) => {
      doc.setFontSize(12);
      const sectionTitleLines = doc.splitTextToSize(`- ${section.title}:`, 190);
      sectionTitleLines.forEach((line) => {
        doc.text(line, 10, y);
        y += 10;
      });
      const sectionContentLines = doc.splitTextToSize(section.content, 190);
      sectionContentLines.forEach((line) => {
        doc.text(line, 10, y);
        y += 10;
      });
    });

    // Save the PDF
    doc.save(`${contract.title}_Analysis_Report.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse flex flex-col">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900">Contract not found</h2>
              <p className="mt-2 text-gray-500">
                The contract you're looking for doesn't exist or has been deleted.
              </p>
              <div className="mt-4">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  &larr; Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-black-900">Contract Analysis</h1>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                &larr; Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Contract Header */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
              <div className="px-4 py-5 sm:px-6 flex items-center">
                <img
                  src={contract.thumbnail}
                  alt={contract.title}
                  className="h-24 w-20 object-cover rounded border border-gray-200 mr-4"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{contract.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Uploaded: {contract.uploadDate} • {contract.pages} Pages
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    } mr-2`}>
                      {contract.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {contract.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                  <button
                    type="button"
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="text-primary-600 hover:text-primary-500 flex items-center text-sm font-medium"
                  >
                    {expandedSummary ? (
                      <>
                        <FaChevronUp className="mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-1" /> Show More
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">{contract.summary}</p>
                {expandedSummary && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Key Points:</h4>
                    <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                      {contract.keyPoints?.length ? (
                        contract.keyPoints.map((point, index) => <li key={index}>{point}</li>)
                      ) : (
                        <li>No key points available.</li>
                      )}
                    </ul>
                  </div>
                )}
                {/* Download Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={downloadPDF}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    <FaDownload className="mr-2" /> Download Analysis as PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Alert Badges */}
            {contract.detailedSections.some(section => section.alerts.length > 0) && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">Contract Alerts</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        We've identified potential issues in this contract that you should review carefully.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {contract.detailedSections
                          .flatMap(section => 
                            section.alerts.map((alert, i) => (
                              <li key={`${section.title}-alert-${i}`}>
                                <strong>{section.title}:</strong> {alert.message}
                              </li>
                            ))
                          )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Sections */}
            <div className="mt-6 bg-white shadow sm:rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Detailed Analysis</h3>
              </div>
              
              {contract.detailedSections.map((section, index) => (
                <div key={index} className="px-4 py-5 sm:px-6">
                  <div 
                    className="flex justify-between items-center cursor-pointer" 
                    onClick={() => toggleSection(index)}
                  >
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      {section.title}
                      {section.alerts.length > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Alert
                        </span>
                      )}
                    </h4>
                    {expandedSections[index] ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSections[index] && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">{section.content}</p>
                      
                      {section.alerts.length > 0 && (
                        <div className="mt-3 rounded-md bg-red-50 p-3">
                          {section.alerts.map((alert, alertIndex) => (
                            <div key={alertIndex} className="flex">
                              <FaExclamationTriangle className={`h-5 w-5 ${alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                              <p className="ml-2 text-sm text-red-700">{alert.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Signature/Verification Section */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-3 ${
                    contract.status === 'Processing' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {contract.status === 'Processing' ? (
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <FaCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {contract.status === 'Processing' ? 'Contract is Processing' : 'Contract Analyzed Successfully'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {contract.status === 'Processing'
                        ? 'This contract is currently being processed. Please check back later.'
                        : `This analysis was completed on ${contract.uploadDate} with ${contract.confidenceScore}% confidence.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chatbot Section */}
            <div className="mt-6">
              <DocumentChatbot 
                documentData={contract.documentData} 
                documentText={contract.documentText}
              />
            </div>
            
            {/* Actions Footer */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                &larr; Back to Dashboard
              </Link>
              
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Upload Another Contract
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalysisSummary;