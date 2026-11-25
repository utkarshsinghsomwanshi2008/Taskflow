import React, { useState, useEffect } from "react";
import Auth, { getCurrentUser, logoutUser } from "./Auth";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  LogOut,
  Leaf,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Trash2,
  X,
  ArrowUpRight,
} from "lucide-react";

const STORAGE_KEY = "taskflow-data-v1";

const initialTasks = [
  {
    id: 1,
    title: "Complete Data Structures assignment",
    description: "Finish trees and graph questions",
    project: "College",
    priority: "High",
    status: "In Progress",
    date: "2026-11-27",
  },
  {
    id: 2,
    title: "Review React fundamentals",
    description: "Hooks, components and state management",
    project: "Learning",
    priority: "Medium",
    status: "Pending",
    date: "2026-11-28",
  },
  {
    id: 3,
    title: "Build portfolio website",
    description: "Update projects and personal introduction",
    project: "Personal",
    priority: "High",
    status: "Pending",
    date: "2026-11-29",
  },
  {
    id: 4,
    title: "Organize weekly schedule",
    description: "Plan study sessions and personal goals",
    project: "Personal",
    priority: "Low",
    status: "Completed",
    date: "2026-11-26",
  },
];

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "My Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  const stored = loadData();

  const [tasks, setTasks] = useState(
    stored.tasks || initialTasks
  );

  const [projects, setProjects] = useState(
    stored.projects || ["College", "Personal", "Learning"]
  );

  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "College",
    priority: "Medium",
    date: "",
  });

  const [newProject, setNewProject] = useState("");

  // Keep app data synchronized
  useEffect(() => {
    saveData({ tasks, projects });
  }, [tasks, projects]);

  // Sync authentication
  useEffect(() => {
    const checkSession = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
    };

    const interval = setInterval(checkSession, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.project.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  const toggleTask = (id) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? {
              ...task,
                status:
                  task.status === "Completed"
                    ? "Pending"
                    : "Completed",
            }
          : task
      )
    );
  };

  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    const task = {
      ...newTask,
      id: Date.now(),
      status: "Pending",
      date: newTask.date || new Date().toISOString().slice(0, 10),
    };

    setTasks((previous) => [task, ...previous]);

    setNewTask({
      title: "",
      description: "",
      project: projects[0] || "Personal",
      priority: "Medium",
      date: "",
    });

    setShowAddTask(false);
  };

  const deleteTask = (id) => {
    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  };

  const addProject = (e) => {
    e.preventDefault();

    if (!newProject.trim()) return;

    if (projects.includes(newProject.trim())) return;

    setProjects((previous) => [...previous, newProject.trim()]);
    setNewProject("");
    setShowAddProject(false);
  };

  const deleteProject = (project) => {
    setProjects((previous) =>
      previous.filter((item) => item !== project)
    );
  };

  const updateStatus = (id, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  const today = new Date().toISOString().slice(0, 10);

  const todayTasks = tasks.filter(
    (task) => task.date === today
  );

  const renderTask = (task) => (
    <div className="task-card" key={task.id}>
      <button
        className={`task-check ${
          task.status === "Completed" ? "checked" : ""
        }`}
        onClick={() => toggleTask(task.id)}
      >
        {task.status === "Completed" ? (
          <CheckCircle2 size={19} />
        ) : (
          <Circle size={19} />
        )}
      </button>

      <div className="task-info">
        <h4
          className={
            task.status === "Completed" ? "task-done" : ""
          }
        >
          {task.title}
        </h4>

        {task.description && (
          <p>{task.description}</p>
        )}

        <div className="task-meta">
          <span className="project-tag">
            {task.project}
          </span>

          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>

          <span className="task-date">
            <Clock size={13} />
            {task.date}
          </span>
        </div>
      </div>

      <select
        className="status-select"
        value={task.status}
        onChange={(e) => updateStatus(task.id, e.target.value)}
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <button
        className="task-delete"
        onClick={() => deleteTask(task.id)}
        title="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">YOUR OVERVIEW</span>

          <h1>
            Good day, {currentUser.name?.split(" ")[0]}.
          </h1>

          <p>Let's make today count.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowAddTask(true)}
        >
          <Plus size={17} />
          Add new task
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Tasks</span>
            <CheckSquare size={18} />
          </div>

          <h2>{tasks.length}</h2>
          <span className="stat-caption">Across all projects</span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Completed</span>
            <CheckCircle2 size={18} />
          </div>

          <h2>{completedTasks}</h2>
          <span className="stat-caption">Tasks finished</span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>In Progress</span>
            <Clock size={18} />
          </div>

          <h2>{inProgressTasks}</h2>
          <span className="stat-caption">Currently working on</span>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Completion</span>
            <BarChart3 size={18} />
          </div>

          <h2>{completionRate}%</h2>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <h3>Recent tasks</h3>
              <p>Your latest activity</p>
            </div>

            <button
              className="text-btn"
              onClick={() => setActivePage("tasks")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          {tasks.slice(0, 4).length > 0 ? (
            tasks.slice(0, 4).map(renderTask)
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={30} />
              <p>No tasks yet.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Your projects</h3>
              <p>Work organized simply</p>
            </div>

            <button
              className="icon-btn"
              onClick={() => setShowAddProject(true)}
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="project-list">
            {projects.map((project, index) => {
              const projectTasks = tasks.filter(
                (task) => task.project === project
              );

              const projectCompleted = projectTasks.filter(
                (task) => task.status === "Completed"
              ).length;

              const percentage =
                projectTasks.length > 0
                  ? Math.round(
                      (projectCompleted / projectTasks.length) * 100
                    )
                  : 0;

              return (
                <div className="project-item" key={project}>
                  <div className="project-item-top">
                    <div className="project-icon">
                      <FolderKanban size={17} />
                    </div>

                    <div className="project-title">
                      <strong>{project}</strong>
                      <span>{projectTasks.length} tasks</span>
                    </div>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="project-progress-label">
                    {percentage}% completed
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );

  const renderTasks = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">TASK MANAGEMENT</span>
          <h1>My Tasks</h1>
          <p>Everything you need to get done.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowAddTask(true)}
        >
          <Plus size={17} />
          Add task
        </button>
      </div>

      <div className="panel">

        <div className="task-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Search tasks or projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTask)
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={32} />
              <p>No tasks found.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );

  const renderProjects = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">ORGANIZATION</span>
          <h1>Projects</h1>
          <p>Keep your work organized.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowAddProject(true)}
        >
          <Plus size={17} />
          New project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => {
          const projectTasks = tasks.filter(
            (task) => task.project === project
          );

          const done = projectTasks.filter(
            (task) => task.status === "Completed"
          ).length;

          const percentage = projectTasks.length
            ? Math.round((done / projectTasks.length) * 100)
            : 0;

          return (
            <div className="project-card" key={project}>
              <div className="project-card-head">
                <div className="project-icon large">
                  <FolderKanban size={20} />
                </div>

                <button
                  className="task-delete"
                  onClick={() => deleteProject(project)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3>{project}</h3>
              <p>{projectTasks.length} tasks in this project</p>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="project-card-footer">
                <span>{done} completed</span>
                <strong>{percentage}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderCalendar = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <>
        <div className="welcome-section">
          <div>
            <span className="eyebrow">SCHEDULE</span>
            <h1>Calendar</h1>
            <p>Stay on top of your deadlines.</p>
          </div>
        </div>

        <div className="panel calendar-panel">
          <h2>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-day-heading" key={day}>
                  {day}
                </div>
              )
            )}

            {days.map((day, index) => {
              const dateString = day
                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(
                    day
                  ).padStart(2, "0")}`
                : null;

              const dayTasks = tasks.filter(
                (task) => task.date === dateString
              );

              return (
                <div
                  className={`calendar-cell ${
                    day === currentDate.getDate() ? "today" : ""
                  }`}
                  key={index}
                >
                  {day && (
                    <>
                      <span className="calendar-number">{day}</span>

                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          className="calendar-task"
                          key={task.id}
                        >
                          {task.title}
                        </div>
                      ))}

                      {dayTasks.length > 2 && (
                        <small>+{dayTasks.length - 2} more</small>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderAnalytics = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">YOUR PERFORMANCE</span>
          <h1>Analytics</h1>
          <p>See how far you've come.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-caption">Total Tasks</span>
          <h2>{tasks.length}</h2>
        </div>

        <div className="stat-card">
          <span className="stat-caption">Completed</span>
          <h2>{completedTasks}</h2>
        </div>

        <div className="stat-card">
          <span className="stat-caption">Remaining</span>
          <h2>{pendingTasks}</h2>
        </div>

        <div className="stat-card">
          <span className="stat-caption">Completion Rate</span>
          <h2>{completionRate}%</h2>
        </div>
      </div>

      <div className="panel analytics-panel">
        <div className="panel-header">
          <div>
            <h3>Task progress</h3>
            <p>Your overall productivity</p>
          </div>
        </div>

        <div className="analytics-bar-container">
          <div className="analytics-bar">
            <div
              className="analytics-bar-completed"
              style={{
                width: `${
                  tasks.length
                    ? (completedTasks / tasks.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="analytics-legend">
          <span>
            <i className="legend-dot completed-dot" />
            Completed ({completedTasks})
          </span>

          <span>
            <i className="legend-dot pending-dot" />
            Remaining ({pendingTasks})
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Project breakdown</h3>
            <p>Tasks across your projects</p>
          </div>
        </div>

        {projects.map((project) => {
          const count = tasks.filter(
            (task) => task.project === project
          ).length;

          return (
            <div className="analytics-project" key={project}>
              <div className="analytics-project-top">
                <span>{project}</span>
                <strong>{count} tasks</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      tasks.length ? (count / tasks.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your account and workspace.</p>
        </div>
      </div>

      <div className="panel settings-panel">
        <h3>Profile</h3>

        <div className="settings-profile">
          <div className="avatar large-avatar">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{currentUser.name}</strong>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="settings-row">
          <span>Account name</span>
          <strong>{currentUser.name}</strong>
        </div>

        <div className="settings-row">
          <span>Email address</span>
          <strong>{currentUser.email}</strong>
        </div>

        <div className="settings-row">
          <span>Workspace</span>
          <strong>TaskFlow</strong>
        </div>

        <button
          className="logout-settings-btn"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );

  let pageContent;

  switch (activePage) {
    case "tasks":
      pageContent = renderTasks();
      break;
    case "projects":
      pageContent = renderProjects();
      break;
    case "calendar":
      pageContent = renderCalendar();
      break;
    case "analytics":
      pageContent = renderAnalytics();
      break;
    case "settings":
      pageContent = renderSettings();
      break;
    default:
      pageContent = renderDashboard();
  }

  return (
    <div className="app-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">
            <Leaf size={22} />
          </div>

          <span>
            taskflow<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{currentUser.name}</strong>
              <span>Personal workspace</span>
            </div>

            <button
              className="sidebar-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        <header className="topbar">
          <div className="topbar-left">
            <span className="breadcrumb">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">
              {navigation.find((item) => item.id === activePage)?.label}
            </span>
          </div>

          <div className="topbar-right">

            <div className="topbar-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="icon-btn notification-btn">
              <Bell size={18} />
            </button>

            <div className="avatar top-avatar">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>

          </div>
        </header>

        <div className="page-content">
          {pageContent}
        </div>

      </main>

      {/* ADD TASK MODAL */}

      {showAddTask && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddTask(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Create a task</h2>
                <p>Add something meaningful to your day.</p>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowAddTask(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addTask} className="modal-form">

              <label>Task title</label>
              <input
                autoFocus
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />

              <label>Description</label>
              <textarea
                placeholder="Add some details..."
                rows="3"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    description: e.target.value,
                  })
                }
              />

              <div className="modal-two-col">
                <div>
                  <label>Project</label>

                  <select
                    value={newTask.project}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        project: e.target.value,
                      })
                    }
                  >
                    {projects.map((project) => (
                      <option key={project}>{project}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Priority</label>

                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <label>Due date</label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    date: e.target.value,
                  })
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddTask(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Create task <ArrowUpRight size={16} />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}

      {showAddProject && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddProject(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Create a project</h2>
                <p>Give your work a place of its own.</p>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowAddProject(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addProject} className="modal-form">
              <label>Project name</label>

              <input
                autoFocus
                placeholder="e.g. Semester project"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddProject(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Create project <ArrowUpRight size={16} />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}