/**
 * Migration untuk membuat tabel Role
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      role_name: {
        type: Sequelize.STRING,
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

  /**
   * Rollback migration untuk menghapus tabel Role
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  },
};
