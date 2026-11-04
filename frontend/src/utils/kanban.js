// Helpers shared by the Kanban boards (ProjectPage, TasksPage).

// Oldest first, so cards keep a stable order between reloads.
export const sortByCreated = (tasks) =>
  [...tasks].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

// Moves a task to another column and puts it exactly where it was dropped.
// `grouped` is what the board shows right now (after filters), so the drop
// index is matched against visible cards only.
export function moveTask(tasks, grouped, { draggableId, destination }) {
  const moved = tasks.find((t) => t.id === draggableId)
  if (!moved) return tasks

  const updated = { ...moved, status: destination.droppableId }
  const rest = tasks.filter((t) => t.id !== draggableId)
  const visibleInDest = (grouped[destination.droppableId] || []).filter((t) => t.id !== draggableId)
  const anchor = visibleInDest[destination.index]

  let insertAt
  if (anchor) {
    insertAt = rest.findIndex((t) => t.id === anchor.id)
  } else if (visibleInDest.length > 0) {
    const last = visibleInDest[visibleInDest.length - 1]
    insertAt = rest.findIndex((t) => t.id === last.id) + 1
  } else {
    insertAt = rest.length
  }

  return [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)]
}

// Styles for a card while it is being dragged. The library's own style
// (position + transform) must come last, otherwise the card does not move.
export const cardStyle = (provided, snapshot) => ({
  backgroundColor: 'var(--bg-card)',
  borderColor: snapshot.isDragging ? '#0D631B' : 'var(--border-card)',
  boxShadow: snapshot.isDragging ? '0 10px 24px rgba(0, 0, 0, 0.18)' : 'none',
  ...provided.draggableProps.style,
})

export const columnStyle = (snapshot) => ({
  backgroundColor: snapshot.isDraggingOver ? 'rgba(13, 99, 27, 0.06)' : 'transparent',
  outline: snapshot.isDraggingOver ? '1px dashed rgba(13, 99, 27, 0.35)' : '1px dashed transparent',
})