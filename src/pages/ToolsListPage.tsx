// src/pages/ToolsListPage.tsx
import React from 'react'; // Removed useState as we use prompt
import { Link } from 'react-router-dom';
import { Tool } from '../types';

interface ToolsListPageProps {
    tools: Tool[];
    addTool: (toolData: Omit<Tool, 'id'>) => Promise<Tool | null>; // Add the function prop
}

function ToolsListPage({ tools, addTool }: ToolsListPageProps) {

    const handleAddNewTool = async () => {
        const name = prompt("Enter name for the new tool:");
        if (name && name.trim()) {
             const category = prompt("Enter category (optional):");
             const description = prompt("Enter description (optional):");
            const newTool = await addTool({
                name: name.trim(),
                category: category?.trim() || undefined,
                description: description?.trim() || undefined,
            });
            if (newTool) {
                // Optionally, handle the newly added tool, e.g., show a success message
                // or update local state if the parent component doesn't automatically re-render.
                // For now, we'll just log it or do nothing specific as the main list
                // is expected to be updated by the parent.
                console.log("Tool added successfully:", newTool);
            } else {
                // Handle the case where the tool was not added (e.g. validation failed server-side)
                alert("Failed to add the tool. Please try again or check the details.");
            }
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
                        <div className="tool-item" key={tool.id}>
                             <h3>{tool.name ?? 'Unnamed Tool'}</h3>
                             <p><strong>ID:</strong> {tool.id ?? 'N/A'}</p>
                             {tool.category && <p><strong>Category:</strong> {tool.category}</p>}
                             {tool.description && <p><strong>Description:</strong> {tool.description}</p>}
                            <Link to={`/tools/book/${tool.id}`} className="button-link">Request Booking</Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ToolsListPage;