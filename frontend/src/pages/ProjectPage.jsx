import { useState, useEffect, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate, useParams } from 'react-router-dom'
import { File, Calendar, Trash2, Search } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

const columns = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

const priorityBg = { high: '#FAECE7', medium: '#FAEEDA', low: '#EAF3DE' }
const priorityText = { high: '#993C1D', medium: '#854F0B', low: '#3B6D11' }
const avatarPalette = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FAEEDA', text: '#854F0B' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#E6F1FB', text: '#185FA5' },
]

const initials = (name) => (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
const avatarColor = (name) => avatarPalette[(name || '').charCodeAt(0) % avatarPalette.length || 0]

export default function ProjectPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [files, setFiles] = useState([])
  const [myRole, setMyRole] = useState('member')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [availableStudents, setAvailableStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editAssigneeId, setEditAssigneeId] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newAssigneeId, setNewAssigneeId] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadFiles = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/files`)
      setFiles(res.data)
    } catch (err) {
      console.error('Could not load files')
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [projectRes, tasksRes, roleRes, membersRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
        api.get(`/api/projects/${projectId}/my-role`),
        api.get(`/api/projects/${projectId}/members`),
      ])
      setProject(projectRes.data)
      setMyRole(roleRes.data.role)
      setTasks(tasksRes.data)
      setMembers(membersRes.data)
      await loadFiles()
    } catch (err) {
      setError('Could not load this project.')
    } finally {
      setLoading(false)
    }
  }

  const memberName = useMemo(() => {
    const map = new Map()
    for (const m of members) map.set(m.user_id, m.name)
    return map
  }, [members])

  const students = members.filter((m) => m.role === 'member')

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee && t.assignee_id !== filterAssignee) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filterAssignee, filterPriority, search])

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] }
    for (const t of filteredTasks) g[t.status]?.push(t)
    return g
  }, [filteredTasks])

  const hasFilters = filterAssignee || filterPriority || search
  const clearFilters = () => { setFilterAssignee(''); setFilterPriority(''); setSearch('') }

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId
    const prevTasks = tasks
    setTasks(tasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t)))

    try {
      await api.put(`/api/projects/${projectId}/tasks/${draggableId}`, { status: newStatus })
    } catch (err) {
      setTasks(prevTasks)
      alert(err.response?.data?.detail || 'Could not update task status.')
    }
  }

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await api.post(`/api/projects/${projectId}/tasks`, {
        title: newTitle,
        priority: newPriority,
        assignee_id: newAssigneeId || null,
        deadline: newDeadline || null,
      })
      setTasks([...tasks, res.data])
      setShowModal(false)
      setNewTitle('')
      setNewPriority('medium')
      setNewAssigneeId('')
      setNewDeadline('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not create task.')
    }
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditAssigneeId(task.assignee_id || '')
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : '')
    setShowEditModal(true)
  }

  const handleUpdateTask = async () => {
    if (!editTitle.trim() || !editingTask) return
    try {
      const res = await api.put(`/api/projects/${projectId}/tasks/${editingTask.id}`, {
        title: editTitle,
        priority: editPriority,
        assignee_id: editAssigneeId || null,
        deadline: editDeadline || null,
      })
      setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data : t)))
      setShowEditModal(false)
      setEditingTask(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not update task.')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      await api.post(`/api/projects/${projectId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowFileModal(false)
      setSelectedFile(null)
      loadFiles()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not upload file.')
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/api/projects/${projectId}/files/${fileId}`)
      setFiles(files.filter((f) => f.id !== fileId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not delete file.')
    }
  }

  const openAddStudentModal = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/available-students`)
      setAvailableStudents(res.data)
      setSelectedStudentId('')
      setShowAddStudentModal(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not load students.')
    }
  }

  const handleAddStudent = async () => {
    if (!selectedStudentId) return
    try {
      await api.post(`/api/projects/${projectId}/members`, { user_id: selectedStudentId })
      setShowAddStudentModal(false)
      setSelectedStudentId('')
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not add student.')
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
      <Sidebar active="Projects" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{project?.title}</h1>
            <p className="text-sm text-gray-500">{project?.description}</p>
          </div>
          {myRole === 'owner' && (
            <div className="flex items-center gap-2">
              <button onClick={openAddStudentModal} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                + Add Student
              </button>
              <button onClick={() => setShowModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#0D631B' }}>
                + Add Task
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-500"
          >
            <option value="">All students</option>
            {students.map((s) => (
              <option key={s.user_id} value={s.user_id}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-500"
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm hover:underline" style={{ color: '#0D631B' }}>
              Clear filters
            </button>
          )}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(columns).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">{label}</span>
                  <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">{grouped[key].length}</span>
                </div>
                <Droppable droppableId={key}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[40px]">
                      {grouped[key].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => myRole === 'owner' && openEditModal(task)}
                              className={`bg-white border border-gray-200 rounded-lg p-3 mb-2.5 ${myRole === 'owner' ? 'cursor-pointer hover:border-green-300' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className="text-xs px-2 py-1 font-medium rounded inline-block"
                                  style={{ backgroundColor: priorityBg[task.priority], color: priorityText[task.priority] }}
                                >
                                  {task.priority}
                                </span>
                                {task.assignee_id && memberName.get(task.assignee_id) && (
                                  <span
                                    title={memberName.get(task.assignee_id)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                                    style={{
                                      backgroundColor: avatarColor(memberName.get(task.assignee_id)).bg,
                                      color: avatarColor(memberName.get(task.assignee_id)).text,
                                    }}
                                  >
                                    {initials(memberName.get(task.assignee_id))}
                                  </span>
                                )}
                              </div>
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
                      {grouped[key].length === 0 && (
                        <p className="text-xs text-gray-400 px-1">No tasks.</p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Files section — общая папка проекта. Загружает только mentor/admin, скачивают все участники. */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Files</h2>
            {myRole === 'owner' && (
              <button
                onClick={() => setShowFileModal(true)}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0D631B' }}
              >
                + Upload File
              </button>
            )}
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
                  {myRole === 'owner' && (
                    <button onClick={() => handleDeleteFile(file.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
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
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Assignee</label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">Unassigned</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
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

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Task</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Assignee</label>
                <select
                  value={editAssigneeId}
                  onChange={(e) => setEditAssigneeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">Unassigned</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleUpdateTask} className="flex-1 text-white rounded-lg py-2 text-sm font-medium" style={{ backgroundColor: '#0D631B' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Student to Project</h2>
            {availableStudents.length === 0 ? (
              <p className="text-sm text-gray-500">
                No students available to add — either everyone is already in this project, or no student accounts exist yet.
              </p>
            ) : (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">Select a student</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddStudentModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={!selectedStudentId}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#0D631B' }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}