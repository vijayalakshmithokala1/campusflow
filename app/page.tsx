'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Inbox, Download, Plus, Loader2, GraduationCap, LogOut } from 'lucide-react'

interface Resource {
  id: number
  title: string
  subject: string
  semester: number
  file_url: string
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  // 1. Check if user is logged in
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login') // Kick to login if not authenticated
    } else {
      fetchResources() // Fetch data if they are allowed in
    }
  }

  // 2. Fetch the documents
  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      if (data) setResources(data)
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setLoading(false)
    }
  }

  // 3. Handle Logout
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredResources = resources.filter(res =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
            <GraduationCap className="text-blue-600" size={28} />
            <span>CampusFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 px-3 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
            <Link 
              href="/upload" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Upload
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* SEARCH BAR */}
        <div className="max-w-3xl mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg shadow-sm"
            placeholder="Search for notes, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Loading documents...</p>
          </div>
        ) : resources.length === 0 ? (
          
          /* EMPTY STATE: Database is completely empty */
          <div className="max-w-4xl mx-auto bg-white border border-dashed border-slate-200 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center shadow-sm">
            <Inbox className="text-slate-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-slate-600 mb-1">No documents found yet.</h3>
            <p className="text-slate-400 text-sm">Be the first to upload a resource!</p>
          </div>

        ) : filteredResources.length === 0 ? (
          
          /* EMPTY STATE: Search matched nothing */
          <div className="max-w-4xl mx-auto bg-white border border-dashed border-slate-200 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center shadow-sm">
            <Search className="text-slate-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-slate-600 mb-1">No matches found</h3>
            <p className="text-slate-400 text-sm">The document has not been updated by anyone yet.</p>
          </div>

        ) : (
          
          /* RESULTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex-1">
                  <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    Semester {resource.semester}
                  </span>
                  <h3 className="font-bold text-xl text-slate-800 mb-1 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {resource.subject}
                  </p>
                </div>
                
                <a 
                  href={resource.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#F8FAFC] hover:bg-blue-600 hover:text-white text-slate-700 py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors border border-slate-100 hover:border-blue-600"
                >
                  <Download size={18} /> View Document
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}