/**
 * Migration untuk membuat tabel RfidCard
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rfid_cards", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      card_uid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      activated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      blocked_at: {
        allowNull: true,
        type: Sequelize.DATE,
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

  /**
   * Rollback migration untuk menghapus tabel RfidCard
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rfid_cards");
  },
};
