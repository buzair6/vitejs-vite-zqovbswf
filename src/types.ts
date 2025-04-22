// src/types.ts - VERIFIED VERSION

// --- Asset Types ---
export type AssetStatus = 'Online' | 'Offline - Planned' | 'Offline - Unplanned' | 'Maintenance';
export interface Asset {
    id: string;
    name: string;
    location: string;
    type: string;
    status: AssetStatus;
}

// --- Work Order Types ---
export type WorkOrderType = 'Reactive' | 'Preventive' | 'Corrective' | 'Inspection' | 'Improvement' | 'Project' | 'Safety' | 'Other';
export type WorkOrderStatus = 'Requested' | 'Approved' | 'Assigned' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed' | 'Cancelled';
export type WorkOrderPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type FailureCode = 'NA' | 'Mechanical' | 'Electrical' | 'Operational' | 'Wear' | 'Damage' | 'Other';

export interface WorkOrder {
  // --- Required Fields ---
  id: string;                   // Non-optional String
  title: string;                // Non-optional String
  type: WorkOrderType;          // Must be one of the defined types
  status: WorkOrderStatus;      // Must be one of the defined statuses
  priority: WorkOrderPriority;  // Must be one of the defined priorities
  assetId: string;              // Non-optional String (should match an Asset ID)
  dateReported: string;         // Non-optional String (parsable date format)
  reportedBy: string;           // Non-optional String
  problemDescription: string;   // Non-optional String
  followUpRequired: boolean;    // Non-optional Boolean
  signatureRequired: boolean;   // Non-optional Boolean

  // --- Optional Fields ---
  locationNotes?: string;
  dateDue?: string;             // Should be parsable date format if present
  dateScheduledStart?: string;
  dateActualStart?: string;
  dateActualCompletion?: string;
  assignedTo?: string;
  supervisor?: string;
  scopeOfWork?: string;
  linkedProcedureInfo?: string;
  safetyInstructions?: string;
  estimatedHours?: number;      // Optional number
  actualLaborLog?: string;
  plannedParts?: string;
  partsConsumed?: string;
  toolsRequired?: string;
  externalCosts?: number;       // Optional number
  completionNotes?: string;
  failureProblemCode?: FailureCode; // Optional, but must match defined types if present
  failureCauseCode?: FailureCode;
  failureRemedyCode?: FailureCode;
  meterReadingsNotes?: string;
  inspectionResults?: string;
  downtimeLogged?: string;
  attachmentNotes?: string;
}

// --- Meter Reading Type ---
export interface MeterReading {
    id: string;
    assetId: string;
    date: string; // ISO Date string format ideally
    value: number | string; // Can be number or string
    unit?: string;
    notes?: string;
}

// --- Chat Types ---
export interface ChatGroup {
    id: string;
    name: string;
    lastActivity?: string; // ISO Date string format ideally
}
export interface ChatMessage {
    id: string;
    groupId: string;
    sender: string; // User name or ID ('You' for current user)
    text: string;
    timestamp: number; // Epoch timestamp (milliseconds)
}

// --- Tool Types ---
export interface Tool {
    id: string;
    name: string;
    description?: string;
    category?: string;
}
export type BookingStatus = 'pending' | 'approved' | 'rejected';
export interface ToolBooking {
    id: string;
    toolId: string;
    requestedBy: string;
    startTime: string; // ISO Date string format ideally
    endTime: string;   // ISO Date string format ideally
    status: BookingStatus; // Must be one of the defined statuses
    approvedBy?: string;
    notes?: string;
}