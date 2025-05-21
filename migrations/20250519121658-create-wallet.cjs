// migrations/YYYYMMDDHHMMSS-create-wallet.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallets", {
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
        allowNull: false
      },
      last_top_up: {
        type: Sequelize.DATE,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
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
    await queryInterface.dropTable("wallets");
  },
};
