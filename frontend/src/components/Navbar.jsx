import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';

const Navbar = () => {
    const { logout } = useLogout();
    const {user} = useAuthContext();
    const handleClick = () => {
        // Placeholder for logout functionality
        logout();
        console.log("Log out clicked");
    }
  return (
    <header>
        <div className="container flex justify-between items-center max-w-full bg-gray-100 text-black p-4">
            <Link to="/">
                <h1 className='text-2xl uppercase font-bold'>Medqueue</h1>
                </Link>
            <nav>
                <div className="flex gap-4 items-center ">
                    {user && (
                        <div className='flex justify-between gap-8'>
                            <Link to="/dashboard/profile">{user.user.email}</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <button onClick={handleClick}>Log out</button>
                        </div>
                    )}
                    {!user && (
                        <div className='flex justify-around gap-4'>
                            <Link to="/public">Public</Link>
                            <Link to="/login">Login</Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    </header>
  )
}

export default Navbar