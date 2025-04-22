// src/pages/AssetDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Asset, WorkOrder, MeterReading } from '../types'; // Import MeterReading

interface AssetDetailPageProps {
    assets: Asset[];
    workOrders: WorkOrder[];
    meterReadings: MeterReading[]; // <-- Add meterReadings prop
}

function AssetDetailPage({ assets, workOrders, meterReadings }: AssetDetailPageProps) { // <-- Destructure meterReadings
  const { assetId } = useParams<{ assetId: string }>();
  const asset = assets.find(a => a.id === assetId);

  const getStatusClassName = (status: Asset['status']): string => {
    // ... (getStatusClassName function remains the same) ...
    const baseClass = 'status-badge';
    switch (status) {
        case 'Online': return `${baseClass} status-online`;
        case 'Maintenance': return `${baseClass} status-maintenance`;
        case 'Offline - Planned': return `${baseClass} status-offline-planned`;
        case 'Offline - Unplanned': return `${baseClass} status-offline-unplanned`;
        default: return baseClass;
    }
  };

  if (!asset) {
    return ( // Use div instead of detail-view for not found
      <div className="container"> {/* Add container for padding */}
        <h2>Asset Not Found</h2>
        <p>Could not find asset with ID: {assetId || 'Unknown'}</p>
        <Link to="/assets"><button>Back to Assets List</button></Link>
      </div>
    );
  }

  // Filter data for this specific asset
  const maintenanceHistory = workOrders.filter(wo => wo.assetId === asset.id);
  const assetMeterReadings = meterReadings
        .filter(mr => mr.assetId === asset.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

  return (
    <div className="detail-view">
      <h2>Asset Details: {asset.name}</h2>
      <p><strong>ID:</strong> {asset.id}</p>
      <p><strong>Name:</strong> {asset.name}</p>
      <p><strong>Location:</strong> {asset.location}</p>
      <p><strong>Type:</strong> {asset.type}</p>
      <p>
        <strong>Status:</strong>
        <span className={getStatusClassName(asset.status)}>
            {asset.status}
        </span>
      </p>

      {/* Meter Readings Section */}
      <h3>
        Meter Readings
        {/* Link to add a new reading */}
        <Link to={`/assets/${asset.id}/add-reading`} style={{ marginLeft: '20px', fontSize: '0.9em' }}>
            <button type="button" style={{fontSize: '0.8em', padding: '0.4rem 0.8rem'}}>+ Add Reading</button>
        </Link>
      </h3>
      <div className="meter-readings-list">
        {assetMeterReadings.length > 0 ? (
           <ul>
            {assetMeterReadings.map(reading => (
                <li key={reading.id}>
                    <span className="reading-value">{reading.value} {reading.unit || ''}</span>
                    <span className="reading-date">on {new Date(reading.date).toLocaleString()}</span>
                    {reading.notes && <span className="reading-notes">Notes: {reading.notes}</span>}
                </li>
            ))}
           </ul>
        ) : (
            <p>No meter readings logged for this asset.</p>
        )}
      </div>


      {/* Placeholder for Reliability Metrics (Mentioning calculation need) */}
      <h3>Reliability Metrics</h3>
      <p><i>(Requires historical failure/repair data & calculation logic)</i></p>
      <ul style={{listStyle: 'disc', marginLeft: '20px'}}>
        <li>MTBF (Mean Time Between Failures): N/A</li>
        <li>MTTR (Mean Time To Repair): N/A</li>
        <li>Availability: N/A</li>
      </ul>

      {/* Maintenance History Section */}
      <h3>Maintenance History</h3>
      {maintenanceHistory.length > 0 ? (
        <ul>
          {maintenanceHistory.map(wo => (
            <li key={wo.id}>
              <Link to={`/workorders/${wo.id}`}>{wo.title} ({wo.id})</Link>
              <span>Status: {wo.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No maintenance history found for this asset.</p>
      )}

      <br />
      <Link to="/assets"><button>Back to Assets List</button></Link>
    </div>
  );
}

export default AssetDetailPage;