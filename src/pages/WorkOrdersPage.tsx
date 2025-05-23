// src/pages/WorkOrdersPage.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, Asset } from '../types';

interface WorkOrdersPageProps {
    workOrders: WorkOrder[];
    assets: Asset[];
}

// --- Date Helper Functions ---

// Formats a Date object into 'YYYY-MM-DD' string
const formatDateToInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Gets the start and end Date for a week relative to today
const getWeekRange = (offset: number = 0): { start: Date, end: Date } => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const diffToSunday = currentDay;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - diffToSunday + (offset * 7));
    startDate.setHours(0, 0, 0, 0); // Start of Sunday

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999); // End of Saturday
    return { start: startDate, end: endDate };
};

// Gets the start and end Date for a month relative to today
const getMonthRange = (offset: number = 0): { start: Date, end: Date } => {
    const today = new Date();
    const targetMonth = today.getMonth() + offset;
    const targetYear = today.getFullYear() + Math.floor(targetMonth / 12);
    const actualMonth = targetMonth % 12;

    const startDate = new Date(targetYear, actualMonth, 1);
    startDate.setHours(0, 0, 0, 0); // Start of the 1st

    const endDate = new Date(targetYear, actualMonth + 1, 0); // Last day of target month
    endDate.setHours(23, 59, 59, 999); // End of the last day
    return { start: startDate, end: endDate };
};


// --- Styling Helper Functions (Same as before) ---
const getStatusClassName = (status?: WorkOrderStatus): string => { /* ... same as before ... */
    const base = 'status-badge'; if (!status) return base;
    switch (status.toLowerCase().replace(/\s+/g, '-')) {
        case 'requested': case 'approved': case 'assigned': return `${base} status-requested`;
        case 'in-progress': return `${base} status-in-progress`;
        case 'on-hold': return `${base} status-on-hold`;
        case 'completed': return `${base} status-completed`;
        case 'closed': return `${base} status-closed`;
        case 'cancelled': return `${base} status-cancelled`;
        default: return base;
    }
};
const getPriorityClassName = (priority?: WorkOrderPriority): string => { /* ... same as before ... */
   return `priority-${priority?.toLowerCase() ?? 'medium'}`;
};
const getPriorityTagClassName = (priority?: WorkOrderPriority): string => { /* ... same as before ... */
    const base = 'priority-tag'; if (!priority) return `${base} medium`;
     switch (priority.toLowerCase()) {
        case 'critical': return `${base} critical`;
        case 'high': return `${base} high`;
        case 'medium': return `${base} medium`;
        case 'low': return `${base} low`;
        default: return `${base} medium`;
    }
};


// --- Component ---
function WorkOrdersPage({ workOrders, assets }: WorkOrdersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // State for custom date range (YYYY-MM-DD strings)
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const assetMap = useMemo(() => {
    const map = new Map<string, Asset>();
    if (Array.isArray(assets)) {
        assets.forEach(asset => map.set(asset.id, asset));
    }
    return map;
  }, [assets]);

  // Filter Logic - incorporating date range
  const filteredWorkOrders = useMemo(() => {
    let filtered = Array.isArray(workOrders) ? [...workOrders] : [];

    // 1. Apply Text Search Filter (same as before)
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(wo => { /* ... text search logic ... */
            if (!wo) return false;
            const asset = wo.assetId ? assetMap.get(wo.assetId) : undefined;
            return (
                wo.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                wo.id?.toLowerCase().includes(lowerCaseSearchTerm) ||
                wo.assetId?.toLowerCase().includes(lowerCaseSearchTerm) ||
                (asset?.name && asset.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                wo.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
                wo.assignedTo?.toLowerCase().includes(lowerCaseSearchTerm) ||
                wo.problemDescription?.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    }

    // 2. Apply Date Range Filter
    const filterStartDate = startDateFilter ? new Date(`${startDateFilter}T00:00:00`) : null; // Parse start date
    const filterEndDate = endDateFilter ? new Date(`${endDateFilter}T23:59:59.999`) : null; // Parse end date

    if (filterStartDate || filterEndDate) {
        filtered = filtered.filter(wo => {
            if (!wo || !wo.dateDue) return false; // Must have a due date
            try {
                const dueDate = new Date(wo.dateDue);
                // Add time part if only date is present to ensure correct comparison
                if (wo.dateDue.length === 10) { // Check if it's just YYYY-MM-DD
                    dueDate.setUTCHours(12,0,0,0); // Use UTC noon to avoid timezone shifts moving the date
                }

                if (isNaN(dueDate.getTime())) return false; // Invalid due date

                const isAfterStart = filterStartDate ? dueDate >= filterStartDate : true; // True if no start date set
                const isBeforeEnd = filterEndDate ? dueDate <= filterEndDate : true;   // True if no end date set

                return isAfterStart && isBeforeEnd;
            } catch (e) {
                console.error("Error parsing WO due date for filtering:", wo.dateDue, e);
                return false;
            }
        });
    }

    return filtered;
    // Dependencies include the new date filter states
  }, [workOrders, searchTerm, startDateFilter, endDateFilter, assetMap]);

  // --- Handlers for Quick Date Buttons ---
  const setDateRange = (start: Date, end: Date) => {
    setStartDateFilter(formatDateToInput(start));
    setEndDateFilter(formatDateToInput(end));
  };

  const handleThisWeek = () => setDateRange(getWeekRange(0).start, getWeekRange(0).end);
  const handleNextWeek = () => setDateRange(getWeekRange(1).start, getWeekRange(1).end);
  const handleThisMonth = () => setDateRange(getMonthRange(0).start, getMonthRange(0).end);
  const handleNextMonth = () => setDateRange(getMonthRange(1).start, getMonthRange(1).end);
  const handleClearDates = () => {
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="work-orders-page">
      {/* Updated Header Structure */}
      <div className="page-header">
          <h2>Work Orders</h2>
          {/* Actions Group */}
          <div className="page-header-actions">
             {/* Date Filter Group */}
             <div className="date-filter-group">
                 <label htmlFor="start-date">Due Between:</label>
                 <input
                    type="date"
                    id="start-date"
                    className="date-input-filter"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    aria-label="Due Date Start"
                 />
                 <label htmlFor="end-date">and:</label>
                 <input
                    type="date"
                    id="end-date"
                    className="date-input-filter"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    aria-label="Due Date End"
                 />
             </div>
             {/* Quick Date Buttons */}
             <div className="quick-date-buttons">
                 <button type="button" className="quick-date-button" onClick={handleThisWeek}>This Week</button>
                 <button type="button" className="quick-date-button" onClick={handleNextWeek}>Next Week</button>
                 <button type="button" className="quick-date-button" onClick={handleThisMonth}>This Month</button>
                 <button type="button" className="quick-date-button" onClick={handleNextMonth}>Next Month</button>
                 <button type="button" className="quick-date-button" onClick={handleClearDates} title="Clear date filter">Clear</button>
             </div>

             {/* Search Input */}
             <input
                type="text"
                placeholder="Search WOs..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search Work Orders"
             />
             {/* Create Button */}
            <Link to="/workorders/new" className="button-link">Create New Work Order</Link>
          </div>
      </div>

      <div className="work-orders-grid">
        {!Array.isArray(filteredWorkOrders) || filteredWorkOrders.length === 0 ? (
          <p className="no-data">{searchTerm || startDateFilter || endDateFilter ? 'No work orders match your filters.' : 'No work orders found.'}</p>
        ) : (
          filteredWorkOrders.map(wo => {
             if (!wo) return null;
             const assetName = assetMap.get(wo.assetId)?.name ?? 'Unknown Asset';
             return (
                <div className={`work-order-card ${getPriorityClassName(wo.priority)}`} key={wo.id}>
                  <div className="work-order-header">
                    <h3>{wo.title ?? 'Untitled WO'}</h3>
                    <span className={getStatusClassName(wo.status)}>{wo.status ?? 'Unknown'}</span>
                  </div>
                  <span className="work-order-id">
                     Asset: {assetName} ({wo.assetId ?? 'N/A'}) | ID: {wo.id ?? 'N/A'}
                  </span>
                  {wo.assignedTo && <span style={{fontSize: '0.9em', color: '#555', display: 'block', marginBottom: '5px'}}>Assigned: {wo.assignedTo}</span>}
                  <span style={{fontSize: '0.9em', color: '#777', display: 'block', marginBottom: '10px'}}>
                     Due: {wo.dateDue ? new Date(wo.dateDue).toLocaleDateString() : 'N/A'}
                   </span>
                  <p className="work-order-description">
                    {(wo.problemDescription ?? 'No description.').length > 120 ? `${(wo.problemDescription ?? '').substring(0, 120)}...` : (wo.problemDescription ?? 'No description.')}
                  </p>
                  <div className="work-order-footer">
                    <span className={getPriorityTagClassName(wo.priority)}>{wo.priority ?? 'Medium'} Priority</span>
                    <Link to={`/workorders/${wo.id}`} className="view-details">View Details</Link>
                  </div>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WorkOrdersPage;