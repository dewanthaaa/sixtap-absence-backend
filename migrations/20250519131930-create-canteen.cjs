// migrations/YYYYMMDDHHMMSS-create-canteen.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("canteens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      initial_balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      current_balance: {
        type: Sequelize.DECIMAL(12, 2),
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
      opened_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("canteens");
  },
};
