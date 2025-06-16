// migrations/XXXXXX-create-absence-notification.js

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("absence_notifications", {
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
      absence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      notif_type: {
        type: Sequelize.ENUM("tapin", "tapout"),
        allowNull: false,
      },
      notif_status: {
        type: Sequelize.ENUM("berhasil", "gagal"),
        allowNull: false,
      },
      sent_at: {
        type: Sequelize.DATE,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("absence_notifications");
  },
};
