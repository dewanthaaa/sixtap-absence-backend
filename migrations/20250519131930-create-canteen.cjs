// migrations/YYYYMMDDHHMMSS-create-canteen.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Canteen", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      initial_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      current_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_settled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      settlement_time: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("Canteen");
  },
};
