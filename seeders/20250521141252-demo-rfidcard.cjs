"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("rfid_cards", [
      {
        id: 1,
        user_id: 13,
        card_uid: "113377",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        user_id: 14,
        card_uid: "113344",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        user_id: 15,
        card_uid: "113355",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        user_id: 16, // Sari
        card_uid: "654321",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        user_id: 17, // Rudi
        card_uid: "731204",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        user_id: 18, // Tika
        card_uid: "908712",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        user_id: 19, // Yoga
        card_uid: "346178",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        user_id: 20, // Nina
        card_uid: "512096",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        user_id: 21, // Fahri
        card_uid: "284610",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        user_id: 22, // Alya
        card_uid: "765201",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        user_id: 23, // Rangga
        card_uid: "143298",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        user_id: 24, // Mira
        card_uid: "973416",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 13,
        user_id: 25, // Gilang
        card_uid: "620548",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 14,
        user_id: 26, // Novi
        card_uid: "486270",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 15,
        user_id: 27, // Zaki
        card_uid: "328719",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 16,
        user_id: 28, // Dewi
        card_uid: "591630",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 17,
        user_id: 29, // Andre
        card_uid: "459327",
        is_active: true,
        activated_at: new Date(),
        blocked_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 18,
        user_id: 30, // Sinta
        card_uid: "237180",
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
