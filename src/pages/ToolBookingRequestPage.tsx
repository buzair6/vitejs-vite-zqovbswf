// src/pages/ToolBookingRequestPage.tsx
import { useState, useMemo, FormEvent } from 'react'; // Removed React
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Tool, ToolBooking } from '../types'; // Added type keyword

interface ToolBookingRequestPageProps {
    tools: Tool[];
    currentBookings: ToolBooking[]; // <-- Add current bookings prop
    requestToolBooking: (bookingData: Omit<ToolBooking, 'id' | 'status' | 'approvedBy'>) => Promise<ToolBooking | null>; // Updated return type
}

// --- Helper: Formats a Date object into 'YYYY-MM-DDTHH:mm' string for datetime-local input ---
// TS2355 Fix: Removed the commented-out placeholder declaration here.
// The actual implementation is below.

const formatDateForInput = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn("Invalid date passed to formatDateForInput");
        return ''; // Return empty string for invalid dates
    }
    // Format to 'YYYY-MM-DDTHH:mm' which is expected by datetime-local input
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const MIN_BOOKING_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

function ToolBookingRequestPage({ tools, currentBookings, requestToolBooking }: ToolBookingRequestPageProps) {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    // Ensure tools is an array before finding
    const tool = useMemo(() => Array.isArray(tools) ? tools.find(t => t.id === toolId) : undefined, [tools, toolId]);

    // Default start time to 1 hour from now, end time to 3 hours from now
    const defaultStartTime = useMemo(() => {
       const date = new Date();
       date.setHours(date.getHours() + 1);
       date.setMinutes(0); // Round to the hour for cleaner default
       date.setSeconds(0,0);
       return formatDateForInput(date);
    }, []); // Empty dependency array means this runs once on mount

    const defaultEndTime = useMemo(() => {
        const date = new Date();
        date.setHours(date.getHours() + 3);
        date.setMinutes(0); // Round to the hour for cleaner default
        date.setSeconds(0,0);
        return formatDateForInput(date);
    }, []); // Empty dependency array means this runs once on mount


    const [requestedBy, setRequestedBy] = useState('Demo User');
    const [startTime, setStartTime] = useState(defaultStartTime);
    const [endTime, setEndTime] = useState(defaultEndTime);
    const [notes, setNotes] = useState('');
    const [isChecking, setIsChecking] = useState(false); // To prevent double submit

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isChecking || !toolId || !requestedBy || !startTime || !endTime) {
            // Added basic alert if required fields are missing
            if (!toolId || !requestedBy || !startTime || !endTime) {
                alert('Please fill in all required fields.');
            }
            return;
        }

        setIsChecking(true); // Prevent double clicks

        // Using new Date() directly on the input string might have timezone issues.
        // For datetime-local input, the string format is YYYY-MM-DDTHH:mm.
        // Parsing this without timezone information often defaults to local time.
        // Let's just use the input strings directly as ISO strings for the type.
        // However, for date comparisons, it's safer to use Date objects.
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert("Invalid date/time format entered.");
            setIsChecking(false);
            return;
        }
        if (endDate <= startDate) {
            alert("End time must be after start time.");
            setIsChecking(false);
            return;
        }
        const durationMs = endDate.getTime() - startDate.getTime();
        if (durationMs < MIN_BOOKING_DURATION_MS) {
             alert(`Booking duration must be at least 2 hours.`);
             setIsChecking(false);
             return;
        }

        // --- Overlap Check ---
        const requestStartMs = startDate.getTime();
        const requestEndMs = endDate.getTime();

        // Ensure currentBookings is an array before filtering/finding
        const validCurrentBookings = Array.isArray(currentBookings) ? currentBookings : [];

        const conflictingBooking = validCurrentBookings.find(existing => {
           // Check if existing booking object is valid before accessing properties
           if (!existing || existing.toolId !== toolId || existing.status === 'rejected' || !existing.startTime || !existing.endTime) return false;
           try {
              const existingStart = new Date(existing.startTime).getTime();
              const existingEnd = new Date(existing.endTime).getTime();
               // Check if parsed dates are valid
              if (isNaN(existingStart) || isNaN(existingEnd)) return false;

              // Check for overlap
              return requestStartMs < existingEnd && requestEndMs > existingStart;
           } catch (e) {
               console.error("Error parsing existing booking dates during overlap check:", existing, e);
               return false; // Skip if parsing fails
           }
        });

        if (conflictingBooking) {
           alert(`Booking failed: Time slot conflicts with an existing booking (ID: ${conflictingBooking.id ?? 'N/A'}) for this tool.`);
           setIsChecking(false);
           return; // Stop submission
        }
        // --- End Overlap Check ---

        try {
            const newBooking = await requestToolBooking({
                toolId,
                requestedBy,
                // Pass the input values directly, assuming they are valid datetime-local strings
                startTime, // Use the state value directly
                endTime,   // Use the state value directly
                notes: notes || undefined, // Convert empty string to undefined if notes is optional in type
            });

            if (newBooking) { // Check if booking succeeded (didn't return null)
                 alert(`Booking requested for ${tool?.name || 'tool'}!`);
                 navigate('/tools/bookings'); // Navigate only on success
            } else {
                 alert("Failed to request booking. The request returned no booking information. Please try again.");
            }
        } catch (error) {
            console.error("Error requesting booking:", error);
            alert("Failed to request booking due to an error. Please check console.");
        } finally {
             setIsChecking(false); // Re-enable button
        }
    };

    if (!tool) {
        return (
             <div className="container"> {/* Added container class */}
                 <h2>Tool Not Found</h2>
                 {/* Use nullish coalescing */}
                 <p>Could not find tool with ID: {toolId ?? 'Unknown'}</p>
                 <Link to="/tools"><button>Back to Tools List</button></Link>
             </div>
        );
    }

    return (
        <div className="form-container"> {/* Added form-container class */}
            {/* Use nullish coalescing for tool name */}
            <h2>Request Booking for: {tool.name ?? 'Unnamed Tool'}</h2>
            {/* Display existing bookings for this tool */}
            <div className="detail-section" style={{marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: '2rem'}}>
                <h4>Existing Bookings (Approved/Pending):</h4>
                 <ul style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '150px', overflowY: 'auto', fontSize: '0.9em' }}>
                    {/* Ensure currentBookings is an array and filter/map safely */}
                    {(Array.isArray(currentBookings) ? currentBookings : [])
                        .filter(b => b?.toolId === toolId && b.status !== 'rejected') // Check if booking object is valid
                        .sort((a, b) => {
                             // Added checks for valid booking objects and dates before sorting
                             const timeA = a?.startTime ? new Date(a.startTime).getTime() : 0;
                             const timeB = b?.startTime ? new Date(b.startTime).getTime() : 0;
                             return timeA - timeB;
                         })
                        .map(b => (
                             // Add check for valid booking object and id before rendering
                            b?.id ? (
                                <li key={b.id} style={{ marginBottom: '5px', padding: '5px', background: b.status === 'approved' ? '#eafaf1' : '#fef9e7' }}>
                                    {/* Use nullish coalescing and format dates safely */}
                                    {new Date(b.startTime ?? '').toLocaleString()} - {new Date(b.endTime ?? '').toLocaleString()} ({b.status ?? 'unknown'}) by {b.requestedBy ?? 'N/A'}
                                </li>
                            ) : null // Skip if booking or booking.id is invalid
                        ))
                        // Add a check for the length of the *rendered* list, not the filtered list
                        .filter(Boolean).length === 0 && <li>No current bookings found.</li> // Use filter(Boolean) to count non-null/undefined items
                    }
                </ul>
            </div>

            <form onSubmit={handleSubmit}>
                {/* ... form groups remain the same ... */}
                 <div className="form-group">
                    <label htmlFor="toolName">Tool:</label>
                    {/* Use nullish coalescing for tool name */}
                    <input type="text" id="toolName" value={tool.name ?? 'Unnamed Tool'} disabled />
                </div>
                <div className="form-group">
                    <label htmlFor="requestedBy">Requested By:</label>
                    <input type="text" id="requestedBy" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="startTime">Start Time:</label>
                    <input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="endTime">End Time:</label>
                    <input type="datetime-local" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">Notes (Optional):</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for booking..." />
                </div>

                <div className="form-actions"> {/* Added form-actions class */}
                    <button type="submit" disabled={isChecking || !toolId}>{isChecking ? 'Checking...' : 'Submit Request'}</button> {/* Disable if toolId is missing */}
                    <Link to="/tools"><button type="button">Cancel</button></Link>
                </div>
            </form>
        </div>
    );
}
export default ToolBookingRequestPage;