import React from 'react'
import { useState } from 'react'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Sign up logic here
        console.log(email, password);
    }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='bg-gray-300 p-8 rounded-lg shadow-lg w-full max-w-md'>
            <h3 className='text-4xl font-bold mb-6 text-center'>Log In.</h3>
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
                <button className='bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition mt-8'>Sign Up</button>
            </form>
        </div>
    </div>
  )
}

export default LoginPage