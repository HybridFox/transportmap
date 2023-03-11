import React from 'react';
import * as ol from 'ol';

const MapContext: React.Context<{ map: ol.Map }> = React.createContext<{ map: ol.Map }>(null as any);

export default MapContext;
