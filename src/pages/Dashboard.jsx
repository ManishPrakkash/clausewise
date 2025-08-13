// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFileUpload, FaSearch, FaFilter, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa'; // Import icon for Total Contracts Scanned
import Navigation from '../components/Navigation';
import sampleImage from '../assets/sample.png'; // Import the sample image

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Add state for filter status
  const [stats, setStats] = useState({
    totalContracts: 0,
    alertsFound: 0,
    pendingContracts: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('lastVisitedPage', 'dashboard'); // Store the current page in localStorage
      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      const mockContracts = history
        .map((item, index) => ({
          id: `${index + 1}`,
          title: item.name || 'Untitled Contract', // Fallback for missing title
          uploadDate: new Date().toLocaleDateString(),
          status: item.status || 'Completed', // Fallback for missing status
          thumbnail: item.thumbnail || sampleImage, // Fallback for missing thumbnail
          alertsCount: item.alerts || 0, // Fallback for missing alerts
          summary: (item.text || 'No summary available').slice(0, 100) + '...', // Fallback for missing text
        }))
        .reverse(); // Reverse to show most recently added contracts first
      setContracts(mockContracts);
      setStats({
        totalContracts: mockContracts.length,
        alertsFound: mockContracts.reduce((acc, contract) => acc + contract.alertsCount, 0),
        pendingContracts: mockContracts.filter((contract) => contract.status === 'Processing').length,
      });
    } catch (err) {
      console.error('Error initializing dashboard:', err); // Debugging: Log errors
      setContracts([]);
      setStats({
        totalContracts: 0,
        alertsFound: 0,
        pendingContracts: 0,
      });
    }
  }, []); // Removed dependency on `localStorage.getItem('ocrHistory')` to avoid unnecessary re-renders

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleFilter = () => {
    setFilterStatus((prevStatus) => 
      prevStatus === 'Processing' ? 'Completed' : prevStatus === 'Completed' ? '' : 'Processing'
    ); // Toggle between "Processing", "Completed", and "Show All"
  };

  const filteredContracts = contracts
    .filter(contract => 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === '' || contract.status === filterStatus) // Apply filter
    )
    .slice(0, 3); // Show only the most recent three contracts

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="py-10">
        <header className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight text-black-900">Dashboard</h1>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Stats Panel */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                        <FaFileAlt className="h-8 w-6 text-black" /> {/* Icon for Total Contracts Scanned */}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Contracts Scanned
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.totalContracts}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                        <FaExclamationTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Alerts Found
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.alertsFound}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Contracts
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.pendingContracts}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={toggleFilter} // Toggle filter status
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaFilter className="mr-2" /> {filterStatus === 'Processing' ? 'Show Completed' : filterStatus === 'Completed' ? 'Show All' : 'Show Processing'}
                </button>
                
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <FaFileUpload className="mr-2" /> Upload New Contract
                </Link>
              </div>
            </div>

            {/* Recent Contracts */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Recent Contracts</h2>
              
              {filteredContracts.length === 0 ? (
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
                  No contracts found. Upload your first contract!
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredContracts.map((contract) => (
                    <div key={contract.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img 
                              src={contract.thumbnail} 
                              alt={contract.title} 
                              className="h-32 w-24 object-cover rounded border border-gray-200" 
                            />
                          </div>
                          <div className="ml-5">
                            <h3 className="text-lg font-medium text-gray-900">{contract.title}</h3>
                            <p className="text-sm text-gray-500">Uploaded: {contract.uploadDate}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contract.status === 'Processing' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {contract.status}
                              </span>
                              
                              {contract.alertsCount > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {contract.alertsCount} Alerts
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-5 py-3">
                        <Link
                          to={`/analysis-summary/${contract.id}`} // Updated path to match AnalysisSummary route
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          View Summary <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;