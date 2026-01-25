import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const DashboardLayout = () => {
  const {user} = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {user && (<div className="flex min-h-screen gap-6">
        <Sidebar />
        <Outlet/>
      </div>)}
    </div>
  );
};

export default DashboardLayout;
