import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useState } from "react";
import { LogOut, CircleUser } from "lucide-react";

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const handleClick = () => {
    // Placeholder for logout functionality
    logout();
    console.log("Log out clicked");
  };

  const [openMenu, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="container flex justify-between items-center max-w-full bg-gray-100 text-black p-6">
        <Link to="/">
          <h1 className="text-2xl uppercase font-bold">Medqueue</h1>
        </Link>
        <nav>
          <div className="flex gap-4 items-center ">
            {user && (
              <div className="flex justify-between gap-8">
                <Link className="hover:underline" to="/dashboard/appointments">Appointments</Link>
                <Link className="hover:underline" to="/dashboard/schedules">Availability</Link>
                {user?.user.role === "admin" && (
                  <Link className="hover:underline" to="/dashboard/users">Users</Link>
                )}
                <Link to="/dashboard/profile"><CircleUser/></Link>
                <button onClick={handleClick}><LogOut/></button>
              </div>
            )}
            {!user && (
              <div className="flex justify-around gap-4">
                <Link className="flex justify-center items-center gap-3" to="/login">Login</Link>
                <Link className="flex justify-center items-center gap-3" to="/signup">Signup</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
