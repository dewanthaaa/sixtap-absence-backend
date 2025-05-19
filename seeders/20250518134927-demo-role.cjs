"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("role", [
      {
        id: 1,
        role_name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        role_name: "Siswa",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        role_name: "Petinggi Sekolah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        role_name: "Penjaga Kantin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        role_name: "Wali Kelas",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Role", null, {});
  },
};
