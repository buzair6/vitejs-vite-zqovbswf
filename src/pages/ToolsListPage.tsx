// src/pages/ToolsListPage.tsx
import { Link } from 'react-router-dom'; // Removed React as it's not needed explicitly
import type { Tool } from '../types'; // Added type import keyword

interface ToolsListPageProps {
    tools: Tool[];
    addTool: (toolData: Omit<Tool, 'id'>) => Tool; // Add the function prop
}

function ToolsListPage({ tools, addTool }: ToolsListPageProps) {

    const handleAddNewTool = () => {
        const name = prompt("Enter name for the new tool:");
        if (name && name.trim()) {
             // Using prompt for category and description
             const category = prompt("Enter category (optional):");
             const description = prompt("Enter description (optional):");
            addTool({
                name: name.trim(),
                // Use trim() and convert empty strings to undefined if needed by your type/logic
                category: category?.trim() || undefined,
                description: description?.trim() || undefined,
            });
        } else if (name !== null) { // Only alert if they didn't press Cancel
             alert("Tool name cannot be empty.");
        }
    };

    return (
        <div className="tools-page">
             <div className="page-header">
                 <h2>Available Tools</h2>
                 <div className="page-header-actions">
                    {/* Add Tool Button */}
                    <button onClick={handleAddNewTool} className="button">+ Add New Tool</button>
                     <Link to="/tools/bookings" className="button-link">View All Bookings</Link>
                 </div>
             </div>

            <div className="tools-list">
                {!Array.isArray(tools) || tools.length === 0 ? (
                     <p className="no-data">No tools available. Add one above!</p>
                ) : (
                    tools.map(tool => (
                         // Added a check for valid tool and tool.id before rendering
                        tool?.id ? (
                            <div className="tool-item" key={tool.id}>
                                 {/* Use nullish coalescing for potentially undefined properties */}
                                 <h3>{tool.name ?? 'Unnamed Tool'}</h3>
                                 <p><strong>ID:</strong> {tool.id}</p> {/* id is guaranteed by the check */}
                                 {tool.category && <p><strong>Category:</strong> {tool.category}</p>}
                                 {tool.description && <p><strong>Description:</strong> {tool.description}</p>}
                                <Link to={`/tools/book/${tool.id}`} className="button-link">Request Booking</Link>
                            </div>
                         ) : null // Skip rendering if tool or tool.id is invalid
                    ))
                )}
            </div>
        </div>
    );
}

export default ToolsListPage;