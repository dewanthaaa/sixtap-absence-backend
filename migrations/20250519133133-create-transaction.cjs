// migrations/YYYYMMDDHHMMSS-create-transaction.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transaction", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
        type: Sequelize.ENUM("purchase", "topup", "refund"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("success", "pending", "failed"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Transaction");
  },
};
