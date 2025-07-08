'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create a default classroom (if none exists)
    const [result] = await queryInterface.sequelize.query(
      `INSERT INTO "Classrooms" ("name", "nfcId", "qrLink", "createdAt", "updatedAt")
       VALUES ('Default Classroom', 'default-nfc', NULL, NOW(), NOW())
       RETURNING id;`
    );
    const defaultClassroomId = result[0].id;

    // 2. Set classroomId for all existing courses to the default classroom
    await queryInterface.sequelize.query(
      `UPDATE "Courses" SET "classroomId" = ${defaultClassroomId} WHERE "classroomId" IS NULL;`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, set classroomId back to NULL for all courses that have the default classroom
    const [result] = await queryInterface.sequelize.query(
      `SELECT id FROM "Classrooms" WHERE "name" = 'Default Classroom' AND "nfcId" = 'default-nfc' LIMIT 1;`
    );
    if (result.length > 0) {
      const defaultClassroomId = result[0].id;
      await queryInterface.sequelize.query(
        `UPDATE "Courses" SET "classroomId" = NULL WHERE "classroomId" = ${defaultClassroomId};`
      );
      await queryInterface.sequelize.query(
        `DELETE FROM "Classrooms" WHERE id = ${defaultClassroomId};`
      );
    }
  }
};