// migrations/YYYYMMDDHHMMSS-create-transaction-notification.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transaction_notifications", {
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
      message: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("pembelian", "refund", "top up"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("berhasil", "gagal"),
        allowNull: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable("transaction_notifications");
  },
};
