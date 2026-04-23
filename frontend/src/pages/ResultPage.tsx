import { useEffect, useState } from 'react'
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
  check:     <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  trophy:    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 009.86 15H7v2h2v2H7v2h10v-2h-2v-2h2v-2h-2.86a5.01 5.01 0 002.47-2.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>,
  print:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>,
  history:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  back:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
}

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

function CountUp({target,duration=1200}:{target:number;duration?:number}){
  const [count,setCount]=useState(0)
  useEffect(()=>{
    let start=0; const step=target/(duration/16)
    const t=setInterval(()=>{start+=step;if(start>=target){setCount(target);clearInterval(t)}else setCount(Math.floor(start))},16)
    return()=>clearInterval(t)
  },[target,duration])
  return <>{count}</>
}

export default function ResultPage(){
  const navigate=useNavigate()
  const location=useLocation()
  const { session } = useAuth()
  const [sidebarOpen,setSidebarOpen]=useState(false)

  // Real data from ExamPage via router state
  const state=location.state as {correct:number;incorrect:number;unanswered:number;score:number;total:number;timeUsed:string;subject:string}|null
  const correct    = state?.correct    ?? 0
  const incorrect  = state?.incorrect  ?? 0
  const unanswered = state?.unanswered ?? 0
  const score      = state?.score      ?? 0
  const timeUsed   = state?.timeUsed   ?? '—'
  const subject    = state?.subject    ?? 'Mathematics'
  const passed     = score >= 50
  const peerRank   = Math.max(5, 100 - score)
  const studentName = session?.role === 'student' ? session.fullName : 'Student'
  const studentClass = session?.role === 'student' ? formatClassLabel(session.className) : ''
  const studentInitials = getUserInitials(studentName)

  const handlePrint=()=>{
    const style=document.createElement('style')
    style.innerHTML=`@media print{.no-print{display:none!important;} body{margin:0;} .print-area{margin:0 auto;max-width:700px;}}`
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }

  return(
    <div className="min-h-screen" style={{backgroundColor:'#f8f9fa'}}>
      <style>{`
        @media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}
        @media print{.no-print{display:none!important;}.sidebar-desktop{display:none!important;}.main-content{margin-left:0!important;}}
      `}</style>

      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16 no-print"
          style={{backgroundColor:'rgba(255,255,255,0.85)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',boxShadow:'0 1px 0 rgba(188,203,185,0.3)'}}>
          <div className="flex items-center gap-4">
            <button onClick={()=>setSidebarOpen(o=>!o)} className="p-2 rounded-lg transition-colors md:hidden" style={{color:'#3d4a3d'}}>{Ic.menu}</button>
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

        <main className="flex-1 p-5 md:p-8 max-w-4xl mx-auto w-full print-area">
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="mb-6 no-print">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Examination Result</h1>
            <p className="text-xs uppercase tracking-widest font-medium" style={{color:'#6d7b6c'}}>Session: 2025/2026 First Term • {subject}</p>
          </motion.div>

          {/* Main card */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
            className="p-8 md:p-12 rounded-2xl relative overflow-hidden mb-6"
            style={{backgroundColor:'#ffffff',boxShadow:'0 8px 40px rgba(25,28,29,0.07)'}}>
            <div className="absolute pointer-events-none" style={{top:'-4rem',right:'-4rem',width:'16rem',height:'16rem',backgroundColor:'#22c55e',opacity:0.04,borderRadius:'50%',filter:'blur(60px)'}}/>
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:'spring',stiffness:200}}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{backgroundColor:passed?'rgba(34,197,94,0.12)':'rgba(186,26,26,0.1)',color:passed?'#006e2f':'#ba1a1a'}}>
                {Ic.check}
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>
                {score>=80?'Excellent Performance!':score>=60?'Good Performance!':score>=50?'You Passed!':'Needs Improvement'}
              </h2>
              <p className="text-sm mb-8 max-w-md" style={{color:'#3d4a3d',lineHeight:1.7}}>
                {passed?'Your submission has been graded successfully. Keep it up!':'Keep practising and try again next time.'}
              </p>

              {/* Score */}
              <div className="mb-8">
                <div className="font-black tracking-tighter mb-3" style={{fontFamily:'Manrope,sans-serif',fontSize:'5rem',color:'#006e2f',lineHeight:1}}>
                  <CountUp target={score}/><span style={{fontSize:'2rem',color:'#6d7b6c',fontWeight:300}}>/100</span>
                </div>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{backgroundColor:passed?'#e8f5ed':'#ffdad6',color:passed?'#006e2f':'#9e4036'}}>
                  Status: {passed?'PASS':'FAIL'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-lg mb-10">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{color:'#6d7b6c'}}>Percentage Score</span>
                  <span className="text-xs font-bold" style={{color:'#006e2f'}}>{score}%</span>
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden" style={{backgroundColor:'#e7e8e9'}}>
                  <motion.div initial={{width:0}} animate={{width:`${score}%`}} transition={{delay:0.4,duration:0.8,ease:'easeOut'}}
                    className="h-full rounded-full" style={{background:'linear-gradient(90deg,#006e2f,#22c55e)'}}/>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[{label:'Correct',value:correct,color:'#006e2f'},{label:'Incorrect',value:incorrect,color:'#9e4036'},{label:'Unanswered',value:unanswered,color:'#6d7b6c'}]
                    .map(({label,value,color})=>(
                      <div key={label} className="p-4 rounded-xl text-center" style={{backgroundColor:'#f3f4f5'}}>
                        <p className="text-xs font-bold uppercase mb-1" style={{color:'#6d7b6c'}}>{label}</p>
                        <p className="text-xl font-bold" style={{color,fontFamily:'Manrope,sans-serif'}}>{value}</p>
                      </div>
                    ))}
                </div>
                <div className="mt-3 p-3 rounded-xl text-center" style={{backgroundColor:'#f3f4f5'}}>
                  <p className="text-xs font-bold uppercase mb-1" style={{color:'#6d7b6c'}}>Time Used</p>
                  <p className="text-lg font-bold" style={{color:'#191c1d',fontFamily:'Manrope,sans-serif'}}>{timeUsed}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center no-print">
                <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}} onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-sm"
                  style={{background:'linear-gradient(135deg,#006e2f,#22c55e)',boxShadow:'0 4px 16px rgba(34,197,94,0.3)'}}>
                  {Ic.print} Print / Save PDF
                </motion.button>
                <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}} onClick={()=>navigate('/results-history')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm"
                  style={{backgroundColor:'#f3f4f5',color:'#191c1d',border:'1px solid #e7e8e9'}}>
                  {Ic.history} View All Results
                </motion.button>
                <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}} onClick={()=>navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm"
                  style={{backgroundColor:'#f3f4f5',color:'#191c1d',border:'1px solid #e7e8e9'}}>
                  {Ic.back} Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Peer ranking */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.5}}
            className="p-7 rounded-2xl flex flex-col items-center justify-center text-center mb-6"
            style={{backgroundColor:'rgba(34,197,94,0.06)',border:'1px solid rgba(0,110,47,0.1)'}}>
            <div className="mb-4 p-3 rounded-full" style={{backgroundColor:'#fff',color:'#006e2f',boxShadow:'0 4px 16px rgba(34,197,94,0.15)'}}>{Ic.trophy}</div>
            <h4 className="font-bold text-lg mb-1" style={{fontFamily:'Manrope,sans-serif',color:'#006e2f'}}>Peer Ranking</h4>
            <p className="text-sm mb-3" style={{color:'#3d4a3d'}}>You scored higher than {100-peerRank}% of your peers.</p>
            <div className="text-4xl font-black" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Top {peerRank}%</div>
          </motion.div>

          <p className="text-center text-xs uppercase tracking-widest" style={{color:'#bccbb9'}}>
            Generated by ScholarSlate CBT • Ref: CBT-{new Date().getFullYear()}-{String(Math.floor(Math.random()*90000+10000))}
          </p>
        </main>
      </div>
    </div>
  )
}