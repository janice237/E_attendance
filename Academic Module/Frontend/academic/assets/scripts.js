document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById("content");

    // Function to fetch and display courses
    function loadCourses() {
        fetch("http://localhost:5500/api/courses") // Update URL if needed
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector("#coursesTable tbody");
                tableBody.innerHTML = "";
                data.forEach(course => {
                    tableBody.innerHTML += `
                        <tr>
                            <td>${course.courseCode}</td>
                            <td>${course.courseName}</td>
                            <td>${course.credits}</td>
                            <td>
                                <button onclick="editCourse('${course.id}', '${course.courseCode}', '${course.courseName}', '${course.credits}')">Edit</button>
                                <button onclick="deleteCourse('${course.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            })
            .catch(error => console.error("Error loading courses:", error));
    }

    // Function to add or update a course
    document.getElementById("courseForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const courseId = document.getElementById("courseId").value;
        const courseCode = document.getElementById("courseCode").value;
        const courseName = document.getElementById("courseName").value;
        const courseCredits = document.getElementById("courseCredits").value;

        const courseData = { courseCode, courseName, credits: courseCredits };

        const method = courseId ? "PUT" : "POST";
        const url = courseId ? `http://localhost:5500/api/courses/${courseId}` : "http://localhost:5500/api/courses";

        fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData),
        })
            .then(response => response.json())
            .then(() => {
                document.getElementById("courseFormContainer").style.display = "none";
                loadCourses();
            })
            .catch(error => console.error("Error saving course:", error));
    });

    // Function to edit a course
    window.editCourse = function (id, code, name, credits) {
        document.getElementById("courseId").value = id;
        document.getElementById("courseCode").value = code;
        document.getElementById("courseName").value = name;
        document.getElementById("courseCredits").value = credits;
        document.getElementById("formTitle").textContent = "Edit Course";
        document.getElementById("courseFormContainer").style.display = "block";
    };

    // Function to delete a course
    window.deleteCourse = function (id) {
        if (confirm("Are you sure you want to delete this course?")) {
            fetch(`http://localhost:5500/api/courses/${id}`, { method: "DELETE" })
                .then(() => loadCourses())
                .catch(error => console.error("Error deleting course:", error));
        }
    };

    // Show add course form
    document.getElementById("addCourseBtn").addEventListener("click", function () {
        document.getElementById("courseForm").reset();
        document.getElementById("courseId").value = "";
        document.getElementById("formTitle").textContent = "Add Course";
        document.getElementById("courseFormContainer").style.display = "block";
    });

    // Cancel button functionality
    document.getElementById("cancelBtn").addEventListener("click", function () {
        document.getElementById("courseFormContainer").style.display = "none";
    });

    // Load courses on page load
    if (window.location.pathname.includes("courses.html")) {
        loadCourses();
    }
});
