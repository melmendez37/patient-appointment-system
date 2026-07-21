import React from "react";
import { useState, useEffect } from "react";
import { useAvailabilityContext } from "../../hooks/useAvailabilityContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import AvailabilityRow from "../../components/availabilities/AvailabilityRow";
import AvailabilityForm from "../../components/availabilities/AvailabilityForm";
import Modal from "../../components/Modal";

const ViewSchedules = () => {
  const { availabilities, dispatch } = useAvailabilityContext();
  const { user } = useAuthContext();

  const role = user?.user?.role;
  const canManage = role === "admin" || role === "staff" || role === "doctor";
  const isDoctor = role === "doctor";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);

  const fetchAvailabilities = async () => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/schedules`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "SET_AVAILABILITIES", payload: json.data });
    }
  };

  const handleEdit = (availability) => {
    setEditingAvailability(availability); 
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [user])

  return (
    <div>
      <div className="flex justify-between items-start p-2">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Schedules</h1>
        {!isDoctor && (
          <button
          className="px-4 py-2 rounded-lg bg-blue-800 text-white font-medium hover:bg-blue-900 transition"
          onClick={() => {
            setEditingAvailability(null);
            setIsModalOpen(true);
            
          }}
        >
          Add Schedule
        </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6 text-sm items-center font-semibold text-gray-500">
        <div>Doctor</div>
        <div>Schedule</div>
        {!isDoctor && (<div>Days</div>)}
      </div>
      {availabilities.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
      <div className="max-h-150 overflow-y-auto">
        {availabilities.map((availabilities) => (
        <AvailabilityRow
          key={availabilities._id}
          availabilities={availabilities}
          canManage={canManage}
          isDoctor={isDoctor}
          onEdit={handleEdit}
        />
      ))}
      </div>
      

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <AvailabilityForm
            availability={editingAvailability} // null for POST
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchAvailabilities}
            isDoctor={isDoctor}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewSchedules;
