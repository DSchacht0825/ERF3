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

            <h2>Application Details - {selectedApplication.applicationId}</h2>

            <div className="detail-section">
              <h3>Application Information</h3>
              <div className="detail-grid">
                <div><strong>Application ID:</strong> {selectedApplication.applicationId}</div>
                <div><strong>Status:</strong> <span className={`status-badge ${selectedApplication.status}`}>{selectedApplication.status}</span></div>
                <div><strong>Application Date:</strong> {selectedApplication.applicationDate ? new Date(selectedApplication.applicationDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Submitted:</strong> {new Date(selectedApplication.submittedDate).toLocaleString()}</div>
                {selectedApplication.viewedDate && (
                  <div><strong>Viewed:</strong> {new Date(selectedApplication.viewedDate).toLocaleString()}</div>
                )}
                {selectedApplication.approvalDate && (
                  <div><strong>Approved:</strong> {new Date(selectedApplication.approvalDate).toLocaleString()}</div>
                )}
                {selectedApplication.denialDate && (
                  <div><strong>Denied:</strong> {new Date(selectedApplication.denialDate).toLocaleString()}</div>
                )}
                {selectedApplication.reviewedBy && (
                  <div><strong>Reviewed By:</strong> {selectedApplication.reviewedBy}</div>
                )}
              </div>
            </div>

            {/* Financial Summary - MAIN REQUEST */}
            <div className="detail-section" style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '2px solid #3b82f6' }}>
              <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>Financial Summary</h3>
              <div className="detail-grid">
                <div style={{ fontSize: '1.1rem' }}>
                  <strong>Total ERF3 Subsidy:</strong>
                  <span style={{ color: '#059669', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                    ${(() => {
                      if (selectedApplication.monthlyBreakdown && selectedApplication.monthlyBreakdown.length > 0) {
                        const total = selectedApplication.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0);
                        return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      }
                      return parseFloat(selectedApplication.totalRentalAssistance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem' }}>
                  <strong>Total Client Pays:</strong>
                  <span style={{ color: '#dc2626', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                    ${(() => {
                      if (selectedApplication.monthlyBreakdown && selectedApplication.monthlyBreakdown.length > 0) {
                        const total = selectedApplication.monthlyBreakdown.reduce((sum, month) => sum + (month.clientPays || 0), 0);
                        return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      }
                      return '0.00';
                    })()}
                  </span>
                </div>
                <div><strong>Program Duration:</strong> {selectedApplication.totalMonths || 'N/A'} months</div>
                <div><strong>Security Deposit Included:</strong> {selectedApplication.includeSecurityDeposit || 'N/A'}</div>
                {selectedApplication.securityAmount && (
                  <div><strong>Security Deposit Amount:</strong> ${parseFloat(selectedApplication.securityAmount).toFixed(2)}</div>
                )}
                <div style={{ fontSize: '1.1rem' }}>
                  <strong>Total Assistance Requested:</strong>
                  <span style={{ color: '#1e40af', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                    ${parseFloat(selectedApplication.totalAssistanceRequested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Applicant Information</h3>
              <div className="detail-grid">
                <div><strong>Name:</strong> {selectedApplication.applicantName}</div>
                <div><strong>Date of Birth:</strong> {selectedApplication.applicantDob ? new Date(selectedApplication.applicantDob).toLocaleDateString() : 'N/A'}</div>
                <div><strong>SSN:</strong> {selectedApplication.applicantSsn || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedApplication.applicantPhone}</div>
                <div><strong>Email:</strong> {selectedApplication.applicantEmail}</div>
                <div><strong>Address:</strong> {selectedApplication.applicantAddress}</div>
                <div><strong>Household Size:</strong> {selectedApplication.householdSize}</div>
                <div><strong>Number of Children:</strong> {selectedApplication.numberOfChildren}</div>
                <div><strong>Emergency Contact:</strong> {selectedApplication.emergencyContactName || 'N/A'}</div>
                <div><strong>Emergency Phone:</strong> {selectedApplication.emergencyContactPhone || 'N/A'}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Summary of Needs</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.summaryOfNeeds || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Referring Agency Information</h3>
              <div className="detail-grid">
                <div><strong>Agency Name:</strong> {selectedApplication.agencyName}</div>
                <div><strong>Address:</strong> {selectedApplication.agencyAddress || 'N/A'}</div>
                <div><strong>City:</strong> {selectedApplication.agencyCity || 'N/A'}</div>
                <div><strong>State:</strong> {selectedApplication.agencyState || 'N/A'}</div>
                <div><strong>ZIP:</strong> {selectedApplication.agencyZip || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedApplication.agencyPhone || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedApplication.agencyEmail || 'N/A'}</div>
                <div><strong>Website:</strong> {selectedApplication.agencyWebsite || 'N/A'}</div>
                <div><strong>Tax ID:</strong> {selectedApplication.agencyTaxId || 'N/A'}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Case Manager Information</h3>
              <div className="detail-grid">
                <div><strong>Case Manager:</strong> {selectedApplication.caseManagerName}</div>
                <div><strong>Title:</strong> {selectedApplication.caseManagerTitle || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedApplication.caseManagerPhone}</div>
                <div><strong>Email:</strong> {selectedApplication.caseManagerEmail}</div>
                <div><strong>Availability:</strong> {selectedApplication.caseManagerAvailability || 'N/A'}</div>
              </div>
              {(selectedApplication.alternateContactName || selectedApplication.alternateContactPhone || selectedApplication.alternateContactEmail) && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Alternate Contact</h4>
                  <div className="detail-grid">
                    <div><strong>Name:</strong> {selectedApplication.alternateContactName || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedApplication.alternateContactPhone || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedApplication.alternateContactEmail || 'N/A'}</div>
                  </div>
                </>
              )}
            </div>

            <div className="detail-section">
              <h3>Referral Details</h3>
              <div className="detail-grid">
                <div><strong>Referral Date:</strong> {selectedApplication.referralDate ? new Date(selectedApplication.referralDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Referring Program:</strong> {selectedApplication.referringProgram || 'N/A'}</div>
                <div><strong>Client ID Number:</strong> {selectedApplication.clientIdNumber || 'N/A'}</div>
                <div><strong>Length of Service:</strong> {selectedApplication.lengthOfService || 'N/A'}</div>
                <div><strong>Program Status:</strong> {selectedApplication.programEnrollmentStatus || 'N/A'}</div>
              </div>
              {selectedApplication.additionalServices && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Additional Services</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.additionalServices}</p>
                </>
              )}
              {selectedApplication.agencyCoordination && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Agency Coordination Plan</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.agencyCoordination}</p>
                </>
              )}
            </div>

            <div className="detail-section">
              <h3>Income & Employment</h3>
              <div className="detail-grid">
                <div><strong>Current Income:</strong> ${parseFloat(selectedApplication.currentIncome || 0).toFixed(2)}/month</div>
                <div><strong>Projected Income:</strong> ${parseFloat(selectedApplication.projectedIncome || 0).toFixed(2)}/month</div>
                <div><strong>Primary Income Source:</strong> {selectedApplication.primaryIncomeSource || 'N/A'}</div>
                <div><strong>Employment Status:</strong> {selectedApplication.employmentStatus || 'N/A'}</div>
                {selectedApplication.employmentStartDate && (
                  <div><strong>Employment Start:</strong> {new Date(selectedApplication.employmentStartDate).toLocaleDateString()}</div>
                )}
                {selectedApplication.expectedIncomeIncrease && (
                  <div><strong>Expected Income Increase:</strong> ${parseFloat(selectedApplication.expectedIncomeIncrease).toFixed(2)}</div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Lease Information</h3>
              <div className="detail-grid">
                <div><strong>Monthly Rent:</strong> ${parseFloat(selectedApplication.monthlyRent || 0).toFixed(2)}</div>
                <div><strong>Security Deposit:</strong> ${parseFloat(selectedApplication.securityDeposit || 0).toFixed(2)}</div>
                <div><strong>Lease Start Date:</strong> {selectedApplication.leaseStartDate ? new Date(selectedApplication.leaseStartDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Lease End Date:</strong> {selectedApplication.leaseEndDate ? new Date(selectedApplication.leaseEndDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Lease Term:</strong> {selectedApplication.leaseTermMonths || selectedApplication.totalMonths || 'N/A'} months</div>
                <div><strong>Rent Due Day:</strong> {selectedApplication.rentDueDay || 'N/A'}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Step-Down Plan</h3>
              {selectedApplication.phases && selectedApplication.phases.length > 0 ? (
                <table className="detail-table" style={{ marginBottom: '1rem' }}>
                  <thead>
                    <tr>
                      <th>Phase</th>
                      <th>Months</th>
                      <th>ERF3 Pays</th>
                      <th>Client Pays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApplication.phases.map((phase, idx) => (
                      <tr key={idx}>
                        <td>Phase {idx + 1}</td>
                        <td>{phase.months} months</td>
                        <td>{phase.percentage}%</td>
                        <td>{100 - phase.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No phase information available</p>
              )}
              <h4>Rationale</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.stepDownRationale || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Barriers & Support Services</h3>
              {selectedApplication.barriersToHousing && (
                <>
                  <h4>Barriers to Housing</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.barriersToHousing}</p>
                </>
              )}
              {selectedApplication.supportServicesNeeded && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Support Services Needed</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.supportServicesNeeded}</p>
                </>
              )}
              {selectedApplication.longTermHousingPlan && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Long-term Housing Plan</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApplication.longTermHousingPlan}</p>
                </>
              )}
            </div>

            <div className="detail-section">
              <h3>Landlord Information</h3>
              <div className="detail-grid">
                <div><strong>Landlord Name:</strong> {selectedApplication.landlordName || 'N/A'}</div>
                <div><strong>Company:</strong> {selectedApplication.landlordCompany || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedApplication.landlordPhone || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedApplication.landlordEmail || 'N/A'}</div>
                <div><strong>Property Address:</strong> {selectedApplication.propertyAddress || 'N/A'}</div>
                <div><strong>Payment Address:</strong> {selectedApplication.paymentAddress || 'N/A'}</div>
                <div><strong>W-9 on File:</strong> {selectedApplication.w9OnFile || 'N/A'}</div>
                <div><strong>Agreement Signed:</strong> {selectedApplication.landlordAgreementSigned || 'N/A'}</div>
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
                      <th>ERF3 %</th>
                      <th>ERF3 Assistance</th>
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
                  <tfoot>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                      <td colSpan="3">TOTALS</td>
                      <td style={{ color: '#059669' }}>
                        ${selectedApplication.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ color: '#dc2626' }}>
                        ${selectedApplication.monthlyBreakdown.reduce((sum, month) => sum + (month.clientPays || 0), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {selectedApplication.notes && selectedApplication.notes.length > 0 && (
              <div className="detail-section">
                <h3>Admin Notes</h3>
                {selectedApplication.notes.map((note, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', marginBottom: '0.5rem', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {new Date(note.date).toLocaleString()} - {note.author}
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))}
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
