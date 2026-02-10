import React, { useEffect, useState } from "react";
import { useAppointmentsContext } from "../../hooks/useAppointmentsContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import AppointmentRow from "../../components/appointments/AppointmentRow";
import AppointmentForm from "../../components/appointments/AppointmentForm";
import Modal from "../../components/Modal";

const ViewAppointments = () => {
  const { appointments, dispatch } = useAppointmentsContext();
  const { user } = useAuthContext();

  const role = user?.user?.role;
  const canSeeDoctor = role === "staff" || role === "admin";
  const isStaff = role === "staff";
  const isDoctor = role === "doctor";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = async () => {
      const response = await fetch("http://localhost:5555/appointments", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_APPOINTMENTS", payload: json.data });
      }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment); 
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return (
    <div>
      <div className="flex p-2">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Appointments</h1>
        {isStaff && (
          <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          onClick={() => {
            setEditingAppointment(null);
            setIsModalOpen(true);
            
          }}
        >
          Add Appointment
        </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6 text-sm items-center font-semibold text-gray-500">
        <div>Patient</div>
        {canSeeDoctor && (<div>Doctor</div>)}
        <div>Date & Time</div>
        <div>Status</div>
        {(isStaff || isDoctor) && (<div>Actions</div>)}
      </div>

      {appointments.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
        
      <div className="max-h-150 overflow-y-auto">
        {appointments.map((appointment) => (
          <AppointmentRow
            key={appointment._id}
            appointment={appointment}
            canSeeDoctor={canSeeDoctor}
            isStaff={isStaff}
            isDoctor={isDoctor}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <AppointmentForm
            appointment={editingAppointment} // null for POST
            onClose={() => setIsModalOpen(false)}
            isDoctor={isDoctor}
            isStaff={isStaff}
            onSuccess={fetchAppointments}
            setEditingAppointment = {handleEdit}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewAppointments;
