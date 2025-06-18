const CrudRepository = require('./crud-repositories');
const {Booking} = require('../../models');
const {Enums} = require("../utils/common");
const{CONFIRMED,CANCELLED } = Enums.BOOKING_STATUS;

const { Op } = require('sequelize');
class BookingRepository extends CrudRepository {
    constructor(){
        super(Booking);
    }
    async createBooking(data, transaction) {
        const response = await Booking.create(data, {transaction});
        return response;
    } 
      async get(data,transaction) {
    const response = await this.model.findByPk(data,{transaction});
    if (!response) {
      throw new AppError(
        `No record found for id ${data}`,
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }
   async update(id, data,transaction) {
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
       
    },{transaction});
    return response;
  }
    async cancelOldBookings(timestamp) {
        console.log("in repo")
        const response = await Booking.update({status: CANCELLED},{
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timestamp
                        }
                    }, 
                    {
                        status: {
                            [Op.ne]: CONFIRMED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]
                
            }
        });
        return response;
    }
}


module.exports = BookingRepository;