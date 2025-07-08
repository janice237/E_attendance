// Script to update all courses to use UTC times and days
const { sequelize, Course } = require('./models');

async function localTimeToUTCString(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString().slice(11, 16); // UTC HH:MM
}

async function localDaysToUTCDays(daysArr) {
  if (!Array.isArray(daysArr)) return daysArr;
  return daysArr.map(day => {
    const d = new Date();
    const currentDay = d.getDay();
    const targetDay = [
      'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
    ].indexOf(day);
    if (targetDay === -1) return day;
    d.setDate(d.getDate() + (targetDay - currentDay));
    return d.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
  });
}

async function fixCourses() {
  await sequelize.authenticate();
  const courses = await Course.findAll();
  for (const course of courses) {
    const newStartTime = await localTimeToUTCString(course.startTime);
    const newEndTime = await localTimeToUTCString(course.endTime);
    const newDays = await localDaysToUTCDays(course.days);
    await course.update({
      startTime: newStartTime,
      endTime: newEndTime,
      days: newDays
    });
    console.log(`Updated course ${course.id}: startTime=${newStartTime}, endTime=${newEndTime}, days=${JSON.stringify(newDays)}`);
  }
  await sequelize.close();
  console.log('All courses updated to UTC format.');
}

fixCourses().catch(err => {
  console.error('Error updating courses:', err);
  process.exit(1);
});
