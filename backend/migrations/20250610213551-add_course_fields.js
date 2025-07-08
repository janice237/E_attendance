'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new columns to the existing Courses table
    await queryInterface.addColumn('Courses', 'code', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    await queryInterface.addColumn('Courses', 'title', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Courses', 'lecturer', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Courses', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Courses', 'credits', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.addColumn('Courses', 'hours', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.addColumn('Courses', 'location', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Courses', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Courses', 'days', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
    await queryInterface.addColumn('Courses', 'startTime', {
      type: Sequelize.TIME,
      allowNull: true
    });
    await queryInterface.addColumn('Courses', 'endTime', {
      type: Sequelize.TIME,
      allowNull: true
    });
    await queryInterface.addColumn('Courses', 'totalHours', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the columns if rolling back
    await queryInterface.removeColumn('Courses', 'code');
    await queryInterface.removeColumn('Courses', 'title');
    await queryInterface.removeColumn('Courses', 'lecturer');
    await queryInterface.removeColumn('Courses', 'description');
    await queryInterface.removeColumn('Courses', 'credits');
    await queryInterface.removeColumn('Courses', 'hours');
    await queryInterface.removeColumn('Courses', 'location');
    await queryInterface.removeColumn('Courses', 'name');
    await queryInterface.removeColumn('Courses', 'days');
    await queryInterface.removeColumn('Courses', 'startTime');
    await queryInterface.removeColumn('Courses', 'endTime');
    await queryInterface.removeColumn('Courses', 'totalHours');
  }
};
