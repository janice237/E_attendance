'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Courses', 'classroomId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Classrooms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Courses', 'classroomId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Classrooms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};