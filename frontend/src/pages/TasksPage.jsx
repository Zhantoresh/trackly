import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Calendar, Search } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

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
  const { t } = useLanguage()

  const columns = { todo: t('todo'), in_progress: t('inProgress'), done: t('done') }

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
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Tasks" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{t('tasksTitle')}</h1>

        <div className="border rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchTasksPlaceholder')}
              className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-green-500"
              style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
          >
            <option value="">{t('allProjects')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
          >
            <option value="">{t('allStudents')}</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
          >
            <option value="">{t('allPriorities')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm hover:underline" style={{ color: '#0D631B' }}>
              {t('clearFilters')}
            </button>
          )}
        </div>

        {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('loadingTasks')}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(columns).map(([key, label]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="text-xs border rounded-full px-2 py-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>{grouped[key].length}</span>
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
                                className="border rounded-lg p-3 mb-2.5 cursor-pointer hover:border-green-300 transition"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-xs px-2 py-1 font-medium rounded inline-block"
                                    style={{ backgroundColor: priorityBg[task.priority], color: priorityText[task.priority] }}
                                  >
                                    {t(task.priority)}
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
                                <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                                <p className="text-xs mb-1.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.project_title}</p>
                                {task.deadline && (
                                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
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
                          <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{t('noTasks')}</p>
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