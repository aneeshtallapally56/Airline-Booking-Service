const {BookingService} = require('../services');
const {StatusCodes} = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createBooking(req,res) {
     try {
      const booking = await BookingService.createBooking({
        flightId: req.body.flightId,
        userId: req.body.userId,
        noOfSeats: req.body.noOfSeats,
      });
        SuccessResponse.data = booking;
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        console.log(error);
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

async function makePayment(req,res) {
     try {
        console.log("Controller: makePayment called");
        console.log("Request body:", req.body);
        
        // Fix: Add input validation
        if(!req.body.bookingId || !req.body.userId || !req.body.totalCost) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Missing required fields: bookingId, userId, totalCost"
            });
        }
        
        const payment = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost,
        });
        
        SuccessResponse.data = payment;
        return res
                .status(StatusCodes.OK) // Fix: Changed from CREATED to OK
                .json(SuccessResponse);
    } catch(error) {
        console.error("Controller error:", error);
        
        // Fix: Better error handling with proper status codes
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        
        if(error.statusCode) {
            statusCode = error.statusCode;
        }
        
        ErrorResponse.error = error;
        return res
                .status(statusCode)
                .json(ErrorResponse);
    }
}

module.exports={
    createBooking,
    makePayment
}