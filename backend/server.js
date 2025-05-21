const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Added
const sqlite3 = require('sqlite3').verbose(); // Added sqlite3

const app = express();
const PORT = process.env.PORT || 3001;

// Database Setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => { // Use db.serialize to ensure sequential execution
      // Assets Table
      db.run(`CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
      location TEXT,
      type TEXT,
      status TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating assets table', err.message);
      } else {
        // Optional: Seed initial data if table is newly created or empty
        const initialAssets = [
          { id: 'ASSET-001', name: 'Pump Station Alpha', location: 'North Sector / Bay 1', type: 'Pump', status: 'Online' },
          { id: 'ASSET-002', name: 'Conveyor Belt B1', location: 'Production Line 1 / Section C', type: 'Conveyor', status: 'Maintenance' },
          { id: 'ASSET-003', name: 'HVAC Unit - Office', location: 'Admin Building / Roof West', type: 'HVAC', status: 'Offline - Planned' }
        ];
        const stmt = db.prepare("INSERT OR IGNORE INTO assets (id, name, location, type, status) VALUES (?, ?, ?, ?, ?)");
        initialAssets.forEach(asset => {
          stmt.run(asset.id, asset.name, asset.location, asset.type, asset.status);
        });
        stmt.finalize();
          console.log('Assets table checked/created and seeded.');
        }
      });

      // Workorders Table
      db.run(`CREATE TABLE IF NOT EXISTS workorders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        assetId TEXT NOT NULL,
        dateReported TEXT NOT NULL,
        reportedBy TEXT NOT NULL,
        problemDescription TEXT NOT NULL,
        followUpRequired INTEGER NOT NULL,
        signatureRequired INTEGER NOT NULL,
        locationNotes TEXT,
        dateDue TEXT,
        dateScheduledStart TEXT,
        dateActualStart TEXT,
        dateActualCompletion TEXT,
        assignedTo TEXT,
        supervisor TEXT,
        scopeOfWork TEXT,
        linkedProcedureInfo TEXT,
        safetyInstructions TEXT,
        estimatedHours REAL,
        actualLaborLog TEXT,
        plannedParts TEXT,
        partsConsumed TEXT,
        toolsRequired TEXT,
        externalCosts REAL,
        completionNotes TEXT,
        failureProblemCode TEXT,
        failureCauseCode TEXT,
        failureRemedyCode TEXT,
        meterReadingsNotes TEXT,
        inspectionResults TEXT,
        downtimeLogged TEXT,
        attachmentNotes TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating workorders table', err.message);
        } else {
          console.log('Workorders table checked/created.');
          // Seed initial work orders (simplified example)
          const initialWorkOrders = [
            { id: 'WO-1001', title: 'Inspect Pump Alpha', type: 'Preventive', status: 'Assigned', priority: 'Medium', assetId: 'ASSET-001', dateReported: new Date().toISOString(), reportedBy: 'System Scheduler', problemDescription: 'Routine monthly vibration analysis required.', followUpRequired: 0, signatureRequired: 1, dateDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), estimatedHours: 2.0 },
            { id: 'WO-1002', title: 'Replace Belt B1 Rollers', type: 'Corrective', status: 'In Progress', priority: 'High', assetId: 'ASSET-002', dateReported: new Date().toISOString(), reportedBy: 'Operator John Smith', problemDescription: 'Rollers R3/R4 grinding noise.', followUpRequired: 0, signatureRequired: 0, dateDue: null, estimatedHours: 4.0 }
          ];
          // Ensure all columns for the seed data are included in the INSERT statement
          const stmt = db.prepare("INSERT OR IGNORE INTO workorders (id, title, type, status, priority, assetId, dateReported, reportedBy, problemDescription, followUpRequired, signatureRequired, dateDue, estimatedHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
          initialWorkOrders.forEach(wo => {
            stmt.run(wo.id, wo.title, wo.type, wo.status, wo.priority, wo.assetId, wo.dateReported, wo.reportedBy, wo.problemDescription, wo.followUpRequired, wo.signatureRequired, wo.dateDue, wo.estimatedHours);
          });
          stmt.finalize(err => {
            if (err) console.error('Error finalizing WO seed stmt:', err.message);
            else console.log('Workorders table seeded with initial data.');
          });
        }
      });

      // Tools Table
      db.run(`CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating tools table', err.message);
        } else {
          console.log('Tools table checked/created.');
          // Seed initial tools (simplified example)
          const initialTools = [
            { id: 'tool-001', name: 'Hammer Drill HD-500', description: 'Heavy duty hammer drill', category: 'Power Tools' },
            { id: 'tool-002', name: 'Wrench Set Metric', description: 'Set of 20 metric wrenches', category: 'Hand Tools' },
            { id: 'tool-003', name: 'Vibration Analyzer VA-X1', description: 'For predictive maintenance', category: 'Testing Equipment' }
          ];
          const stmt = db.prepare("INSERT OR IGNORE INTO tools (id, name, description, category) VALUES (?, ?, ?, ?)");
          initialTools.forEach(tool => {
            stmt.run(tool.id, tool.name, tool.description, tool.category);
          });
          stmt.finalize(err => {
            if (err) console.error('Error finalizing Tool seed stmt:', err.message);
            else console.log('Tools table seeded with initial data.');
          });
        }
      });

      // Toolbookings Table
      db.run(`CREATE TABLE IF NOT EXISTS toolbookings (
        id TEXT PRIMARY KEY,
        toolId TEXT NOT NULL,
        requestedBy TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        status TEXT NOT NULL,
        approvedBy TEXT,
        notes TEXT,
        FOREIGN KEY (toolId) REFERENCES tools(id)
      )`, (err) => {
        if (err) {
          console.error('Error creating toolbookings table', err.message);
        } else {
          console.log('Toolbookings table checked/created.');
          // Seed initial tool bookings (simplified example)
          const initialBookings = [
            { id: 'book-001', toolId: 'tool-001', requestedBy: 'User A', startTime: new Date(Date.now() + 24*3600*1000).toISOString(), endTime: new Date(Date.now() + 26*3600*1000).toISOString(), status: 'pending', notes: 'Need for Project X', approvedBy: null },
            { id: 'book-002', toolId: 'tool-002', requestedBy: 'User B', startTime: new Date(Date.now() + 48*3600*1000).toISOString(), endTime: new Date(Date.now() + 50*3600*1000).toISOString(), status: 'approved', approvedBy: 'Admin', notes: 'Urgent repair' }
          ];
          const stmt = db.prepare("INSERT OR IGNORE INTO toolbookings (id, toolId, requestedBy, startTime, endTime, status, approvedBy, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
          initialBookings.forEach(b => {
            stmt.run(b.id, b.toolId, b.requestedBy, b.startTime, b.endTime, b.status, b.approvedBy, b.notes);
          });
          stmt.finalize(err => {
            if (err) console.error('Error finalizing ToolBooking seed stmt:', err.message);
            else console.log('Toolbookings table seeded with initial data.');
          });
        }
      });
    }); // End of db.serialize
  }
});

// let serverAssets = [...]; // Removed in-memory array

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// API ROUTES //

// GET all assets
app.get('/api/assets', (req, res) => {
  db.all("SELECT * FROM assets", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new asset
app.post('/api/assets', (req, res) => {
  const { name, location, type } = req.body;
  if (!name || !location || !type) {
    return res.status(400).json({ message: 'Missing required fields: name, location, type' });
  }
  const newAsset = {
    id: `ASSET-${Date.now()}`, // Keep existing ID generation for now
    name,
    location,
    type,
    status: 'Online' // Default status
  };
  const stmt = db.prepare("INSERT INTO assets (id, name, location, type, status) VALUES (?, ?, ?, ?, ?)");
  stmt.run(newAsset.id, newAsset.name, newAsset.location, newAsset.type, newAsset.status, function(err) { // Use function for this.lastID, this.changes
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(newAsset); // Return the newAsset object as before
  });
  stmt.finalize();
});

// GET all workorders
app.get('/api/workorders', (req, res) => {
  db.all("SELECT * FROM workorders ORDER BY dateReported DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert boolean fields back to boolean for the client
    const workOrders = rows.map(wo => ({
      ...wo,
      followUpRequired: !!wo.followUpRequired,
      signatureRequired: !!wo.signatureRequired
    }));
    res.json(workOrders);
  });
});

// POST a new workorder
app.post('/api/workorders', (req, res) => {
  const {
    title, type, status, priority, assetId, dateReported, reportedBy, problemDescription,
    followUpRequired, signatureRequired, locationNotes, dateDue, dateScheduledStart,
    dateActualStart, dateActualCompletion, assignedTo, supervisor, scopeOfWork,
    linkedProcedureInfo, safetyInstructions, estimatedHours, actualLaborLog,
    plannedParts, partsConsumed, toolsRequired, externalCosts, completionNotes,
    failureProblemCode, failureCauseCode, failureRemedyCode, meterReadingsNotes,
    inspectionResults, downtimeLogged, attachmentNotes
  } = req.body;

  // Basic validation for required fields
  if (!title || !type || !status || !priority || !assetId || !dateReported || !reportedBy || !problemDescription || typeof followUpRequired === 'undefined' || typeof signatureRequired === 'undefined') {
    return res.status(400).json({ message: 'Missing one or more required fields.' });
  }

  const newWorkOrder = {
    id: `WO-${Date.now()}`,
    title, type, status, priority, assetId, dateReported, reportedBy, problemDescription,
    followUpRequired: followUpRequired ? 1 : 0, // Convert boolean to integer for SQLite
    signatureRequired: signatureRequired ? 1 : 0, // Convert boolean to integer for SQLite
    locationNotes, dateDue, dateScheduledStart, dateActualStart, dateActualCompletion,
    assignedTo, supervisor, scopeOfWork, linkedProcedureInfo, safetyInstructions,
    estimatedHours, actualLaborLog, plannedParts, partsConsumed, toolsRequired,
    externalCosts, completionNotes, failureProblemCode, failureCauseCode,
    failureRemedyCode, meterReadingsNotes, inspectionResults, downtimeLogged, attachmentNotes
  };

  // Construct the SQL query and parameters array carefully based on fields provided
  const fields = ['id'];
  const params = [newWorkOrder.id];
  
  // Iterate over all keys in newWorkOrder (except 'id') to build fields and params
  for (const [key, value] of Object.entries(newWorkOrder)) {
    if (key === 'id') continue; // Skip id as it's already added
    if (typeof value !== 'undefined') {
      fields.push(key);
      // Ensure booleans are converted to 0 or 1; other values pushed directly
      if (key === 'followUpRequired' || key === 'signatureRequired') {
        params.push(value ? 1 : 0);
      } else {
        params.push(value);
      }
    }
  }
      
  const placeholders = fields.map(() => '?').join(',');
  const sql = `INSERT INTO workorders (${fields.join(',')}) VALUES (${placeholders})`;

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message, sql: sql, params: params }); // include SQL for debugging
      return;
    }
    // Convert boolean fields back to boolean for client in the response
    const responseWorkOrder = {
        ...newWorkOrder,
        followUpRequired: !!newWorkOrder.followUpRequired,
        signatureRequired: !!newWorkOrder.signatureRequired
    };
    res.status(201).json(responseWorkOrder);
  });
});

// GET all tools
app.get('/api/tools', (req, res) => {
  db.all("SELECT * FROM tools ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new tool
app.post('/api/tools', (req, res) => {
  const { name, description, category } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Missing required field: name' });
  }

  const newTool = {
    id: `tool-${Date.now()}`,
    name,
    description,
    category
  };

  const fields = ['id', 'name'];
  const params = [newTool.id, newTool.name];

  if (typeof description !== 'undefined') {
    fields.push('description');
    params.push(description);
  }
  if (typeof category !== 'undefined') {
    fields.push('category');
    params.push(category);
  }
  
  const placeholders = fields.map(() => '?').join(',');
  const sql = `INSERT INTO tools (${fields.join(',')}) VALUES (${placeholders})`;

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message, sql: sql, params: params });
      return;
    }
    res.status(201).json(newTool);
  });
});

// GET all toolbookings
app.get('/api/toolbookings', (req, res) => {
  db.all("SELECT * FROM toolbookings ORDER BY startTime ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new toolbooking
app.post('/api/toolbookings', (req, res) => {
  const { toolId, requestedBy, startTime, endTime, notes } = req.body;

  if (!toolId || !requestedBy || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields: toolId, requestedBy, startTime, endTime' });
  }
  
  const newBooking = {
    id: `book-${Date.now()}`,
    toolId,
    requestedBy,
    startTime,
    endTime,
    status: 'pending', // Default status
    notes,
    approvedBy: null // Will be set on approval
  };

  const sql = `INSERT INTO toolbookings (id, toolId, requestedBy, startTime, endTime, status, notes, approvedBy)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [newBooking.id, newBooking.toolId, newBooking.requestedBy, newBooking.startTime, newBooking.endTime, newBooking.status, newBooking.notes, newBooking.approvedBy];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(newBooking);
  });
});

// PUT update toolbooking status
app.put('/api/toolbookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, approvedBy } = req.body; // approvedBy is optional, only relevant for 'approved' status

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided. Must be one of: pending, approved, rejected.' });
  }

  let sql;
  let params;

  if (status === 'approved') {
    if (!approvedBy) {
      return res.status(400).json({ message: 'approvedBy is required when status is approved.'});
    }
    sql = "UPDATE toolbookings SET status = ?, approvedBy = ? WHERE id = ?";
    params = [status, approvedBy, id];
  } else { // For 'pending' or 'rejected'
    sql = "UPDATE toolbookings SET status = ?, approvedBy = NULL WHERE id = ?"; // Clear approvedBy if not approved
    params = [status, id];
  }
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    // Fetch and return the updated booking
    db.get("SELECT * FROM toolbookings WHERE id = ?", [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials (for now)
  const validUsername = "Uzair Bhatti";
  const validPassword = "Pakistan";

  if (username === validUsername && password === validPassword) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Remember to build the React app (e.g., `npm run build` or `vite build` in the root project directory) and ensure the output is in the `dist` folder.');
});
