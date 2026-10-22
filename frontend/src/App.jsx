import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { getFriendlyError, statsApi, taskApi, userApi } from './api.js';

const statuses = ['pending', 'in-progress', 'done'];

function Layout({ children }) {
  const location = useLocation();
  const pageName = location.pathname === '/' ? 'Overview' : location.pathname.slice(1).split('/')[0];

  return (
    <div className="app-shell min-h-screen lg:flex">
      <aside className="sidebar fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-line bg-[#0b1016] px-5 py-6">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center border border-cyan bg-cyan/10 font-display text-lg font-bold text-cyan">TF</div>
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-white">TaskFlow</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Control room</p>
          </div>
        </div>

        <nav className="space-y-2" aria-label="Primary navigation">
          <NavItem to="/" label="Dashboard" marker="01" />
          <NavItem to="/users" label="Users" marker="02" />
          <NavItem to="/tasks" label="Tasks" marker="03" />
        </nav>

        <div className="mt-auto border-t border-line px-2 pt-5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-600">
            <span>Environment</span>
            <span className="flex items-center gap-1.5 text-cyan"><span className="h-1.5 w-1.5 rounded-full bg-cyan" />Local</span>
          </div>
        </div>
      </aside>

      <main className="main-content min-h-screen flex-1 lg:ml-64">
        <header className="border-b border-line bg-[#0b1016]/80 px-6 py-5 backdrop-blur-md md:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-cyan">TaskFlow / {pageName}</p>
              <p className="font-display text-sm text-slate-400">Keep the work moving.</p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_12px_#00D9FF]" />
              Services connected
            </div>
          </div>
        </header>
        <div className="page-content grid-lines min-h-[calc(100vh-77px)] px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label, marker }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `group flex items-center justify-between border px-3 py-3 text-sm ${isActive ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-transparent text-slate-500 hover:border-line hover:bg-white/[0.02] hover:text-slate-200'}`}
    >
      <span className="flex items-center gap-3"><span className="font-code text-[10px] opacity-60">{marker}</span>{label}</span>
      <span className="text-xs opacity-50">↗</span>
    </NavLink>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-cyan">{eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function LoadingState({ label = 'Loading data' }) {
  return <div className="glass-panel flex min-h-48 items-center justify-center gap-3 p-8 text-sm text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-cyan" />{label}...</div>;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="glass-panel flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <p className="font-display text-lg text-white">We couldn&apos;t load this view.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-5 border border-cyan/50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-cyan hover:bg-cyan hover:text-ink">Try again</button>}
    </div>
  );
}

function EmptyState({ label }) {
  return <div className="py-14 text-center text-sm text-slate-600">{label}</div>;
}

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });

  const loadOverview = async () => {
    setState({ loading: true, error: '' });
    try {
      const { data } = await statsApi.get('/api/stats/overview');
      setOverview(data);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: getFriendlyError(error, 'The stats service is taking a moment to respond.') });
    }
  };

  useEffect(() => { loadOverview(); }, []);

  return (
    <>
      <PageHeading eyebrow="Workspace pulse" title="Good morning, operator." description="A live readout of the people and work flowing through your task system." action={<span className="font-code text-xs text-slate-600">UPDATED LIVE</span>} />
      {state.loading ? <LoadingState label="Syncing overview" /> : state.error ? <ErrorState message={state.error} onRetry={loadOverview} /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Total users" value={overview.totalUsers} detail="people in the workspace" marker="01" />
            <StatCard label="Total tasks" value={overview.totalTasks} detail="across every project" marker="02" />
          </div>
          <section className="glass-panel p-6 md:p-8">
            <div className="mb-8 flex items-end justify-between border-b border-line pb-5">
              <div><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Task distribution</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Work by status</h2></div>
              <span className="font-code text-xs text-slate-600">{overview.totalTasks} TOTAL</span>
            </div>
            <div className="space-y-6">
              <StatusBar label="Pending" value={overview.tasksByStatus.pending} total={overview.totalTasks} color="bg-amber-400" />
              <StatusBar label="In progress" value={overview.tasksByStatus['in-progress']} total={overview.totalTasks} color="bg-sky-400" />
              <StatusBar label="Done" value={overview.tasksByStatus.done} total={overview.totalTasks} color="bg-cyan" />
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, detail, marker }) {
  return <div className="glass-panel relative overflow-hidden p-6"><span className="absolute right-5 top-5 font-code text-xs text-slate-700">{marker}</span><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-5 font-display text-5xl font-semibold text-white">{value}</p><p className="mt-3 text-sm text-slate-500">{detail}</p></div>;
}

function StatusBar({ label, value, total, color }) {
  const width = total ? `${Math.max((value / total) * 100, value ? 3 : 0)}%` : '0%';
  return <div><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-code text-xs text-slate-500">{value}</span></div><div className="h-2 bg-line"><div className={`h-full ${color} transition-all duration-500`} style={{ width }} /></div></div>;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [form, setForm] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setState({ loading: true, error: '' });
    try {
      const { data } = await userApi.get('/api/users');
      setUsers(data);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: getFriendlyError(error, 'The user service is unavailable right now.') });
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const createUser = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await userApi.post('/api/users', form);
      setForm({ name: '', email: '' });
      await loadUsers();
    } catch (error) {
      setFormError(getFriendlyError(error, 'We could not create that user.'));
    } finally { setSaving(false); }
  };

  const deleteUser = async (id) => {
    try { await userApi.delete(`/api/users/${id}`); setUsers((current) => current.filter((user) => user._id !== id)); } catch (error) { setState({ loading: false, error: getFriendlyError(error, 'We could not delete that user.') }); }
  };

  return <>
    <PageHeading eyebrow="People directory" title="Users" description="Manage the people who own and move work through TaskFlow." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="glass-panel overflow-hidden"><div className="border-b border-line px-6 py-5"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Directory</p><h2 className="mt-1 font-display text-xl font-semibold text-white">All users <span className="font-code text-xs font-normal text-slate-600">/{users.length}</span></h2></div>{state.loading ? <LoadingState label="Loading users" /> : state.error ? <ErrorState message={state.error} onRetry={loadUsers} /> : <UserTable users={users} onDelete={deleteUser} />}</section>
      <CreateUserForm form={form} setForm={setForm} onSubmit={createUser} saving={saving} error={formError} />
    </div>
  </>;
}

function UserTable({ users, onDelete }) {
  return <div className="table-wrap"><table className="w-full min-w-[560px] text-left"><thead className="border-b border-line text-[10px] uppercase tracking-[0.18em] text-slate-600"><tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Email</th><th className="px-6 py-4 font-medium">Joined</th><th className="px-6 py-4 text-right font-medium">Action</th></tr></thead><tbody className="divide-y divide-line">{users.length ? users.map((user) => <tr key={user._id} className="text-sm hover:bg-white/[0.02]"><td className="px-6 py-4 font-medium text-slate-200">{user.name}<span className="mt-1 block font-code text-[10px] text-slate-600">{user._id}</span></td><td className="px-6 py-4 text-slate-500">{user.email}</td><td className="px-6 py-4 text-slate-500">{formatDate(user.createdAt)}</td><td className="px-6 py-4 text-right"><button onClick={() => onDelete(user._id)} className="text-xs text-slate-600 hover:text-red-300">Delete</button></td></tr>) : <tr><td colSpan="4"><EmptyState label="No users yet. Add the first person to get started." /></td></tr>}</tbody></table></div>;
}

function CreateUserForm({ form, setForm, onSubmit, saving, error }) {
  return <section className="glass-panel h-fit p-6"><p className="text-[10px] uppercase tracking-[0.2em] text-cyan">New record</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Add a user</h2><form onSubmit={onSubmit} className="mt-6 space-y-4"><Field label="Full name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Avery Stone" /></Field><Field label="Email address"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="avery@example.com" /></Field>{error && <InlineError message={error} />}<button disabled={saving} className="w-full bg-cyan px-4 py-3 text-xs font-bold uppercase tracking-widest text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60">{saving ? 'Creating...' : 'Create user'}</button></form></section>;
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [state, setState] = useState({ loading: true, error: '' });
  const [form, setForm] = useState({ title: '', description: '', userId: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setState({ loading: true, error: '' });
    try {
      const [tasksResponse, usersResponse] = await Promise.all([taskApi.get('/api/tasks'), userApi.get('/api/users')]);
      setTasks(tasksResponse.data);
      setUsers(usersResponse.data);
      setForm((current) => ({ ...current, userId: current.userId || usersResponse.data[0]?._id || '' }));
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: getFriendlyError(error, 'The task or user service is unavailable right now.') });
    }
  };

  useEffect(() => { loadData(); }, []);

  const createTask = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try { await taskApi.post('/api/tasks', form); setForm({ title: '', description: '', userId: users[0]?._id || '' }); await loadData(); } catch (error) { setFormError(getFriendlyError(error, 'We could not create that task.')); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { const { data } = await taskApi.patch(`/api/tasks/${id}/status`, { status }); setTasks((current) => current.map((task) => task._id === id ? data : task)); } catch (error) { setState({ loading: false, error: getFriendlyError(error, 'We could not update that task.') }); }
  };

  const deleteTask = async (id) => {
    try { await taskApi.delete(`/api/tasks/${id}`); setTasks((current) => current.filter((task) => task._id !== id)); } catch (error) { setState({ loading: false, error: getFriendlyError(error, 'We could not delete that task.') }); }
  };

  const visibleTasks = filter ? tasks.filter((task) => task.userId === filter) : tasks;
  const userName = (id) => users.find((user) => user._id === id)?.name || 'Unknown user';

  return <>
    <PageHeading eyebrow="Work queue" title="Tasks" description="Create, assign, and keep every piece of work moving toward done." action={<label className="flex items-center gap-3 text-xs text-slate-500">Filter by user<select value={filter} onChange={(event) => setFilter(event.target.value)} className="!w-auto"><option value="">All users</option>{users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}</select></label>} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="glass-panel overflow-hidden"><div className="border-b border-line px-6 py-5"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Execution queue</p><h2 className="mt-1 font-display text-xl font-semibold text-white">All tasks <span className="font-code text-xs font-normal text-slate-600">/{visibleTasks.length}</span></h2></div>{state.loading ? <LoadingState label="Loading tasks" /> : state.error ? <ErrorState message={state.error} onRetry={loadData} /> : <TaskTable tasks={visibleTasks} userName={userName} onStatusChange={updateStatus} onDelete={deleteTask} />}</section>
      <CreateTaskForm form={form} setForm={setForm} users={users} onSubmit={createTask} saving={saving} error={formError} />
    </div>
  </>;
}

function TaskTable({ tasks, userName, onStatusChange, onDelete }) {
  return <div className="table-wrap"><table className="w-full min-w-[720px] text-left"><thead className="border-b border-line text-[10px] uppercase tracking-[0.18em] text-slate-600"><tr><th className="px-6 py-4 font-medium">Task</th><th className="px-6 py-4 font-medium">Owner</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Created</th><th className="px-6 py-4 text-right font-medium">Action</th></tr></thead><tbody className="divide-y divide-line">{tasks.length ? tasks.map((task) => <tr key={task._id} className="text-sm hover:bg-white/[0.02]"><td className="px-6 py-4"><span className="font-medium text-slate-200">{task.title}</span><span className="mt-1 block max-w-[230px] truncate text-xs text-slate-600">{task.description || 'No description'}</span><span className="mt-1 block font-code text-[10px] text-slate-700">{task._id}</span></td><td className="px-6 py-4"><span className="text-slate-400">{userName(task.userId)}</span><span className="mt-1 block font-code text-[10px] text-slate-600">{task.userId}</span></td><td className="px-6 py-4"><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)} className={`status-select status-${task.status}`}><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="done">Done</option></select></td><td className="px-6 py-4 text-slate-500">{formatDate(task.createdAt)}</td><td className="px-6 py-4 text-right"><button onClick={() => onDelete(task._id)} className="text-xs text-slate-600 hover:text-red-300">Delete</button></td></tr>) : <tr><td colSpan="5"><EmptyState label="No tasks match this view." /></td></tr>}</tbody></table></div>;
}

function CreateTaskForm({ form, setForm, users, onSubmit, saving, error }) {
  return <section className="glass-panel h-fit p-6"><p className="text-[10px] uppercase tracking-[0.2em] text-cyan">New record</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Create a task</h2><form onSubmit={onSubmit} className="mt-6 space-y-4"><Field label="Title"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Prepare release notes" /></Field><Field label="Description"><textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What needs to happen?" /></Field><Field label="Assign to"><select required value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })}><option value="">Select a user</option>{users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}</select></Field>{error && <InlineError message={error} />}<button disabled={saving || !users.length} className="w-full bg-cyan px-4 py-3 text-xs font-bold uppercase tracking-widest text-ink hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Creating...' : 'Create task'}</button>{!users.length && <p className="text-xs text-amber-300">Add a user before creating tasks.</p>}</form></section>;
}

function Field({ label, children }) { return <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</span>{children}</label>; }
function InlineError({ message }) { return <p className="border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs leading-5 text-red-300">{message}</p>; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

function App() {
  return <Layout><Routes><Route path="/" element={<Dashboard />} /><Route path="/users" element={<Users />} /><Route path="/tasks" element={<Tasks />} /><Route path="*" element={<ErrorState message="That page does not exist." />} /></Routes></Layout>;
}

export default App;
