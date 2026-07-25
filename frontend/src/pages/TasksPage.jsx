import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, Calendar } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

const tasks = [
  { id: 1, title: 'Design login page', project: 'Trackly', status: 'To Do', priority: 'Medium', assignee: 'Alua', deadline: 'Jul 3' },
  { id: 2, title: 'Write API documentation', project: 'Trackly', status: 'To Do', priority: 'Low', assignee: 'Dastan', deadline: 'Jul 5' },
  { id: 3, title: 'Setup Docker', project: 'Trackly', status: 'To Do', priority: 'High', assignee: 'Dastan', deadline: 'Jul 6' },
  { id: 4, title: 'Implement auth endpoints', project: 'Trackly', status: 'In Progress', priority: 'High', assignee: 'Birzhan', deadline: 'Jul 4' },
  { id: 5, title: 'Build dashboard UI', project: 'Trackly', status: 'In Progress', priority: 'Medium', assignee: 'Zhantore', deadline: 'Jul 5' },
  { id: 6, title: 'Setup repository', project: 'Trackly', status: 'Done', priority: 'High', assignee: 'Zhantore', deadline: 'Jun 28' },
  { id: 7, title: 'DB schema design', project: 'Trackly', status: 'Done', priority: 'High', assignee: 'Dastan', deadline: 'Jun 29' },
]

const statusBg = { 'To Do': '#E6F1FB', 'In Progress': '#FAEEDA', 'Done': '#EAF3DE' }
const statusText = { 'To Do': '#185FA5', 'In Progress': '#854F0B', 'Done': '#3B6D11' }
const priorityBg = { High: '#FAECE7', Medium: '#FAEEDA', Low: '#EAF3DE' }
const priorityText = { High: '#993C1D', Medium: '#854F0B', Low: '#3B6D11' }

export default function TasksPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const routeFor = (name) => ({
    Dashboard: '/dashboard',
    Projects: '/projects',
    Tasks: '/tasks',
    Files: '/files',
    Team: '/team',
    Settings: '/settings',
  }[name])

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col py-6 px-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0D631B' }}>
            <div className="grid grid-cols-2 gap-0.5 p-1.5">
              <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
              <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
              <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
              <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
            </div>
          </div>
          <span className="font-semibold text-lg" style={{ color: '#0D631B' }}>Trackly</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(routeFor(item.name))}
              className={`text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 ${
                item.name === 'Tasks'
                  ? 'border-l-4 rounded-r-lg'
                  : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Tasks' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 pt-4 flex flex-col gap-1">
          <button className="text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-3">
            <HelpCircle size={16} /> Support
          </button>
          <button onClick={handleLogout} className="text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-3 rounded-lg">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Tasks</h1>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Assignee</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-800 font-medium">{task.title}</td>
                  <td className="px-5 py-3 text-gray-500">{task.project}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-1 font-medium rounded"
                      style={{ backgroundColor: statusBg[task.status], color: statusText[task.status] }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-1 font-medium rounded"
                      style={{ backgroundColor: priorityBg[task.priority], color: priorityText[task.priority] }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{task.assignee}</td>
                  <td className="px-5 py-3 text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {task.deadline}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
