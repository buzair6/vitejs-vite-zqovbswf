// src/pages/AIInteractionPage.tsx - FULL CONTEXT, LESS RESTRICTION
import { useState, useRef, useEffect } from 'react'; // Removed useMemo as it was not used
import { GoogleGenerativeAI, Content, ChatSession, SafetySetting } from "@google/generative-ai"; // Removed HarmCategory, HarmBlockThreshold as they were not used
import type { Asset, WorkOrder, Tool, ToolBooking, MeterReading /* Import all needed types */ } from '../types'; // Removed WorkOrderStatus as it was not used

// --- Environment Variable & Model ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash";

// --- Component Props ---
interface AIInteractionPageProps {
    assets: Asset[];
    workOrders: WorkOrder[];
    tools?: Tool[];
    toolBookings?: ToolBooking[];
    meterReadings?: MeterReading[]; // Add meter readings if available and needed for context
}

// --- Formatting Helper (Simple JSON Stringify) ---
const formatDataForAIContext = (label: string, data: any[] | undefined, sampleSize = 5): string => {
    if (!Array.isArray(data) || data.length === 0) {
        return `${label}: None\n`;
    }
    const sample = data.slice(0, sampleSize); // Take a sample
    let contextString = `${label} (Total: ${data.length}, Showing Sample: ${sample.length}):\n`;
    sample.forEach((item, index) => {
        try {
             // Stringify each item - might become very long for complex objects
             // Consider selecting only key fields if token limits are hit
             contextString += `  Item ${index + 1}: ${JSON.stringify(item, null, 2)}\n`; // Pretty print JSON slightly
        } catch (e) {
             contextString += `  Item ${index + 1}: [Error stringifying item]\n`;
        }
    });
    if (data.length > sampleSize) {
        contextString += `  ...\n`;
    }
    return contextString;
};


const AIInteractionPage: React.FC<AIInteractionPageProps> = ({
    assets = [],
    workOrders = [],
    tools = [],
    toolBookings = [],
    meterReadings = [] // Receive meter readings
}) => {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);

    // --- Initialize Chat Session ---
    useEffect(() => {
        if (API_KEY) {
            try {
                console.log("[AIInteractionPage] Initializing Chat Session (Full Context Strategy)...");
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: MODEL_NAME });
                const generationConfig = { temperature: 0.7, maxOutputTokens: 2048 }; // Allow longer responses

                // Added explicit type annotation for safetySettings
                // Assuming default settings if none specified, hence empty array
                const safetySettings: SafetySetting[] = [];

                // --- More Open System Instruction ---
                // Encourage analysis but acknowledge data limitations
                const initialSystemInstruction = `
You are a helpful AI assistant for the EngroMaint system. You will be provided with a snapshot of current system data (Assets, Work Orders, Tools, Bookings, Meter Readings) with each query.
Analyze the provided data snapshot to answer the user's questions. You can summarize, list items (referring to IDs if helpful), compare data points, and identify basic trends visible *within the provided snapshot*.
If the user asks for information not present in the snapshot, state that the specific detail is unavailable in the current data view.
Aim for informative and natural responses based *only* on the data given in the context for this turn.
                `;

                const chat = model.startChat({
                    // Start with system instruction to set the persona/goal
                    history: [{ role: "user", parts: [{ text: initialSystemInstruction }]}, { role: "model", parts: [{ text: "Okay, I'm ready. I will analyze the provided data snapshot to answer your questions about EngroMaint."}]}],
                    generationConfig,
                    safetySettings,
                });
                setChatSession(chat);
                 console.log("[AIInteractionPage] Chat Session Initialized.");
            } catch (err: any) {
                 console.error("[AIInteractionPage] Error initializing Gemini AI:", err);
                 setError(`Failed to initialize AI session: ${err.message}`);
            }

        } else {
            setError('ERROR: Gemini API Key missing.');
            console.error('Gemini API Key not found.');
        }
    }, []); // Run only once


    useEffect(() => { conversationEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

    // --- **FULL CONTEXT PREPARATION** ---
    // Creates the full context string from ALL available data slices passed as props
    const prepareFullDataContext = (): string => {
        console.log("[AIInteractionPage] Preparing FULL data context...");
        const validAssets = Array.isArray(assets) ? assets : [];
        const validWorkOrders = Array.isArray(workOrders) ? workOrders : [];
        const validTools = Array.isArray(tools) ? tools : [];
        const validBookings = Array.isArray(toolBookings) ? toolBookings : [];
        const validReadings = Array.isArray(meterReadings) ? meterReadings : [];

        let context = "CURRENT SYSTEM DATA SNAPSHOT:\n";
        context += "=========================\n";
        context += formatDataForAIContext("ASSETS", validAssets, 5); // Sample size 5
        context += "=========================\n";
        context += formatDataForAIContext("WORK ORDERS", validWorkOrders, 10); // Sample size 10
        context += "=========================\n";
        context += formatDataForAIContext("TOOLS", validTools, 5);
        context += "=========================\n";
        context += formatDataForAIContext("TOOL BOOKINGS", validBookings, 10);
        context += "=========================\n";
        context += formatDataForAIContext("METER READINGS", validReadings, 10); // Added Meter Readings
        context += "=========================\n";

        console.log("[AIInteractionPage] Full data context length:", context.length);
        // WARNING: Check this length against model token limits!
        if (context.length > 15000) { // Example arbitrary limit check
             console.warn("[AIInteractionPage] Context length is very high, might exceed token limits!");
        }
        return context;
    };


    // --- Handle Sending Prompt (Using ChatSession with FULL Context) ---
    const handleSendPrompt = async (e: React.FormEvent) => {
        e.preventDefault();
        const userText = prompt.trim();
        if (!userText || isLoading || !API_KEY || !chatSession) {
             if(!chatSession && API_KEY) setError("Chat session initializing...");
             return;
        }

        setIsLoading(true);
        setError(null);
        const userContent: Content = { role: "user", parts: [{ text: userText }] };
        // Note: Adding the CONTEXT + USER QUERY as a *single* new message part to the history might clutter the UI.
        // A better approach for display is to just add the original userText to the history,
        // but send the combined CONTEXT + USER QUERY to the AI.
        // Let's keep the original userText in history for display purposes.
        setHistory(prevHistory => [...prevHistory, userContent]);
        setPrompt('');

        try {
            // Prepare the FULL context every time
            const dataContext = prepareFullDataContext();

            // Prepend context to the user query for this turn before sending to AI
            // The actual message sent to the AI is the combined text.
            const messageToSend = `CONTEXT:\n${dataContext}\n\nUSER QUERY:\n${userText}`;

            console.log("[AIInteractionPage] Sending message to chat session (Length:", messageToSend.length, ")");

            // Send the message using the chat session object
            // The history is handled by the chat session internally based on what *was sent*.
            // We manage our local 'history' state for display only.
            const result = await chatSession.sendMessage(messageToSend);

            const response = result.response;
            // Safely access the text property of the response
            const responseText = response?.text() ?? '';

            if (!responseText && response?.promptFeedback?.blockReason) { setError(`Response blocked: ${response.promptFeedback.blockReason}`); console.warn("Response blocked", response.promptFeedback);}
            else if (!responseText) { setError("AI returned an empty response."); console.warn("Empty AI response"); }
            else {
                // Add the AI's response to our local history for display
                const modelContent: Content = { role: "model", parts: [{ text: responseText }] };
                setHistory(prev => [...prev, modelContent]);
            }

        } catch (err: any) { setError(`Error: ${err.message}`); console.error("Gemini API Error", err);}
        finally { setIsLoading(false); }
    };

    // --- Render ---
    return (
        <div className="ai-page">
            <div className="page-header"><h2>AI Assistant ({MODEL_NAME})</h2><button type="button" onClick={() => setHistory([])} className='button-small' disabled={isLoading}>Clear Chat</button></div>
            {/* UPDATED Intro Text */}
            <p className="intro-text">
                Ask questions about the system data (Assets, WOs, Tools, Bookings). The AI has access to a snapshot of all current demo data. You can ask for summaries, lists, or details about specific items.
                <br/>
                Example: "List open work orders sorted by priority", "Are there any conflicts for Forklift FL-2 next week?", "Summarize the status of assets in the North Sector".
                <br/>
                <strong style={{color: 'orange'}}>Note:</strong> Performance depends on the AI's ability to parse the provided data. Complex analysis or very long data might cause issues or exceed limits.
                <br/>
                <strong style={{color: '#e74c3c'}}>SECURITY WARNING:</strong> API Key exposed. Demo only!
            </p>
            {!API_KEY && ( <p className="error-message"> ERROR: API Key missing. AI features disabled. </p> )}

            <div className="conversation-history">
                 {/* Safely render history messages, filtering out the initial preamble */}
                 {history
                    // Filter out the specific initial messages based on role and part content (safer with checks)
                    .filter((msg, index) => {
                        // Check if msg.parts is an array and has elements before accessing parts[0]
                        if (!Array.isArray(msg.parts) || msg.parts.length === 0) return true; // Keep if no parts or not array
                        const firstPart = msg.parts[0];
                        // Check if the first part exists and has text before checking startsWith
                        if (msg.role === 'user' && typeof firstPart?.text === 'string' && firstPart.text.startsWith('You are a helpful AI assistant')) return false;
                        if (msg.role === 'model' && typeof firstPart?.text === 'string' && firstPart.text.startsWith('Okay, I\'m ready.')) return false;
                        return true; // Keep other messages
                    })
                    // Map the remaining history items
                    .map((msg, index) => (
                         // Each history item is a bubble container
                         <div key={`msg-${index}`} className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                             {/* Map over the parts within this message, safely */}
                             {/* Check if msg.parts is an array before mapping */}
                             {Array.isArray(msg.parts) && msg.parts.map((part, partIndex) => (
                                 // Check if part exists and has text property before using it
                                 typeof part?.text === 'string' ? (
                                     // Use React.Fragment and split to handle line breaks correctly without extra divs
                                     <React.Fragment key={`part-${index}-${partIndex}`}>
                                          {part.text.split('\n').map((line, lineIndex, arr) => (
                                             <span key={`line-${index}-${partIndex}-${lineIndex}`}>
                                                 {line}
                                                 {/* Add <br/> after each line except the last one */}
                                                 {lineIndex < arr.length - 1 && <br />}
                                             </span>
                                          ))}
                                     </React.Fragment>
                                 ) : null // Skip parts without text content
                             ))}
                         </div>
                     ))
                 }
                <div ref={conversationEndRef} />
                {isLoading && <div className="loading-indicator">AI is thinking...</div>}
            </div>

            {error && !isLoading && ( <p className="error-message">{error}</p> )}

            <form className="ai-input-area" onSubmit={handleSendPrompt}>
                <textarea placeholder="Ask a question..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} disabled={isLoading || !API_KEY || !chatSession} aria-label="AI Prompt Input" />
                <button type="submit" disabled={isLoading || !prompt.trim() || !API_KEY || !chatSession}> {isLoading ? 'Thinking...' : 'Send'} </button>
            </form>
        </div>
    );
};

export default AIInteractionPage;