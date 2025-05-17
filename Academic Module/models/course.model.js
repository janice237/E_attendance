// course.model.js file to define the Course model
export default (sequelize, DataTypes) => {
    const Course = sequelize.define("Course", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    return Course;
  };
  