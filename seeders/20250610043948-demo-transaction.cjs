"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "transactions",
      [
        {
          user_id: 13,
          rfid_card_id: 1,
          canteen_id: null,
          type: "top up",
          status: "berhasil",
          amount: 30000,
          note: "Top Up Gemscool",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 14,
          rfid_card_id: 2,
          canteen_id: null,
          type: "top up",
          status: "berhasil",
          amount: 20000,
          note: "Top Up Emel",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 15,
          rfid_card_id: 3,
          canteen_id: null,
          type: "top up",
          status: "berhasil",
          amount: 30000,
          note: "Top Up V Bucks",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("transactions", null, {});
  },
};
