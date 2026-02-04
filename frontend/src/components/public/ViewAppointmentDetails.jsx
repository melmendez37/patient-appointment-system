import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ViewAppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      const token = sessionStorage.getItem("appointmentToken");

      if (!token) {
        setError(
          "No access token found. Please verify your appointment first.",
        );
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5555/public/appointments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json = await res.json();

        console.log("Fetch appointment response:", json);

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
  }, [id]);

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
      <h2>Appointment Details</h2>
      <p className="capitalize">Status: {appointment?.status}</p>
      <p>Doctor: {appointment?.doctor?.name}</p>
      <p>
        Date:{" "}
        {new Date(appointment.date).toLocaleString("en-PH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p>Reference: {appointment.referenceNumber}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default ViewAppointmentDetails;
