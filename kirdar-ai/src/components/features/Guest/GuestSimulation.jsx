// In GuestSimulation.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Simulation from '../ScenarioChallenge/Simulation';

const GuestSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const simulationData = location.state;

  useEffect(() => {
    if (!simulationData?.data || !simulationData?.guestData) {
      navigate('/guest');
    }
  }, [simulationData, navigate]);

  if (!simulationData?.data) return null;

  // Extract features from guestData
  const features = simulationData?.guestData?.features || {};
  
  console.log('Guest Simulation Features:', features); // Debug log

  return (
    <div className="min-h-screen bg-black">
      <Simulation 
        isGuest={true}
        initialData={{
          type: simulationData.type,
          data: simulationData.data,
          guestData: {
            ...simulationData.guestData,
            features: {
              mentorEnabled: Boolean(features.mentorEnabled),
              evaluatorEnabled: Boolean(features.evaluatorEnabled)
            }
          }
        }}
      />
    </div>
  );
};

export default GuestSimulation;