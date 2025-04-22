// src/pages/WorkOrderDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { WorkOrder, Asset } from '../types';

interface WorkOrderDetailPageProps {
    workOrders: WorkOrder[];
    assets: Asset[];
}

// Updated Helper to handle undefined/invalid dates gracefully
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date is valid after parsing
        if (isNaN(date.getTime())) {
            return dateString; // Return original if invalid
        }
        // Adjust formatting as needed (e.g., toLocaleDateString, toLocaleString)
        return date.toLocaleDateString();
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Return original string if any error
    }
};

function WorkOrderDetailPage({ workOrders, assets }: WorkOrderDetailPageProps) {
  const { woId } = useParams<{ woId: string }>();
  const workOrder = workOrders.find(wo => wo.id === woId);
  // Use optional chaining when finding the asset
  const asset = workOrder ? assets.find(a => a.id === workOrder.assetId) : undefined;

  if (!workOrder) {
    return (
      <div className="container">
        <h2>Work Order Not Found</h2>
        <p>Could not find work order with ID: {woId ?? 'Unknown'}</p>
        <Link to="/workorders"><button>Back to Work Orders List</button></Link>
      </div>
    );
  }

  // Helper for displaying text, handling undefined/null and pre-wrapping
  const renderTextField = (label: string, value?: string) => (
     <>
        <p><strong>{label}:</strong></p>
        {value ? (
             <p style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginTop: '-10px' }}>{value}</p>
        ) : (
            <p style={{marginTop: '-10px'}}>N/A</p>
        )}
     </>
  );


  return (
    <div className="detail-view">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
        <h2>WO: {workOrder.title} ({workOrder.id})</h2>
      </div>

      <div className="detail-section">
        <h3>Basic Information</h3>
        <p><strong>Type:</strong> {workOrder.type ?? 'N/A'}</p>
        <p><strong>Status:</strong> {workOrder.status ?? 'N/A'}</p>
        <p><strong>Priority:</strong> {workOrder.priority ?? 'N/A'}</p>
      </div>

      <div className="detail-section">
        <h3>Asset & Location</h3>
         <p>
            <strong>Asset:</strong>
            {asset ? (
                <Link to={`/assets/${asset.id}`}> {asset.name} ({asset.id})</Link>
            ) : (
                ` ${workOrder.assetId} (Asset details not found)`
            )}
        </p>
        <p><strong>Asset Location:</strong> {asset?.location ?? 'N/A'}</p> {/* Use optional chaining */}
        <p><strong>Specific Location Notes:</strong> {workOrder.locationNotes ?? 'N/A'}</p>
      </div>

       <div className="detail-section">
        <h3>Dates & Scheduling</h3>
        <p><strong>Date Reported:</strong> {formatDate(workOrder.dateReported)}</p>
        <p><strong>Reported By:</strong> {workOrder.reportedBy ?? 'N/A'}</p>
        <p><strong>Due Date:</strong> {formatDate(workOrder.dateDue)}</p>
        <p><strong>Scheduled Start:</strong> {formatDate(workOrder.dateScheduledStart)}</p>
        <p><strong>Actual Start:</strong> {formatDate(workOrder.dateActualStart)}</p>
        <p><strong>Actual Completion:</strong> {formatDate(workOrder.dateActualCompletion)}</p>
      </div>

      <div className="detail-section">
        <h3>Assignment & Responsibility</h3>
        <p><strong>Assigned To:</strong> {workOrder.assignedTo ?? 'N/A'}</p>
        <p><strong>Supervisor:</strong> {workOrder.supervisor ?? 'N/A'}</p>
      </div>

       <div className="detail-section">
        <h3>Work Description & Instructions</h3>
        {renderTextField("Problem Description", workOrder.problemDescription)}
        {renderTextField("Scope of Work / Tasks", workOrder.scopeOfWork)}
        <p><strong>Linked Procedures:</strong> {workOrder.linkedProcedureInfo ?? 'N/A'}</p>
        {renderTextField("Safety Instructions", workOrder.safetyInstructions)}
      </div>

      <div className="detail-section">
        <h3>Resource Tracking</h3>
        <p><strong>Estimated Labor Hours:</strong> {workOrder.estimatedHours ?? 'N/A'}</p>
        {renderTextField("Actual Labor Log", workOrder.actualLaborLog)}
        {renderTextField("Planned Parts", workOrder.plannedParts)}
        {renderTextField("Parts Consumed", workOrder.partsConsumed)}
        <p><strong>Tools Required:</strong> {workOrder.toolsRequired ?? 'N/A'}</p>
        {/* Use optional chaining before toFixed */}
        <p><strong>External Costs:</strong> ${workOrder.externalCosts?.toFixed(2) ?? 'N/A'}</p>
      </div>

      <div className="detail-section">
        <h3>Completion Details & Findings</h3>
         {renderTextField("Completion Notes / Summary", workOrder.completionNotes)}
         <p><strong>Problem Code:</strong> {workOrder.failureProblemCode ?? 'N/A'}</p>
         <p><strong>Cause Code:</strong> {workOrder.failureCauseCode ?? 'N/A'}</p>
         <p><strong>Remedy Code:</strong> {workOrder.failureRemedyCode ?? 'N/A'}</p>
         {renderTextField("Meter Readings Taken (During WO)", workOrder.meterReadingsNotes)}
         {renderTextField("Inspection Results", workOrder.inspectionResults)}
         <p><strong>Downtime Logged:</strong> {workOrder.downtimeLogged ?? 'N/A'}</p>
         {/* Explicitly check boolean */}
         <p><strong>Follow-Up Required:</strong> {workOrder.followUpRequired === true ? 'Yes' : 'No'}</p>
      </div>

       <div className="detail-section">
            <h3>Attachments & Signatures</h3>
            {renderTextField("Attachment Notes", workOrder.attachmentNotes)}
             <p><i>(Placeholder for viewing attached files)</i></p>
            {/* Explicitly check boolean */}
            <p><strong>Signature Required:</strong> {workOrder.signatureRequired === true ? 'Yes' : 'No'}</p>
            <p><i>(Placeholder for displaying captured signatures)</i></p>
       </div>

      <div style={{marginTop: '2.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem'}}>
           <Link to="/workorders"><button>Back to Work Orders List</button></Link>
      </div>
    </div>
  );
}

export default WorkOrderDetailPage;