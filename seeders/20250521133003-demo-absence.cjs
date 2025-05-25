"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "absences",
      [
        {
          user_id: 2,
          rfid_card_id: "1",
          day: "Monday",
          time_in: new Date("2025-01-15 06:05:00"), // Format Date object
          time_out: new Date("2025-01-15 14:45:00"),
          sum_attendance: 20,
          sum_sick: 2,
          sum_permission: 0,
          sum_alpa: 0,
          type: "hadir",
          status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 3,
          rfid_card_id: "2",
          day: "Tuesday",
          time_in: new Date("2025-01-16 06:00:00"), // Format string ISO
          time_out: new Date("2025-01-16 14:30:00"),
          sum_attendance: 22,
          sum_sick: 0,
          sum_permission: 0,
          sum_alpa: 0,
          type: "hadir",
          status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 4,
          rfid_card_id: "3",
          day: "Wednesday",
          time_in: new Date("2025-01-16 06:00:00"), // Dengan timezone
          time_out: new Date("2025-01-16 14:35:00"),
          sum_attendance: 29,
          sum_sick: 0,
          sum_permission: 1,
          sum_alpa: 0,
          type: "hadir",
          status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
