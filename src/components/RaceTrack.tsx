import React from 'react';
import { Race, HorseNFT } from '../types';

interface RaceTrackProps {
  race: Race;
  horses: HorseNFT[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ race, horses }) => {
  return (
    <div className="bg-gray-100 p-8 rounded-xl text-center">
      <h2 className="text-2xl font-bold mb-4">Race Track: {race.name}</h2>
      <p className="text-gray-600 mb-4">
        {horses.length} horses are ready to race on this {race.distance}m track!
      </p>
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
        Race visualization is currently under maintenance.
      </div>
    </div>
  );
};

export default RaceTrack;