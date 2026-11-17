
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const searchInput = document.getElementById("searchInput");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");
const clearCompleted = document.getElementById("clearCompleted");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const addBtn = document.getElementById("addBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingId = null;

// Display current date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Save tasks in Local Storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
todoForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = todoInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    if (editingId !== null) {
        tasks = tasks.map(task =>
            task.id === editingId
                ? { ...task, text: taskText }
                : task
        );

        editingId = null;
        addBtn.textContent = "+ Add Task";
    } else {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        tasks.push(newTask);
    }

    todoInput.value = "";
    saveTasks();
    renderTasks();
});

// Display tasks
function renderTasks() {
    todoList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "✏️";
        editButton.title = "Edit Task";

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete Task";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actions);

        todoList.appendChild(li);
    });

    // Show empty message when there are no visible tasks
    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    // Update remaining task count
    const remaining = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${remaining} tasks remaining`;

    // Update progress bar
    const completed = tasks.filter(task => task.completed).length;

    const progress = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    progressFill.style.width = progress + "%";
    progressText.textContent = progress + "% completed";
}

// Complete or uncomplete a task
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        todoInput.value = task.text;
        editingId = id;
        addBtn.textContent = "Update Task";
        todoInput.focus();
    }
}

// Delete a task
function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter(task => task.id !== id);

        if (editingId === id) {
            editingId = null;
            todoInput.value = "";
            addBtn.textContent = "+ Add Task";
        }

        saveTasks();
        renderTasks();
    }
}

// Clear all completed tasks
clearCompleted.addEventListener("click", function() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// Filter tasks
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
        currentFilter = this.dataset.filter;

        renderTasks();
    });
});

// Search tasks
searchInput.addEventListener("input", renderTasks);

// Load saved tasks when page opens
renderTasks();
