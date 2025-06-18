// booking-service.js (Fixed version)
const axios = require("axios");
const { BookingRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");

const db = require("../../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");
const {Enums} = require("../utils/common");

const{CONFIRMED ,CANCELLED } = Enums.BOOKING_STATUS;
const bookingRepository = new BookingRepository();

async function createBooking(bookingData) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${FLIGHT_SERVICE}/api/v1/flights/${bookingData.flightId}`
    );
    const flightData = flight.data.data;
    if (bookingData.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }
    const totalBillingAmount = flightData.price * bookingData.noOfSeats;
    const bookingPayload = { ...bookingData, totalCost: totalBillingAmount };

    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flights/${bookingData.flightId}/update-seats`,
      {
        seats: +bookingData.noOfSeats,
      }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        console.log("Service: makePayment called with data:", data);
        
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        console.log("Booking details retrieved:", bookingDetails);
        
        if(!bookingDetails) {
            throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
        }
        if(bookingDetails.status === CANCELLED){
            throw new AppError("Booking already cancelled", StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        const timeDifference = currentTime - bookingTime;
        if(timeDifference>300000){
          await cancelBooking(data.bookingId);
            throw new AppError("Booking expired", StatusCodes.BAD_REQUEST);
        }

        if(Number(data.totalCost) !== Number(bookingDetails.totalCost)){
            throw new AppError("Total cost mismatch", StatusCodes.BAD_REQUEST);
        }
        

        if(Number(bookingDetails.userId) !== Number(data.userId)){
            throw new AppError("User not authorized to make payment", StatusCodes.UNAUTHORIZED);
        }
        
        const response = await bookingRepository.update(
            data.bookingId, 
            {status: CONFIRMED}, 
            transaction
        );
        
        await transaction.commit();
        console.log("Payment successful, response:", response);
        

        return response;
        
    } catch (error) {
        console.error("Error in makePayment service:", error);
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction);
        console.log(bookingDetails);
        if(bookingDetails.status == CANCELLED) {
            await transaction.commit();
            return true;
        }
       await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/update-seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec:false
      }
    );
        await bookingRepository.update(bookingId, {status: CANCELLED}, transaction);
        await transaction.commit();

    } catch(error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
  createBooking,
  makePayment
};