"use strict";

// import User from "../App/Models/user.js";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id, schoolclass_id FROM users WHERE id IN (2, 3, 4);`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    // Buat mapping user_id -> schoolclass_id
    const userClassMap = {};
    users.forEach((user) => {
      userClassMap[user.id] = user.schoolclass_id;
    });

    await queryInterface.bulkInsert(
      "absences",
      [
        {
          user_id: 2,
          rfid_card_id: "1",
          schoolclass_id: userClassMap[2], //ini saya mau schoolclass_id nya ngambil dari data user berdasarkan user_id diatas
          day: "Monday",
          time_in: new Date("2025-01-15 06:05:00"), // Format Date object
          time_out: new Date("2025-01-15 14:45:00"),
          date: new Date(),
          absence_status: "hadir",
          card_status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 3,
          rfid_card_id: "2",
          schoolclass_id: userClassMap[3],
          day: "Tuesday",
          time_in: new Date("2025-01-16 06:00:00"), // Format string ISO
          time_out: new Date("2025-01-16 14:30:00"),
          date: new Date(),
          absence_status: "hadir",
          card_status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 4,
          rfid_card_id: "3",
          schoolclass_id: userClassMap[4],
          day: "Wednesday",
          time_in: new Date("2025-01-16 06:00:00"), // Dengan timezone
          time_out: new Date("2025-01-16 14:35:00"),
          date: new Date(),
          absence_status: "hadir",
          card_status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("absences", null, {});
  },
};
