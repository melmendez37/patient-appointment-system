import React, {use, useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom';

const ManageBookingForm = (onClose) => {
  const {id} = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("appointmentToken");

  //appointment
  useEffect(() => {
    const fetchAppointment = async () => {
      if(!token){
        setError("No access token found. Please verify your appointment first.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/public/appointments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message);
        }
        setAppointment(json);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

      if(!token){
        setError("No access token found. Please verify your appointment first.");
        setIsLoading(false);
        return;
      }

      try {
        const dateObj = new Date(appointment.startTime);
        const [hours, minutes] = selectedTime.split(":").map(Number);

        dateObj.setHours(hours);
        dateObj.setMinutes(minutes);
        dateObj.setSeconds(0);
        dateObj.setMilliseconds(0);

        const payload = {
          startTime: dateObj.toISOString(),
        };
        
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/public/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message);
        }
        setAppointment(json);
        navigate(-1);
      } catch (error) {
        setError("ERROR: " + error.message);
      } finally {
        setIsLoading(false);
      }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div>
        <p>Appointment not found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Edit Appointment Time</h2>
      <p className="capitalize">Status: {appointment?.status}</p>
      <p>Doctor: {appointment?.doctor?.name}</p>
      <p>Reference: {appointment?.referenceNumber}</p>   
      <form onSubmit={handleSubmit}>
        <label>
          Time:
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Time"}
        </button>
      </form>
         

      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )
}

export default ManageBookingForm