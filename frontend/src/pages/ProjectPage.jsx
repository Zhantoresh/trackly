import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, Calendar } from 'lucide-react'

const initialTasks = {
  todo: [
    { id: '1', title: 'Design login page', description: 'Design the login and register screens', assignee: 'Alua', deadline: 'Jul 3', priority: 'Medium' },
    { id: '2', title: 'Write API documentation', description: 'Document all API endpoints', assignee: 'Dastan', deadline: 'Jul 5', priority: 'Low' },
    { id: '3', title: 'Setup Docker', description: 'Configure Docker for deployment', assignee: 'Dastan', deadline: 'Jul 6', priority: 'High' },
  ],
  in_progress: [
    { id: '4', title: 'Implement auth endpoints', description: 'Login, register, JWT tokens', assignee: 'Birzhan', deadline: 'Jul 4', priority: 'High' },
    { id: '5', title: 'Build dashboard UI', description: 'Dashboard with project cards', assignee: 'Zhantoре', deadline: 'Jul 5', priority: 'Medium' },
  ],
  done: [
    { id: '6', title: 'Setup repository', description: 'Create monorepo structure', assignee: 'Zhantoре', deadline: 'Jun 28', priority: 'High' },
    { id: '7', title: 'DB schema design', description: 'Design database schema', assignee: 'Dastan', deadline: 'Jun 29', priority: 'High' },
  ],
}

const columns = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export default function ProjectPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
const [projectData, setProjectData] = useState({
  name: 'Trackly',
  description: 'Internal project management platform',
  deadline: 'Jul 14'
})
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const onDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCol = [...tasks[source.droppableId]]
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]]

    const [moved] = sourceCol.splice(source.index, 1)
    destCol.splice(destination.index, 0, moved)

    setTasks({
      ...tasks,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    })
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      {/* Sidebar */}
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
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { name: 'Projects', icon: <FolderOpen size={16} /> },
            { name: 'Tasks', icon: <CheckSquare size={16} /> },
            { name: 'Files', icon: <File size={16} /> },
            { name: 'Team', icon: <Users size={16} /> },
            { name: 'Settings', icon: <Settings size={16} /> },
          ].map((item) => (
            <button
              key={item.name}
              className={`text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 ${
                item.name === 'Projects'
                  ? 'border-l-4 rounded-r-lg'
                  : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
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

      {/* Main */}
      <main className="ml-60 flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
          <input type="text" placeholder="Search projects, tasks, or files..." className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 w-72 focus:outline-none bg-gray-50" />
          <button onClick={() => setShowModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + Add Task
          </button>
        </div>

        <div className="p-8">
          {/* Project header */}
          <div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold text-gray-800">Trackly</h1>
    <p className="text-sm text-gray-500">Internal project management platform</p>
    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
      <Calendar size={12} /> Deadline: Jul 14
    </p>
  </div>
  <button 
  onClick={() => setShowEditModal(true)}
  className="text-white px-4 py-2 rounded-lg text-sm font-medium" 
  style={{backgroundColor: '#0D631B'}}
>
  Edit Project
</button>
</div>

          {/* Kanban */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(columns).map(([colId, colName]) => (
                <div key={colId} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">{colName}</h2>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{tasks[colId].length}</span>
                  </div>
                  <Droppable droppableId={colId}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3 min-h-20">
                        {tasks[colId].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-grab"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: task.priority === 'High' ? '#FFE4E4' : task.priority === 'Low' ? '#E8F0FF' : '#FFF3E0',
            color: task.priority === 'High' ? '#BA1A1A' : task.priority === 'Low' ? '#1A4FBA' : '#E65100',
          }}
        >
          {task.priority}
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-3">{task.title}</h3>
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">{task.assignee}</span>
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Calendar size={12} /> {task.deadline}
        </span>
      </div>
    </div>
  )}
</Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <button className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 py-2 border border-dashed border-gray-300 rounded-lg transition" onClick={() => setShowModal(true)}>
                    + Add Task
                  </button>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Task</h2>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Task title" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              <textarea placeholder="Description" rows={3} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" />
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                <option value="">Select status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <input type="text" placeholder="Assignee name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

{showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Project</h2>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Project name</label>
          <input
            type="text"
            value={projectData.name}
            onChange={(e) => setProjectData({...projectData, name: e.target.value})}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Description</label>
          <textarea
            value={projectData.description}
            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Deadline</label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => setShowEditModal(false)}
          className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => setShowEditModal(false)}
          className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition"
          style={{backgroundColor: '#0D631B'}}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}