import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CreateAppointmentForm = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    doctor: "",
    startTime: "",
  });

  //fetching doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5555/public/doctors");
        const json = await res.json();

        if (res.ok) {
          setDoctors(json);
        } else {
          console.error("Error fetching doctors:", json.message);
        }
      } catch (error) {
        console.error("server error.");
      }
    };

    fetchDoctors();
  }, []);

  //fetching available days
  useEffect(() => {
    if (!formData.doctor) return;
    
    const fetchAvailableDays = async () => {
      const res = await fetch(
        `http://localhost:5555/public/schedules/${formData.doctor}/available-days`,
      );

      const json = await res.json();
      console.log("Fetched available days:", json);
      if (res.ok) {
        setAvailableDays(
          Array.isArray(json.availableDays) ? json.availableDays : [],
        );
      } else {
        console.error("Failed to fetch available days:", json.message);
        setAvailableDays([]);
      }
    };

    fetchAvailableDays();
  }, [formData.doctor]);

  //fetching available timeslots
  useEffect(() => {
    if (!selectedDate || !formData.doctor) return;
    const fetchAvailableTimes = async () => {
      const res = await fetch(
        `http://localhost:5555/public/schedules/${formData.doctor}/available-slots?date=${selectedDate}`,
      );

      const json = await res.json();
      if (res.ok) {
        setAvailableSlots(Array.isArray(json) ? json : []);
      } else {
        console.error("Failed to fetch available times:", json.message);
        setAvailableSlots([]);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, formData.doctor]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // if selectedTime is like "2026-02-02T11:30:00.000Z"
      const timePart = new Date(selectedTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // "11:30"

      // now you can split into hours and minutes
      const [hours, minutes] = timePart.split(":").map(Number);

      // combine with selectedDate
      const [year, month, day] = selectedDate.split("-").map(Number);
      const startTime = new Date(year, month - 1, day, hours, minutes).toISOString();

    

    try {
      const payload = {
      ...formData,
      startTime: startTime,
    };

    console.log("Submitting appointment with payload:", payload);

      const res = await fetch("http://localhost:5555/public/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to create appointment.");
      
      console.log("Appointment created successfully:", json);
         navigate(`/public/appointments/${json._id}`);
    } catch (error) {
      setError(error.message || "Failed to create appointment.");
      console.log(error.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Create Appointment</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full name"
          />
        </div>
        <div>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email address"
          />
        </div>
        <div>
          <input
            type="text"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Phone number"
          />
        </div>

        <div>
          <select
            value={formData.doctor}
            onChange={handleChange}
            name="doctor"
            required
            className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Dropdown */}
        <div>
          <select
            value={formData.selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            name="selectedDate"
            className={`w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none transition ${!formData.doctor ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
            disabled={!formData.doctor}
          >
            <option value="">
              Date
            </option>
            {Array.isArray(availableDays) &&
              availableDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            name="selectedTime"
            required
            disabled={!formData.doctor || !selectedDate}
            className={`w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none transition ${!formData.doctor ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              Time
            </option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "UTC",
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !formData.patientName ||
              !formData.patientEmail ||
              !formData.patientPhone ||
              !formData.doctor ||
              !selectedDate ||
              !selectedTime
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAppointmentForm;
