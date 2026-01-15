import React, { useEffect } from "react";
import { useAppointmentsContext } from "../../hooks/useAppointmentsContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import AppointmentRow from "../../components/appointments/AppointmentRow";

const ViewAppointments = () => {
  const { appointments, dispatch } = useAppointmentsContext();
  const { user } = useAuthContext();

  const role = user?.user?.role;
  const canSeeDoctor = role === "staff" || role === "admin";
  const canManageAppointments = role === "staff" || role === "doctor";
  const isDoctor = role === "doctor";

  useEffect(() => {
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

    if (user) {
      fetchAppointments();
    }
  }, [dispatch, user]);

  console.log("user:", user);
  console.log("appointments:", appointments);

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Appointments</h1>
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Add Appointment
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6 text-sm items-center font-semibold text-gray-500">
        <div>Patient</div>
        <div>Doctor</div>
        <div>Date & Time</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {appointments.length === 0 ? (
        <p className="text-center mt-4">No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <AppointmentRow
            key={appointment._id}
            appointment={appointment}
            canSeeDoctor={canSeeDoctor}
            canManageAppointments={canManageAppointments}
            isDoctor={isDoctor}
          />
        ))
      )}
    </div>
  );
};

export default ViewAppointments;
