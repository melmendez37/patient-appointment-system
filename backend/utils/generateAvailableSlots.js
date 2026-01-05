export const generateAvailableSlots = (
    date, startTime, endTime, bookedAppointments
) => {
      const targetDate = new Date(date);
      //generate 30min slots between startTime and endTime
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      let current = new Date(Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        startHours,
        startMinutes
      ));

      const end = new Date(Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        endHours,
        endMinutes
      ));

      const slots = [];
      while (current < end) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + 30); // Assuming 30-minute slots
      }

      

      const bookedSlots = bookedAppointments.map((app) =>
        app.startTime.getTime()
      );

      //filter out booked slots
      return slots.filter(
        (slot) => !bookedSlots.includes(slot.getTime())
      );

};