import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FaSearch, FaFilter, FaFileAlt, FaMapMarkedAlt, FaEye } from 'react-icons/fa';

const ContractHistory = ({ setIsAuthenticated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' or 'land-verification'
  const [contractHistory, setContractHistory] = useState([]);
  const [landVerificationHistory, setLandVerificationHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', 'history');

    // Load contract history
    const contracts = JSON.parse(localStorage.getItem('ocrHistory')) || [];
    const formattedContracts = contracts.map((item, index) => ({
      id: index + 1,
      title: item.name || 'Untitled Contract',
      dateScanned: new Date().toLocaleDateString(),
      status: item.status || 'Completed',
      alerts: item.alerts || 0,
      type: 'contract'
    }));
    setContractHistory(formattedContracts.reverse());

    // Load land verification history
    const landResults = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    const formattedLandResults = landResults.map(result => ({
      id: result.id,
      title: result.documentName,
      dateScanned: result.uploadDate,
      status: result.status,
      alerts: result.discrepancies?.length || 0,
      type: 'land-verification',
      isLegal: result.isLegal,
      ownershipType: result.ownershipType
    }));
    setLandVerificationHistory(formattedLandResults);

  }, []);

  const getCurrentHistory = () => {
    return activeTab === 'contracts' ? contractHistory : landVerificationHistory;
  };

  const filteredHistory = getCurrentHistory().filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === '' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status, isLegal) => {
    if (activeTab === 'land-verification') {
      if (!isLegal) {
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Issues Found</span>;
      }
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Verified</span>;
    }
    
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Document History
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              View and manage your processed documents
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contracts'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FaFileAlt className="inline mr-2" />
                  Contracts ({contractHistory.length})
                </button>
                <button
                  onClick={() => setActiveTab('land-verification')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'land-verification'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FaMapMarkedAlt className="inline mr-2" />
                  Land Verification ({landVerificationHistory.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  {activeTab === 'land-verification' && <option value="Verified">Verified</option>}
                </select>
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeTab === 'contracts' ? 'Recently Scanned Contracts' : 'Land Verification Results'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'contracts' 
                  ? 'Details of your scanned contracts.' 
                  : 'Details of your land document verifications.'
                }
              </p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((doc) => (
                  <div key={doc.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {activeTab === 'contracts' ? (
                              <FaFileAlt className="text-primary-500 text-xl" />
                            ) : (
                              <FaMapMarkedAlt className="text-primary-500 text-xl" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                              {doc.title}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {activeTab === 'contracts' ? 'Scanned:' : 'Verified:'} {doc.dateScanned}
                              </span>
                              {activeTab === 'land-verification' && doc.ownershipType && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {doc.ownershipType} Land
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {getStatusBadge(doc.status, doc.isLegal)}
                        
                        {doc.alerts > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {doc.alerts} Alert{doc.alerts > 1 ? 's' : ''}
                          </span>
                        )}

                        <Link
                          to={activeTab === 'contracts' ? `/analysis/${doc.id}` : `/verification-results/${doc.id}`}
                          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                        >
                          <FaEye />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    {activeTab === 'contracts' ? (
                      <FaFileAlt className="mx-auto text-6xl" />
                    ) : (
                      <FaMapMarkedAlt className="mx-auto text-6xl" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {activeTab === 'contracts' 
                      ? "You haven't scanned any contracts yet."
                      : "You haven't verified any land documents yet."
                    }
                  </p>
                  <Link
                    to={activeTab === 'contracts' ? '/upload' : '/land-verification'}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {activeTab === 'contracts' ? 'Upload Contract' : 'Verify Land Document'}
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ContractHistory;
