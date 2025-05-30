// migrations/YYYYMMDDHHMMSS-create-transaction.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rfid_card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      canteen_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM("pembelian", "refund", "top up", "pencairan"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("berhasil", "gagal", "menunggu"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transactions");
  },
};
