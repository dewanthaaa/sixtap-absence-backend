"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const kelas = [];
    const jurusan = ["RPL", "Animasi", "DKV"];
    const tingkat = ["X", "XI", "XII"];
    let id = 1;

    for (const t of tingkat) {
      for (const j of jurusan) {
        kelas.push({
          id: id++,
          class_name: `${t} ${j}`,
          class_code: `${t
            .replace("X", "1")
            .replace("XI", "2")
            .replace("XII", "3")}${j.charAt(0)}${j.charAt(1)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("schoolclass", kelas, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("SchoolClass", null, {});
  },
};
