// Migration: Change Attendance.userId from STRING to INTEGER
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change userId column type to INTEGER
    await queryInterface.changeColumn('Attendances', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert userId column type to STRING
    await queryInterface.changeColumn('Attendances', 'userId', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
