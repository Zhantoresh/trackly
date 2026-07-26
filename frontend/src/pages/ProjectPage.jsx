import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, Calendar } from 'lucide-react'
import api from '../services/api'

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

const routeFor = (name) => ({
  Dashboard: '/dashboard', Projects: '/projects', Tasks: '/tasks',
  Files: '/files', Team: '/team', Settings: '/settings',
}[name])

const columns = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

const priorityBg = { high: '#FAECE7', medium: '#FAEEDA', low: '#EAF3DE' }
const priorityText = { high: '#993C1D', medium: '#854F0B', low: '#3B6D11' }

export default function ProjectPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadFiles = async () => {
    try {
      const res = await api.get(`/api/projects/files/project/${projectId}`)
      console.log('Files:', res.data)
      setFiles(res.data)
    }   catch (err) {
      console.error('Could not load files')
  }
}

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
      ])
      setProject(projectRes.data)
      const grouped = { todo: [], in_progress: [], done: [] }
      for (const task of tasksRes.data) {
        grouped[task.status]?.push(task)
      }
      setTasks(grouped)
      await loadFiles()
    } catch (err) {
      setError('Could not load this project.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const onDragEnd = async (result) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCol = [...tasks[source.droppableId]]
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]]
    const [moved] = sourceCol.splice(source.index, 1)
    destCol.splice(destination.index, 0, moved)

    const newTasks = { ...tasks, [source.droppableId]: sourceCol, [destination.droppableId]: destCol }
    setTasks(newTasks)

    if (source.droppableId !== destination.droppableId) {
      try {
        await api.put(`/api/projects/${projectId}/tasks/${moved.id}`, { status: destination.droppableId })
      } catch (err) {
        loadData()
      }
    }
  }

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await api.post(`/api/projects/${projectId}/tasks`, { title: newTitle, priority: newPriority })
      setTasks({ ...tasks, todo: [...tasks.todo, res.data] })
      setShowModal(false)
      setNewTitle('')
      setNewPriority('medium')
    } catch (err) {
      alert('Could not create task.')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedTaskId || !selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      await api.post(`/api/projects/${projectId}/tasks/${selectedTaskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowFileModal(false)
      setSelectedTaskId('')
      setSelectedFile(null)
      loadFiles()
    } catch (err) {
      alert('Could not upload file.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

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
                item.name === 'Projects' ? 'border-l-4 rounded-r-lg' : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Projects' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
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
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{project?.title}</h1>
            <p className="text-sm text-gray-500">{project?.description}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#0D631B' }}>
            + Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(columns).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">{label}</span>
                  <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">{tasks[key].length}</span>
                </div>
                <Droppable droppableId={key}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[40px]">
                      {tasks[key].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border border-gray-200 rounded-lg p-3 mb-2.5"
                            >
                              <span
                                className="text-xs px-2 py-1 font-medium rounded inline-block mb-2"
                                style={{ backgroundColor: priorityBg[task.priority], color: priorityText[task.priority] }}
                              >
                                {task.priority}
                              </span>
                              <p className="text-sm font-medium text-gray-800 mb-2">{task.title}</p>
                              {task.deadline && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Files section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Files</h2>
            <button
              onClick={() => setShowFileModal(true)}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0D631B' }}
            >
              + Upload File
            </button>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-gray-400">No files uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {files.map((file) => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                  <File size={20} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.file_name}</p>
                  </div>
                  <a href={file.file_url} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: '#0D631B' }}>
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Task</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleCreateTask} className="flex-1 text-white rounded-lg py-2 text-sm font-medium" style={{ backgroundColor: '#0D631B' }}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Select Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">Choose a task...</option>
                  {[...tasks.todo, ...tasks.in_progress, ...tasks.done].map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowFileModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium"
                style={{ backgroundColor: '#0D631B' }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}