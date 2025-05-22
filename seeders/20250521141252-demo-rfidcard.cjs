"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let id = 1;
    await queryInterface.bulkInsert("rfid_cards", [
      {
        id: id++,
        user_id: "2",
        card_uid: "113377",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
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
