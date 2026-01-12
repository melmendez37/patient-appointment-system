import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
const Sidebar = () => {
    const {user} = useAuthContext();

  return (
   <div className="bg-gray-800 text-white p-6 h-screen w-64 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Welcome</h1>
        <nav className="flex flex-col gap-4">
            <Link to="/dashboard/appointments" className='px-4 py-2 rounded hover:bg-gray-700 transition'>Appointments</Link>
            <Link to="/dashboard/schedules" className='px-4 py-2 rounded hover:bg-gray-700 transition'>Availability</Link>
            <Link to="/dashboard/user" className='px-4 py-2 rounded hover:bg-gray-700 transition'>Profile</Link>
            {user?.user.role === "admin" && (
                <Link className='px-4 py-2 rounded hover:bg-gray-700 transition'>Users</Link>
            )}
        </nav>
   </div>
  )
}

export default Sidebar