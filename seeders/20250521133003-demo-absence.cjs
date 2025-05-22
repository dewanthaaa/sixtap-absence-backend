"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let id = 1;

    await queryInterface.bulkInsert(
      "absences",
      [
        {
          id: id++,
          user_id: 2,
          day: "Senin",
          time_in: "2025-02-03 06:01:31",
          time_out: "2025-02-03 14:45:31",
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
