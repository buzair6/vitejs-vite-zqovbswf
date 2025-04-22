import React, { useState, FormEvent } from 'react'; // Import FormEvent
import { useNavigate } from 'react-router-dom';
import { Asset } from '../types'; // Import Asset type if needed for props validation

interface AssetFormProps {
    addAsset: (assetData: Omit<Asset, 'id'>) => void;
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
    addAsset({ name, location, type });
    navigate('/assets'); // Redirect to asset list after adding
  };

  return (
    <div>
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
        <button type="submit">Create Asset</button>
         <button type="button" onClick={() => navigate('/assets')}>Cancel</button>
      </form>
    </div>
  );
}

export default AssetForm;