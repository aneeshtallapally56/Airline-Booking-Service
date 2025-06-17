const axios = require("axios");
const { BookingRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");

const db = require("../../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");

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
const bookingPayload = {...bookingData,totalCost:totalBillingAmount};

    const booking = await bookingRepository.createBooking(bookingPayload, transaction);

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  createBooking,
};
