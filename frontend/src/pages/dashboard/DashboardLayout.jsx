import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const DashboardLayout = () => {
  const {user} = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {user && (<div className="flex min-h-screen gap-6 p-6">
        <Outlet/>
      </div>)}
    </div>
  );
};

export default DashboardLayout;
