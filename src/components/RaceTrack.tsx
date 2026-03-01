import React, { useEffect } from 'react';
import { Race, HorseNFT } from '../types';

interface RaceTrackProps {
  race: Race;
  horses: HorseNFT[];
}

const RaceTrack: React.FC<RaceTrackProps> = (props) => {
  return (
    <div>
      <p>RaceTrack Component Placeholder</p>
    </div>
  );
};

export default RaceTrack;