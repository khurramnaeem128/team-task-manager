import { useEffect, useState } from 'react';
import { apiRequest } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function loadDashboard() {
    setDashboardLoading(true);
    setError('');

    try {
      const [teamData, taskData] = await Promise.all([
        apiRequest('/teams'),
        apiRequest('/tasks'),
      ]);

      setTeams(teamData.teams || []);
      setTasks(taskData.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email').trim(),
          password: formData.get('password'),
        }),
      });

      setUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    setError('');
    setSuccessMessage('');

    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      setTeams([]);
      setTasks([]);
      setSearch('');
      setStatusFilter('all');
      setIsRegistering(false);
      setSuccessMessage('Logged out successfully!');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);

    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setIsRegistering(false);
      setError('');
      setSuccessMessage('Account created successfully! Please sign in.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTeamSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);

    const teamData = {
      name: formData.get('name').trim(),
      description: formData.get('description').trim(),
    };

    try {
      await apiRequest('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });

      setShowTeamModal(false);
      setSuccessMessage('Team created successfully!');
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);

    const taskData = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      team_id: Number(formData.get('team_id')),
      status: formData.get('status'),
    };

    try {
      if (editingTask) {
        await apiRequest(`/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
          }),
        });
      } else {
        await apiRequest('/tasks', {
          method: 'POST',
          body: JSON.stringify(taskData),
        });
      }

      setShowTaskModal(false);
      setEditingTask(null);
      setSuccessMessage(
        editingTask ? 'Task updated successfully!' : 'Task created successfully!'
      );
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  function openNewTaskModal() {
    setError('');
    setEditingTask(null);
    setShowTaskModal(true);
  }

  function openEditTaskModal(task) {
    setError('');
    setEditingTask(task);
    setShowTaskModal(true);
  }

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    setError('');
    setSuccessMessage('');

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });

      setSuccessMessage('Task deleted successfully!');
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-slate-900">
            Team Task Manager
          </h1>

          <p className="mt-2 text-slate-600">
            {isRegistering
              ? 'Create an account to get started.'
              : 'Sign in to manage your teams and tasks.'}
          </p>

          {successMessage && (
            <p className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          {isRegistering && (
            <>
              <label className="mt-6 block text-sm font-medium">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
                placeholder="Enter your full name"
              />
            </>
          )}

          <label className="mt-6 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            placeholder="you@example.com"
          />

          <label className="mt-4 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={isRegistering ? 10 : undefined}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            placeholder={
              isRegistering
                ? 'At least 10 characters'
                : 'Enter your password'
            }
          />

          {isRegistering && (
            <>
              <label className="mt-4 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
                placeholder="Enter your password again"
              />
            </>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            {isRegistering
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering((current) => !current);
                setError('');
                setSuccessMessage('');
              }}
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  const completedTasks = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || '').toLowerCase().includes(searchText) ||
      (task.team_name || '').toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Team Task Manager
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user.name}! Manage your teams and tasks in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMessage('');
              setShowTeamModal(true);
            }}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Add Team
          </button>

          <button
            type="button"
            onClick={openNewTaskModal}
            disabled={teams.length === 0}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Task
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">My Teams</p>
          <p className="mt-2 text-3xl font-bold">{teams.length}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">My Tasks</p>
          <p className="mt-2 text-3xl font-bold">{tasks.length}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Completed Tasks</p>
          <p className="mt-2 text-3xl font-bold">{completedTasks}</p>
        </div>
      </section>

      {dashboardLoading ? (
        <p className="mt-8 text-slate-600">Loading dashboard...</p>
      ) : (
        <section className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">My Teams</h2>

            {teams.length === 0 ? (
              <p className="mt-4 text-slate-500">
                No teams found. Click Add Team to create your first team.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {team.description || 'No description provided.'}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Role: {team.role}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">My Tasks</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-300 p-3"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="mt-4 text-slate-500">
                {tasks.length === 0
                  ? 'No tasks found. Click Add Task to create one.'
                  : 'No tasks match your search or filter.'}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {task.description || 'No description provided.'}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Team: {task.team_name || 'Unknown team'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditTaskModal(task)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleTeamSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Create Team
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowTeamModal(false);
                  setError('');
                }}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium">
              Team name
            </label>
            <input
              name="name"
              type="text"
              required
              maxLength={100}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              placeholder="e.g. AI Development Team"
            />

            <label className="mt-4 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              maxLength={1000}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              placeholder="What is this team working on?"
            />

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTeamModal(false);
                  setError('');
                }}
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Create Team
              </button>
            </div>
          </form>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={handleTaskSubmit}
            className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  setError('');
                }}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium">
              Task title
            </label>
            <input
              name="title"
              required
              maxLength={200}
              defaultValue={editingTask?.title || ''}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter task title"
            />

            <label className="mt-4 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={editingTask?.description || ''}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              placeholder="Describe the task"
            />

            <label className="mt-4 block text-sm font-medium">Team</label>
            <select
              name="team_id"
              required
              defaultValue={String(editingTask?.team_id || teams[0]?.id || '')}
              disabled={Boolean(editingTask)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium">Status</label>
            <select
              name="status"
              defaultValue={editingTask?.status || 'pending'}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  setError('');
                }}
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;