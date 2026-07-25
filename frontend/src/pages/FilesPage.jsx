import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, FileText, Image, Download } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

const files = [
  { id: 1, name: 'dashboard-wireframe.fig', project: 'Trackly', task: 'Design dashboard page', size: '2.4 MB', type: 'design' },
  { id: 2, name: 'project-requirements.pdf', project: 'Trackly', task: 'Design dashboard page', size: '1.1 MB', type: 'doc' },
  { id: 3, name: 'login-wireframe-v2.fig', project: 'Trackly', task: 'Design login page', size: '2.4 MB', type: 'design' },
  { id: 4, name: 'api-contract.md', project: 'Trackly', task: 'Write API documentation', size: '0.3 MB', type: 'doc' },
  { id: 5, name: 'db-schema.png', project: 'Trackly', task: 'DB schema design', size: '0.8 MB', type: 'image' },
]

const typeIcon = {
  design: <FileText size={16} className="text-gray-500" />,
  doc: <FileText size={16} className="text-gray-500" />,
  image: <Image size={16} className="text-gray-500" />,
}

export default function FilesPage() {
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
                item.name === 'Files'
                  ? 'border-l-4 rounded-r-lg'
                  : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Files' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Files</h1>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">File</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Size</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-800 font-medium flex items-center gap-2">
                    {typeIcon[file.type]}
                    {file.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{file.project}</td>
                  <td className="px-5 py-3 text-gray-500">{file.task}</td>
                  <td className="px-5 py-3 text-gray-400">{file.size}</td>
                  <td className="px-5 py-3">
                    <button className="text-gray-400 hover:text-green-700 transition">
                      <Download size={16} />
                    </button>
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
