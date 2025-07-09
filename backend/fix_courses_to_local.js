// fix_courses_to_local.js
const { sequelize, Course } = require('./models');

const TIMEZONE_OFFSET = 1; // GMT+1 (Nigeria, West Africa Time)

function shiftTime(timeStr, offset) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  let newH = (h + offset + 24) % 24;
  return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

async function main() {
  await sequelize.authenticate();
  const courses = await Course.findAll();
  for (const course of courses) {
    const newStart = shiftTime(course.startTime, TIMEZONE_OFFSET);
    const newEnd = shiftTime(course.endTime, TIMEZONE_OFFSET);
    await course.update({ startTime: newStart, endTime: newEnd });
    console.log(`Updated course ${course.id}: ${course.startTime} -> ${newStart}, ${course.endTime} -> ${newEnd}`);
  }
  await sequelize.close();
  console.log('All course times shifted.');
}

main().catch(console.error);
