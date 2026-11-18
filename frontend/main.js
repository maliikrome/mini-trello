
// 1. Set the minimum due date to today
document.getElementById("due-date").min =
    new Date().toISOString().split("T")[0];


// 2. Get the HTML elements
const taskform = document.getElementById("task-form");
const cardTemplate = document.getElementById("task-card-template");
const taskbtn = document.getElementById("add-task-btn");
const dialog = document.getElementById("dialog");
const cancelbtn = document.getElementById("cancel-button");

const todoList = document.getElementById("todo-list");
const progressList = document.getElementById("in-progress-column");
const doneList = document.getElementById("done-column");



// 3. Create an array to store our tasks
let tasks = [];
let editingTaskId = null;

// POST HTTP
async function saveTasks(task) {

    const response = await fetch(
        "http://127.0.0.1:8000/api/tasks/",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(task)
        }
    );

    // Read Django's response
    const data = await response.json();

    // Check whether Django accepted the task
    if (!response.ok) {
        console.log("Django rejected the task:", data);
      
    }

    return data;
}

//GET HTTP
async function getTasks() {

    const response = await fetch(
        "http://127.0.0.1:8000/api/tasks/",
        {
            method: "GET"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to retrieve tasks");
    }

    const savedTasks = await response.json();

    return savedTasks;
}

async function loadTasks() {

    try {

        tasks = await getTasks();
        renderTasks();

    } catch (error) {

        console.error("Error loading tasks:", error);

        alert("Could not load tasks.");

    }
}
// PATCH HTTP
async function updateTask(taskId, updatedData) {

    const response = await fetch(
        `http://127.0.0.1:8000/api/tasks/${taskId}/`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(updatedData)
        }
    );

    const updatedTask = await response.json();

    if (!response.ok) {
        throw new Error("Failed to update task");
  
    }

    return updatedTask;
}
// DELETE HTTP
async function deleteTask(taskId) {

    const response = await fetch(
        `http://127.0.0.1:8000/api/tasks/${taskId}/`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }
}

function openEditDialog(taskId) {

    const task = tasks.find(function(item) {
        return item.id === taskId;
    });

    if (!task) {
        console.error("Task not found:", taskId);
        return;
    }

    editingTaskId = taskId;

    // Fill task information
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-category").value = task.category;
    document.getElementById("due-date").value = task.due_date;

    // Change dialog heading and button
    document.getElementById("dialog-title").textContent = "Edit Task";
    document.getElementById("save-button").textContent = "Update";

    // Display existing comments
    const comments = task.comments || [];
    const commentsList = document.getElementById("comments-list");

    //commentsList.innerHTML = "";

    if (comments.length > 0) {

        comments.forEach(function(comment) {

            const commentElement = document.createElement("p");

            commentElement.className = "comment-item";
            commentElement.textContent = comment.text;

            commentsList.appendChild(commentElement);

        });

    } else {

        commentsList.textContent = "No comments yet.";

    }

    // Update comment heading
    updateCommentHeading(comments);

    // Clear the new comment textarea
    document.getElementById("comment-input").value = "";

    // Show comments section
    document.getElementById("comment-section").style.display = "block";

    // Open dialog
    dialog.showModal();
}
function updateCommentHeading(comments) {
    const commentHeading = document.getElementById("comment-heading");

    if (comments.length === 0) {
        commentHeading.textContent = "Add comment";
    } else {
        commentHeading.textContent = "Add another comment";
    }
}


// 6. Display tasks on the board
function renderTasks() {

    // Empty all three columns before displaying tasks again
    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";

    // Go through every task in the array
    tasks.forEach(function (task) {

        // Make a copy of the card template
        const card = cardTemplate.content.cloneNode(true);

        card.querySelector(".task-title").textContent = task.title;
        card.querySelector(".task-description").textContent = task.description;
        card.querySelector(".task-priority").textContent = task.priority;
        card.querySelector(".task-category").textContent = task.category;
        card.querySelector(".due-date").textContent = "Due: " + task.due_date;

        // Make the card clickable
        const cardElement = card.querySelector(".task-card");

        cardElement.addEventListener("click", function () {
            openEditDialog(task.id);
        });
        // Show Delete button only for completed tasks
        if (task.status === "done") {

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.className = "delete-task-btn";

            cardElement.appendChild(deleteButton);

            deleteButton.addEventListener("click", async function (event) {

                // Prevent the card's edit event from running
                event.stopPropagation();

                try {

                    // Ask Django to delete the task
                    await deleteTask(task.id);

                    // Remove the task from our JavaScript array
                    tasks = tasks.filter(function (item) {
                        return item.id !== task.id;
                    });

                    // Update the board
                    renderTasks();

                } catch (error) {

                    console.error("Error deleting task:", error);

                    alert("Could not delete task. Please try again.");

                }

            });

        }
        // Make the card draggable
        cardElement.draggable = true;

        // Store the task ID when dragging starts
        cardElement.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", task.id);
        });
        // Put the card in the correct column
        if (task.status === "todo") {
            todoList.appendChild(card);
        }
        else if (task.status === "in_progress") {
            progressList.appendChild(card);
        }
        else if (task.status === "done") {
            doneList.appendChild(card);
        }
    });

    // Update the column counts
    document.querySelectorAll(".column").forEach(function (column) {

        const status = column.dataset.status;

        const count = tasks.filter(function (task) {
            return task.status === status;
        }).length;

        column.querySelector(".count").textContent = count;
    });
}
// Make columns accept dragged cards
document.querySelectorAll(".column").forEach(function (column) {

    // Allow dropping
    column.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    // Handle the drop
    column.addEventListener("drop",async function (event) {

        event.preventDefault();

        // Get dragged task ID
        const taskId = Number(
            event.dataTransfer.getData("text/plain")
        );

        // Find the task
        const task = tasks.find(function (item) {
            return item.id === taskId;
        });

        // Stop if task wasn't found
        if (!task) {
            console.log("Task not found:", taskId);
            return;
        }

        // Get destination status
        const newStatus = column.dataset.status;

        console.log("Moving task:", task.title);
        console.log("New status:", newStatus);

        // Update task

        
        // Save the new status in Django
        try {
            const updatedTask = await updateTask(taskId, {
                status: newStatus
            });

            // Update the task in our JavaScript array
            const index = tasks.findIndex(function(item) {
                return item.id === taskId;
            });

            tasks[index] = updatedTask;

            // Display the task in its new column
            renderTasks();

        } catch (error) {
            console.error("Error updating task status:", error);
            alert("Could not move task. Please try again.");

            // Reload tasks to show the status saved in the database
            loadTasks();
        }
    });

});
//This part handles form submission
// function delays the execution of the function until user submits
// This part handles form submission
taskform.addEventListener("submit", async function(event) {

    event.preventDefault();

    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-description").value;
    const priority = document.getElementById("task-priority").value;
    const category = document.getElementById("task-category").value;
    const due_date = document.getElementById("due-date").value;

    // ADD NEW TASK
    if (editingTaskId === null) {

        const task = {
            title: title,
            description: desc,
            priority: priority.toLowerCase(),
            category: category,
            due_date: due_date,
            status: "todo"
        };

        try {

            const savedTask = await saveTasks(task);

            tasks.push(savedTask);

            taskform.reset();
            dialog.close();

            renderTasks();

        } catch (error) {

            console.error("Error saving task:", error);
            alert("Could not save task. Please try again.");

        }

    }

    // UPDATE EXISTING TASK
    else {

        const commentText = document.getElementById("comment-input").value.trim();

        const updatedData = {
            title: title,
            description: desc,
            priority: priority.toLowerCase(),
            category: category,
            due_date: due_date,
            comments: commentText !== "" ? [{ text: commentText }] : []
        };

        try {

            const updatedTask = await updateTask(editingTaskId, updatedData);

            const index = tasks.findIndex(function(item) {
                return item.id === editingTaskId;
            });

            tasks[index] = updatedTask;

            renderTasks();

            taskform.reset();
            dialog.close();
            editingTaskId = null;

        } catch (error) {

            console.error("Error updating task:", error);
            alert("Could not update task. Please try again.");

        }

    }

});

// 8. Open the dialog for adding a new task
taskbtn.addEventListener("click", function() {

    editingTaskId = null;

    taskform.reset();

    // Hide comments when creating a new task
    document.getElementById("comment-section").style.display = "none";

    // Reset dialog heading and button
    document.getElementById("dialog-title").textContent = "Add Task";
    document.getElementById("save-button").textContent = "Save";

    // Clear comments
    document.getElementById("comments-list").innerHTML = "";
    document.getElementById("comment-input").value = "";

    dialog.showModal();

});


// 9. Close the dialog
cancelbtn.addEventListener("click", function () {
    dialog.close();
});


// 10. Display saved tasks
loadTasks();
