import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import { useState } from "react";
import FindAppointmentForm from "../components/public/FindAppointmentForm";
import CreateAppointmentForm from "../components/public/CreateAppointmentForm";

const HomePage = () => {
   const [modalType, setModalType] = useState(null);
  return (
    <div className="min-h-screen flex flex-col gap-8">
      <div>
        <Navbar />
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={() => setModalType("add")} className="bg-orange-500 text-white p-2 rounded">Add Appointment</button>
        <button onClick={() => setModalType("view")} className="bg-blue-500 text-white p-2 rounded">Find Appointment</button>
        <button onClick={() => setModalType("manage")} className="bg-green-500 text-white p-2 rounded">Manage Booking</button>
      </div>
      

      {modalType && (
        <Modal onClose={() => setModalType(null)}>
          {modalType === "add" && (<  CreateAppointmentForm onClose={() => setModalType(null)} />)}
          {modalType === "view" && (<FindAppointmentForm onClose={() => setModalType(null)} />)}
          {modalType === "manage" && (<ManageBookingForm onClose={() => setModalType(null)} />)}
        </Modal>
      )}
      
    </div>
  );
};

export default HomePage;
