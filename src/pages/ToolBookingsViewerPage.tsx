// src/pages/ToolBookingsViewerPage.tsx
import React, { useMemo, useState } from 'react'; // Added useState
import { Link } from 'react-router-dom';
import { ToolBooking, Tool, BookingStatus } from '../types';

interface ToolBookingsViewerPageProps {
    bookings: ToolBooking[];
    tools: Tool[];
    updateBookingStatus: (bookingId: string, newStatus: BookingStatus, approverName?: string) => void;
}

// Date & Status Helpers (Keep from previous version)
const formatBookingDateTime = (isoString: string): string => { /* ... */ };
const getBookingStatusClassName = (status: BookingStatus): string => { /* ... */ };
// Add date range helpers (copy from WorkOrdersPage if needed, or implement simplified logic here)
const getStartOfDay = (date: Date): Date => { /* ... */ };
const getEndOfDay = (date: Date): Date => { /* ... */ };
const formatDateToInput = (date: Date): string => { /* ... */ };
// ... (getWeekRange, getMonthRange if using quick buttons)


function ToolBookingsViewerPage({ bookings, tools, updateBookingStatus }: ToolBookingsViewerPageProps) {
    const [selectedToolId, setSelectedToolId] = useState<string>('all'); // 'all' or tool.id
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

     const toolMap = useMemo(() => {
        const map = new Map<string, Tool>();
        if (Array.isArray(tools)) {
            tools.forEach(tool => map.set(tool.id, tool));
        }
        return map;
    }, [tools]);

    // Filter and Sort Bookings
    const filteredAndSortedBookings = useMemo(() => {
        let filtered = Array.isArray(bookings) ? [...bookings] : [];

        // 1. Filter by Tool
        if (selectedToolId !== 'all') {
            filtered = filtered.filter(b => b.toolId === selectedToolId);
        }

        // 2. Filter by Date Range (using booking START time for filtering)
        const filterStartDate = startDateFilter ? new Date(`${startDateFilter}T00:00:00`) : null;
        const filterEndDate = endDateFilter ? new Date(`${endDateFilter}T23:59:59.999`) : null;

        if (filterStartDate || filterEndDate) {
             filtered = filtered.filter(booking => {
                if (!booking || !booking.startTime) return false;
                try {
                    const bookingStart = new Date(booking.startTime);
                    if (isNaN(bookingStart.getTime())) return false;

                    const isAfterStart = filterStartDate ? bookingStart >= filterStartDate : true;
                    const isBeforeEnd = filterEndDate ? bookingStart <= filterEndDate : true; // Check if START is before filter END
                    return isAfterStart && isBeforeEnd;
                } catch { return false; }
            });
        }

        // 3. Sort by Start Time
        return filtered.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    }, [bookings, selectedToolId, startDateFilter, endDateFilter]); // Add dependencies

    const handleApprove = (bookingId: string) => updateBookingStatus(bookingId, 'approved', 'Admin User');
    const handleReject = (bookingId: string) => updateBookingStatus(bookingId, 'rejected');
    const handleClearFilters = () => {
        setSelectedToolId('all');
        setStartDateFilter('');
        setEndDateFilter('');
    }

    const selectedToolName = selectedToolId === 'all' ? 'All Tools' : toolMap.get(selectedToolId)?.name ?? 'Unknown Tool';

    return (
        <div className="tool-bookings-page">
            <div className="page-header">
                <h2>Tool Bookings ({selectedToolName})</h2>
                {/* Add Filter controls to header actions */}
                 <div className="page-header-actions">
                    {/* Tool Filter */}
                    <select
                        value={selectedToolId}
                        onChange={(e) => setSelectedToolId(e.target.value)}
                        className='date-input-filter' /* Reuse style for consistency */
                        style={{maxWidth: '200px'}}
                        aria-label="Filter by Tool"
                     >
                        <option value="all">All Tools</option>
                        {tools.map(tool => (
                            <option key={tool.id} value={tool.id}>{tool.name}</option>
                        ))}
                    </select>
                    {/* Date Filter */}
                     <div className="date-filter-group">
                         <label htmlFor="start-date">Booked From:</label>
                         <input type="date" id="start-date" className="date-input-filter" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} aria-label="Booking Start Date Filter"/>
                         <label htmlFor="end-date">To:</label>
                         <input type="date" id="end-date" className="date-input-filter" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} aria-label="Booking End Date Filter"/>
                     </div>
                    {/* Clear Button */}
                    <button type="button" onClick={handleClearFilters} className="quick-date-button">Clear Filters</button>
                     {/* Only show 'Request Booking' if a specific tool is selected */}
                    {selectedToolId !== 'all' && toolMap.has(selectedToolId) && (
                         <Link to={`/tools/book/${selectedToolId}`} className="button-link button-small">Book This Tool</Link>
                    )}
                     <Link to="/tools" className="button-link button-small">Back to Tools List</Link>
                </div>
            </div>

            <ul className="tool-bookings-list">
                {filteredAndSortedBookings.length === 0 ? (
                     <li className="no-data" style={{gridColumn: '1 / -1'}}>No bookings match filters.</li>
                ) : (
                    filteredAndSortedBookings.map(booking => {
                        const toolName = toolMap.get(booking.toolId)?.name ?? 'Unknown Tool';
                        const statusClass = `status-${booking.status}`;
                        return (
                            <li key={booking.id} className={statusClass}>
                                <div className="booking-info">
                                    <strong>{toolName}</strong>
                                    <span>ID: {booking.id}</span>
                                    <span>Req By: {booking.requestedBy}</span>
                                    <span className="booking-dates">From: {formatBookingDateTime(booking.startTime)}</span>
                                     <span className="booking-dates">To: {formatBookingDateTime(booking.endTime)}</span>
                                    {booking.notes && <span>Notes: {booking.notes}</span>}
                                    <div> <span className={getBookingStatusClassName(booking.status)}>{booking.status}</span> {booking.status === 'approved' && booking.approvedBy && <span className="approver-info">by {booking.approvedBy}</span>} {booking.status === 'rejected' && <span className="approver-info">(Rejected)</span>} </div>
                                </div>
                                {booking.status === 'pending' && (
                                    <div className="booking-actions">
                                        <button onClick={() => handleApprove(booking.id)} className="button-success button-small">Approve</button>
                                        <button onClick={() => handleReject(booking.id)} className="button-danger button-small">Reject</button>
                                    </div>
                                )}
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
}

export default ToolBookingsViewerPage;