import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import { API_URL } from '../config';

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    agency: '',
    searchTerm: '',
    minIncome: '',
    maxIncome: '',
    householdSize: '',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: ''
  });

  // Checkboxes for custom reporting
  const [reportFields, setReportFields] = useState({
    applicantName: true,
    agencyName: true,
    status: true,
    submittedDate: true,
    totalAssistanceRequested: true,
    currentIncome: false,
    householdSize: false,
    monthlyRent: false,
    caseManagerName: false,
    landlordName: false
  });

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/applications`);
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Agency filter
    if (filters.agency) {
      filtered = filtered.filter(app =>
        app.agencyName?.toLowerCase().includes(filters.agency.toLowerCase())
      );
    }

    // Search term (searches multiple fields)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.applicantName?.toLowerCase().includes(term) ||
        app.applicationId?.toLowerCase().includes(term) ||
        app.agencyName?.toLowerCase().includes(term) ||
        app.caseManagerName?.toLowerCase().includes(term)
      );
    }

    // Income range
    if (filters.minIncome) {
      filtered = filtered.filter(app =>
        parseFloat(app.currentIncome) >= parseFloat(filters.minIncome)
      );
    }
    if (filters.maxIncome) {
      filtered = filtered.filter(app =>
        parseFloat(app.currentIncome) <= parseFloat(filters.maxIncome)
      );
    }

    // Household size
    if (filters.householdSize) {
      filtered = filtered.filter(app =>
        parseInt(app.householdSize) === parseInt(filters.householdSize)
      );
    }

    // Assistance amount range
    if (filters.minAmount) {
      filtered = filtered.filter(app =>
        parseFloat(app.totalAssistanceRequested) >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(app =>
        parseFloat(app.totalAssistanceRequested) <= parseFloat(filters.maxAmount)
      );
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(app =>
        new Date(app.submittedDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(app =>
        new Date(app.submittedDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      agency: '',
      searchTerm: '',
      minIncome: '',
      maxIncome: '',
      householdSize: '',
      minAmount: '',
      maxAmount: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const updateApplicationStatus = async (id, status, reviewedBy = 'Admin') => {
    try {
      await axios.patch(`${API_URL}/applications/${id}/status`, {
        status,
        reviewedBy
      });
      fetchApplications();
      fetchStatistics();
      alert(`Application ${status} successfully!`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application status');
    }
  };

  const viewApplication = (app) => {
    setSelectedApplication(app);
    if (app.status === 'pending') {
      updateApplicationStatus(app.id, 'viewed');
    }
  };

  const closeDetail = () => {
    setSelectedApplication(null);
  };

  const exportToCSV = () => {
    const headers = Object.keys(reportFields)
      .filter(key => reportFields[key])
      .map(key => key.replace(/([A-Z])/g, ' $1').trim());

    const rows = filteredApplications.map(app => {
      const row = [];
      Object.keys(reportFields).forEach(key => {
        if (reportFields[key]) {
          let value = app[key] || '';
          if (key === 'submittedDate' && value) {
            value = new Date(value).toLocaleDateString();
          }
          if (key === 'totalAssistanceRequested' || key === 'currentIncome' || key === 'monthlyRent') {
            value = `$${parseFloat(value || 0).toFixed(2)}`;
          }
          row.push(value);
        }
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erf3-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>ERF3 Application Dashboard</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <div className="stat-number">{statistics.total}</div>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <div className="stat-number">{statistics.pending}</div>
          </div>
          <div className="stat-card viewed">
            <h3>Viewed</h3>
            <div className="stat-number">{statistics.viewed}</div>
          </div>
          <div className="stat-card approved">
            <h3>Approved</h3>
            <div className="stat-number">{statistics.approved}</div>
          </div>
          <div className="stat-card denied">
            <h3>Denied</h3>
            <div className="stat-number">{statistics.denied}</div>
          </div>
          <div className="stat-card">
            <h3>Total Requested</h3>
            <div className="stat-number">${statistics.totalRequested.toLocaleString()}</div>
          </div>
          <div className="stat-card approved">
            <h3>Total Approved</h3>
            <div className="stat-number">${statistics.totalApproved.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h2>Filters & Search</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Name, ID, Agency..."
            />
          </div>

          <div className="filter-group">
            <label>Agency</label>
            <input
              type="text"
              name="agency"
              value={filters.agency}
              onChange={handleFilterChange}
              placeholder="Agency name..."
            />
          </div>

          <div className="filter-group">
            <label>Household Size</label>
            <input
              type="number"
              name="householdSize"
              value={filters.householdSize}
              onChange={handleFilterChange}
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Min Income</label>
            <input
              type="number"
              name="minIncome"
              value={filters.minIncome}
              onChange={handleFilterChange}
              placeholder="$0"
            />
          </div>

          <div className="filter-group">
            <label>Max Income</label>
            <input
              type="number"
              name="maxIncome"
              value={filters.maxIncome}
              onChange={handleFilterChange}
              placeholder="$10,000"
            />
          </div>

          <div className="filter-group">
            <label>Min Assistance</label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              placeholder="$0"
            />
          </div>

          <div className="filter-group">
            <label>Max Assistance</label>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              placeholder="$50,000"
            />
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear All Filters
        </button>
      </div>

      {/* Report Fields Selection */}
      <div className="report-fields-section">
        <h2>Custom Report Fields</h2>
        <p>Select which fields to include in your exported report:</p>
        <div className="checkbox-grid">
          {Object.keys(reportFields).map(key => (
            <label key={key} className="checkbox-label">
              <input
                type="checkbox"
                checked={reportFields[key]}
                onChange={(e) => setReportFields(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
              />
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
          ))}
        </div>
        <button className="btn btn-success" onClick={exportToCSV}>
          Export to CSV ({filteredApplications.length} applications)
        </button>
      </div>

      {/* Applications Table */}
      <div className="applications-section">
        <h2>Applications ({filteredApplications.length})</h2>
        <div className="table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Applicant</th>
                <th>Agency</th>
                <th>Case Manager</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <tr key={app.id} className={`status-${app.status}`}>
                    <td>{app.applicationId}</td>
                    <td>{new Date(app.submittedDate).toLocaleDateString()}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.agencyName}</td>
                    <td>{app.caseManagerName}</td>
                    <td>${parseFloat(app.totalAssistanceRequested || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small btn-view"
                          onClick={() => viewApplication(app)}
                        >
                          View
                        </button>
                        {app.status !== 'approved' && (
                          <button
                            className="btn-small btn-approve"
                            onClick={() => updateApplicationStatus(app.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {app.status !== 'denied' && (
                          <button
                            className="btn-small btn-deny"
                            onClick={() => updateApplicationStatus(app.id, 'denied')}
                          >
                            Deny
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No applications found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetail}>×</button>

            <h2>Application Details</h2>

            <div className="detail-section">
              <h3>Application Information</h3>
              <div className="detail-grid">
                <div><strong>Application ID:</strong> {selectedApplication.applicationId}</div>
                <div><strong>Status:</strong> <span className={`status-badge ${selectedApplication.status}`}>{selectedApplication.status}</span></div>
                <div><strong>Submitted:</strong> {new Date(selectedApplication.submittedDate).toLocaleString()}</div>
                {selectedApplication.viewedDate && (
                  <div><strong>Viewed:</strong> {new Date(selectedApplication.viewedDate).toLocaleString()}</div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Applicant Information</h3>
              <div className="detail-grid">
                <div><strong>Name:</strong> {selectedApplication.applicantName}</div>
                <div><strong>Phone:</strong> {selectedApplication.applicantPhone}</div>
                <div><strong>Email:</strong> {selectedApplication.applicantEmail}</div>
                <div><strong>Address:</strong> {selectedApplication.applicantAddress}</div>
                <div><strong>Household Size:</strong> {selectedApplication.householdSize}</div>
                <div><strong>Children:</strong> {selectedApplication.numberOfChildren}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Referring Agency</h3>
              <div className="detail-grid">
                <div><strong>Agency:</strong> {selectedApplication.agencyName}</div>
                <div><strong>Case Manager:</strong> {selectedApplication.caseManagerName}</div>
                <div><strong>Manager Email:</strong> {selectedApplication.caseManagerEmail}</div>
                <div><strong>Manager Phone:</strong> {selectedApplication.caseManagerPhone}</div>
                <div><strong>Program:</strong> {selectedApplication.referringProgram}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Financial Information</h3>
              <div className="detail-grid">
                <div><strong>Monthly Rent:</strong> ${parseFloat(selectedApplication.monthlyRent || 0).toFixed(2)}</div>
                <div><strong>Security Deposit:</strong> ${parseFloat(selectedApplication.securityDeposit || 0).toFixed(2)}</div>
                <div><strong>Current Income:</strong> ${parseFloat(selectedApplication.currentIncome || 0).toFixed(2)}</div>
                <div><strong>Projected Income:</strong> ${parseFloat(selectedApplication.projectedIncome || 0).toFixed(2)}</div>
                <div><strong>Total Months:</strong> {selectedApplication.totalMonths}</div>
                <div><strong>Total Assistance:</strong> ${parseFloat(selectedApplication.totalAssistanceRequested || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Summary of Needs</h3>
              <p>{selectedApplication.summaryOfNeeds}</p>
            </div>

            <div className="detail-section">
              <h3>Step-Down Plan Rationale</h3>
              <p>{selectedApplication.stepDownRationale}</p>
            </div>

            <div className="detail-section">
              <h3>Landlord Information</h3>
              <div className="detail-grid">
                <div><strong>Landlord:</strong> {selectedApplication.landlordName}</div>
                <div><strong>Company:</strong> {selectedApplication.landlordCompany}</div>
                <div><strong>Phone:</strong> {selectedApplication.landlordPhone}</div>
                <div><strong>Email:</strong> {selectedApplication.landlordEmail}</div>
                <div><strong>Property:</strong> {selectedApplication.propertyAddress}</div>
              </div>
            </div>

            {selectedApplication.monthlyBreakdown && selectedApplication.monthlyBreakdown.length > 0 && (
              <div className="detail-section">
                <h3>Monthly Payment Breakdown</h3>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Phase</th>
                      <th>%</th>
                      <th>Assistance</th>
                      <th>Client Pays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApplication.monthlyBreakdown.map((month, idx) => (
                      <tr key={idx}>
                        <td>{month.month}</td>
                        <td>{month.phase}</td>
                        <td>{month.percentage}%</td>
                        <td>${month.assistance.toFixed(2)}</td>
                        <td>${month.clientPays.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={() => {
                  updateApplicationStatus(selectedApplication.id, 'approved');
                  closeDetail();
                }}
              >
                Approve Application
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  updateApplicationStatus(selectedApplication.id, 'denied');
                  closeDetail();
                }}
              >
                Deny Application
              </button>
              <button className="btn btn-secondary" onClick={closeDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
