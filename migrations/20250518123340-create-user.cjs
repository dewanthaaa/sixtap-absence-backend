/**
 * Migration untuk membuat tabel User
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      batch: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      schoolclass_id: {
        type: Sequelize.INTEGER,
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

  /**
   * Rollback migration untuk menghapus tabel User
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
