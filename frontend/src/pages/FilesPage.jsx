import { FileText, Image, Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'

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
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Files" />

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
