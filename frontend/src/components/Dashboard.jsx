import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import { API_URL } from '../config';

// Total Vista CAREs budget
const TOTAL_BUDGET = 2781345.02;

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [expandedBudgetApp, setExpandedBudgetApp] = useState(null);
  const [budgetEditData, setBudgetEditData] = useState(null);

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

  const confirmDelete = (app) => {
    setApplicationToDelete(app);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setApplicationToDelete(null);
    setShowDeleteConfirm(false);
  };

  const deleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      await axios.delete(`${API_URL}/applications/${applicationToDelete.id}`);
      await fetchApplications();
      await fetchStatistics();
      setShowDeleteConfirm(false);
      setApplicationToDelete(null);
      alert('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };

  const openEditModal = (app) => {
    setEditingApplication(app);
    setEditFormData({ ...app });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingApplication(null);
    setEditFormData({});
    setShowEditModal(false);
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveEditedApplication = async () => {
    if (!editingApplication) return;

    try {
      await axios.put(`${API_URL}/applications/${editingApplication.id}`, editFormData);
      await fetchApplications();
      await fetchStatistics();
      closeEditModal();
      alert('Application updated successfully');
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application. Please try again.');
    }
  };

  const calculateTotalSubsidizedDollars = () => {
    // Only count approved applications
    const approvedApps = filteredApplications.filter(app => app.status === 'approved');

    let total = 0;
    approvedApps.forEach(app => {
      // Try to get from monthly breakdown first (most accurate)
      if (app.monthlyBreakdown && app.monthlyBreakdown.length > 0) {
        const appTotal = app.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0);
        total += appTotal;
      } else if (app.totalRentalAssistance) {
        // Fallback to totalRentalAssistance
        total += parseFloat(app.totalRentalAssistance);
      } else if (app.totalAssistanceRequested) {
        // Final fallback
        total += parseFloat(app.totalAssistanceRequested);
      }
    });

    return total;
  };

  // Calculate budget spent from ALL approved applications (not filtered)
  const calculateBudgetSpent = () => {
    const approvedApps = applications.filter(app => app.status === 'approved');

    let total = 0;
    approvedApps.forEach(app => {
      if (app.monthlyBreakdown && app.monthlyBreakdown.length > 0) {
        const appTotal = app.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0);
        total += appTotal;
      } else if (app.totalRentalAssistance) {
        total += parseFloat(app.totalRentalAssistance);
      } else if (app.totalAssistanceRequested) {
        total += parseFloat(app.totalAssistanceRequested);
      }
    });

    return total;
  };

  const budgetSpent = calculateBudgetSpent();
  const budgetRemaining = TOTAL_BUDGET - budgetSpent;
  const budgetPercentUsed = (budgetSpent / TOTAL_BUDGET) * 100;

  // Get approved applications with their assistance amounts for the budget modal
  const getApprovedApplicationsWithAmounts = () => {
    return applications
      .filter(app => app.status === 'approved')
      .map(app => {
        let assistanceAmount = 0;
        if (app.monthlyBreakdown && app.monthlyBreakdown.length > 0) {
          assistanceAmount = app.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0);
        } else if (app.totalRentalAssistance) {
          assistanceAmount = parseFloat(app.totalRentalAssistance);
        } else if (app.totalAssistanceRequested) {
          assistanceAmount = parseFloat(app.totalAssistanceRequested);
        }
        return { ...app, assistanceAmount };
      })
      .sort((a, b) => new Date(b.approvalDate || b.submittedDate) - new Date(a.approvalDate || a.submittedDate));
  };

  // Toggle expand/collapse for budget editing
  const toggleBudgetExpand = (app) => {
    if (expandedBudgetApp === app.id) {
      setExpandedBudgetApp(null);
      setBudgetEditData(null);
    } else {
      setExpandedBudgetApp(app.id);
      // Create a deep copy of the monthly breakdown for editing
      setBudgetEditData({
        id: app.id,
        monthlyBreakdown: app.monthlyBreakdown ? JSON.parse(JSON.stringify(app.monthlyBreakdown)) : [],
        monthlyRent: app.monthlyRent || 0
      });
    }
  };

  // Handle changes to the monthly breakdown in budget modal
  const handleBudgetBreakdownChange = (index, field, value) => {
    if (!budgetEditData) return;

    const newBreakdown = [...budgetEditData.monthlyBreakdown];
    const numValue = parseFloat(value) || 0;

    if (field === 'assistance') {
      newBreakdown[index].assistance = numValue;
      // Recalculate client pays based on rent
      newBreakdown[index].clientPays = (budgetEditData.monthlyRent || newBreakdown[index].rent || 0) - numValue;
    } else if (field === 'clientPays') {
      newBreakdown[index].clientPays = numValue;
      // Recalculate assistance based on rent
      newBreakdown[index].assistance = (budgetEditData.monthlyRent || newBreakdown[index].rent || 0) - numValue;
    }

    setBudgetEditData(prev => ({ ...prev, monthlyBreakdown: newBreakdown }));
  };

  // Calculate the edited total for preview
  const calculateEditedTotal = () => {
    if (!budgetEditData || !budgetEditData.monthlyBreakdown) return 0;
    return budgetEditData.monthlyBreakdown.reduce((sum, month) => sum + (month.assistance || 0), 0);
  };

  // Save budget changes
  const saveBudgetChanges = async () => {
    if (!budgetEditData) return;

    try {
      const totalAssistance = calculateEditedTotal();

      await axios.put(`${API_URL}/applications/${budgetEditData.id}`, {
        monthlyBreakdown: budgetEditData.monthlyBreakdown,
        totalRentalAssistance: totalAssistance,
        totalAssistanceRequested: totalAssistance
      });

      await fetchApplications();
      await fetchStatistics();

      setExpandedBudgetApp(null);
      setBudgetEditData(null);

      alert('Budget updated successfully!');
    } catch (error) {
      console.error('Error saving budget changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const generateReportPreview = () => {
    const headers = Object.keys(reportFields)
      .filter(key => reportFields[key])
      .map(key => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').trim()
      }));

    const rows = filteredApplications.map(app => {
      const row = {};
      Object.keys(reportFields).forEach(key => {
        if (reportFields[key]) {
          let value = app[key] || '';
          if (key === 'submittedDate' && value) {
            value = new Date(value).toLocaleDateString();
          }
          if (key === 'totalAssistanceRequested' || key === 'currentIncome' || key === 'monthlyRent') {
            value = `$${parseFloat(value || 0).toFixed(2)}`;
          }
          row[key] = value;
        }
      });
      return row;
    });

    const totalSubsidized = calculateTotalSubsidizedDollars();

    setPreviewData({ headers, rows, totalSubsidized });
    setShowReportPreview(true);
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
      <h1>Vista CAREs Application Dashboard</h1>

      {/* Budget Tracker - Clickable */}
      <div
        className="budget-tracker"
        onClick={() => setShowBudgetModal(true)}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Vista CAREs Budget Tracker</h2>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Click to view approved applicants →
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Total Budget</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${TOTAL_BUDGET.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Amount Committed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>${budgetSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Remaining Balance</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: budgetRemaining > 0 ? '#4ade80' : '#f87171' }}>
              ${budgetRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Budget Utilization</span>
            <span>{budgetPercentUsed.toFixed(1)}% used</span>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(budgetPercentUsed, 100)}%`,
              height: '100%',
              backgroundColor: budgetPercentUsed > 90 ? '#f87171' : budgetPercentUsed > 75 ? '#fbbf24' : '#4ade80',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

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
          <div className="stat-card" style={{ backgroundColor: '#10b981', color: 'white' }}>
            <h3>Subsidized Dollars Spent</h3>
            <div className="stat-number">${calculateTotalSubsidizedDollars().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.9 }}>
              Approved applications only
            </div>
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
        <button className="btn btn-success" onClick={generateReportPreview}>
          Preview Report ({filteredApplications.length} applications)
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
                        <button
                          className="btn-small"
                          style={{ backgroundColor: '#3b82f6', color: 'white' }}
                          onClick={() => openEditModal(app)}
                        >
                          Edit
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
                        <button
                          className="btn-small"
                          style={{ backgroundColor: '#dc2626', color: 'white' }}
                          onClick={() => confirmDelete(app)}
                        >
                          Delete
                        </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && applicationToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={cancelDelete}>×</button>

            <h2 style={{ color: '#dc2626' }}>⚠️ Delete Application</h2>

            <div className="detail-section" style={{ backgroundColor: '#fef2f2', padding: '1.5rem', borderRadius: '8px', border: '2px solid #dc2626' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Are you sure you want to delete this application?
              </p>
              <div className="detail-grid">
                <div><strong>Application ID:</strong> {applicationToDelete.applicationId}</div>
                <div><strong>Applicant:</strong> {applicationToDelete.applicantName}</div>
                <div><strong>Agency:</strong> {applicationToDelete.agencyName}</div>
                <div><strong>Status:</strong> {applicationToDelete.status}</div>
                <div><strong>Amount:</strong> ${parseFloat(applicationToDelete.totalAssistanceRequested || 0).toLocaleString()}</div>
              </div>
              <p style={{ marginTop: '1rem', color: '#dc2626', fontWeight: 'bold' }}>
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={deleteApplication}
              >
                Yes, Delete Application
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {showEditModal && editingApplication && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <button className="modal-close" onClick={closeEditModal}>×</button>

            <h2>Edit Application - {editingApplication.applicationId}</h2>

            <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '1rem' }}>
              {/* Applicant Information */}
              <div className="detail-section">
                <h3>Applicant Information</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Name:</strong></label>
                    <input
                      type="text"
                      value={editFormData.applicantName || ''}
                      onChange={(e) => handleEditChange('applicantName', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Phone:</strong></label>
                    <input
                      type="text"
                      value={editFormData.applicantPhone || ''}
                      onChange={(e) => handleEditChange('applicantPhone', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Email:</strong></label>
                    <input
                      type="email"
                      value={editFormData.applicantEmail || ''}
                      onChange={(e) => handleEditChange('applicantEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Household Size:</strong></label>
                    <input
                      type="number"
                      value={editFormData.householdSize || ''}
                      onChange={(e) => handleEditChange('householdSize', parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Agency Information */}
              <div className="detail-section">
                <h3>Agency Information</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Agency Name:</strong></label>
                    <input
                      type="text"
                      value={editFormData.agencyName || ''}
                      onChange={(e) => handleEditChange('agencyName', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Case Manager:</strong></label>
                    <input
                      type="text"
                      value={editFormData.caseManagerName || ''}
                      onChange={(e) => handleEditChange('caseManagerName', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Manager Email:</strong></label>
                    <input
                      type="email"
                      value={editFormData.caseManagerEmail || ''}
                      onChange={(e) => handleEditChange('caseManagerEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Manager Phone:</strong></label>
                    <input
                      type="text"
                      value={editFormData.caseManagerPhone || ''}
                      onChange={(e) => handleEditChange('caseManagerPhone', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="detail-section">
                <h3>Financial Information</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Monthly Rent:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.monthlyRent || ''}
                      onChange={(e) => handleEditChange('monthlyRent', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Security Deposit:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.securityDeposit || ''}
                      onChange={(e) => handleEditChange('securityDeposit', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Current Income:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.currentIncome || ''}
                      onChange={(e) => handleEditChange('currentIncome', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Projected Income:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.projectedIncome || ''}
                      onChange={(e) => handleEditChange('projectedIncome', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Landlord Information */}
              <div className="detail-section">
                <h3>Landlord Information</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Landlord Name:</strong></label>
                    <input
                      type="text"
                      value={editFormData.landlordName || ''}
                      onChange={(e) => handleEditChange('landlordName', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Landlord Phone:</strong></label>
                    <input
                      type="text"
                      value={editFormData.landlordPhone || ''}
                      onChange={(e) => handleEditChange('landlordPhone', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Landlord Email:</strong></label>
                    <input
                      type="email"
                      value={editFormData.landlordEmail || ''}
                      onChange={(e) => handleEditChange('landlordEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Property Address:</strong></label>
                    <input
                      type="text"
                      value={editFormData.propertyAddress || ''}
                      onChange={(e) => handleEditChange('propertyAddress', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="detail-section">
                <h3>Application Status</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Status:</strong></label>
                    <select
                      value={editFormData.status || ''}
                      onChange={(e) => handleEditChange('status', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="viewed">Viewed</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              <div className="detail-section">
                <h3>Lease Information</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Lease Start Date:</strong></label>
                    <input
                      type="date"
                      value={editFormData.leaseStartDate?.split('T')[0] || ''}
                      onChange={(e) => handleEditChange('leaseStartDate', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Lease End Date:</strong></label>
                    <input
                      type="date"
                      value={editFormData.leaseEndDate?.split('T')[0] || ''}
                      onChange={(e) => handleEditChange('leaseEndDate', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Total Months:</strong></label>
                    <input
                      type="number"
                      value={editFormData.totalMonths || ''}
                      onChange={(e) => handleEditChange('totalMonths', parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown - EDITABLE */}
              {editFormData.monthlyBreakdown && editFormData.monthlyBreakdown.length > 0 && (
                <div className="detail-section">
                  <h3>Monthly Payment Breakdown (Editable)</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    You can edit the Vista CAREs Assistance and Client Pays amounts for each month:
                  </p>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="detail-table">
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                        <tr>
                          <th>Month</th>
                          <th>Phase</th>
                          <th>Vista CAREs %</th>
                          <th>Vista CAREs Assistance ($)</th>
                          <th>Client Pays ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.monthlyBreakdown.map((month, idx) => (
                          <tr key={idx}>
                            <td>{month.month}</td>
                            <td>{month.phase}</td>
                            <td>{month.percentage}%</td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={month.assistance || 0}
                                onChange={(e) => {
                                  const newBreakdown = [...editFormData.monthlyBreakdown];
                                  newBreakdown[idx].assistance = parseFloat(e.target.value) || 0;
                                  // Recalculate clientPays based on monthlyRent
                                  if (editFormData.monthlyRent) {
                                    newBreakdown[idx].clientPays = parseFloat(editFormData.monthlyRent) - newBreakdown[idx].assistance;
                                  }
                                  handleEditChange('monthlyBreakdown', newBreakdown);
                                }}
                                style={{ width: '100px', padding: '0.25rem' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={month.clientPays || 0}
                                onChange={(e) => {
                                  const newBreakdown = [...editFormData.monthlyBreakdown];
                                  newBreakdown[idx].clientPays = parseFloat(e.target.value) || 0;
                                  // Recalculate assistance based on monthlyRent
                                  if (editFormData.monthlyRent) {
                                    newBreakdown[idx].assistance = parseFloat(editFormData.monthlyRent) - newBreakdown[idx].clientPays;
                                  }
                                  handleEditChange('monthlyBreakdown', newBreakdown);
                                }}
                                style={{ width: '100px', padding: '0.25rem' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                          <td colSpan="3">TOTALS</td>
                          <td style={{ color: '#059669' }}>
                            ${editFormData.monthlyBreakdown.reduce((sum, m) => sum + (m.assistance || 0), 0).toFixed(2)}
                          </td>
                          <td style={{ color: '#dc2626' }}>
                            ${editFormData.monthlyBreakdown.reduce((sum, m) => sum + (m.clientPays || 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Step-Down Phases */}
              {editFormData.phases && editFormData.phases.length > 0 && (
                <div className="detail-section">
                  <h3>Step-Down Phases (Editable)</h3>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Vista CAREs Pays (%)</th>
                        <th>Months</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editFormData.phases.map((phase, idx) => (
                        <tr key={idx}>
                          <td>Phase {idx + 1}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={phase.percentage || 0}
                              onChange={(e) => {
                                const newPhases = [...editFormData.phases];
                                newPhases[idx].percentage = parseInt(e.target.value) || 0;
                                handleEditChange('phases', newPhases);
                              }}
                              style={{ width: '80px', padding: '0.25rem' }}
                            />
                            %
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={phase.months || 0}
                              onChange={(e) => {
                                const newPhases = [...editFormData.phases];
                                newPhases[idx].months = parseInt(e.target.value) || 0;
                                handleEditChange('phases', newPhases);
                              }}
                              style={{ width: '80px', padding: '0.25rem' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Calculated Totals */}
              <div className="detail-section">
                <h3>Calculated Totals</h3>
                <div className="detail-grid">
                  <div>
                    <label><strong>Total Rental Assistance:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.totalRentalAssistance || ''}
                      onChange={(e) => handleEditChange('totalRentalAssistance', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label><strong>Total Assistance Requested:</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.totalAssistanceRequested || ''}
                      onChange={(e) => handleEditChange('totalAssistanceRequested', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Summary of Needs */}
              <div className="detail-section">
                <h3>Summary of Needs</h3>
                <textarea
                  value={editFormData.summaryOfNeeds || ''}
                  onChange={(e) => handleEditChange('summaryOfNeeds', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                />
              </div>

              {/* Step-Down Rationale */}
              <div className="detail-section">
                <h3>Step-Down Plan Rationale</h3>
                <textarea
                  value={editFormData.stepDownRationale || ''}
                  onChange={(e) => handleEditChange('stepDownRationale', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={saveEditedApplication}
              >
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && previewData && (
        <div className="modal-overlay" onClick={() => setShowReportPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90vh' }}>
            <button className="modal-close" onClick={() => setShowReportPreview(false)}>×</button>

            <h2>Custom Report Preview</h2>

            <div className="detail-section" style={{ backgroundColor: '#ecfdf5', padding: '1.5rem', borderRadius: '8px', border: '2px solid #10b981', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#047857', marginBottom: '1rem' }}>Report Summary</h3>
              <div className="detail-grid">
                <div>
                  <strong>Total Applications in Report:</strong> {previewData.rows.length}
                </div>
                <div>
                  <strong>Report Generated:</strong> {new Date().toLocaleString()}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ fontSize: '1.2rem' }}>Total Subsidized Dollars Spent:</strong>
                  <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '1.3rem', marginLeft: '1rem' }}>
                    ${previewData.totalSubsidized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div style={{ fontSize: '0.9rem', color: '#065f46', marginTop: '0.5rem' }}>
                    (Only includes approved applications - excludes client contributions)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
              <table className="applications-table">
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                  <tr>
                    {previewData.headers.map(header => (
                      <th key={header.key}>{header.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, idx) => (
                    <tr key={idx}>
                      {previewData.headers.map(header => (
                        <td key={header.key}>{row[header.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={() => {
                  exportToCSV();
                  setShowReportPreview(false);
                }}
              >
                Download CSV
              </button>
              <button className="btn btn-secondary" onClick={() => setShowReportPreview(false)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <strong>Total Vista CAREs Subsidy:</strong>
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
                      <th>Vista CAREs Pays</th>
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
                      <th>Vista CAREs %</th>
                      <th>Vista CAREs Assistance</th>
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

      {/* Budget Tracker Modal - Approved Applicants */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
            <button className="modal-close" onClick={() => setShowBudgetModal(false)}>×</button>

            <h2 style={{ marginBottom: '1.5rem' }}>Vista CAREs Budget - Approved Applicants</h2>

            {/* Budget Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Budget</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${TOTAL_BUDGET.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Amount Committed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
                    ${budgetSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Remaining</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: budgetRemaining > 0 ? '#4ade80' : '#f87171' }}>
                    ${budgetRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(budgetPercentUsed, 100)}%`,
                    height: '100%',
                    backgroundColor: budgetPercentUsed > 90 ? '#f87171' : budgetPercentUsed > 75 ? '#fbbf24' : '#4ade80',
                    borderRadius: '999px'
                  }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  {budgetPercentUsed.toFixed(1)}% utilized
                </div>
              </div>
            </div>

            {/* Approved Applicants List */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem' }}>
                Approved Applicants ({getApprovedApplicationsWithAmounts().length})
              </h3>

              {getApprovedApplicationsWithAmounts().length > 0 ? (
                <div>
                  <table className="applications-table">
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                      <tr>
                        <th></th>
                        <th>Application ID</th>
                        <th>Applicant Name</th>
                        <th>Agency</th>
                        <th style={{ textAlign: 'right' }}>Committed Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getApprovedApplicationsWithAmounts().map(app => (
                        <React.Fragment key={app.id}>
                          <tr style={{ backgroundColor: expandedBudgetApp === app.id ? '#f0f9ff' : 'inherit' }}>
                            <td style={{ width: '40px' }}>
                              <button
                                onClick={() => toggleBudgetExpand(app)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  padding: '0.25rem',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                {expandedBudgetApp === app.id ? '▼' : '▶'}
                              </button>
                            </td>
                            <td style={{ fontWeight: '500' }}>{app.applicationId}</td>
                            <td>{app.applicantName}</td>
                            <td>{app.agencyName}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                              ${expandedBudgetApp === app.id && budgetEditData
                                ? calculateEditedTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : app.assistanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>
                              <button
                                className="btn-small btn-view"
                                onClick={() => {
                                  setShowBudgetModal(false);
                                  viewApplication(app);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                          {/* Expanded Edit Row */}
                          {expandedBudgetApp === app.id && budgetEditData && (
                            <tr>
                              <td colSpan="6" style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>
                                    Edit Monthly Breakdown - {app.applicantName}
                                  </h4>

                                  {budgetEditData.monthlyBreakdown && budgetEditData.monthlyBreakdown.length > 0 ? (
                                    <>
                                      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                          <thead>
                                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                                              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Month</th>
                                              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Phase</th>
                                              <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Rent</th>
                                              <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Vista CAREs Pays</th>
                                              <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Client Pays</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {budgetEditData.monthlyBreakdown.map((month, idx) => (
                                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.5rem' }}>{month.month}</td>
                                                <td style={{ padding: '0.5rem' }}>{month.phase}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                  ${(month.rent || budgetEditData.monthlyRent || 0).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    value={month.assistance || 0}
                                                    onChange={(e) => handleBudgetBreakdownChange(idx, 'assistance', e.target.value)}
                                                    style={{
                                                      width: '100px',
                                                      padding: '0.35rem',
                                                      border: '1px solid #cbd5e1',
                                                      borderRadius: '4px',
                                                      textAlign: 'right'
                                                    }}
                                                  />
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    value={month.clientPays || 0}
                                                    onChange={(e) => handleBudgetBreakdownChange(idx, 'clientPays', e.target.value)}
                                                    style={{
                                                      width: '100px',
                                                      padding: '0.35rem',
                                                      border: '1px solid #cbd5e1',
                                                      borderRadius: '4px',
                                                      textAlign: 'right'
                                                    }}
                                                  />
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                          <tfoot>
                                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
                                              <td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right' }}>Totals:</td>
                                              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#059669' }}>
                                                ${calculateEditedTotal().toFixed(2)}
                                              </td>
                                              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#dc2626' }}>
                                                ${budgetEditData.monthlyBreakdown.reduce((sum, m) => sum + (m.clientPays || 0), 0).toFixed(2)}
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>

                                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <button
                                          className="btn btn-secondary"
                                          onClick={() => {
                                            setExpandedBudgetApp(null);
                                            setBudgetEditData(null);
                                          }}
                                          style={{ padding: '0.5rem 1rem' }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="btn btn-success"
                                          onClick={saveBudgetChanges}
                                          style={{ padding: '0.5rem 1rem' }}
                                        >
                                          Save Changes
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <p style={{ color: '#6b7280' }}>No monthly breakdown data available for this application.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                        <td></td>
                        <td colSpan="3" style={{ textAlign: 'right' }}>Total Committed:</td>
                        <td style={{ textAlign: 'right', color: '#059669', fontSize: '1.1rem' }}>
                          ${budgetSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No approved applications yet</p>
                  <p style={{ fontSize: '0.9rem' }}>Approved applications will appear here with their committed amounts</p>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>
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
