document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    document.getElementById("course-form").addEventListener("submit", addCourse);
});

// Fetch and display courses from backend
async function loadCourses() {
    try {
        const response = await fetch("http://localhost:5000/api/courses");
        const courses = await response.json();

        const courseList = document.getElementById("course-list");
        courseList.innerHTML = "";
        courses.forEach(course => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.description}</td>
                <td>${course.credits}</td>
                <td>${course.instructorId}</td>
                <td>
                    <button onclick="enrollCourse('${course.id}')">Enroll</button>
                </td>
            `;
            courseList.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// Add a new course
async function addCourse(event) {
    event.preventDefault();

    const id = document.getElementById("courseId").value; // Get course ID (if updating)
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const credits = document.getElementById("credits").value;
    const instructorId = document.getElementById("instructorId").value;

    const method = id ? "PUT" : "POST"; // Use PUT if updating, POST if adding
    const url = id ? `http://localhost:5000/api/courses/${id}` : "http://localhost:5000/api/courses";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, credits, instructorId }),
        });

        if (response.ok) {
            alert(id ? "Course updated successfully!" : "Course added successfully!");
            document.getElementById("course-form").reset();
            document.getElementById("courseId").value = ""; // Reset hidden field
            document.getElementById("course-form-button").textContent = "Add Course"; // Reset button text
            loadCourses(); // Reload courses
        } else {
            alert("Error saving course.");
        }
    } catch (error) {
        console.error("Error saving course:", error);
    }
}
//Edit course
function editCourse(id, name, description, credits, instructorId) {
    document.getElementById("name").value = name;
    document.getElementById("description").value = description;
    document.getElementById("credits").value = credits;
    document.getElementById("instructorId").value = instructorId;

    // Store course ID in a hidden field to track updates
    document.getElementById("courseId").value = id;

    // Change form button to "Update Course"
    document.getElementById("course-form-button").textContent = "Update Course";
}

// Delete a course
async function deleteCourse(courseId) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Course deleted!");
            loadCourses();
        } else {
            alert("Error deleting course.");
        }
    } catch (error) {
        console.error("Error deleting course:", error);
    }
}
// Enroll in a course
async function enrollCourse(courseId) {
    const studentId = localStorage.getItem("userId");  // Assume student ID is stored
    if (!studentId) {
        alert("Please log in first!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/courses/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, courseId }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Enrollment successful!");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
    }
}