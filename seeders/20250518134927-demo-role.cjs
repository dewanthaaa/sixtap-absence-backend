"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("roles", [
      {
        id: 1,
        role_name: "Admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        role_name: "Siswa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        role_name: "Petinggi Sekolah",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        role_name: "Penjaga Kantin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        role_name: "Wali Kelas",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Role", null, {});
  },
};
