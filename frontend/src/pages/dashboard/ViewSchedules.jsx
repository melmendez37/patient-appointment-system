import React from 'react'
import { useEffect } from 'react'
import { useAvailabilityContext } from '../../hooks/useAvailabilityContext'
import { useAuthContext } from '../../hooks/useAuthContext'

const ViewSchedules = () => {
    const {availabilities, dispatch} = useAvailabilityContext();
    const {user} = useAuthContext();

    useEffect(() => {
        const fetchAvailabilities = async () => {
          const response = await fetch("http://localhost:5555/schedules", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          const json = await response.json();
    
          if (response.ok) {
            dispatch({ type: "SET_AVAILABILITIES", payload: json.data });
          }
        };
    
        if (user) {
          fetchAvailabilities();
        }
      }, [dispatch, user]);
    
      console.log("user:", user);
      console.log("schedules:", availabilities);

  return (
    <div className="flex-1 p-6 bg-white">
        {availabilities.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
      {availabilities.map((availabilities) => (
        <div key={availabilities._id} className="flex justify-around gap-8 mb-8">
          <div className="flex-1 font-semibold text-gray-900">
            {availabilities.startTime}
          </div>
          
        </div>
      ))}
    </div>
  )
}

export default ViewSchedules