/**
 * Migration untuk membuat tabel Role
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Role", {
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

  /**
   * Rollback migration untuk menghapus tabel Role
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Role");
  },
};
