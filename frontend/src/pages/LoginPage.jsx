import React from 'react'
import { useState } from 'react'
import { useLogin } from '../hooks/useLogin'
import Navbar from '../components/Navbar';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Sign up logic here
        await login (email, password);
    }

  return (
    <div className='min-h-screen flex flex-col'>
       <Navbar/>
        <div className="flex flex-1 justify-center items-center bg-gray-200">
            <div className='bg-white rounded-xl p-8 shadow-lg w-full max-w-md'>
                <h3 className='text-2xl font-bold mb-6 text-left'>Log In.</h3>
                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder='Email address'
                    />

                    <input 
                        type="password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password}
                        className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder='Password'
                    />
                    <button disabled={isLoading} className='bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition mt-4'>Log In</button>
                    {error && <div className='text-red-500 font-semibold text-center'>{error}</div>}
                </form>
            </div>
        </div>
    </div>
  )
}

export default LoginPage