import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAppointmentsContext } from '../hooks/useAppointmentsContext'
import { useAuthContext } from '../hooks/useAuthContext'

const HomePage = () => {
  const {appointments, dispatch} = useAppointmentsContext()
  const {user} = useAuthContext();
  

  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await fetch('http://localhost:5555/appointments', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json();

      if(response.ok){
        dispatch({type: "SET_APPOINTMENTS", payload: json.data}) 
      }
    }
    
    if(user){
      fetchAppointments();
    }
  }, [dispatch, user])

  console.log("user:", user);
console.log("appointments:", appointments);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {appointments.length === 0 && (
        <p className="text-center mt-4">No appointments found.</p>
      )}
      {appointments.map((appointment) => (
        <div key={appointment._id} className='flex justify-around gap-8'>
          <p className='font-bold'>{appointment.patientName}</p>
          <p>{appointment.status}</p>
          <p>{appointment.startTime}</p>
          {user.user.role === "staff" && 
          (<div className='flex justify-between gap-4'>
            <p>Edit</p>
            <p>Delete</p>
          </div>)}

        </div>
      ))}
    </div>
  )
}

export default HomePage