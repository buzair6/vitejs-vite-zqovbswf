// src/pages/AssetForm.tsx
import { useState, FormEvent } from 'react'; // Removed React
import { useNavigate } from 'react-router-dom';
// Import Asset type using the 'type' keyword as it's only used in type annotations
import type { Asset } from '../types';

interface AssetFormProps {
    // CORRECTED TYPE: The addAsset function in App.tsx expects Omit<Asset, 'id' | 'status'>
    // because it adds the 'status' itself. This type definition now matches.
    addAsset: (assetData: Omit<Asset, 'id' | 'status'>) => void;
    // Optional: Add assetToEdit?: Asset for editing functionality later
}

function AssetForm({ addAsset }: AssetFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { // Type the event
    event.preventDefault();
    if (!name || !location || !type) {
      alert('Please fill in all fields.');
      return;
    }
    // Pass ONLY the properties expected by addAsset (name, location, type)
    // The 'status' property is intentionally omitted here as handled by App.tsx
    addAsset({ name, location, type });
    navigate('/assets'); // Redirect to asset list after adding
  };

  return (
    <div className="form-container"> {/* Added form-container class */}
      <h2>Create New Asset</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Asset Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
         <div className="form-group">
          <label htmlFor="type">Asset Type:</label>
          <input
            type="text"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>
        <div className="form-actions"> {/* Added form-actions class */}
            <button type="submit">Create Asset</button>
             <button type="button" onClick={() => navigate('/assets')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default AssetForm;