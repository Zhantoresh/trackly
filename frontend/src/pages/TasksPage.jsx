import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Calendar, Search } from 'lucide-react'
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

export default function TasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterProject, setFilterProject] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects'),
      ])
      setTasks(tasksRes.data)
      setProjects(projectsRes.data)
    } catch (err) {
      setError('Could not load tasks.')
    } finally {
      setLoading(false)
    }
  }

  // список исполнителей строим из самих задач — не нужен отдельный эндпоинт
  const assignees = useMemo(() => {
    const map = new Map()
    for (const t of tasks) {
      if (t.assignee_id && !map.has(t.assignee_id)) {
        map.set(t.assignee_id, t.assignee_name)
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterProject && t.project_id !== filterProject) return false
      if (filterAssignee && t.assignee_id !== filterAssignee) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filterProject, filterAssignee, filterPriority, search])

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] }
    for (const t of filteredTasks) {
      g[t.status]?.push(t)
    }
    return g
  }, [filteredTasks])

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return

    const task = tasks.find((t) => t.id === draggableId)
    if (!task) return

    const newStatus = destination.droppableId
    const prevTasks = tasks
    setTasks(tasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t)))

    try {
      await api.put(`/api/projects/${task.project_id}/tasks/${task.id}`, { status: newStatus })
    } catch (err) {
      // например student тащит чужую задачу или не может её менять — откатываем
      setTasks(prevTasks)
      alert(err.response?.data?.detail || 'Could not update task status.')
    }
  }

  const clearFilters = () => {
    setFilterProject('')
    setFilterAssignee('')
    setFilterPriority('')
    setSearch('')
  }

  const hasFilters = filterProject || filterAssignee || filterPriority || search

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Tasks" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Tasks</h1>

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
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-500"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-500"
          >
            <option value="">All students</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
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

        {loading && <p className="text-sm text-gray-500">Loading tasks...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
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
                                onClick={() => navigate(`/project/${task.project_id}`)}
                                className="bg-white border border-gray-200 rounded-lg p-3 mb-2.5 cursor-pointer hover:border-green-300 transition"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-xs px-2 py-1 font-medium rounded inline-block"
                                    style={{ backgroundColor: priorityBg[task.priority], color: priorityText[task.priority] }}
                                  >
                                    {task.priority}
                                  </span>
                                  {task.assignee_name && (
                                    <span
                                      title={task.assignee_name}
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                                      style={{ backgroundColor: avatarColor(task.assignee_name).bg, color: avatarColor(task.assignee_name).text }}
                                    >
                                      {initials(task.assignee_name)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-800 mb-1.5">{task.title}</p>
                                <p className="text-xs text-gray-400 mb-1.5 truncate">{task.project_title}</p>
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
        )}
      </main>
    </div>
  )
}
