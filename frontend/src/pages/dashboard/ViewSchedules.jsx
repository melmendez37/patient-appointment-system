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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);

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

  const handleEdit = (availability) => {
    setEditingAvailability(availability); 
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [user])

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Schedules</h1>
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          onClick={() => {
            setEditingAvailability(null);
            setIsModalOpen(true);
            
          }}
        >
          Add Schedule
        </button>
      </div>
      {availabilities.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
      {availabilities.map((availabilities) => (
        <AvailabilityRow
          key={availabilities._id}
          availabilities={availabilities}
          canManage={canManage}
          onEdit={handleEdit}
        />
      ))}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <AvailabilityForm
            availability={editingAvailability} // null for POST
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchAvailabilities}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewSchedules;
