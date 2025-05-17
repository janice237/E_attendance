// grade.model.js file to define the Grade model
export default (sequelize, DataTypes) => {
    const Grade = sequelize.define("Grade", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attendance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
    return Grade;
  };
  