import { useState } from 'react';
import axios from 'axios';
import '../styles/ApplicationForm.css';
import { API_URL } from '../config';

function ApplicationForm() {
  const [currentTab, setCurrentTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const [formData, setFormData] = useState({
    // Tab 1: Referring Agency
    applicationDate: new Date().toISOString().split('T')[0],
    agencyName: '',
    agencyAddress: '',
    agencyCity: '',
    agencyState: '',
    agencyZip: '',
    agencyPhone: '',
    agencyEmail: '',
    agencyWebsite: '',
    agencyTaxId: '',
    caseManagerName: '',
    caseManagerTitle: '',
    caseManagerPhone: '',
    caseManagerEmail: '',
    caseManagerAvailability: '',
    alternateContactName: '',
    alternateContactPhone: '',
    alternateContactEmail: '',
    referralDate: new Date().toISOString().split('T')[0],
    referringProgram: '',
    clientIdNumber: '',
    lengthOfService: '',
    programEnrollmentStatus: '',
    additionalServices: '',
    agencyCoordination: '',

    // Tab 2: Applicant Info
    applicantName: '',
    applicantDOB: '',
    applicantSSN: '',
    applicantPhone: '',
    applicantEmail: '',
    applicantAddress: '',
    householdSize: '',
    numberOfChildren: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    summaryOfNeeds: '',

    // Tab 3: Financial & Plan
    monthlyRent: '',
    securityDeposit: '',
    includeSecurityDeposit: 'Yes',
    currentIncome: '',
    projectedIncome: '',
    primaryIncomeSource: '',
    leaseStartDate: '',
    leaseEndDate: '',
    rentDueDay: '1st',

    // Step-down plan (6 phases)
    phases: [
      { name: 'Phase 1 (100%)', percentage: 100, months: 3 },
      { name: 'Phase 2 (75%)', percentage: 75, months: 3 },
      { name: 'Phase 3 (50%)', percentage: 50, months: 3 },
      { name: 'Phase 4 (25%)', percentage: 25, months: 3 },
      { name: 'Phase 5', percentage: 0, months: 0 },
      { name: 'Phase 6', percentage: 0, months: 0 },
    ],
    stepDownRationale: '',

    // Tab 4: Monthly Breakdown (calculated)
    monthlyBreakdown: [],

    // Tab 5: Landlord & Approval
    landlordName: '',
    landlordCompany: '',
    landlordPhone: '',
    landlordEmail: '',
    propertyAddress: '',
    paymentAddress: '',
    w9OnFile: 'No',
    landlordAgreementSigned: 'No',
  });

  const tabs = [
    { id: 0, title: '1. Referring Agency' },
    { id: 1, title: '2. Applicant Info' },
    { id: 2, title: '3. Financial & Plan' },
    { id: 3, title: '4. Monthly Breakdown' },
    { id: 4, title: '5. Landlord & Approval' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...formData.phases];
    newPhases[index][field] = field === 'percentage' || field === 'months' ? Number(value) : value;
    setFormData(prev => ({ ...prev, phases: newPhases }));
  };

  const calculateTotals = () => {
    const rent = parseFloat(formData.monthlyRent) || 0;
    const securityDeposit = parseFloat(formData.securityDeposit) || 0;

    let totalRentalAssistance = 0;
    let totalMonths = 0;

    formData.phases.forEach(phase => {
      const assistancePerMonth = rent * (phase.percentage / 100);
      totalRentalAssistance += assistancePerMonth * phase.months;
      totalMonths += phase.months;
    });

    const securityAmount = formData.includeSecurityDeposit === 'Yes' ? securityDeposit : 0;
    const totalAssistanceRequested = totalRentalAssistance + securityAmount;

    return {
      totalMonths,
      totalRentalAssistance,
      securityAmount,
      totalAssistanceRequested
    };
  };

  const generateMonthlyBreakdown = () => {
    const rent = parseFloat(formData.monthlyRent) || 0;
    const breakdown = [];
    let monthCounter = 1;

    formData.phases.forEach(phase => {
      for (let i = 0; i < phase.months; i++) {
        const assistance = rent * (phase.percentage / 100);
        const clientPays = rent - assistance;

        breakdown.push({
          month: monthCounter,
          phase: phase.name,
          percentage: phase.percentage,
          rent,
          assistance,
          clientPays
        });

        monthCounter++;
      }
    });

    return breakdown;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totals = calculateTotals();
      const monthlyBreakdown = generateMonthlyBreakdown();

      const submissionData = {
        ...formData,
        ...totals,
        monthlyBreakdown
      };

      const response = await axios.post(`${API_URL}/applications`, submissionData);
      setApplicationId(response.data.applicationId);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="application-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Application Submitted Successfully!</h2>
          <p>Your application ID is: <strong>{applicationId}</strong></p>
          <p>Please save this ID for your records.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const monthlyBreakdown = generateMonthlyBreakdown();

  return (
    <div className="application-container">
      <h1>ERF3 Grant Funding Application</h1>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {/* TAB 1: REFERRING AGENCY */}
        {currentTab === 0 && (
          <div className="tab-content">
            <h2>Section A: Referring Agency Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Application Date</label>
                <input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Referring Agency/Organization Name</label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Agency Address</label>
                <input
                  type="text"
                  name="agencyAddress"
                  value={formData.agencyAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="agencyCity"
                  value={formData.agencyCity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="agencyState"
                  value={formData.agencyState}
                  onChange={handleInputChange}
                  maxLength="2"
                  required
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="agencyZip"
                  value={formData.agencyZip}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Agency Phone</label>
                <input
                  type="tel"
                  name="agencyPhone"
                  value={formData.agencyPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Agency Email</label>
                <input
                  type="email"
                  name="agencyEmail"
                  value={formData.agencyEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Agency Website</label>
                <input
                  type="url"
                  name="agencyWebsite"
                  value={formData.agencyWebsite}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Agency Tax ID/EIN</label>
                <input
                  type="text"
                  name="agencyTaxId"
                  value={formData.agencyTaxId}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <h2>Section B: Primary Contact / Case Manager</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Case Manager / Navigator Name</label>
                <input
                  type="text"
                  name="caseManagerName"
                  value={formData.caseManagerName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Job Title / Position</label>
                <input
                  type="text"
                  name="caseManagerTitle"
                  value={formData.caseManagerTitle}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Direct Phone</label>
                <input
                  type="tel"
                  name="caseManagerPhone"
                  value={formData.caseManagerPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Direct Email</label>
                <input
                  type="email"
                  name="caseManagerEmail"
                  value={formData.caseManagerEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Best Time to Contact</label>
                <input
                  type="text"
                  name="caseManagerAvailability"
                  value={formData.caseManagerAvailability}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                />
              </div>

              <div className="form-group full-width">
                <label>Alternate Contact Person</label>
                <input
                  type="text"
                  name="alternateContactName"
                  value={formData.alternateContactName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Alternate Contact Phone</label>
                <input
                  type="tel"
                  name="alternateContactPhone"
                  value={formData.alternateContactPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Alternate Contact Email</label>
                <input
                  type="email"
                  name="alternateContactEmail"
                  value={formData.alternateContactEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <h2>Section C: Referral Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Referral Date</label>
                <input
                  type="date"
                  name="referralDate"
                  value={formData.referralDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Program/Service Referring From</label>
                <input
                  type="text"
                  name="referringProgram"
                  value={formData.referringProgram}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Client ID Number</label>
                <input
                  type="text"
                  name="clientIdNumber"
                  value={formData.clientIdNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Length of Service with Agency</label>
                <input
                  type="text"
                  name="lengthOfService"
                  value={formData.lengthOfService}
                  onChange={handleInputChange}
                  placeholder="e.g., 6 months"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Current Program Enrollment Status</label>
                <input
                  type="text"
                  name="programEnrollmentStatus"
                  value={formData.programEnrollmentStatus}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Additional Services Being Provided to Client</label>
                <textarea
                  name="additionalServices"
                  value={formData.additionalServices}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Agency Coordination Plan with ERF3</label>
                <textarea
                  name="agencyCoordination"
                  value={formData.agencyCoordination}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICANT INFO */}
        {currentTab === 1 && (
          <div className="tab-content">
            <h2>Section D: Applicant / Client Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Applicant Full Name</label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="applicantDOB"
                  value={formData.applicantDOB}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>SSN (Last 4 digits)</label>
                <input
                  type="text"
                  name="applicantSSN"
                  value={formData.applicantSSN}
                  onChange={handleInputChange}
                  maxLength="4"
                  pattern="\d{4}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="applicantEmail"
                  value={formData.applicantEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Current Address</label>
                <input
                  type="text"
                  name="applicantAddress"
                  value={formData.applicantAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Household Size</label>
                <input
                  type="number"
                  name="householdSize"
                  value={formData.householdSize}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Children</label>
                <input
                  type="number"
                  name="numberOfChildren"
                  value={formData.numberOfChildren}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <h2>Section E: Summary of Needs</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Please provide detailed explanation of why rental assistance is needed</label>
                <textarea
                  name="summaryOfNeeds"
                  value={formData.summaryOfNeeds}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Include details about current housing situation, financial hardships, barriers to housing, circumstances, and goals for achieving housing stability..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL & PLAN */}
        {currentTab === 2 && (
          <div className="tab-content">
            <h2>Section F: Financial Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Monthly Rent Amount</label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Security Deposit Amount</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Include Security Deposit?</label>
                <select
                  name="includeSecurityDeposit"
                  value={formData.includeSecurityDeposit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Monthly Income</label>
                <input
                  type="number"
                  name="currentIncome"
                  value={formData.currentIncome}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Projected Monthly Income (12 months)</label>
                <input
                  type="number"
                  name="projectedIncome"
                  value={formData.projectedIncome}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Income Source</label>
                <input
                  type="text"
                  name="primaryIncomeSource"
                  value={formData.primaryIncomeSource}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Lease Start Date</label>
                <input
                  type="date"
                  name="leaseStartDate"
                  value={formData.leaseStartDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Lease End Date</label>
                <input
                  type="date"
                  name="leaseEndDate"
                  value={formData.leaseEndDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Rent Due Day of Month</label>
                <input
                  type="text"
                  name="rentDueDay"
                  value={formData.rentDueDay}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <h2>Section G: Step-Down Assistance Plan</h2>
            <p className="info-text">Configure the rental assistance step-down schedule below:</p>

            <div className="phase-table">
              <table>
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>% Assistance</th>
                    <th># of Months</th>
                    <th>Assistance/Month</th>
                    <th>Client Pays/Month</th>
                    <th>Phase Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.phases.map((phase, index) => {
                    const rent = parseFloat(formData.monthlyRent) || 0;
                    const assistancePerMonth = rent * (phase.percentage / 100);
                    const clientPays = rent - assistancePerMonth;
                    const phaseTotal = assistancePerMonth * phase.months;

                    return (
                      <tr key={index}>
                        <td>{phase.name}</td>
                        <td>
                          <input
                            type="number"
                            value={phase.percentage}
                            onChange={(e) => handlePhaseChange(index, 'percentage', e.target.value)}
                            min="0"
                            max="100"
                            className="phase-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={phase.months}
                            onChange={(e) => handlePhaseChange(index, 'months', e.target.value)}
                            min="0"
                            className="phase-input"
                          />
                        </td>
                        <td className="calculated">${assistancePerMonth.toFixed(2)}</td>
                        <td className="calculated">${clientPays.toFixed(2)}</td>
                        <td className="calculated">${phaseTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="totals-summary">
              <div className="total-item">
                <span>Total Months:</span>
                <strong>{totals.totalMonths}</strong>
              </div>
              <div className="total-item">
                <span>Total Rental Assistance:</span>
                <strong>${totals.totalRentalAssistance.toFixed(2)}</strong>
              </div>
              <div className="total-item">
                <span>Security Deposit:</span>
                <strong>${totals.securityAmount.toFixed(2)}</strong>
              </div>
              <div className="total-item highlight">
                <span>TOTAL ASSISTANCE REQUESTED:</span>
                <strong>${totals.totalAssistanceRequested.toFixed(2)}</strong>
              </div>
            </div>

            <h2>Section H: Step-Down Plan Rationale</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Explain how client will achieve financial independence</label>
                <textarea
                  name="stepDownRationale"
                  value={formData.stepDownRationale}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Describe the reasoning behind your step-down plan, milestones, support services, and path to independence..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MONTHLY BREAKDOWN */}
        {currentTab === 3 && (
          <div className="tab-content">
            <h2>Section I: Monthly Payment Breakdown</h2>
            <p className="info-text">Detailed month-by-month payment schedule based on your step-down plan configuration:</p>

            <div className="monthly-breakdown-table">
              <table>
                <thead>
                  <tr>
                    <th>Month #</th>
                    <th>Phase</th>
                    <th>% Assist</th>
                    <th>Rent</th>
                    <th>Assistance</th>
                    <th>Client Pays</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.length > 0 ? (
                    monthlyBreakdown.map((month, index) => (
                      <tr key={index}>
                        <td>{month.month}</td>
                        <td>{month.phase}</td>
                        <td>{month.percentage}%</td>
                        <td>${month.rent.toFixed(2)}</td>
                        <td className="calculated">${month.assistance.toFixed(2)}</td>
                        <td className="calculated">${month.clientPays.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Please complete Tab 3 to see the monthly breakdown
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {monthlyBreakdown.length > 0 && (
              <div className="totals-summary">
                <div className="total-item highlight">
                  <span>Total Assistance (from monthly breakdown):</span>
                  <strong>${monthlyBreakdown.reduce((sum, m) => sum + m.assistance, 0).toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LANDLORD & APPROVAL */}
        {currentTab === 4 && (
          <div className="tab-content">
            <h2>Section J: Landlord / Property Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Landlord/Property Manager Name</label>
                <input
                  type="text"
                  name="landlordName"
                  value={formData.landlordName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Property Management Company</label>
                <input
                  type="text"
                  name="landlordCompany"
                  value={formData.landlordCompany}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Landlord Phone Number</label>
                <input
                  type="tel"
                  name="landlordPhone"
                  value={formData.landlordPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Landlord Email Address</label>
                <input
                  type="email"
                  name="landlordEmail"
                  value={formData.landlordEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Property Address</label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Payment Mailing Address (if different)</label>
                <input
                  type="text"
                  name="paymentAddress"
                  value={formData.paymentAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Tax ID / W-9 on File?</label>
                <select
                  name="w9OnFile"
                  value={formData.w9OnFile}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Landlord Agreement Signed?</label>
                <select
                  name="landlordAgreementSigned"
                  value={formData.landlordAgreementSigned}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <h2>Section K: Review & Submit</h2>
            <div className="review-summary">
              <div className="summary-card">
                <h3>Application Summary</h3>
                <p><strong>Applicant:</strong> {formData.applicantName || 'Not provided'}</p>
                <p><strong>Referring Agency:</strong> {formData.agencyName || 'Not provided'}</p>
                <p><strong>Case Manager:</strong> {formData.caseManagerName || 'Not provided'}</p>
                <p><strong>Monthly Rent:</strong> ${formData.monthlyRent ? parseFloat(formData.monthlyRent).toFixed(2) : '0.00'}</p>
                <p><strong>Total Months:</strong> {totals.totalMonths}</p>
                <p><strong>Total Assistance Requested:</strong> ${totals.totalAssistanceRequested.toFixed(2)}</p>
              </div>
            </div>

            <div className="certification">
              <h3>Certification</h3>
              <p>By submitting this application, I certify that the information provided is true and accurate to the best of my knowledge. I understand that false information may result in denial of assistance or termination of benefits.</p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="form-navigation">
          {currentTab > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentTab(currentTab - 1)}
            >
              ← Previous
            </button>
          )}

          {currentTab < tabs.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentTab(currentTab + 1)}
            >
              Next →
            </button>
          ) : (
            <button type="submit" className="btn btn-success">
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ApplicationForm;
