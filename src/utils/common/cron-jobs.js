const cron = require("node-cron");
const { BookingService } = require('../../services');

function scheduleCronJobs() {

    cron.schedule('*/5 * * * * *  ',async()=>{
      const response=  await BookingService.cancelOldBookings();
        console.log("inside cron")
        console.log(response);

})


}
module.exports = 
    scheduleCronJobs;