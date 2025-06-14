// Migration to rename 'name' column to 'classroom' in Courses table
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename column 'name' to 'classroom'
    await queryInterface.renameColumn('Courses', 'name', 'classroom');
  },

  async down(queryInterface, Sequelize) {
    // Revert column name from 'classroom' back to 'name'
    await queryInterface.renameColumn('Courses', 'classroom', 'name');
  }
};
