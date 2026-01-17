import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const AppointmentForm = ({ appointment = null, onClose, onSuccess }) => {
  const isEdit = Boolean(appointment);
  const [isWalkIn, setIsWalkIn] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("")

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    doctor: "",
    startTime: "",
    status: "",
    isWalkIn: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appointment) {
      const start = new Date(appointment.startTime);

      setFormData({
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctor: appointment.doctor?._id || "",
        startTime: appointment.startTime,
        status: appointment.status,
        isWalkIn: appointment.isWalkIn,
      });
    }
  }, [appointment]);

  useEffect(() => {
    if(!selectedDate || !selectedTime) return;

    const fetchAvailableTimes = async () => {
      const res = await fetch(
        `http://localhost:5555/${selectedDoctor}/available-slots?date=${selectedDate}`,
        {
          headers: {Authorization: `Bearer ${user.token}`},
        }
      );

      const json = await res.json();
      if(res.ok){
        setAvailableSlots(json.slots);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, selectedDoctor])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const payload = {
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        doctor: formData.doctor,
        startTime: formData.startTime,
        status: formData.status,
        isWalkIn: formData.isWalkIn,
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        isEdit
          ? "http://localhost:5555/appointments/${appointment._id}"
          : "http://localhost:5555/appointments/",

        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Try again later.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Edit Appointment" : "Add Appointment"}
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Email
          </label>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Phone
          </label>
          <input
            type="text"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
                <label className="block text-sm font-medium mb-1">
                Doctor
                </label>

                <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                <option value="">Select a doctor</option>

                {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                    </option>
                ))}
                </select>
            </div>

        {/* Start Time Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date) => setSelectedDate(date)}
            filterDate={(date) => availableSlots.includes(date.toISOString().split("T")[0])}
            dateFormat="yyyy-MM-dd"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a time</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">Did not show</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isWalkIn}
              onChange={(e) => setIsWalkIn(e.target.checked)}
            />
            Walk-in appointment?
          </label>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
