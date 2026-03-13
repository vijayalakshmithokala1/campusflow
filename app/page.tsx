'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, ThumbsUp, Download, GraduationCap, Plus, Loader2, Inbox } from 'lucide-react'

export default function Home() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error fetching:", error)
    if (data) setDocs(data)
    setLoading(false)
  }

  const filtered = docs.filter(d => 
    d.title?.toLowerCase().includes(search.toLowerCase()) || 
    d.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800">CampusFlow</h1>
        </div>
        <a href="/upload" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18}/> Upload
        </a>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        <div className="relative mb-12">
          <Search className="absolute left-4 top-4 text-slate-400" size={24} />
          <input 
            type="text" placeholder="Search for notes, subjects..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="mt-4 text-slate-500 font-medium">Connecting to Supabase...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-slate-800 text-xl mb-1">{doc.title}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-4 uppercase tracking-wider">{doc.subject}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                   <span className="text-slate-400 text-sm">Sem {doc.semester}</span>
                   <a href={doc.file_url} target="_blank" className="bg-slate-100 p-3 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition">
                      <Download size={20}/>
                   </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <Inbox className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 text-lg font-medium">No documents found yet.</p>
            <p className="text-slate-400">Be the first to upload a resource!</p>
          </div>
        )}
      </main>
    </div>
  )
}