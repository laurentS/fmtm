import React from 'react';
import CoreModules from '@/shared/CoreModules';

const MappingHeader = () => {
  return (
    <CoreModules.Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', fontSize: '14px' }}>
      <CoreModules.Typography color="error" sx={{ fontSize: '14px' }}>
        Sauvons la France (eh oui, rien que ça!)
      </CoreModules.Typography>
      <CoreModules.Link
        to="https://frontpopulaire-2024.fr"
        style={{ textDecoration: 'none', color: '#d73f3e' }}
        target="_blank"
      >
        frontpopulaire-2024.fr
      </CoreModules.Link>
    </CoreModules.Box>
  );
};

export default MappingHeader;
