import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

const roleBg = { admin: '#FAECE7', mentor: '#D9E6DA', student: '#F1F0EB' }
const roleText = { admin: '#993C1D', mentor: '#0D631B', student: '#5F5E5A' }

const emptyForm = { name: '', email: '', password: '', role: 'student' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/admin/users')
      setUsers(res.data)
    } catch (err) {
      setError('Не удалось загрузить пользователей.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) return
    setCreating(true)
    setFormError('')
    try {
      const res = await api.post('/api/admin/users', form)
      setUsers([res.data, ...users])
      setShowCreateModal(false)
      setForm(emptyForm)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Не удалось создать пользователя.')
    } finally {
      setCreating(false)
    }
  }

  const handleChangeRole = async (userId, role) => {
    try {
      const res = await api.patch(`/api/admin/users/${userId}/role`, { role })
      setUsers(users.map((u) => (u.id === userId ? res.data : u)))
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось изменить роль.')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      await api.delete(`/api/admin/users/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось удалить пользователя.')
    }
  }

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Admin" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Users</h1>
          <button onClick={() => setShowCreateModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + New User
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'admin', 'mentor', 'student'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition"
              style={
                roleFilter === r
                  ? { backgroundColor: '#D9E6DA', color: '#0D631B' }
                  : { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }
              }
            >
              {r}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading users...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-black hover:bg-opacity-5" style={{ borderColor: 'var(--border-card)' }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td className="px-5 py-3">
                      {u.role === 'admin' ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: roleBg.admin, color: roleText.admin }}>
                          admin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer"
                          style={{ backgroundColor: roleBg[u.role], color: roleText[u.role] }}
                        >
                          <option value="mentor">mentor</option>
                          <option value="student">student</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="hover:text-red-500 transition" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New User</h2>
            {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Temporary password</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter a password"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreateModal(false); setForm(emptyForm); setFormError('') }} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating || !form.name.trim() || !form.email.trim() || !form.password}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#0D631B' }}
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}