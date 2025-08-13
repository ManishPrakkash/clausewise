import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FaFilter, FaSearch } from 'react-icons/fa';

const ContractHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterStatus, setFilterStatus] = useState(''); // State for filter status
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [contractToDelete, setContractToDelete] = useState(null); // State for the contract to delete
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for showing the delete confirmation

  useEffect(() => {
    try {
      localStorage.setItem('lastVisitedPage', 'history'); // Store the current page in localStorage
      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      const mockHistory = history.map((item, index) => ({
        id: `${index + 1}`,
        title: item.name || 'Untitled Contract', // Fallback for missing title
        dateScanned: item.dateScanned || new Date().toLocaleDateString(), // Use actual scanned date if available
        status: 'Completed',
        alerts: item.alerts || 0, // Fallback for missing alerts
        thumbnail: item.thumbnail || '', // Fallback for missing thumbnail
      }));

      setHistory(mockHistory);
    } catch (err) {
      console.error('Error fetching contract history:', err); // Debugging: Log errors
      setHistory([]);
    }
  }, []);

  const toggleFilter = () => {
    setFilterStatus((prevStatus) =>
      prevStatus === 'Processing' ? 'Completed' : prevStatus === 'Completed' ? '' : 'Processing'
    ); // Toggle between "Processing", "Completed", and "Show All"
  };

  const confirmDeleteContract = (id) => {
    setContractToDelete(id);
    setShowConfirmDelete(true);
  };

  const deleteContract = () => {
    const updatedHistory = history.filter((doc) => doc.id !== contractToDelete);
    setHistory(updatedHistory);
    localStorage.setItem('ocrHistory', JSON.stringify(updatedHistory));
    setShowConfirmDelete(false);
    setContractToDelete(null);
  };

  const filteredHistory = history.filter(
    (doc) =>
      (filterStatus === '' || doc.status === filterStatus) &&
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 pb-7">Contract History</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Recently Scanned Documents
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Details of your scanned contracts.
                  </p>
                </div>
                <div className="flex space-x-4">
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
                  <button
                    onClick={toggleFilter}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaFilter className="mr-2" />
                    {filterStatus === 'Processing'
                      ? 'Show Completed'
                      : filterStatus === 'Completed'
                      ? 'Show All'
                      : 'Show Processing'}
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200">
                {/* Column Titles */}
                <div className="bg-gray-100 px-4 py-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 font-medium text-gray-700">
                  <div>Title</div>
                  <div>Date Scanned</div>
                  <div>Status</div>
                  <div className="text-center">Actions</div> {/* Center-align actions heading */}
                </div>
                <dl>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6"
                      >
                        <dt className="text-sm font-medium text-gray-500">{doc.title}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{doc.dateScanned}</dd>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                          {doc.alerts > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {doc.alerts} Alerts
                            </span>
                          )}
                        </dd>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                          <div className="flex justify-center space-x-2"> {/* Center-align buttons */}
                            <Link
                              to={`/analysis-summary/${doc.id}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                              Open
                            </Link>
                            <button
                              onClick={() => confirmDeleteContract(doc.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </dd>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-5 sm:px-6">
                      <p className="text-sm text-gray-500">No scanned documents found.</p>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold text-gray-900">Confirm Delete</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteContract}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractHistory;
