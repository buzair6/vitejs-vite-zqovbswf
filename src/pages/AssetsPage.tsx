// src/pages/AssetsPage.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Asset } from '../types';

interface AssetsPageProps {
  assets: Asset[];
}

function AssetsPage({ assets }: AssetsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = useMemo(() => {
    if (!searchTerm) {
      return assets;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    // Ensure assets is an array before filtering
    if (!Array.isArray(assets)) return [];
    return assets.filter(asset =>
      asset && ( // Check if asset object exists
        asset.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.location?.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.type?.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.id?.toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [assets, searchTerm]);

  return (
    // Added page wrapper class for consistent padding/margin
    <div className="assets-page">
      {/* New Header Structure */}
      <div className="page-header">
          <h2>Assets</h2>
          <div className="page-header-actions">
             <input
                type="text"
                placeholder="Search Assets..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
            <Link to="/assets/new" className="button-link">Create New Asset</Link>
          </div>
      </div>

      {/* Grid for Assets */}
      <div className="assets-list">
        {/* Ensure filteredAssets is an array */}
        {!Array.isArray(filteredAssets) || filteredAssets.length === 0 ? (
          <p className="no-data">{searchTerm ? 'No assets match your search.' : 'No assets found.'}</p>
        ) : (
          filteredAssets.map(asset => {
            // Handle cases where an asset might be null/undefined in the array
            if (!asset) return null;
            return (
                <div className="asset-item" key={asset.id}>
                  {/* Use ?? for default values */}
                  <h3>{asset.name ?? 'Unnamed Asset'}</h3>
                  <p><strong>ID:</strong> {asset.id ?? 'No ID'}</p>
                  <p><strong>Location:</strong> {asset.location ?? 'N/A'}</p>
                  <p><strong>Type:</strong> {asset.type ?? 'N/A'}</p>
                  <Link to={`/assets/${asset.id}`} className="view-details-link">View Details</Link>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default AssetsPage;