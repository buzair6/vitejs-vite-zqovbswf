// src/pages/WorkOrderForm.tsx
import React, { useState, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrder, Asset, WorkOrderStatus, WorkOrderPriority, WorkOrderType, FailureCode } from '../types';

interface WorkOrderFormProps {
    addWorkOrder: (workOrderData: Omit<WorkOrder, 'id'>) => void;
    assets: Asset[];
    // workOrderToEdit?: WorkOrder; // Add later for editing
}

// Define options arrays conveniently
const workOrderTypeOptions: WorkOrderType[] = ['Reactive', 'Preventive', 'Corrective', 'Inspection', 'Improvement', 'Project', 'Safety', 'Other'];
const workOrderStatusOptions: WorkOrderStatus[] = ['Requested', 'Approved', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Closed', 'Cancelled'];
const workOrderPriorityOptions: WorkOrderPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const failureCodeOptions: FailureCode[] = ['NA', 'Mechanical', 'Electrical', 'Operational', 'Wear', 'Damage', 'Other'];


function WorkOrderForm({ addWorkOrder, assets /*, workOrderToEdit */ }: WorkOrderFormProps) {
  const navigate = useNavigate();

  // --- State for all fields ---
  // Section 1
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkOrderType>('Reactive');
  const [status, setStatus] = useState<WorkOrderStatus>('Requested');
  const [priority, setPriority] = useState<WorkOrderPriority>('Medium');
  // Section 2
  const [assetId, setAssetId] = useState(assets.length > 0 ? assets[0].id : '');
  const [locationNotes, setLocationNotes] = useState('');
  // Section 3
  const [dateReported, setDateReported] = useState(new Date().toISOString().substring(0, 10)); // Default to today's date YYYY-MM-DD
  const [reportedBy, setReportedBy] = useState('');
  const [dateDue, setDateDue] = useState('');
  const [dateScheduledStart, setDateScheduledStart] = useState('');
  const [dateActualStart, setDateActualStart] = useState('');
  const [dateActualCompletion, setDateActualCompletion] = useState('');
  // Section 4
  const [assignedTo, setAssignedTo] = useState('');
  const [supervisor, setSupervisor] = useState('');
  // Section 5
  const [problemDescription, setProblemDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [linkedProcedureInfo, setLinkedProcedureInfo] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');
  // Section 6
  const [estimatedHours, setEstimatedHours] = useState<number | ''>(''); // Use '' for empty number input
  const [actualLaborLog, setActualLaborLog] = useState('');
  const [plannedParts, setPlannedParts] = useState('');
  const [partsConsumed, setPartsConsumed] = useState('');
  const [toolsRequired, setToolsRequired] = useState('');
  const [externalCosts, setExternalCosts] = useState<number | ''>('');
  // Section 7
  const [completionNotes, setCompletionNotes] = useState('');
  const [failureProblemCode, setFailureProblemCode] = useState<FailureCode>('NA');
  const [failureCauseCode, setFailureCauseCode] = useState<FailureCode>('NA');
  const [failureRemedyCode, setFailureRemedyCode] = useState<FailureCode>('NA');
  const [meterReadingsNotes, setMeterReadingsNotes] = useState('');
  const [inspectionResults, setInspectionResults] = useState('');
  const [downtimeLogged, setDowntimeLogged] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  // Section 8
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [attachmentNotes, setAttachmentNotes] = useState('');

  // --- Handle Submit ---
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
     if (!title || !assetId || !problemDescription || !reportedBy || !dateReported) {
       alert('Please fill in required fields: Title, Asset, Problem Description, Reported By, Date Reported.');
       return;
     }

    // Convert potentially empty number strings to numbers or undefined
    const finalEstimatedHours = estimatedHours === '' ? undefined : Number(estimatedHours);
    const finalExternalCosts = externalCosts === '' ? undefined : Number(externalCosts);

    addWorkOrder({
        title, type, status, priority, assetId, locationNotes,
        dateReported, reportedBy, dateDue, dateScheduledStart, dateActualStart, dateActualCompletion,
        assignedTo, supervisor, problemDescription, scopeOfWork, linkedProcedureInfo, safetyInstructions,
        estimatedHours: finalEstimatedHours, actualLaborLog, plannedParts, partsConsumed, toolsRequired, externalCosts: finalExternalCosts,
        completionNotes, failureProblemCode, failureCauseCode, failureRemedyCode, meterReadingsNotes, inspectionResults, downtimeLogged,
        followUpRequired, signatureRequired, attachmentNotes
    });
    navigate('/workorders'); // Redirect after adding
  };

  return (
    <div className="form-container">
      {/* Use a consistent heading (Create or Edit) */}
      <h2>Create New Work Order</h2>
      <form onSubmit={handleSubmit}>

        {/* --- Section 1: Identification & Basic Info --- */}
        <div className="form-section">
            <h3>Identification & Basic Information</h3>
            <div className="form-group">
              <label htmlFor="title">Work Order Title *</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as WorkOrderType)} required>
                 {workOrderTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)} required>
                 {workOrderStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as WorkOrderPriority)} required>
                 {workOrderPriorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
        </div>

        {/* --- Section 2: Asset & Location --- */}
         <div className="form-section">
            <h3>Asset & Location</h3>
            <div className="form-group">
              <label htmlFor="assetId">Asset *</label>
              <select id="assetId" value={assetId} onChange={(e) => setAssetId(e.target.value)} required disabled={assets.length === 0} >
                <option value="" disabled={assetId !== ''}>-- Select an Asset --</option>
                {assets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.name} ({asset.id}) </option> ))}
                {assets.length === 0 && <option disabled>No assets available</option>}
              </select>
            </div>
             <div className="form-group">
              <label htmlFor="locationNotes">Specific Location Notes</label>
              <input type="text" id="locationNotes" value={locationNotes} onChange={(e) => setLocationNotes(e.target.value)} placeholder="e.g., Panel 3B, Underneath Platform" />
            </div>
        </div>

        {/* --- Section 3: Dates & Scheduling --- */}
        <div className="form-section">
            <h3>Dates & Scheduling</h3>
            <div className="form-group">
              <label htmlFor="dateReported">Date Reported *</label>
              <input type="date" id="dateReported" value={dateReported} onChange={(e) => setDateReported(e.target.value)} required />
            </div>
             <div className="form-group">
              <label htmlFor="reportedBy">Reported By *</label>
              <input type="text" id="reportedBy" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="dateDue">Due Date</label>
              <input type="date" id="dateDue" value={dateDue} onChange={(e) => setDateDue(e.target.value)} />
            </div>
            {/* Add other date inputs similarly if needed: dateScheduledStart, dateActualStart, dateActualCompletion */}
        </div>

        {/* --- Section 4: Assignment --- */}
        <div className="form-section">
            <h3>Assignment & Responsibility</h3>
             <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              <input type="text" id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Technician or Team Name/ID"/>
            </div>
             <div className="form-group">
              <label htmlFor="supervisor">Supervisor</label>
              <input type="text" id="supervisor" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
            </div>
        </div>

        {/* --- Section 5: Work Details --- */}
        <div className="form-section">
            <h3>Work Description & Instructions</h3>
            <div className="form-group">
              <label htmlFor="problemDescription">Detailed Problem Description *</label>
              <textarea id="problemDescription" value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} required />
            </div>
             <div className="form-group">
              <label htmlFor="scopeOfWork">Scope of Work / Task List</label>
              <textarea id="scopeOfWork" value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} />
            </div>
             <div className="form-group">
              <label htmlFor="linkedProcedureInfo">Linked Procedure Info (Placeholder)</label>
              <input type="text" id="linkedProcedureInfo" value={linkedProcedureInfo} onChange={(e) => setLinkedProcedureInfo(e.target.value)} placeholder="e.g., SOP-123, Checklist CHK-SAFETY-01"/>
            </div>
             <div className="form-group">
              <label htmlFor="safetyInstructions">Safety Instructions</label>
              <textarea id="safetyInstructions" value={safetyInstructions} onChange={(e) => setSafetyInstructions(e.target.value)} placeholder="e.g., Requires LOTO, Wear PPE XYZ"/>
            </div>
        </div>

         {/* --- Section 6: Resources --- */}
        <div className="form-section">
            <h3>Resource Tracking</h3>
             <div className="form-group">
              <label htmlFor="estimatedHours">Estimated Labor Hours</label>
              <input type="number" id="estimatedHours" value={estimatedHours} min="0" step="0.1" onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : parseFloat(e.target.value))} />
            </div>
             <div className="form-group">
              <label htmlFor="actualLaborLog">Actual Labor Log (Placeholder)</label>
              <textarea id="actualLaborLog" value={actualLaborLog} onChange={(e) => setActualLaborLog(e.target.value)} placeholder="e.g., Tech A: 2.5 hrs, Tech B: 1 hr"/>
            </div>
             <div className="form-group">
              <label htmlFor="plannedParts">Planned Parts (Placeholder)</label>
              <textarea id="plannedParts" value={plannedParts} onChange={(e) => setPlannedParts(e.target.value)} placeholder="e.g., Filter X (1), Belt Y (1)"/>
            </div>
             <div className="form-group">
              <label htmlFor="partsConsumed">Parts Consumed (Placeholder)</label>
              <textarea id="partsConsumed" value={partsConsumed} onChange={(e) => setPartsConsumed(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="toolsRequired">Tools Required</label>
              <input type="text" id="toolsRequired" value={toolsRequired} onChange={(e) => setToolsRequired(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="externalCosts">External Costs ($)</label>
              <input type="number" id="externalCosts" value={externalCosts} min="0" step="0.01" onChange={(e) => setExternalCosts(e.target.value === '' ? '' : parseFloat(e.target.value))} />
            </div>
        </div>

        {/* --- Section 7: Completion --- */}
        <div className="form-section">
            <h3>Completion Details & Findings</h3>
             <div className="form-group">
              <label htmlFor="completionNotes">Completion Notes / Work Summary</label>
              <textarea id="completionNotes" value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)}/>
            </div>
            {/* Simplified Failure Codes */}
             <div className="form-group">
              <label htmlFor="failureProblemCode">Problem Code</label>
               <select id="failureProblemCode" value={failureProblemCode} onChange={(e) => setFailureProblemCode(e.target.value as FailureCode)}>
                 {failureCodeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>
             <div className="form-group">
              <label htmlFor="failureCauseCode">Cause Code</label>
               <select id="failureCauseCode" value={failureCauseCode} onChange={(e) => setFailureCauseCode(e.target.value as FailureCode)}>
                 {failureCodeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>
             <div className="form-group">
              <label htmlFor="failureRemedyCode">Remedy Code</label>
               <select id="failureRemedyCode" value={failureRemedyCode} onChange={(e) => setFailureRemedyCode(e.target.value as FailureCode)}>
                 {failureCodeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>
             <div className="form-group">
              <label htmlFor="meterReadingsNotes">Meter Readings Taken (During WO)</label>
              <textarea id="meterReadingsNotes" value={meterReadingsNotes} onChange={(e) => setMeterReadingsNotes(e.target.value)} placeholder="e.g., Hours: 1602, Temp: 55C"/>
            </div>
             <div className="form-group">
              <label htmlFor="inspectionResults">Inspection Results</label>
              <textarea id="inspectionResults" value={inspectionResults} onChange={(e) => setInspectionResults(e.target.value)} placeholder="e.g., All points passed, Point 3 failed."/>
            </div>
             <div className="form-group">
              <label htmlFor="downtimeLogged">Downtime Logged (Placeholder)</label>
              <input type="text" id="downtimeLogged" value={downtimeLogged} onChange={(e) => setDowntimeLogged(e.target.value)} placeholder="e.g., 1.5 hours, None"/>
            </div>
             <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" id="followUpRequired" checked={followUpRequired} onChange={(e) => setFollowUpRequired(e.target.checked)} style={{width: 'auto', marginRight: '10px'}}/>
              <label htmlFor="followUpRequired" style={{ marginBottom: 0 }}>Follow-Up Action Required?</label>
            </div>
        </div>

        {/* --- Section 8: Attachments/Signatures --- */}
        <div className="form-section">
            <h3>Attachments & Signatures (Placeholders)</h3>
            <div className="form-group">
              <label htmlFor="attachmentNotes">Attachment Notes</label>
              <textarea id="attachmentNotes" value={attachmentNotes} onChange={(e) => setAttachmentNotes(e.target.value)} placeholder="e.g., Photos of damage uploaded, Permit P-5 attached"/>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" id="signatureRequired" checked={signatureRequired} onChange={(e) => setSignatureRequired(e.target.checked)} style={{width: 'auto', marginRight: '10px'}}/>
              <label htmlFor="signatureRequired" style={{ marginBottom: 0 }}>Signature Required Upon Completion?</label>
            </div>
            {/* Actual signature capture would go here */}
            <p><i>(Signature capture area would appear here if required)</i></p>
        </div>

        {/* --- Form Actions --- */}
        <div className="form-actions">
          <button type="submit">Save Work Order</button>
          <button type="button" onClick={() => navigate('/workorders')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default WorkOrderForm;