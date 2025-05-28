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
      rfid_card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      schoolclass_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      day: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      time_in: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      time_out: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sum_attendance: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sum_sick: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sum_permission: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sum_alpa: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      absence_status: {
        type: Sequelize.ENUM("hadir", "izin", "sakit", "alpa"),
      },
      card_status: {
        type: Sequelize.ENUM("active", "approved", "rejected"),
      },
      info: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
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
