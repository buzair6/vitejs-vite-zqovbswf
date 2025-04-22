// src/pages/ToolBookingRequestPage.tsx
import React, { useState, useMemo, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tool, ToolBooking } from '../types';

interface ToolBookingRequestPageProps {
    tools: Tool[];
    currentBookings: ToolBooking[]; // <-- Add current bookings prop
    requestToolBooking: (bookingData: Omit<ToolBooking, 'id' | 'status' | 'approvedBy'>) => ToolBooking | null; // Updated return type
}

// Helper (Keep from previous version)
const formatDateForInput = (date: Date): string => { /* ... */ };
const MIN_BOOKING_DURATION_MS = 2 * 60 * 60 * 1000;

function ToolBookingRequestPage({ tools, currentBookings, requestToolBooking }: ToolBookingRequestPageProps) {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    const tool = useMemo(() => tools.find(t => t.id === toolId), [tools, toolId]);

    const [requestedBy, setRequestedBy] = useState('Demo User');
    const [startTime, setStartTime] = useState(formatDateForInput(new Date(Date.now() + 3600000)));
    const [endTime, setEndTime] = useState(formatDateForInput(new Date(Date.now() + 3 * 3600000)));
    const [notes, setNotes] = useState('');
    const [isChecking, setIsChecking] = useState(false); // To prevent double submit

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isChecking || !toolId || !requestedBy || !startTime || !endTime) return;

        setIsChecking(true); // Prevent double clicks

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
        const conflictingBooking = currentBookings.find(existing => {
           if (existing.toolId !== toolId || existing.status === 'rejected') return false;
           const existingStart = new Date(existing.startTime).getTime();
           const existingEnd = new Date(existing.endTime).getTime();
           return requestStartMs < existingEnd && requestEndMs > existingStart;
        });

        if (conflictingBooking) {
           alert(`Booking failed: Time slot conflicts with an existing booking (ID: ${conflictingBooking.id}) for this tool.`);
           setIsChecking(false);
           return; // Stop submission
        }
        // --- End Overlap Check ---


        try {
            const newBooking = requestToolBooking({
                toolId,
                requestedBy,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                notes: notes || undefined,
            });

            if (newBooking) { // Check if booking succeeded (didn't return null)
                 alert(`Booking requested for ${tool?.name || 'tool'}!`);
                 navigate('/tools/bookings'); // Navigate only on success
            }
             // No else needed, as requestToolBooking handles the alert on failure now
        } catch (error) {
            console.error("Error requesting booking:", error);
            alert("Failed to request booking. Please check console.");
        } finally {
             setIsChecking(false); // Re-enable button
        }
    };

    if (!tool) { /* ... not found JSX ... */ }

    return (
        <div className="form-container">
            <h2>Request Booking for: {tool.name}</h2>
            {/* Display existing bookings for this tool */}
            <div className="detail-section" style={{marginTop: 0, paddingTop: 0, borderTop: 'none', marginBottom: '2rem'}}>
                <h4>Existing Bookings (Approved/Pending):</h4>
                 <ul style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '150px', overflowY: 'auto', fontSize: '0.9em' }}>
                    {currentBookings
                        .filter(b => b.toolId === toolId && b.status !== 'rejected')
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map(b => (
                            <li key={b.id} style={{ marginBottom: '5px', padding: '5px', background: b.status === 'approved' ? '#eafaf1' : '#fef9e7' }}>
                                {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleString()} ({b.status}) by {b.requestedBy}
                            </li>
                        ))
                        .length === 0 && <li>No current bookings found.</li>
                    }
                </ul>
            </div>

            <form onSubmit={handleSubmit}>
                {/* ... form groups remain the same ... */}
                 <div className="form-group">
                    <label htmlFor="toolName">Tool:</label>
                    <input type="text" id="toolName" value={tool.name} disabled />
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

                <div className="form-actions">
                    <button type="submit" disabled={isChecking}>{isChecking ? 'Checking...' : 'Submit Request'}</button>
                    <Link to="/tools"><button type="button">Cancel</button></Link>
                </div>
            </form>
        </div>
    );
}
export default ToolBookingRequestPage;