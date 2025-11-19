const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Data file path - use /tmp in production (Vercel), local data dir in development
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

// Initialize data directory and file
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(APPLICATIONS_FILE);
    } catch {
      await fs.writeFile(APPLICATIONS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Read applications
async function readApplications() {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading applications:', error);
    return [];
  }
}

// Write applications
async function writeApplications(applications) {
  try {
    await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing applications:', error);
    return false;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERF3 API is running' });
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await readApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// Get single application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const applications = await readApplications();
    const application = applications.find(app => app.id === req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve application' });
  }
});

// Create new application
app.post('/api/applications', async (req, res) => {
  try {
    console.log('Received application submission');
    const applications = await readApplications();
    console.log(`Current applications count: ${applications.length}`);

    const newApplication = {
      id: uuidv4(),
      applicationId: `ERF3-${new Date().getFullYear()}-${String(applications.length + 1).padStart(4, '0')}`,
      submittedDate: new Date().toISOString(),
      status: 'pending',
      viewedDate: null,
      reviewedBy: null,
      approvalDate: null,
      denialDate: null,
      notes: [],
      ...req.body
    };

    applications.push(newApplication);
    console.log(`Saving application ${newApplication.applicationId} to ${APPLICATIONS_FILE}`);
    const success = await writeApplications(applications);

    if (success) {
      console.log('Application saved successfully');
      res.status(201).json(newApplication);
    } else {
      console.error('Failed to write applications file');
      res.status(500).json({ error: 'Failed to save application' });
    }
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
});

// Update application status
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const applications = await readApplications();
    const index = applications.findIndex(app => app.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const { status, reviewedBy, notes } = req.body;

    applications[index].status = status;

    if (status === 'viewed' && !applications[index].viewedDate) {
      applications[index].viewedDate = new Date().toISOString();
    }

    if (status === 'approved') {
      applications[index].approvalDate = new Date().toISOString();
      applications[index].reviewedBy = reviewedBy;
    }

    if (status === 'denied') {
      applications[index].denialDate = new Date().toISOString();
      applications[index].reviewedBy = reviewedBy;
    }

    if (notes) {
      applications[index].notes.push({
        date: new Date().toISOString(),
        author: reviewedBy || 'System',
        text: notes
      });
    }

    const success = await writeApplications(applications);

    if (success) {
      res.json(applications[index]);
    } else {
      res.status(500).json({ error: 'Failed to update application' });
    }
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Update entire application
app.put('/api/applications/:id', async (req, res) => {
  try {
    const applications = await readApplications();
    const index = applications.findIndex(app => app.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    applications[index] = {
      ...applications[index],
      ...req.body,
      id: applications[index].id, // Preserve original ID
      updatedDate: new Date().toISOString()
    };

    const success = await writeApplications(applications);

    if (success) {
      res.json(applications[index]);
    } else {
      res.status(500).json({ error: 'Failed to update application' });
    }
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const applications = await readApplications();
    const filteredApplications = applications.filter(app => app.id !== req.params.id);

    if (applications.length === filteredApplications.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const success = await writeApplications(filteredApplications);

    if (success) {
      res.json({ message: 'Application deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete application' });
    }
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Get statistics/summary
app.get('/api/statistics', async (req, res) => {
  try {
    const applications = await readApplications();

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      viewed: applications.filter(a => a.status === 'viewed').length,
      approved: applications.filter(a => a.status === 'approved').length,
      denied: applications.filter(a => a.status === 'denied').length,
      totalRequested: applications.reduce((sum, app) => sum + (app.totalAssistanceRequested || 0), 0),
      totalApproved: applications
        .filter(a => a.status === 'approved')
        .reduce((sum, app) => sum + (app.totalAssistanceRequested || 0), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Initialize and start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  initializeData().then(() => {
    app.listen(PORT, () => {
      console.log(`ERF3 API Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // Initialize data for Vercel
  initializeData();
}

// Export for Vercel serverless
module.exports = app;
