const CrudRepository = require('./crud-repositories');
const {Booking} = require('../../models');

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
}
module.exports = BookingRepository;