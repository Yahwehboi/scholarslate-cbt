import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatClassLabel, getUserInitials } from '../lib/auth'

const Ic = {
  school:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  book:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>,
  results:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
  profile:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  help:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  menu:      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  search:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  filter:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>,
  print:     <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>,
  math:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18l2-4H7v-2h3.5l-2-4H11l1 2.5L13 8h2.5l-2 4H17v2h-2.5l2 4H14l-2-5-2 5H7.5z"/></svg>,
  science:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 2v2h1v7.6L4.8 17c-.5.8-.3 1.9.5 2.4.3.2.6.3.9.3h11.6c.9 0 1.7-.8 1.7-1.7 0-.3-.1-.6-.2-.9L16 11.6V4h1V2H7z"/></svg>,
  english:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/></svg>,
  empty:     <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
}

// Mock history data — replace with API later
const HISTORY = [
  {id:1, subject:'Mathematics',     icon:Ic.math,    iconBg:'#e8f5e9', iconColor:'#2f6a3c', score:85, total:20, pct:85, attempt:1, date:'Apr 2, 2026',  status:'Pass'},
  {id:2, subject:'English Language',icon:Ic.english, iconBg:'#fce4ec', iconColor:'#880e4f', score:14, total:20, pct:70, attempt:1, date:'Mar 28, 2026', status:'Pass'},
  {id:3, subject:'Biology',         icon:Ic.science, iconBg:'#e3f2fd', iconColor:'#1565c0', score:8,  total:20, pct:40, attempt:1, date:'Mar 24, 2026', status:'Fail'},
  {id:4, subject:'Chemistry',       icon:Ic.science, iconBg:'#fff3e0', iconColor:'#e65100', score:18, total:20, pct:90, attempt:1, date:'Mar 20, 2026', status:'Pass'},
  {id:5, subject:'Biology',         icon:Ic.science, iconBg:'#e3f2fd', iconColor:'#1565c0', score:12, total:20, pct:60, attempt:2, date:'Mar 10, 2026', status:'Pass'},
  {id:6, subject:'Mathematics',     icon:Ic.math,    iconBg:'#e8f5e9', iconColor:'#2f6a3c', score:9,  total:20, pct:45, attempt:2, date:'Feb 28, 2026', status:'Fail'},
]

function Sidebar({open,onClose}:{open:boolean;onClose:()=>void}){
  const navigate=useNavigate(), location=useLocation()
  const { logout } = useAuth()
  const navItems=[{icon:Ic.dashboard,label:'Dashboard',path:'/dashboard'},{icon:Ic.book,label:'Subjects',path:'/select-subject'},{icon:Ic.results,label:'Results',path:'/results-history'},{icon:Ic.profile,label:'Profile',path:'/profile'}]
  return(
    <>
      {open&&<div className="fixed inset-0 z-30 md:hidden" style={{backgroundColor:'rgba(25,28,29,0.4)',backdropFilter:'blur(4px)'}} onClick={onClose}/>}
      <aside className="sidebar-desktop fixed left-0 top-0 h-screen z-40 flex flex-col transition-transform duration-300"
        style={{width:'256px',backgroundColor:'#f3f4f5',transform:open?'translateX(0)':'translateX(-100%)'}}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-white flex-shrink-0" style={{backgroundColor:'#006e2f',borderRadius:'0.5rem'}}>{Ic.school}</div>
          <div>
            <h1 className="text-base font-black leading-none" style={{fontFamily:'Manrope,sans-serif',color:'#006e2f'}}>ScholarSlate</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{color:'#6d7b6c'}}>Student Portal</p>
          </div>
        </div>
        <nav className="flex-1 mt-2 flex flex-col">
          {navItems.map(({icon,label,path})=>{
            const active=location.pathname===path
            return(
              <button key={path} onClick={()=>{navigate(path);onClose()}}
                className="flex items-center gap-3 py-3 px-6 text-left transition-all duration-200"
                style={{color:active?'#006e2f':'#3d4a3d',backgroundColor:active?'#ffffff':'transparent',borderLeft:active?'4px solid #006e2f':'4px solid transparent',fontWeight:active?600:500,fontFamily:'Inter,sans-serif'}}
                onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLElement).style.backgroundColor='#e7e8e9'}}
                onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLElement).style.backgroundColor='transparent'}}>
                {icon}<span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-4 flex flex-col gap-1">
          {[{icon:Ic.help,label:'Help Center'},{icon:Ic.logout,label:'Logout'}].map(({icon,label})=>(
            <button key={label} className="flex items-center gap-3 py-3 px-6 text-sm font-medium transition-colors duration-200"
              style={{color:'#3d4a3d',fontFamily:'Inter,sans-serif',borderRadius:'0.5rem'}}
              onMouseEnter={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#e7e8e9')}
              onMouseLeave={e=>((e.currentTarget as HTMLElement).style.backgroundColor='transparent')}
              onClick={()=>{
                if(label!=='Logout') return
                logout()
                navigate('/login', { replace: true })
              }}>
              {icon}<span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}

export default function ResultsHistoryPage(){
  const { session } = useAuth()
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [query,setQuery]=useState('')
  const [statusFilter,setStatusFilter]=useState('All')
  const [dateFilter,setDateFilter]=useState('')

  const filtered=HISTORY.filter(r=>{
    const matchSearch=r.subject.toLowerCase().includes(query.toLowerCase())
    const matchStatus=statusFilter==='All'||r.status===statusFilter
    return matchSearch&&matchStatus
  })

  // Summary stats
  const totalExams=HISTORY.length
  const passCount=HISTORY.filter(r=>r.status==='Pass').length
  const avgScore=Math.round(HISTORY.reduce((s,r)=>s+r.pct,0)/HISTORY.length)
  const best=Math.max(...HISTORY.map(r=>r.pct))
  const studentName = session?.role === 'student' ? session.fullName : 'Student'
  const studentClass = session?.role === 'student' ? formatClassLabel(session.className) : ''
  const studentInitials = getUserInitials(studentName)

  return(
    <div className="min-h-screen" style={{backgroundColor:'#f8f9fa'}}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}`}</style>
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>

      <div className="main-content flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{backgroundColor:'rgba(255,255,255,0.85)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',boxShadow:'0 1px 0 rgba(188,203,185,0.3)'}}>
          <div className="flex items-center gap-4">
            <button onClick={()=>setSidebarOpen(o=>!o)} className="p-2 rounded-lg md:hidden" style={{color:'#3d4a3d'}}>{Ic.menu}</button>
            <h2 className="text-lg font-bold" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>School CBT System</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none" style={{color:'#191c1d'}}>{studentName}</p>
              <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{color:'#6d7b6c'}}>{studentClass}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background:'linear-gradient(135deg,#006e2f,#22c55e)'}}>{studentInitials}</div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">

          {/* Page title */}
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Performance Ledger</h1>
            <p className="text-base font-medium" style={{color:'#3d4a3d'}}>Review your historical test performance and academic trajectory.</p>
          </motion.div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[{label:'Total Exams',value:totalExams,color:'#191c1d'},{label:'Passed',value:passCount,color:'#006e2f'},{label:'Avg Score',value:`${avgScore}%`,color:'#2f6a3c'},{label:'Best Score',value:`${best}%`,color:'#006e2f'}]
              .map(({label,value,color},i)=>(
                <motion.div key={label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07,duration:0.4}}
                  className="p-5 rounded-xl" style={{backgroundColor:'#ffffff',boxShadow:'0 2px 12px rgba(25,28,29,0.06)'}}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#6d7b6c'}}>{label}</p>
                  <p className="text-3xl font-black" style={{fontFamily:'Manrope,sans-serif',color}}>{value}</p>
                </motion.div>
              ))}
          </div>

          {/* Filter bar */}
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.4}}
            className="p-5 rounded-xl mb-6 flex flex-wrap gap-4 items-end"
            style={{backgroundColor:'#f3f4f5'}}>
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase font-bold tracking-widest mb-2" style={{color:'#6d7b6c'}}>Search Subject</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#bccbb9'}}>{Ic.search}</span>
                <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder="e.g. Mathematics"
                  style={{width:'100%',paddingLeft:'36px',paddingRight:'12px',paddingTop:'10px',paddingBottom:'10px',backgroundColor:'#ffffff',border:'1px solid #e7e8e9',borderRadius:'0.75rem',outline:'none',fontFamily:'Inter,sans-serif',fontSize:'0.875rem',color:'#191c1d'}}
                  onFocus={e=>(e.target.style.borderColor='#006e2f')}
                  onBlur={e=>(e.target.style.borderColor='#e7e8e9')}/>
              </div>
            </div>
            {/* Status filter */}
            <div className="w-44">
              <label className="block text-[10px] uppercase font-bold tracking-widest mb-2" style={{color:'#6d7b6c'}}>Filter by Status</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                style={{width:'100%',padding:'10px 12px',backgroundColor:'#ffffff',border:'1px solid #e7e8e9',borderRadius:'0.75rem',outline:'none',fontFamily:'Inter,sans-serif',fontSize:'0.875rem',color:'#191c1d'}}>
                <option>All</option><option>Pass</option><option>Fail</option>
              </select>
            </div>
            {/* Date filter */}
            <div className="w-44">
              <label className="block text-[10px] uppercase font-bold tracking-widest mb-2" style={{color:'#6d7b6c'}}>Filter by Date</label>
              <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
                style={{width:'100%',padding:'10px 12px',backgroundColor:'#ffffff',border:'1px solid #e7e8e9',borderRadius:'0.75rem',outline:'none',fontFamily:'Inter,sans-serif',fontSize:'0.875rem',color:'#191c1d'}}/>
            </div>
            {/* Apply */}
            <motion.button whileTap={{scale:0.96}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{background:'linear-gradient(135deg,#006e2f,#22c55e)',boxShadow:'0 4px 12px rgba(34,197,94,0.25)'}}>
              {Ic.filter} Apply Filters
            </motion.button>
          </motion.div>

          {/* Table */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.4}}
            className="rounded-2xl overflow-hidden" style={{backgroundColor:'#ffffff',boxShadow:'0 4px 20px rgba(25,28,29,0.07)'}}>

            {/* Table header */}
            <div className="grid px-6 py-4 text-[11px] font-bold uppercase tracking-widest"
              style={{gridTemplateColumns:'2fr 1fr 1.5fr 1fr 1.2fr 1fr',backgroundColor:'#e7e8e9',color:'#3d4a3d'}}>
              <span>Subject</span>
              <span>Score</span>
              <span>Percentage</span>
              <span className="text-center">Attempt</span>
              <span>Date</span>
              <span className="text-right">Actions</span>
            </div>

            {filtered.length===0?(
              <div className="flex flex-col items-center justify-center py-20" style={{color:'#6d7b6c'}}>
                {Ic.empty}
                <p className="mt-4 font-bold" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>No results found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
              </div>
            ):(
              filtered.map((row,i)=>(
                <motion.div key={row.id}
                  initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.05*i,duration:0.3}}
                  className="grid px-6 py-5 items-center transition-colors duration-150"
                  style={{gridTemplateColumns:'2fr 1fr 1.5fr 1fr 1.2fr 1fr',borderTop:i===0?'none':'1px solid #f3f4f5'}}
                  onMouseEnter={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#f8f9fa')}
                  onMouseLeave={e=>((e.currentTarget as HTMLElement).style.backgroundColor='transparent')}>

                  {/* Subject */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{backgroundColor:row.iconBg,color:row.iconColor}}>
                      {row.icon}
                    </div>
                    <span className="font-semibold text-sm" style={{color:'#191c1d'}}>{row.subject}</span>
                  </div>

                  {/* Score */}
                  <span className="font-bold text-sm" style={{color:'#191c1d'}}>{row.score}/{row.total}</span>

                  {/* Percentage bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{backgroundColor:'#e7e8e9'}}>
                      <motion.div initial={{width:0}} animate={{width:`${row.pct}%`}} transition={{delay:0.3+i*0.05,duration:0.5,ease:'easeOut'}}
                        className="h-full rounded-full"
                        style={{backgroundColor:row.status==='Pass'?'#006e2f':'#9e4036'}}/>
                    </div>
                    <span className="text-xs font-bold" style={{color:row.status==='Pass'?'#006e2f':'#9e4036'}}>{row.pct}%</span>
                  </div>

                  {/* Attempt */}
                  <div className="flex justify-center">
                    <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full"
                      style={{backgroundColor:'#e7e8e9',color:'#3d4a3d'}}>
                      {row.attempt}{row.attempt===1?'st':row.attempt===2?'nd':'rd'} Attempt
                    </span>
                  </div>

                  {/* Date */}
                  <span className="text-sm" style={{color:'#6d7b6c'}}>{row.date}</span>

                  {/* Status + print */}
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                      style={{backgroundColor:row.status==='Pass'?'#e8f5ed':'#ffdad6',color:row.status==='Pass'?'#006e2f':'#9e4036'}}>
                      {row.status}
                    </span>
                    <motion.button whileTap={{scale:0.93}}
                      onClick={()=>window.print()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{backgroundColor:'#ffffff',border:'1px solid #e7e8e9',color:'#3d4a3d'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='#006e2f';(e.currentTarget as HTMLElement).style.color='#fff';(e.currentTarget as HTMLElement).style.borderColor='#006e2f'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='#fff';(e.currentTarget as HTMLElement).style.color='#3d4a3d';(e.currentTarget as HTMLElement).style.borderColor='#e7e8e9'}}>
                      {Ic.print} Print
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs uppercase tracking-widest" style={{color:'#bccbb9'}}>
            ScholarSlate CBT • {new Date().getFullYear()} Academic Session
          </p>
        </main>
      </div>
    </div>
  )
}