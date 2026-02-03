import React from 'react'

const ManageBookingForm = (onClose) => {
  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h2 className="text-lg">Find Appointment</h2>

      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <label className='text-xl font-semibold' htmlFor="">Email</label>
                    <input 
                        type="email" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        className='bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        placeholder='example@gmail.com'
                    />

                    <label className='text-xl font-semibold' htmlFor="">Password</label>
                    <input 
                        type="password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password}
                        className='bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        placeholder='******'
                    />
                    <button disabled={isLoading} className='bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition mt-8'>Sign Up</button>
                    {error && <div className='text-red-500 font-semibold text-center'>{error}</div>}
                </form>
    </div>
  )
}

export default ManageBookingForm