/**
 * Migration untuk membuat tabel SchoolClass
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("school_classes", {
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
   * Rollback migration untuk menghapus tabel SchoolClass
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("school_classes");
  },
};
