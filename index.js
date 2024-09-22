const express = require("express");
const app = express();

app.use(express.json());

let roomsData = [
  {
    room_Id: 1,
    seatsAvailable: "4",
    amenities: "Spa, Restaurant, Elevator/Lift, AC",
    pricePerHour: "150",
  },
  {
    room_Id: 2,
    seatsAvailable: "3",
    amenities: "TV, AC, Spa, Lift",
    pricePerHour: "100",
  },
  {
    room_Id: 3,
    seatsAvailable: "4",
    amenities: "TV, Lift, AC, Spa, Restaurant",
    pricePerHour: "120",
  },
  {
    room_Id: 4,
    seatsAvailable: "4",
    amenities: "Restaurant, Heater, AC, TV",
    pricePerHour: "120",
  },
];

let bookingsData = [
  {
    customer: "John",
    bookingDate: "20240615",
    startTime: "12:00pm",
    endTime: "11:59am",
    booking_Id: 1,
    room_Id: 1,
    status: "booked",
    bookedOn: "10/6/2024",
  },
];

let customersData = [
  {
    name: "John",
    bookingsData: [
      {
        customer: "John",
        bookingDate: "20240615",
        startTime: "12:00pm",
        endTime: "11:59am",
        booking_Id: 1,
        room_Id: 1,
        status: "booked",
        bookedOn: "10/6/2024",
      },
    ],
  },
];

// API Endpoint to get all the rooms
app.get("/rooms", (req, res) => {
  res.status(200).json({ Rooms: roomsData });
  console.log(roomsData);
});

// API Endpoint for creating a new room
app.post("/rooms/create-room", (req, res) => {
  const room = req.body;
  const id = roomsData.find((el) => el.room_Id === parseInt(room.room_Id));
  if (id !== undefined) {
    res.status(400).json({ message: "Room already exists" });
  } else {
    roomsData.push(room);
    res.status(201).json({ message: "New room created successfully" });
  }
});

// API endpoint for booking room
app.post("/booking/create-booking/:id", (req, res) => {
  try {
    const { id } = req.params;
    let booking = req.body;
    let date = new Date();
    let dateFormat = date.toLocaleDateString();
    let isId = roomsData.find((el) => el.room_Id === parseInt(id));
    if (isId === undefined) {
      res
        .status(404)
        .json({ message: "Room does not exist.", Rooms: roomsData });
    }
    let bookingId = bookingsData.filter((b) => b.room_Id === parseInt(id));
    if (bookingId.length > 0) {
      let dateCheck = bookingId.filter(
        (m) => {return m.bookingDate === booking.bookingDate}
      );
      if (dateCheck.length === 0) {
        let newBookingId = bookingsData.length + 1;
        let newbooking = {
          ...booking,
          booking_Id: newBookingId,
          room_Id: parseInt(id),
          status: "booked",
          bookedOn: dateFormat,
        };
        bookingsData.push(newbooking);
        return res.status(201).json({
          message: "hall booked",
          bookingsData: bookingsData,
          added: newbooking,
        });
      } else {
        return res.status(400).json({
          message: "hall already booked for this date, choose another hall",
          bookingsData: bookingsData,
        });
      }
    } else {
      let newBookingId = bookingsData.length + 1;
      let newbooking = {
        ...booking,
        booking_Id: newBookingId,
        room_Id: parseInt(id),
        status: "booked",
        bookedOn: dateFormat,
      };
      bookingsData.push(newbooking);
      const customerdetails = customersData.find(
        (cust) => cust.name === newbooking.customer
      );
      if (customerdetails) {
        customerdetails.bookingsData.push(newbooking);
      } else {
        customersData.push({
          name: newbooking.customer,
          bookingsData: [newbooking],
        });
      }
      return res.status(201).json({
        message: "hall booked",
        bookingsData: bookingsData,
        added: newbooking,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Error booking room",
      error: error,
      data: bookingsData,
    });
  }
});

// API endpoint for getting all the booked room
app.get("/bookings", (req, res) => {
  const bookedRooms = bookingsData.map((booking) => {
    const { room_Id, status, customer, bookingDate, startTime, endTime } = booking;
    return { room_Id, status, customer, bookingDate, startTime, endTime };
  });
  res.status(201).json(bookedRooms);
});

//API Endpoint to list all the customers with booked data
app.get("/customers", (req, res) => {
    const customerBookings = customersData.map(customer => {
      const { name, bookingsData } = customer;
      const customerDetails = bookingsData.map(booking => {
        const { room_Id, bookingDate, startTime, endTime } = booking;
        return { name, room_Id, bookingDate, startTime, endTime };
      });
     
      return customerDetails;
    })
   
    res.json(customerBookings);
  });

// API Endpoint to list how many times the user booked the room
  app.get("/customer/:name", (req, res) => {
    const { name } = req.params;
    const customer = customersData.find(cust => cust.name === name);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    const customerBookings = customer.bookingsData.map(booking => {
      const { customer, room_Id, startTime, endTime, booking_Id, status, bookingDate, bookedOn } = booking;
      return { customer, room_Id, startTime, endTime, booking_Id, status, bookingDate, bookedOn };
    });
    res.json(customerBookings);
  });

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
