"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("absences", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      day: {
        type: Sequelize.STRING,
      },
      time_in: {
        type: Sequelize.DATE,
      },
      time_out: {
        type: Sequelize.DATE,
      },
      type: {
        type: Sequelize.ENUM("hadir", "izin", "sakit", "alpa"),
      },
      status: {
        type: Sequelize.ENUM("active", "approved", "rejected"),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("absences");
  },
};
