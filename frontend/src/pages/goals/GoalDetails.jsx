import React from 'react';
import { useParams } from 'react-router-dom';

const GoalDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Goal Details (ID: {id})</h1>
      <p className="text-gray-600 mt-2">
        Simulation and detailed projection charts will appear here in Milestone 3.
      </p>
    </div>
  );
};

export default GoalDetails;