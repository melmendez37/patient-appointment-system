import React from "react";
import { useEffect } from "react";
import { useAvailabilityContext } from "../../hooks/useAvailabilityContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import AvailabilityRow from "../../components/availabilities/AvailabilityRow";

const ViewSchedules = () => {
  const { availabilities, dispatch } = useAvailabilityContext();
  const { user } = useAuthContext();

  const role = user?.user?.role;
  const canManage = role === "admin" || role === "staff" || role === "doctor";

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

  return (
    <div className="flex-1 p-6 bg-white">
      {availabilities.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
      {availabilities.map((availabilities) => (
        <AvailabilityRow
          key={availabilities._id}
          availabilities={availabilities}
          canManage={canManage}
        />
      ))}
    </div>
  );
};

export default ViewSchedules;
