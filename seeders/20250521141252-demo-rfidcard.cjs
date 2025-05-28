"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("rfid_cards", [
      {
        id: 1,
        user_id: "2",
        card_uid: "113377",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        user_id: "3",
        card_uid: "113344",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        user_id: "4",
        card_uid: "113355",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("rfid_cards", null, {});
  },
};
