function compareTime(time1,time2){
  const dateTime1 = new Date(time1);
    const dateTime2 = new Date(time2);
    return dateTime1.getTime() > dateTime2.getTime();
}
module.exports = {compareTime};