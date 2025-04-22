// src/pages/MeterReadingForm.tsx
import React, { useState, FormEvent, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Asset, MeterReading } from '../types';

interface MeterReadingFormProps {
    assets: Asset[];
    addMeterReading: (readingData: Omit<MeterReading, 'id' | 'date'>) => void; // Exclude auto-generated fields
}

function MeterReadingForm({ assets, addMeterReading }: MeterReadingFormProps) {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  // Find the asset based on the URL parameter
  const currentAsset = useMemo(() => assets.find(a => a.id === assetId), [assets, assetId]);

  const [value, setValue] = useState<string>(''); // Use string initially for flexibility
  const [unit, setUnit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!assetId || !value) {
      alert('Asset ID is missing or reading value is empty.');
      return;
    }

    // Basic validation: Try converting to number if unit suggests it, otherwise keep as string
    let processedValue: number | string = value;
    const numericUnits = ['hours', 'psi', 'miles', 'km', 'cycles', 'count', 'temp', 'vibration']; // Example numeric units
    if (unit && numericUnits.some(u => unit.toLowerCase().includes(u))) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            processedValue = numValue;
        } else {
            alert(`Value "${value}" doesn't seem to be a valid number for unit "${unit}". Please check.`);
            return;
        }
    }

    addMeterReading({
      assetId,
      value: processedValue,
      unit: unit || undefined, // Send undefined if empty
      notes: notes || undefined, // Send undefined if empty
    });

    // Navigate back to the asset detail page after submission
    navigate(`/assets/${assetId}`);
  };

  if (!currentAsset) {
     return (
      <div className="container">
        <h2>Asset Not Found</h2>
        <p>Could not find asset with ID: {assetId || 'Unknown'}</p>
        <Link to="/assets"><button>Back to Assets List</button></Link>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Add Meter Reading for {currentAsset.name} ({currentAsset.id})</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="value">Reading Value:</label>
          <input
            type="text" // Keep as text for flexibility (e.g., "OK", "Check Engine")
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            placeholder="e.g., 1550 or OK"
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Unit (Optional):</label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., Hours, PSI, Miles, Cycles"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any relevant notes about this reading"
          />
        </div>

        <div className="form-actions">
          <button type="submit">Add Reading</button>
          {/* Link back to the asset detail page */}
          <Link to={`/assets/${assetId}`}><button type="button">Cancel</button></Link>
        </div>
      </form>
    </div>
  );
}

export default MeterReadingForm;