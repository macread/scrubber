import React from 'react';

const PointContext = React.createContext();

function useUsssPoints() {
  const context = React.useContext(PointContext);
  if (!context) {
    throw new Error(`useUsssPoints must be used within a PointsProvider`);
  }
  return context;
}

function useFisPoints() {
  const context = React.useContext(PointContext);
  if (!context) {
    throw new Error(`useFisPoints must be used within a PointsProvider`);
  }
  return context;
}

function PointProvider(props) {
  const [fisPoints, setFisPoints] = React.useState();
  const [usssPoints, setUsssPoints] = React.useState();
  const value = React.useMemo(() => [usssPoints, setUsssPoints], [usssPoints], [fisPoints, setFisPoints], [fisPoints]);
  return <PointContext.Provider value={value} {...props} />
}

export default { PointProvider, useFisPoints, useUsssPoints };