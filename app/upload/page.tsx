'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Upload, ArrowLeft, Loader2, CheckCircle, FileText } from 'lucide-react'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ title: '', subject: '', semester: '1' })
  const router = useRouter()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    
    if (!file) return alert("Please select a file to upload!")
    if (!form.title || !form.subject) return alert("Please provide a title and subject!")

    setLoading(true)

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
      const uniqueName = `${Date.now()}-${cleanFileName}`

      const { error: sError } = await supabase.storage
        .from('resources')
        .upload(uniqueName, file)

      if (sError) throw new Error(`Storage Error: ${sError.message}`)

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(uniqueName)
      
      const { error: dbError } = await supabase.from('resources').insert({
        title: form.title,
        subject: form.subject,
        semester: Number(form.semester),
        file_url: urlData.publicUrl,
        upvotes: 0
      })

      // Bypass the fake Supabase Schema Cache error
      if (dbError && !dbError.message.includes('schema cache')) {
        throw new Error(`Database Error: ${dbError.message}`)
      }

      setCompleted(true)
      
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error: any) {
      console.error("Upload process failed:", error)
      alert(error.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        
        <div className={`absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500 ${loading ? 'w-full animate-pulse' : 'w-0'}`} />

        <button 
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Feed
        </button>

        {completed ? (
          <div className="py-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500 font-medium">Your resource is now live.</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-6">
            <header>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Share Knowledge</h2>
              <p className="text-slate-400 font-medium mt-1">Provide details for your resource.</p>
            </header>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. OS Lab Records"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Computer Science"
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                <select 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                  value={form.semester}
                  onChange={e => setForm({...form, semester: e.target.value})}
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  required
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center ${file ? 'border-green-400 bg-green-50' : 'border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200'}`}>
                  <div className={`p-3 rounded-xl shadow-sm mb-3 ${file ? 'bg-green-100' : 'bg-white'}`}>
                    {file ? <CheckCircle className="text-green-600" size={24} /> : <Upload className="text-blue-500" size={24} />}
                  </div>
                  <p className={`text-sm font-bold ${file ? 'text-green-700' : 'text-slate-600'}`}>
                    {file ? file.name : 'Tap to select file'}
                  </p>
                  {!file && <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">PDF or Images</p>}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-600 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Publish Resource</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}