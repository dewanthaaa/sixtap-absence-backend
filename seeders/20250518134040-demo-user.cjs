"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPasswordAdmin = await bcrypt.hash("admin#123", 10);
    const hashedPasswordSiswa = await bcrypt.hash("siswa#123", 10);
    const hashedPasswordWaliKelas = await bcrypt.hash("walikelas#123", 10);

    await queryInterface.bulkInsert("users", [
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
        role_id: 3,
        schoolclass_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Agus",
        email: "agus@email.com",
        password: hashedPasswordSiswa,
        phone: null,
        pin: 221307,
        nis: 28102002,
        nip: null,
        batch: null,
        photo: null,
        role_id: 2,
        schoolclass_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Bayu",
        email: "bayu@email.com",
        password: hashedPasswordSiswa,
        phone: null,
        pin: 221306,
        nis: 28102001,
        nip: null,
        batch: null,
        photo: null,
        role_id: 2,
        schoolclass_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: "Apri",
        email: "apri@email.com",
        password: hashedPasswordWaliKelas,
        phone: null,
        pin: 461913,
        nis: null,
        nip: 201608987,
        batch: null,
        photo: null,
        role_id: 5,
        schoolclass_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: "Galih",
        email: "galih@email.com",
        password: hashedPasswordWaliKelas,
        phone: null,
        pin: 461913,
        nis: null,
        nip: 201608987,
        batch: null,
        photo: null,
        role_id: 5,
        schoolclass_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
