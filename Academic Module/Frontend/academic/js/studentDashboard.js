document.addEventListener("DOMContentLoaded", () => {
    loadEnrolledCourses();
    loadAvailableCourses();
});

// Fetch and display enrolled courses
async function loadEnrolledCourses() {
    try {
        const response = await fetch("http://localhost:5000/api/student/courses", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const courses = await response.json();

        const enrolledList = document.getElementById("enrolled-courses");
        enrolledList.innerHTML = "";

        courses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.description}</td>
                <td>${course.credits}</td>
            `;
            enrolledList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading enrolled courses:", error);
    }
}

// Fetch and display available courses
async function loadAvailableCourses() {
    try {
        const response = await fetch("http://localhost:5000/api/courses", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const courses = await response.json();

        const availableList = document.getElementById("available-courses");
        availableList.innerHTML = "";

        courses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.description}</td>
                <td>${course.credits}</td>
                <td><button onclick="enrollCourse('${course.id}')">Enroll</button></td>
            `;
            availableList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading available courses:", error);
    }
}

// Enroll in a course
async function enrollCourse(courseId) {
    try {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            alert("Successfully enrolled!");
            loadEnrolledCourses(); // Reload enrolled courses
        } else {
            alert("Enrollment failed!");
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
    }
}
