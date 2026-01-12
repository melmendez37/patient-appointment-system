import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAppointmentsContext } from '../hooks/useAppointmentsContext'
import { useAuthContext } from '../hooks/useAuthContext'
import Sidebar from '../components/Sidebar'

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
      <div className='flex min-h-screen gap-6'>
        <div className='w-64 bg-gray-800 text-white p-4'>
          <Sidebar/>
        </div>
        
        <div className='flex-1 p-6 bg-white'>
          {appointments.length === 0 && (
          <p className="text-center mt-4">No appointments found.</p>
        )}
        {appointments.map((appointment) => (
          <div key={appointment._id} className='flex justify-around gap-8 mb-8'>
            <div className="w-40 flex flex-col">
              <span className='text-sm font-medium text-gray-900'>
                {new Date(appointment.startTime).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className='text-xs text-gray-500'>
                {new Date(appointment.startTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex-1 font-semibold text-gray-900">
              {appointment.patientName}
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
              <div className="flex gap-8 ml-6">
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
        ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage