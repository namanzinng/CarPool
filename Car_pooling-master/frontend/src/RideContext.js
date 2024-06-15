// RideContext.js

import { createContext, useContext, useEffect, useState } from 'react';

const RideContext = createContext();

const RideProvider = ({ children }) => {
  const [rideInfo, setRideInfo] = useState(() => {
    // Try to retrieve data from localStorage on component mount
    const storedRideInfo = localStorage.getItem('rideInfo');
    return storedRideInfo ? JSON.parse(storedRideInfo) : {};
  });

  const setRideDetails = (details) => {
    setRideInfo(details);
  };

  useEffect(() => {
    // Update localStorage whenever rideInfo changes
    localStorage.setItem('rideInfo', JSON.stringify(rideInfo));
  }, [rideInfo]);

  // console.log("RideInfo:", rideInfo);

  return (
    <RideContext.Provider value={{ rideInfo, setRideDetails }}>
      {children}
    </RideContext.Provider>
  );
};

const useRideContext = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRideContext must be used within a RideProvider');
  }
  return context;
};

export { RideProvider, useRideContext }; 
