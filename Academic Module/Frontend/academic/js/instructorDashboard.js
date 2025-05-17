// instructor-dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    loadInstructorCourses();
    document.getElementById("add-course-form").addEventListener("submit", addCourse);
});

async function loadInstructorCourses() {
    try {
        const response = await fetch("http://localhost:5000/api/courses/instructor");
        const courses = await response.json();
        
        const courseList = document.getElementById("course-list");
        courseList.innerHTML = "";
        
        courses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.description}</td>
                <td>${course.credits}</td>
                <td>${course.enrolledStudents.length}</td>
            `;
            courseList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

async function addCourse(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const credits = document.getElementById("credits").value;

    try {
        const response = await fetch("http://localhost:5000/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, credits })
        });

        if (response.ok) {
            alert("Course added successfully!");
            loadInstructorCourses();
        } else {
            alert("Error adding course.");
        }
    } catch (error) {
        console.error("Error adding course:", error);
    }
}
