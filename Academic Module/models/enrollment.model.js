// enrollment.model.js file to define the Enrollment model
export default (sequelize, DataTypes) => {
    const Enrollment = sequelize.define("Enrollment", {
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
      semester: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    Enrollment.associate = (models) => {
      Enrollment.belongsTo(models.User, { foreignKey: "userId" });
      Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
    };
  
    return Enrollment;
  };