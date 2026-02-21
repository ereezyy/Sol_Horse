import React from 'react';
import { Race, HorseNFT } from '../types';

interface RaceTrackProps {
  race: Race;
  horses: HorseNFT[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ race, horses }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{race.name}</h2>
        <p className="text-gray-600">{race.location} • {race.distance}m</p>
      </div>

      <div className="relative h-64 bg-green-50 rounded-xl border border-green-200 overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">Race visualization temporarily unavailable.</p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3">Participants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {horses.map(horse => (
            <div key={horse.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {horse.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{horse.name}</p>
                <p className="text-xs text-gray-600">Gen {horse.genetics.generation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaceTrack;
