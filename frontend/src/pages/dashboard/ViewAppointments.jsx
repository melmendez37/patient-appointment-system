import React, { useEffect } from "react";
import { useAppointmentsContext } from "../../hooks/useAppointmentsContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const ViewAppointments = () => {
  const { appointments, dispatch } = useAppointmentsContext();
  const { user } = useAuthContext();

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
        <div key={appointment._id} className="grid grid-cols-5 items-center gap-2 mb-8">
          <div className="font-semibold text-gray-900">
            {appointment.patientName}
          </div>
          <div className="font-semibold text-gray-900">
            {appointment.doctor?.name ?? "-"}
          </div>
          <div className="w-40">
            <span className="block text-sm font-medium text-gray-900">
              {new Date(appointment.startTime).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(appointment.startTime).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    appointment.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : appointment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }
                `}
            >
              {appointment.status}
            </span>
          </div>

          {user?.user?.role === "staff" && (
            <div className="flex gap-8">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800 font-medium">
                Delete
              </button>
            </div>
          )}

          {user?.user?.role === "doctor" && (
            <div className="flex gap-3 ml-6">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Update status
              </button>
            </div>
          )}
        </div>
      ))
      )}
      
      {}
    </div>
  );
};

export default ViewAppointments;
