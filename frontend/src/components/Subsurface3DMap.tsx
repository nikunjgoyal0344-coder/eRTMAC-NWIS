import React from 'react';
import { WellSummary, FormationLayer, DrillingEvent, SurveyPoint } from '../types';
import { SubsurfaceMapView } from './map/SubsurfaceMapView';

export interface Subsurface3DMapProps {
  wells: WellSummary[];
  formations: FormationLayer[];
  events: DrillingEvent[];
  trajectories?: Record<string, SurveyPoint[]>;
  activeDepth: number;
  radiusKm: number;
  onRadiusChange: (r: number) => void;
  selectedWellId: string;
  onSelectWell: (wellId: string) => void;
  onSelectEvent?: (evt: DrillingEvent) => void;
  isLightMode?: boolean;
}

export const Subsurface3DMap: React.FC<Subsurface3DMapProps> = ({
  wells,
  formations,
  events,
  trajectories,
  activeDepth,
  radiusKm,
  onRadiusChange,
  selectedWellId,
  onSelectWell,
  isLightMode = true,
}) => {
  return (
    <SubsurfaceMapView
      wells={wells}
      formations={formations}
      events={events}
      trajectories={trajectories}
      activeDepth={activeDepth}
      radiusKm={radiusKm}
      onRadiusChange={onRadiusChange}
      selectedWellId={selectedWellId}
      onSelectWell={onSelectWell}
      isLightMode={isLightMode}
    />
  );
};

export default Subsurface3DMap;
