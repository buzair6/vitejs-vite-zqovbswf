// src/pages/ToolBookingsViewerPage.tsx
import { useMemo, useState } from 'react'; // Removed React as it's not needed explicitly
import { Link } from 'react-router-dom';
import type { ToolBooking, Tool, BookingStatus } from '../types'; // Added type import keyword

interface ToolBookingsViewerPageProps {
    bookings: ToolBooking[];
    tools: Tool[];
    updateBookingStatus: (bookingId: string, newStatus: BookingStatus, approverName?: string) => void;
}

// --- Date & Status Helpers (Implemented) ---

// Formats an ISO date string to a readable local date/time string
const formatBookingDateTime = (isoString: string): string => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
         if (isNaN(date.getTime())) return isoString; // Return original if invalid date
        // Format to local date and time
        return date.toLocaleString(undefined, {
             year: 'numeric',
             month: 'short',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
         });
    } catch (e) {
        console.error("Error formatting date time:", isoString, e);
        return isoString; // Return original string on error
    }
};

// Gets a CSS class name based on booking status
const getBookingStatusClassName = (status: BookingStatus): string => {
    const base = 'booking-status-badge'; // A base class for styling
    switch (status) {
        case 'pending': return `${base} pending`;
        case 'approved': return `${base} approved`;
        case 'rejected': return `${base} rejected`;
        default: return base; // Fallback for unknown status
    }
};

// Formats a Date object into 'YYYY-MM-DD' string for date input
const formatDateToInput = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return ''; // Handle invalid date
    return date.toISOString().split('T')[0];
};

// Removed getStartOfDay, getEndOfDay as they were not used in this file


function ToolBookingsViewerPage({ bookings, tools, updateBookingStatus }: ToolBookingsViewerPageProps) {
    const [selectedToolId, setSelectedToolId] = useState<string>('all'); // 'all' or tool.id
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

     const toolMap = useMemo(() => {
        const map = new Map<string, Tool>();
        // Ensure tools is an array before iterating
        if (Array.isArray(tools)) {
            tools.forEach(tool => {
                if (tool?.id) { // Ensure tool and tool.id are valid
                     map.set(tool.id, tool);
                }
            });
        }
        return map;
    }, [tools]);

    // Filter and Sort Bookings
    const filteredAndSortedBookings = useMemo(() => {
        // Ensure bookings is an array before spreading
        let filtered = Array.isArray(bookings) ? [...bookings] : [];

        // 1. Filter by Tool
        if (selectedToolId !== 'all') {
            filtered = filtered.filter(b => b?.toolId === selectedToolId); // Add check for valid booking
        }

        // 2. Filter by Date Range (using booking START time for filtering)
        // Validate date inputs before creating Date objects
        const filterStartDate = startDateFilter ? new Date(`${startDateFilter}T00:00:00`) : null;
        const filterEndDate = endDateFilter ? new Date(`${endDateFilter}T23:59:59.999`) : null;

        if (filterStartDate || filterEndDate) {
             filtered = filtered.filter(booking => {
                if (!booking || !booking.startTime) return false; // Must have a booking and startTime
                try {
                    // Parse the date. Using UTC midnight for YYYY-MM-DD strings helps avoid timezone issues.
                    const bookingStart = new Date(booking.startTime.length === 10 ? `${booking.startTime}T00:00:00.000Z` : booking.startTime);

                    if (isNaN(bookingStart.getTime())) {
                        console.warn("Invalid date format for booking start time:", booking.startTime);
                        return false; // Invalid booking start time string
                    }

                    const isAfterStart = filterStartDate ? bookingStart >= filterStartDate : true;
                    const isBeforeEnd = filterEndDate ? bookingStart <= filterEndDate : true; // Check if START is before filter END
                    return isAfterStart && isBeforeEnd;
                } catch (e) {
                     console.error("Error processing booking start date for filtering:", booking.startTime, e);
                     return false; // Handle unexpected errors during date processing
                }
            });
        }

        // 3. Sort by Start Time
        // Added checks for valid booking objects before accessing startTime
        return filtered.sort((a,b) => {
             const timeA = a?.startTime ? new Date(a.startTime).getTime() : 0;
             const timeB = b?.startTime ? new Date(b.startTime).getTime() : 0;
             return timeA - timeB;
        });

    }, [bookings, selectedToolId, startDateFilter, endDateFilter]); // Add dependencies

    const handleApprove = (bookingId: string) => updateBookingStatus(bookingId, 'approved', 'Admin User');
    const handleReject = (bookingId: string) => updateBookingStatus(bookingId, 'rejected');
    const handleClearFilters = () => {
        setSelectedToolId('all');
        setStartDateFilter('');
        setEndDateFilter('');
    }

     // Ensure tools is an array before finding a tool
    const selectedToolName = selectedToolId === 'all' ? 'All Tools' : (Array.isArray(tools) ? toolMap.get(selectedToolId)?.name : undefined) ?? 'Unknown Tool';


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
                         {/* Ensure tools is an array before mapping */}
                        {Array.isArray(tools) && tools.map(tool => (
                             // Add check for valid tool.id and tool.name before rendering option
                             tool?.id && tool?.name ? <option key={tool.id} value={tool.id}>{tool.name}</option> : null
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
                     {/* Only show 'Request Booking' if a specific tool is selected and found */}
                    {selectedToolId !== 'all' && toolMap.has(selectedToolId) && (
                         <Link to={`/tools/book/${selectedToolId}`} className="button-link button-small">Book This Tool</Link>
                    )}
                     <Link to="/tools" className="button-link button-small">Back to Tools List</Link>
                </div>
            </div>

            <ul className="tool-bookings-list">
                 {/* Check if filteredAndSortedBookings is an array and has length */}
                {!Array.isArray(filteredAndSortedBookings) || filteredAndSortedBookings.length === 0 ? (
                     <li className="no-data" style={{gridColumn: '1 / -1'}}>No bookings match filters.</li>
                ) : (
                    filteredAndSortedBookings.map(booking => {
                        // Add check for valid booking object
                        if (!booking?.id) return null;

                        const toolName = toolMap.get(booking.toolId)?.name ?? 'Unknown Tool';
                        // Ensure status is valid before passing to getBookingStatusClassName
                        const status: BookingStatus = (booking.status as BookingStatus) || 'pending'; // Default to 'pending' if status is missing/invalid
                        const statusClass = getBookingStatusClassName(status);

                        return (
                            <li key={booking.id} className={statusClass}>
                                <div className="booking-info">
                                    <strong>{toolName}</strong>
                                    <span>ID: {booking.id}</span>
                                    <span>Req By: {booking.requestedBy ?? 'N/A'}</span> {/* Use nullish coalescing */}
                                    {/* Use nullish coalescing */}
                                    <span className="booking-dates">From: {formatBookingDateTime(booking.startTime ?? '')}</span>
                                    {/* Use nullish coalescing */}
                                     <span className="booking-dates">To: {formatBookingDateTime(booking.endTime ?? '')}</span>
                                    {booking.notes && <span>Notes: {booking.notes}</span>}
                                    <div> <span className={getBookingStatusClassName(status)}>{status}</span> {status === 'approved' && booking.approvedBy && <span className="approver-info">by {booking.approvedBy}</span>} {status === 'rejected' && <span className="approver-info">(Rejected)</span>} </div>
                                </div>
                                {/* Check status before rendering action buttons */}
                                {status === 'pending' && (
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