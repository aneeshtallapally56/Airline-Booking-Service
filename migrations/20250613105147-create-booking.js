'use strict';
/** @type {import('sequelize-cli').Migration} */
const { Enums } = require('../src/utils/common');
const{CONFIRMED,CANCELLED,INITIATED,PENDING} = Enums.BOOKING_STATUS;
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
          allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(CONFIRMED, CANCELLED, INITIATED, PENDING),
          allowNull: false,
        defaultValue: INITIATED
      },
      totalCost: {
        type: Sequelize.INTEGER,
          allowNull: false,
      },
      noOfSeats: {
        type: Sequelize.INTEGER,
          allowNull: false,
      },

      createdAt:
       {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};