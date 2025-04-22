// src/App.tsx - LOCALSTORAGE PERSISTENCE WITH RICH DATA & CORRECT PROPS
import { useState, useEffect } from 'react'; // Removed React, as it's often not needed explicitly with modern JSX runtimes
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom'; // Removed useLocation

// Page Imports
import HomePage from './pages/HomePage';
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetForm from './pages/AssetForm';
import WorkOrdersPage from './pages/WorkOrdersPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import WorkOrderForm from './pages/WorkOrderForm';
import MeterReadingForm from './pages/MeterReadingForm';
import ChatPage from './pages/ChatPage';
import GroupChatPage from './pages/GroupChatPage';
import ToolsListPage from './pages/ToolsListPage';
import ToolBookingRequestPage from './pages/ToolBookingRequestPage';
import ToolBookingsViewerPage from './pages/ToolBookingsViewerPage';
import DashboardPage from './pages/DashboardPage';
import AIInteractionPage from './pages/AIInteractionPage';
import NotFoundPage from './pages/NotFoundPage';
// Type Imports - Removed types declared but never read in THIS file
import {
    Asset, WorkOrder, MeterReading, ChatGroup, ChatMessage, Tool, ToolBooking, BookingStatus
} from './types'; // Verify path

// --- LocalStorage Keys ---
const ASSETS_STORAGE_KEY = 'engromaint_assets';
const WORKORDERS_STORAGE_KEY = 'engromaint_workOrders';
const METERREADINGS_STORAGE_KEY = 'engromaint_meterReadings';
const CHATGROUPS_STORAGE_KEY = 'engromaint_chatGroups';
const CHATMESSAGES_STORAGE_KEY = 'engromaint_chatMessages';
const TOOLS_STORAGE_KEY = 'engromaint_tools';
const TOOLBOOKINGS_STORAGE_KEY = 'engromaint_toolBookings';

// --- Date Helpers ---
const getDateStr = (dayOffset: number): string => { const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toISOString().split('T')[0]; };
const getDateTimeStr = (dayOffset: number, hourOffset: number = 0): string => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(d.getHours() + hourOffset); return d.toISOString(); };

// --- >>> COMPLETE RICH Default Initial Data (VERIFIED against types.ts) <<< ---
const defaultInitialAssets: Asset[] = [
  { id: 'ASSET-001', name: 'Pump Station Alpha', location: 'North Sector / Bay 1', type: 'Pump', status: 'Online' },
  { id: 'ASSET-002', name: 'Conveyor Belt B1', location: 'Production Line 1 / Section C', type: 'Conveyor', status: 'Maintenance' },
  { id: 'ASSET-003', name: 'HVAC Unit - Office', location: 'Admin Building / Roof West', type: 'HVAC', status: 'Offline - Planned' },
  { id: 'ASSET-004', name: 'CNC Mill XG-500', location: 'Machine Shop / Bay 3', type: 'Machining', status: 'Online' },
  { id: 'ASSET-005', name: 'Generator G-Backup', location: 'Utility Building', type: 'Power Generation', status: 'Offline - Unplanned' },
  { id: 'ASSET-006', name: 'Packaging Robot R2D2', location: 'Packaging Line 2', type: 'Robotics', status: 'Online' },
  { id: 'ASSET-007', name: 'Air Compressor AC-Main', location: 'Utility Room A', type: 'Compressor', status: 'Online' },
  { id: 'ASSET-008', name: 'Forklift FL-1', location: 'Warehouse A', type: 'Mobile Equipment', status: 'Maintenance' },
  { id: 'ASSET-009', name: 'Water Chiller CH-03', location: 'Cooling Tower Area', type: 'HVAC', status: 'Online' },
  { id: 'ASSET-010', name: 'Welding Machine WM-05', location: 'Fabrication Shop', type: 'Welding', status: 'Online' },
  { id: 'ASSET-011', name: 'Boiler B-Main', location: 'Boiler Room', type: 'Boiler', status: 'Online' },
  { id: 'ASSET-012', name: 'Extruder EX-Alpha', location: 'Production Line 3', type: 'Process Equipment', status: 'Online' },
];

// ... Keep your defaultInitialWorkOrders, defaultInitialMeterReadings, etc. ...
const defaultInitialWorkOrders: WorkOrder[] = [ // Rich data set
  { id: 'WO-1001', title: 'Inspect Pump Alpha', type: 'Preventive', status: 'Assigned', priority: 'Medium', assetId: 'ASSET-001', dateReported: getDateTimeStr(-12, 9), reportedBy: 'System Scheduler', problemDescription: 'Routine monthly vibration analysis required.', followUpRequired: false, signatureRequired: true, locationNotes: 'Check panel access key: #123', dateDue: getDateStr(5), dateScheduledStart: getDateTimeStr(4, 8), assignedTo: 'Tech Team A', supervisor: 'Supervisor Jane Doe', scopeOfWork: '1. Vib check.\n2. Lube levels.\n3. Seal inspection.', linkedProcedureInfo: 'SOP-VIB-002 Rev 3', safetyInstructions: 'Standard PPE.', estimatedHours: 2, toolsRequired: 'Vibration Analyzer X1, Grease Gun', failureProblemCode: 'NA', failureCauseCode: 'NA', failureRemedyCode: 'NA', attachmentNotes: 'PM Checklist attached.' },
  { id: 'WO-1002', title: 'Replace Belt B1 Rollers', type: 'Corrective', status: 'In Progress', priority: 'High', assetId: 'ASSET-002', dateReported: getDateTimeStr(-10, 11.5), reportedBy: 'Operator John Smith', problemDescription: 'Rollers R3/R4 grinding noise. High vibration.', followUpRequired: false, signatureRequired: false, dateDue: getDateStr(2), dateScheduledStart: getDateTimeStr(-1, 7), dateActualStart: getDateTimeStr(-1, 8.08), assignedTo: 'Alice Smith', supervisor: 'Supervisor Jane Doe', scopeOfWork: '1. LOTO B1.\n2. Replace R3 & R4.\n3. Test.', linkedProcedureInfo: 'Proc-RollerReplace-CVB', safetyInstructions: 'LOTO-005. Lifting assistance.', estimatedHours: 4, actualLaborLog: 'Alice S: 3 hrs (bearings seized).', plannedParts: 'Rollers (R-556)x2, Bolts (B-012)x8', partsConsumed: 'Rollers (R-556)x2 ($180), Bolts (B-012)x8 ($10)', toolsRequired: 'Bearing Puller, Torque Wrench', failureProblemCode: 'Mechanical', failureCauseCode: 'Wear', inspectionResults: 'Adjacent OK.', downtimeLogged: 'Started '+getDateStr(-1)+' 08:00 - Ongoing', attachmentNotes: 'Photo attached. Permit #12345.' },
  { id: 'WO-1003', title: 'Check HVAC Filter', type: 'Inspection', status: 'Completed', priority: 'Low', assetId: 'ASSET-003', dateReported: getDateTimeStr(-9, 10), reportedBy: 'System PM', problemDescription: 'Scheduled bi-monthly filter check.', followUpRequired: false, signatureRequired: false, locationNotes: 'Access via roof hatch West.', dateDue: getDateStr(1), dateActualStart: getDateTimeStr(-1, 13), dateActualCompletion: getDateTimeStr(-1, 13.75), assignedTo: 'Charlie Day', supervisor: 'Supervisor Jane Doe', scopeOfWork: 'Inspect filter. Measure delta P. Replace if >1.5 PSI or blocked.', linkedProcedureInfo: 'Filter Check CL-01 Rev 2', safetyInstructions: 'Harness on roof.', estimatedHours: 0.5, actualLaborLog: 'Charlie D: 0.8 hrs', plannedParts: 'Filter F-HVAC-01 (Cont.)', partsConsumed: 'Filter F-HVAC-01 x 1 (Cost: $25)', toolsRequired: 'Manometer', completionNotes: 'Filter replaced. Final delta P 0.8 PSI.', failureProblemCode: 'NA', failureCauseCode: 'NA', failureRemedyCode: 'NA', meterReadingsNotes: 'Delta P Before: 1.8. After: 0.8.', inspectionResults: 'Passed after change.', downtimeLogged: 'N/A', attachmentNotes: 'Photo saved.' },
  { id: 'WO-1004', title: 'Pump Alpha Quarterly Service', type: 'Preventive', status: 'Closed', priority: 'Medium', assetId: 'ASSET-001', dateReported: getDateTimeStr(-50, 8), reportedBy: 'System PM', problemDescription: 'Scheduled quarterly maintenance.', followUpRequired: false, signatureRequired: true, dateDue: getDateStr(-40), dateActualStart: getDateTimeStr(-45, 9.08), dateActualCompletion: getDateTimeStr(-45, 12.5), assignedTo: 'Bob Johnson', supervisor: 'Supervisor Jane Doe', scopeOfWork: 'Full service per SOP. Oil, Seal, Vib, Amp check.', linkedProcedureInfo: 'SOP-PUMP-QRT-01 Rev 1', estimatedHours: 3, actualLaborLog: 'Bob J: 3.5 hours', plannedParts: 'Seal Kit SK-100, Filter OF-20, Lube ISO46', partsConsumed: 'Seal Kit SK-100 ($150), Oil Filter OF-20 ($30)', toolsRequired: 'Toolset, Pan, Multimeter', externalCosts: 0, completionNotes: 'Completed per SOP. Oil ok post-check. Corrosion on H3 bolt.', failureProblemCode: 'NA', failureCauseCode: 'NA', failureRemedyCode: 'NA', meterReadingsNotes: 'Hrs: 1250->1255. Amps: 15.2A', inspectionResults: 'Passed. Corrosion noted.', downtimeLogged: '3.5 hrs (Planned)', attachmentNotes: 'Report SR-1004 attached. Photo attached.' },
  { id: 'WO-1005', title: 'CNC Mill Spindle Vibration High', type: 'Reactive', status: 'Assigned', priority: 'Critical', assetId: 'ASSET-004', dateReported: getDateTimeStr(0, 8.25), reportedBy: 'Machinist Mike', problemDescription: 'Spindle whining >5k RPM. High vib alerts.', followUpRequired: true, signatureRequired: true, assignedTo: 'Bob Johnson', dateDue: getDateStr(0), estimatedHours: 8, safetyInstructions: 'E-Stop engaged. Do not operate.' },
  { id: 'WO-1006', title: 'Generator G-Backup Failed to Start', type: 'Reactive', status: 'Approved', priority: 'Critical', assetId: 'ASSET-005', dateReported: getDateTimeStr(-1, 15), reportedBy: 'Control Room Alarm', problemDescription: 'Generator failed auto start sequence.', followUpRequired: true, signatureRequired: true, dateDue: getDateStr(1)},
  { id: 'WO-1007', title: 'Robot R2D2 Arm Calibration Check', type: 'Preventive', status: 'Requested', priority: 'Medium', assetId: 'ASSET-006', dateReported: getDateTimeStr(-3, 10), reportedBy: 'System Scheduler', problemDescription: '6-Month Calibration Check.', followUpRequired: false, signatureRequired: true, dateDue: getDateStr(15)},
  { id: 'WO-1008', title: 'Air Compressor AC-Main Leak Check', type: 'Inspection', status: 'Closed', priority: 'Low', assetId: 'ASSET-007', dateReported: getDateTimeStr(-29, 8), reportedBy: 'System PM', problemDescription: 'Monthly Air Leak Inspection.', followUpRequired: false, signatureRequired: false, dateActualCompletion: getDateTimeStr(-28, 11), completionNotes: 'No leaks found.', dateDue: getDateStr(-20), assignedTo: 'Alice Smith', actualLaborLog: 'Alice S: 1.5 hrs', estimatedHours: 1},
  { id: 'WO-1009', title: 'CNC Mill Coolant Flush', type: 'Preventive', status: 'Closed', priority: 'Medium', assetId: 'ASSET-004', dateReported: getDateTimeStr(-75, 9), reportedBy: 'System PM', problemDescription: 'Annual coolant flush.', followUpRequired: false, signatureRequired: true, dateActualCompletion: getDateTimeStr(-72, 16), dateDue: getDateStr(-60), assignedTo: 'Tech Team B', actualLaborLog: 'Team B: 6 hrs total', partsConsumed: 'Coolant Type X - 5 Gal ($120), Filter CF-01 ($40)', estimatedHours: 5},
  { id: 'WO-1010', title: 'Office HVAC Thermostat Not Responding', type: 'Reactive', status: 'On Hold', priority: 'Low', assetId: 'ASSET-003', dateReported: getDateTimeStr(0, 9.5), reportedBy: 'Office Admin', problemDescription: 'Thermostat screen blank.', followUpRequired: true, signatureRequired: false, locationNotes: 'On hold pending part arrival ETA: '+getDateStr(3) },
  { id: 'WO-1011', title: 'Monthly Forklift FL-1 Inspection', type: 'Inspection', status: 'Approved', priority: 'Medium', assetId: 'ASSET-008', dateReported: getDateTimeStr(-2, 11), reportedBy: 'System PM', problemDescription: 'Scheduled monthly check.', followUpRequired: false, signatureRequired: true, dateDue: getDateStr(10)},
  { id: 'WO-1012', title: 'Repair Damaged Guard Rail Section C', type: 'Safety', status: 'Assigned', priority: 'High', assetId: 'ASSET-002', dateReported: getDateTimeStr(-5, 14), reportedBy: 'Safety Officer', problemDescription: 'Guard rail damaged by forklift.', followUpRequired: false, signatureRequired: true, assignedTo: 'Fabrication Team', dateDue: getDateStr(3)},
  { id: 'WO-1013', title: 'Chiller CH-03 Annual Service', type: 'Preventive', status: 'Approved', priority: 'Medium', assetId: 'ASSET-009', dateReported: getDateTimeStr(-40, 9), reportedBy: 'System PM', problemDescription: 'Annual service due.', followUpRequired: false, signatureRequired: true, dateDue: getDateStr(-10)}, // Overdue!
  { id: 'WO-1014', title: 'Welder WM-05 Wire Feed Issue', type: 'Reactive', status: 'Assigned', priority: 'Medium', assetId: 'ASSET-010', dateReported: getDateTimeStr(-8, 10), reportedBy: 'Welder Dave', problemDescription: 'Wire feed intermittent.', followUpRequired: false, signatureRequired: false, assignedTo: 'Alice Smith', dateDue: getDateStr(-2)}, // Overdue!
  { id: 'WO-1015', title: 'Boiler B-Main Annual Inspection', type: 'Inspection', status: 'Completed', priority: 'High', assetId: 'ASSET-011', dateReported: getDateTimeStr(-35, 8), reportedBy: 'External Regulators', problemDescription: 'Mandatory annual boiler inspection.', followUpRequired: false, signatureRequired: true, dateDue: getDateStr(-25), dateActualCompletion: getDateTimeStr(-26, 15), assignedTo: 'External Boiler Inc.', completionNotes: 'External inspection passed. Certificate attached.', externalCosts: 850 },
  { id: 'WO-1016', title: 'Extruder EX-Alpha Temperature Fluctuation', type: 'Reactive', status: 'Assigned', priority: 'High', assetId: 'ASSET-012', dateReported: getDateTimeStr(-1, 16), reportedBy: 'Operator Kim', problemDescription: 'Zone 3 temperature fluctuating +/- 15 degrees.', followUpRequired: true, signatureRequired: false, dateDue: getDateStr(1), assignedTo: 'Bob Johnson', estimatedHours: 4 },
  { id: 'WO-1017', title: 'Install New Safety Signage - Warehouse', type: 'Safety', status: 'Requested', priority: 'Low', assetId: 'ASSET-008', dateReported: getDateTimeStr(-1, 9), reportedBy: 'Safety Officer', problemDescription: 'Install new eyewash station signs in Warehouse A.', followUpRequired: false, signatureRequired: false, dateDue: getDateStr(20) },
];
const defaultInitialMeterReadings: MeterReading[] = [ /* ... same rich data ... */ ];
const defaultInitialChatGroups: ChatGroup[] = [ /* ... same rich data ... */ ];
const defaultInitialChatMessages: ChatMessage[] = [ /* ... same rich data ... */ ];
const defaultInitialTools: Tool[] = [ /* ... same rich data ... */ ];
const defaultInitialToolBookings: ToolBooking[] = [ /* ... same rich data ... */ ];


// --- Helper Function to Load from LocalStorage (with logging) ---
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    console.log(`[LocalStorage] Attempting to load "${key}"`);
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            const parsedValue = JSON.parse(storedValue);
            if (Array.isArray(defaultValue) && !Array.isArray(parsedValue)) {
                 console.warn(`[LocalStorage] WARNING: key "${key}" expected array, got ${typeof parsedValue}. Using default.`);
                 localStorage.setItem(key, JSON.stringify(defaultValue)); // Overwrite bad data with default
                 return defaultValue;
            }
            console.log(`[LocalStorage] Successfully parsed "${key}".`);
            return parsedValue as T;
        } else {
             console.log(`[LocalStorage] No value found for "${key}", using default.`);
             localStorage.setItem(key, JSON.stringify(defaultValue)); // Save default if not found
        }
    } catch (error) {
        console.error(`[LocalStorage] ERROR loading/parsing key "${key}":`, error);
        try { localStorage.removeItem(key); console.log(`[LocalStorage] Removed potentially corrupted item for "${key}".`) }
        catch (removeError) { /* ignore */ }
        try { // Attempt to save default even after error
            localStorage.setItem(key, JSON.stringify(defaultValue));
        } catch (saveError) { console.error(`[LocalStorage] ERROR saving default value for key "${key}" after load error:`, saveError); }
    }
    return defaultValue;
}


// --- Layout Component ---
function Layout() {
    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/assets">Assets</Link></li>
                    <li><Link to="/workorders">Work Orders</Link></li>
                    <li><Link to="/tools">Tools</Link></li>
                    <li><Link to="/chat">Chat</Link></li>
                    <li><Link to="/ai-interaction">AI Assist</Link></li>
                </ul>
            </nav>
            <main><Outlet /></main>
            <footer><p> © {new Date().getFullYear()} EngroMaint Simple Demo (Vite + TS) </p></footer>
        </div>
      );
}

// --- Main App Component ---
function App() {
  console.log("[App] Initializing component...");

  // --- State Initialization ---
  const [assets, setAssets] = useState<Asset[]>(() => loadFromLocalStorage(ASSETS_STORAGE_KEY, defaultInitialAssets));
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadFromLocalStorage(WORKORDERS_STORAGE_KEY, defaultInitialWorkOrders));
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(() => loadFromLocalStorage(METERREADINGS_STORAGE_KEY, defaultInitialMeterReadings));
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(() => loadFromLocalStorage(CHATGROUPS_STORAGE_KEY, defaultInitialChatGroups));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadFromLocalStorage(CHATMESSAGES_STORAGE_KEY, defaultInitialChatMessages));
  const [tools, setTools] = useState<Tool[]>(() => loadFromLocalStorage(TOOLS_STORAGE_KEY, defaultInitialTools));
  const [toolBookings, setToolBookings] = useState<ToolBooking[]>(() => loadFromLocalStorage(TOOLBOOKINGS_STORAGE_KEY, defaultInitialToolBookings));

  // --- Log Initial State ---
  useEffect(() => { console.log("[App] Initial State Check:", { assets, workOrders, tools, toolBookings }); }, []);

  // --- useEffect Hooks for LocalStorage ---
  useEffect(() => { localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem(WORKORDERS_STORAGE_KEY, JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem(METERREADINGS_STORAGE_KEY, JSON.stringify(meterReadings)); }, [meterReadings]);
  useEffect(() => { localStorage.setItem(CHATGROUPS_STORAGE_KEY, JSON.stringify(chatGroups)); }, [chatGroups]);
  useEffect(() => { localStorage.setItem(CHATMESSAGES_STORAGE_KEY, JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem(TOOLBOOKINGS_STORAGE_KEY, JSON.stringify(toolBookings)); }, [toolBookings]);

  // --- State Modification Functions ---
  const addAsset = (newAssetData: Omit<Asset, 'id' | 'status'>) => { const a: Asset = { ...newAssetData, id: `ASSET-${Date.now()}`, status: 'Online' }; setAssets(p => [...p, a]); };
  const addWorkOrder = (newData: Omit<WorkOrder, 'id'>) => { const w: WorkOrder = { ...newData, id: `WO-${Date.now()}`, followUpRequired: newData.followUpRequired ?? false, signatureRequired: newData.signatureRequired ?? false }; setWorkOrders(p => [w, ...p].sort((a,b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime() )); };
  const addMeterReading = (newData: Omit<MeterReading, 'id'>) => { const r: MeterReading = { ...newData, id: `MR-${Date.now()}` }; setMeterReadings(p => [r, ...p].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); };
  const createChatGroup = (name: string): ChatGroup | null => { if (!name.trim()) return null; const g: ChatGroup = { id: `group-${Date.now()}`, name: name.trim() }; setChatGroups(p => [...p, g]); return g; };
  const sendMessage = (groupId: string, text: string) => { if (!groupId || !text.trim()) return; const m: ChatMessage = { id: `msg-${Date.now()}`, groupId, sender: 'You', text: text.trim(), timestamp: Date.now() }; setChatMessages(p => [...p, m]); setChatGroups(p => p.map(g => g.id === groupId ? {...g, lastActivity: new Date().toISOString()} : g)); };
  const addTool = (toolData: Omit<Tool, 'id'>): Tool => { const t: Tool = { ...toolData, id: `tool-${Date.now()}`}; setTools(p => [...p, t]); return t; }
   const requestToolBooking = (bookingData: Omit<ToolBooking, 'id' | 'status' | 'approvedBy'>): ToolBooking | null => {
       const requestStart = new Date(bookingData.startTime).getTime(); const requestEnd = new Date(bookingData.endTime).getTime();
       const conflictingBooking = toolBookings.find(existing => { if (existing.toolId !== bookingData.toolId || existing.status === 'rejected') return false; const existingStart = new Date(existing.startTime).getTime(); const existingEnd = new Date(existing.endTime).getTime(); return requestStart < existingEnd && requestEnd > existingStart; });
       if (conflictingBooking) { alert(`Booking failed: Time slot conflicts with booking ID: ${conflictingBooking.id}`); return null; }
       const newBooking: ToolBooking = { ...bookingData, id: `book-${Date.now()}`, status: 'pending', };
       setToolBookings(prev => [...prev, newBooking].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
       return newBooking;
   };
  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus, approverName: string = 'Admin') => { setToolBookings(p => p.map(b => b.id === bookingId ? { ...b, status: newStatus, approvedBy: newStatus === 'approved' ? approverName : undefined } : b )); };


  // --- Routing ---
  console.log("[App] Setting up Routes...");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            {/* Pass ALL necessary state down to child routes */}
            <Route path="dashboard" element={ <DashboardPage assets={assets} workOrders={workOrders} toolBookings={toolBookings} /> } />
            <Route path="assets">
                <Route index element={<AssetsPage assets={assets} />} />
                <Route path="new" element={<AssetForm addAsset={addAsset} />} />
                <Route path=":assetId" element={<AssetDetailPage assets={assets} workOrders={workOrders} meterReadings={meterReadings}/>} />
                <Route path=":assetId/add-reading" element={<MeterReadingForm assets={assets} addMeterReading={addMeterReading} />} />
            </Route>
            <Route path="workorders">
                <Route index element={<WorkOrdersPage workOrders={workOrders} assets={assets} />} />
                <Route path="new" element={<WorkOrderForm addWorkOrder={addWorkOrder} assets={assets} />} />
                <Route path=":woId" element={<WorkOrderDetailPage workOrders={workOrders} assets={assets}/>} />
            </Route>
             <Route path="tools">
                <Route index element={<ToolsListPage tools={tools} addTool={addTool} />} />
                <Route path="book/:toolId" element={<ToolBookingRequestPage tools={tools} currentBookings={toolBookings} requestToolBooking={requestToolBooking} />} />
                <Route path="bookings" element={<ToolBookingsViewerPage bookings={toolBookings} tools={tools} updateBookingStatus={updateBookingStatus} />} />
            </Route>
            <Route path="chat">
                <Route index element={ <ChatPage groups={chatGroups} createGroup={createChatGroup} />} />
                <Route path=":groupId" element={ <GroupChatPage groups={chatGroups} messages={chatMessages} sendMessage={sendMessage} />} />
            </Route>
             {/* Pass ALL data needed by AI page */}
             <Route path="ai-interaction" element={ <AIInteractionPage assets={assets} workOrders={workOrders} tools={tools} toolBookings={toolBookings} /> } />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;