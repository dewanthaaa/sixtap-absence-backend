"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPasswordAdmin = await bcrypt.hash("admin#123", 10);
    const hashedPasswordSiswa = await bcrypt.hash("siswa#123", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          name: "Admin",
          email: "admin@email.com",
          password: hashedPasswordAdmin,
          phone: null,
          pin: null,
          nis: null,
          nip: null,
          batch: null,
          photo: null,
          role_id: 1,
          schoolclass_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: "Dewantha",
          email: "dewantha@email.com",
          password: hashedPasswordSiswa,
          phone: null,
          pin: 221308,
          nis: 28102003,
          nip: null,
          batch: null,
          photo: null,
          role_id: 2,
          schoolclass_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("User", null, {});
  },
};
