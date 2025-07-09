// models/models.js

const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('nfc_attendance', 'Janice', '0987654321', {
    host: 'localhost',
    dialect: 'postgres'
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('PostgreSQL connected'))
    .catch(err => console.error('PostgreSQL connection error:', err));

// Define User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
     role: {
        type: DataTypes.ENUM('student', 'lecturer', 'administrator'),
        allowNull: false
    }
});

// Define Attendance model
const Attendance = sequelize.define('Attendance', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timeIn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    timeOut: {
        type: DataTypes.DATE,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    percentageCompleted: {
        type: DataTypes.FLOAT, // percentage of course hours completed
        allowNull: true
    },
    hoursLeft: {
        type: DataTypes.FLOAT, // hours left to complete the course
        allowNull: true
    }
});

// Define Classroom model
const Classroom = sequelize.define('Classroom', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nfcId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  qrLink: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Define Course model
const Course = sequelize.define('Course', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lecturer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Use classroom as a string (hall name)
  classroom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  days: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  totalHours: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Define CatchupClass model
const CatchupClass = sequelize.define('CatchupClass', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lecturerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// Define Notification model
const Notification = sequelize.define('Notification', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Define CourseRegistration model
const CourseRegistration = sequelize.define('CourseRegistration', {
    userId: {
        type: DataTypes.INTEGER, // changed from STRING to INTEGER
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});


// Add associations for joins
CourseRegistration.belongsTo(Course, { foreignKey: 'courseId', as: 'Course' });
Course.hasMany(CourseRegistration, { foreignKey: 'courseId', as: 'Registrations' });
CourseRegistration.belongsTo(User, { foreignKey: 'userId', as: 'Student' });


// Sync models with database (alter: true will update tables without dropping them)
sequelize.sync({ alter: true })
    .then(() => console.log('Database & tables updated (alter sync)'))
    .catch(err => console.error('Error updating database tables:', err));

// Export models and sequelize instance
module.exports = { sequelize, User, Attendance, Course, CatchupClass, Notification, CourseRegistration, Classroom };