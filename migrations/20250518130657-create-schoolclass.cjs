/**
 * Migration untuk membuat tabel SchoolClass
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SchoolClass", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      class_code: {
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
   * Rollback migration untuk menghapus tabel SchoolClass
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SchoolClass");
  },
};
