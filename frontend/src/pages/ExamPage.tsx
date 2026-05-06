import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/apiClient'
import { formatClassLabel, getUserInitials } from '../lib/auth'

const Ic = {
  school:  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  timer:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 0 0 7.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
  flag:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>,
  prev:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  next:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>,
  clear:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  submit:  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  info:    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  grid:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>,
  calc:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zM7 17H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm4 12H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2z"/></svg>,
  notepad: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  close:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
  eraser:  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20h7.66l8.72-8.72c.79-.78.79-2.05 0-2.83l-4.85-4.86c-.39-.39-.9-.59-1.42-.59z"/></svg>,
}

// ── Sample questions pool (20 — will come from API per subject) ────
type RuntimeQuestion = {
  id: string
  text: string
  options: string[]
  answer: number | null
  flagged: boolean
}

// ── Scientific Calculator ─────────────────────────────────────────
function Calculator() {
  const [display,setDisplay]=useState('0'),[prev,setPrev]=useState(''),[op,setOp]=useState(''),[reset,setReset]=useState(false),[isDeg,setIsDeg]=useState(true),[error,setError]=useState(false)
  const toRad=(x:number)=>isDeg?x*Math.PI/180:x
  const fmt=(n:number)=>{ if(!isFinite(n))return 'Error'; const s=parseFloat(n.toPrecision(12)).toString(); return s.length>14?n.toExponential(6):s }
  const appendDigit=(d:string)=>{ setError(false); if(reset){setDisplay(d==='.'?'0.':d);setReset(false)}else{ if(d==='.'&&display.includes('.'))return; setDisplay(p=>p==='0'&&d!=='.'?d:p+d) } }
  const applyOp=(o:string)=>{ const cur=parseFloat(display); if(prev!==''&&op&&!reset){ const r=compute(parseFloat(prev),cur,op); if(!isFinite(r)){setDisplay('Error');setError(true);setPrev('');setOp('');setReset(true);return}; setDisplay(fmt(r)); setPrev(fmt(r)) }else setPrev(fmt(cur)); setOp(o); setReset(true) }
  const compute=(a:number,b:number,o:string):number=>{ switch(o){case'+':return a+b;case'−':return a-b;case'×':return a*b;case'÷':return b!==0?a/b:NaN;case'xʸ':return Math.pow(a,b);default:return b} }
  const equals=()=>{ if(prev===''||op===null)return; const r=compute(parseFloat(prev),parseFloat(display),op); if(!isFinite(r)){setDisplay('Error');setError(true)}else setDisplay(fmt(r)); setPrev('');setOp('');setReset(true) }
  const sci=(fn:string)=>{ const x=parseFloat(display); let r:number; switch(fn){ case'sin':r=Math.sin(toRad(x));break;case'cos':r=Math.cos(toRad(x));break;case'tan':r=Math.tan(toRad(x));break;case'sin⁻¹':r=isDeg?Math.asin(x)*180/Math.PI:Math.asin(x);break;case'cos⁻¹':r=isDeg?Math.acos(x)*180/Math.PI:Math.acos(x);break;case'tan⁻¹':r=isDeg?Math.atan(x)*180/Math.PI:Math.atan(x);break;case'log':r=Math.log10(x);break;case'ln':r=Math.log(x);break;case'√':r=Math.sqrt(x);break;case'x²':r=x*x;break;case'1/x':r=x!==0?1/x:NaN;break;case'n!':r=factorial(x);break;case'π':setDisplay(fmt(Math.PI));setReset(true);return;case'e':setDisplay(fmt(Math.E));setReset(true);return;case'+/-':setDisplay(fmt(-x));return;case'%':setDisplay(fmt(x/100));return;default:return} if(!isFinite(r)){setDisplay('Error');setError(true)}else setDisplay(fmt(r)); setReset(true) }
  const factorial=(n:number):number=>{ if(n<0||!Number.isInteger(n))return NaN; if(n>170)return Infinity; let r=1;for(let i=2;i<=n;i++)r*=i;return r }
  const clear=()=>{setDisplay('0');setPrev('');setOp('');setReset(false);setError(false)}
  const backspace=()=>{ if(reset||error){setDisplay('0');setReset(false);setError(false);return}; setDisplay(d=>d.length>1?d.slice(0,-1):'0') }
  const OP='#006e2f',OP_T='#fff',SCI='#1e3a2f',SCI_T='#4ae176',UTIL='#e7e8e9',UTIL_T='#191c1d',NUM='#f3f4f5',NUM_T='#191c1d',EQ='#22c55e',EQ_T='#fff'
  const sciRows=[[isDeg?'DEG':'RAD','sin','cos','tan','sin⁻¹'],[   'π','e','log','ln','n!'],[   '√','x²','xʸ','1/x','%']]
  const sciColors=[[UTIL,SCI,SCI,SCI,SCI],[SCI,SCI,SCI,SCI,SCI],[SCI,SCI,SCI,SCI,UTIL]]
  const sciTextColors=[[UTIL_T,SCI_T,SCI_T,SCI_T,SCI_T],[SCI_T,SCI_T,SCI_T,SCI_T,SCI_T],[SCI_T,SCI_T,SCI_T,SCI_T,UTIL_T]]
  const sciActions=[[()=>setIsDeg(d=>!d),()=>sci('sin'),()=>sci('cos'),()=>sci('tan'),()=>sci('sin⁻¹')],[()=>sci('π'),()=>sci('e'),()=>sci('log'),()=>sci('ln'),()=>sci('n!')],[()=>sci('√'),()=>sci('x²'),()=>applyOp('xʸ'),()=>sci('1/x'),()=>sci('%')]]
  const stdRows=[['C','⌫','+/-','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],[  '0','.','','=']]
  const stdColors=[ ['#ffdad6',UTIL,UTIL,OP],[NUM,NUM,NUM,OP],[NUM,NUM,NUM,OP],[NUM,NUM,NUM,OP],[NUM,NUM,NUM,EQ]]
  const stdTextColors=[['#9e4036',UTIL_T,UTIL_T,OP_T],[NUM_T,NUM_T,NUM_T,OP_T],[NUM_T,NUM_T,NUM_T,OP_T],[NUM_T,NUM_T,NUM_T,OP_T],[NUM_T,NUM_T,NUM_T,EQ_T]]
  const stdActions=[[clear,backspace,()=>sci('+/-'),()=>applyOp('÷')],[()=>appendDigit('7'),()=>appendDigit('8'),()=>appendDigit('9'),()=>applyOp('×')],[()=>appendDigit('4'),()=>appendDigit('5'),()=>appendDigit('6'),()=>applyOp('−')],[()=>appendDigit('1'),()=>appendDigit('2'),()=>appendDigit('3'),()=>applyOp('+')],[()=>appendDigit('0'),()=>appendDigit('.'),()=>null,equals]]
  return(
    <div className="flex flex-col gap-2 select-none">
      <div className="rounded-xl p-4" style={{backgroundColor:'#0d1117',minHeight:'90px'}}>
        <p className="text-xs text-right mb-1 truncate" style={{color:'#4ae176',fontFamily:'monospace',minHeight:'18px'}}>{prev&&op?`${prev} ${op}`:'\u00a0'}</p>
        <p className="text-right font-black tabular-nums truncate" style={{fontFamily:'Manrope,sans-serif',fontSize:display.length>12?'1.4rem':'2rem',color:error?'#ff6b6b':'#ffffff',lineHeight:1.1}}>{display}</p>
        <p className="text-right text-xs mt-1" style={{color:'#3d4a3d'}}>{isDeg?'DEG':'RAD'} mode</p>
      </div>
      {sciRows.map((row,ri)=>(
        <div key={ri} className="grid gap-1.5" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
          {row.map((btn,bi)=>(
            <motion.button key={bi} whileTap={{scale:0.88}} onClick={sciActions[ri][bi]}
              className="py-2.5 rounded-lg font-bold text-xs"
              style={{backgroundColor:sciColors[ri][bi],color:sciTextColors[ri][bi]}}>
              {btn}
            </motion.button>
          ))}
        </div>
      ))}
      <div style={{height:'1px',backgroundColor:'#e7e8e9',margin:'4px 0'}}/>
      {stdRows.map((row,ri)=>(
        <div key={ri} className="grid gap-1.5" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          {row.map((btn,bi)=>(
            btn===''?<div key={bi}/>:
            <motion.button key={bi} whileTap={{scale:0.88}} onClick={stdActions[ri][bi]||undefined}
              className="py-3.5 rounded-xl font-bold text-sm"
              style={{backgroundColor:stdColors[ri][bi],color:stdTextColors[ri][bi],fontFamily:'Manrope,sans-serif'}}>
              {btn}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  )
}

function Notepad(){
  const [note,setNote]=useState('')
  return(
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{color:'#6d7b6c'}}>{note.length} characters</p>
        <motion.button whileTap={{scale:0.95}} onClick={()=>setNote('')}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{backgroundColor:'#ffdad6',color:'#9e4036'}}>
          {Ic.eraser} Clear
        </motion.button>
      </div>
      <textarea value={note} onChange={e=>setNote(e.target.value)}
        placeholder="Rough work — not submitted."
        style={{width:'100%',minHeight:'300px',backgroundColor:'#f3f4f5',border:'1.5px solid #e7e8e9',borderRadius:'0.75rem',padding:'12px 14px',fontFamily:'Inter,sans-serif',fontSize:'0.9rem',color:'#191c1d',lineHeight:1.7,resize:'none',outline:'none'}}
        onFocus={e=>(e.target.style.borderColor='#006e2f')}
        onBlur={e=>(e.target.style.borderColor='#e7e8e9')}/>
      <p className="text-[10px] text-center" style={{color:'#bccbb9'}}>Notes are private and not submitted.</p>
    </div>
  )
}

function ResourcesPanel({open,onClose}:{open:boolean;onClose:()=>void}){
  const [tab,setTab]=useState<'calc'|'notepad'>('calc')
  return(
    <AnimatePresence>
      {open&&(
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-40" style={{backgroundColor:'rgba(25,28,29,0.35)',backdropFilter:'blur(4px)'}}
            onClick={onClose}/>
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
            transition={{type:'spring',damping:28,stiffness:280}}
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{width:'min(460px,100vw)',backgroundColor:'#fff',boxShadow:'-8px 0 40px rgba(25,28,29,0.12)'}}>
            <div className="flex items-center justify-between px-6 py-5" style={{borderBottom:'1px solid #edeeef'}}>
              <h3 className="font-extrabold text-lg" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Exam Resources</h3>
              <motion.button whileTap={{scale:0.93}} onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{backgroundColor:'#f3f4f5',color:'#3d4a3d'}}
                onMouseEnter={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#e7e8e9')}
                onMouseLeave={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#f3f4f5')}>
                {Ic.close}
              </motion.button>
            </div>
            <div className="flex px-6 pt-4 gap-2">
              {([{key:'calc',label:'Scientific Calc',icon:Ic.calc},{key:'notepad',label:'Notepad',icon:Ic.notepad}]as const).map(({key,label,icon})=>(
                <button key={key} onClick={()=>setTab(key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold"
                  style={{backgroundColor:tab===key?'#006e2f':'#f3f4f5',color:tab===key?'#fff':'#3d4a3d'}}>
                  {icon} {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
                  {tab==='calc'?<Calculator/>:<Notepad/>}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="px-6 py-4 flex items-center gap-2 text-xs" style={{borderTop:'1px solid #edeeef',color:'#6d7b6c'}}>
              <span style={{color:'#006e2f'}}>{Ic.info}</span>Timer continues while this panel is open.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SubmitModal({answered,flagged,total,onConfirm,onCancel}:{answered:number;flagged:number;total:number;onConfirm:()=>void;onCancel:()=>void}){
  const unanswered=total-answered
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{backgroundColor:'rgba(25,28,29,0.5)',backdropFilter:'blur(8px)'}}>
      <motion.div initial={{opacity:0,scale:0.92,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92}} transition={{duration:0.25}}
        className="w-full max-w-sm p-8" style={{backgroundColor:'#fff',borderRadius:'1.25rem',boxShadow:'0 24px 64px rgba(25,28,29,0.15)'}}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{backgroundColor:unanswered>0?'#ffdad6':'#e8f5ed',color:unanswered>0?'#9e4036':'#006e2f'}}>
          {unanswered>0?Ic.warning:Ic.submit}
        </div>
        <h3 className="text-xl font-bold text-center mb-2" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Submit Examination?</h3>
        <p className="text-sm text-center mb-6" style={{color:'#3d4a3d'}}>Review your attempt summary below.</p>
        <div className="rounded-xl p-4 mb-5 space-y-2" style={{backgroundColor:'#f3f4f5'}}>
          {[{label:'Answered',value:answered,color:'#006e2f'},{label:'Unanswered',value:unanswered,color:unanswered>0?'#9e4036':'#6d7b6c'},{label:'Flagged',value:flagged,color:'#9e4036'},{label:'Total',value:total,color:'#191c1d'}]
            .map(({label,value,color})=>(
              <div key={label} className="flex justify-between text-sm">
                <span style={{color:'#6d7b6c'}}>{label}</span>
                <span className="font-bold" style={{color}}>{value}</span>
              </div>
            ))}
        </div>
        {unanswered>0&&<div className="flex items-start gap-2 p-3 rounded-xl mb-5 text-xs font-medium" style={{backgroundColor:'rgba(158,64,54,0.08)',color:'#9e4036'}}>{Ic.warning}<span>{unanswered} unanswered. You can go back.</span></div>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-full font-bold text-sm"
            style={{backgroundColor:'#f3f4f5',color:'#191c1d'}}
            onMouseEnter={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#e7e8e9')}
            onMouseLeave={e=>((e.currentTarget as HTMLElement).style.backgroundColor='#f3f4f5')}>Go Back</button>
          <motion.button whileTap={{scale:0.96}} onClick={onConfirm}
            className="flex-1 py-3 rounded-full font-bold text-sm text-white"
            style={{background:'linear-gradient(135deg,#006e2f,#22c55e)',boxShadow:'0 4px 14px rgba(34,197,94,0.3)'}}>Submit Now</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ExamPage(){
  const navigate  = useNavigate()
  const location  = useLocation()
  const { session } = useAuth()

  // ── Read subject from router state ─────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectData    = (location.state as any)?.subject
  const locationSessionId = (location.state as { sessionId?: string } | null)?.sessionId
  const resolvedSessionId = locationSessionId || sessionStorage.getItem('active_exam_session_id') || ''
  const subjectName    = subjectData?.name      ?? 'Mathematics'
  const [sessionId] = useState(resolvedSessionId)
  const [serverSubjectName, setServerSubjectName] = useState(subjectName)
  const [canEdit, setCanEdit] = useState(true)
  const [questions, setQuestions] = useState<RuntimeQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionId) {
        setToast('⚠ Warning: Navigating away from the exam tab is prohibited. This incident has been recorded.')
        setTimeout(() => setToast(''), 6000)
        api.exams.reportViolation(sessionId, "tab_switch").catch(console.error)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [sessionId])

  useEffect(() => {
    setLoadError('')

    if (!sessionId) {
      setQuestions([])
      setLoadError('No active exam session found. Start from the instructions page.')
      setLoadingQuestions(false)
      return
    }

    let mounted = true
    setLoadingQuestions(true)

    api.exams.getSession(sessionId)
      .then((res) => {
        if (!mounted) return

        setServerSubjectName(res.subject.name)
        setCanEdit(res.session.canEdit)

        // If session is already done, clear any stale sessionStorage reference
        if (res.session.status === 'submitted' || res.session.status === 'expired') {
          sessionStorage.removeItem('active_exam_session_id')
          setTimeLeft(0)
        } else {
          setTimeLeft(res.session.remainingSeconds)
        }

        const mapped = res.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          answer: q.answer,
          flagged: q.flagged,
        }))

        setQuestions(mapped)

        const answerState: Record<string, number> = {}
        const flaggedState = new Set<string>()
        for (const q of mapped) {
          if (q.answer !== null) answerState[q.id] = q.answer
          if (q.flagged) flaggedState.add(q.id)
        }
        setAnswers(answerState)
        setFlagged(flaggedState)
      })
      .catch((err) => {
        if (!mounted) return
        setQuestions([])
        setLoadError(err instanceof Error ? err.message : 'Unable to load exam session.')
      })
      .finally(() => {
        if (mounted) setLoadingQuestions(false)
      })

    return () => {
      mounted = false
    }
  }, [sessionId])

  const QUESTIONS      = questions
  const TOTAL          = QUESTIONS.length

  const [current,setCurrent]=useState(0)
  const [answers,setAnswers]=useState<Record<string,number>>({})
  const [flagged,setFlagged]=useState<Set<string>>(new Set())
  const [timeLeft,setTimeLeft]=useState(0)
  const [showSubmit,setShowSubmit]=useState(false)
  const [showResources,setShowResources]=useState(false)
  const [fontSize,setFontSize]=useState(18)
  const studentName = session?.role === 'student' ? session.fullName : 'Student'
  const studentClass = session?.role === 'student' ? formatClassLabel(session.className ?? '') : ''
  const studentInitials = getUserInitials(studentName)

  const q=QUESTIONS[current]
  const answered=Object.keys(answers).length
  const flaggedCount=flagged.size
  const isWarning=timeLeft<300

  const submitExam = useCallback(async () => {
    if (!sessionId || submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.exams.submit(sessionId)
      sessionStorage.removeItem('active_exam_session_id')
      navigate(`/result/${sessionId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit exam now.')
    } finally {
      setSubmitting(false)
      setShowSubmit(false)
    }
  }, [navigate, serverSubjectName, sessionId, submitting])

  useEffect(()=>{
    // Don't start the timer if still loading, no questions, or session is read-only (already submitted)
    if (loadingQuestions || TOTAL === 0 || !canEdit) return
    if(timeLeft<=0){void submitExam();return}
    const t=setInterval(()=>setTimeLeft(s=>s-1),1000)
    return()=>clearInterval(t)
  },[timeLeft,submitExam,loadingQuestions,TOTAL,canEdit])

  const fmt=useCallback((secs:number)=>{
    const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  },[])

  const selectAnswer = (i: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: i }))
    if (!sessionId || !canEdit) return
    void api.exams.saveAnswer(sessionId, { questionId: q.id, answer: i }).catch(() => {
      setSubmitError('Failed to autosave answer. Check connection and continue.')
    })
  }

  const clearAnswer = () => {
    setAnswers((prev) => {
      const n = { ...prev }
      delete n[q.id]
      return n
    })
    if (!sessionId || !canEdit) return
    void api.exams.saveAnswer(sessionId, { questionId: q.id, answer: null }).catch(() => {
      setSubmitError('Failed to clear answer on server.')
    })
  }

  const toggleFlag = () => {
    const nextFlagged = !flagged.has(q.id)
    setFlagged((prev) => {
      const n = new Set(prev)
      n.has(q.id) ? n.delete(q.id) : n.add(q.id)
      return n
    })
    if (!sessionId || !canEdit) return
    void api.exams.setFlag(sessionId, { questionId: q.id, flagged: nextFlagged }).catch(() => {
      setSubmitError('Failed to update flag state on server.')
    })
  }

  const nodeStyle=(qid:string)=>{
    if(qid===q.id)              return {bg:'#ffffff',color:'#006e2f',border:'2px solid #006e2f'}
    if(flagged.has(qid))        return {bg:'#ff8b7c',color:'#76231b',border:'none'}
    if(answers[qid]!==undefined)return {bg:'#006e2f',color:'#ffffff',border:'none'}
    return {bg:'#e1e3e4',color:'#3d4a3d',border:'none'}
  }

  const letters=['A','B','C','D']

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <h2 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Loading exam questions...</h2>
          <p className="text-sm mt-2" style={{ color: '#6d7b6c' }}>Preparing {serverSubjectName} question set.</p>
        </div>
      </div>
    )
  }

  if (TOTAL === 0 || !q) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>No questions available</h2>
          <p className="text-sm mt-2" style={{ color: '#6d7b6c' }}>{loadError || 'This subject has no published questions yet. Contact your administrator.'}</p>
          <button onClick={() => navigate('/select-subject')} className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold" style={{ backgroundColor: '#006e2f', color: '#fff' }}>
            Back to subjects
          </button>
        </div>
      </div>
    )
  }

  return(
    <>
      <AnimatePresence>
        {showSubmit&&<SubmitModal answered={answered} flagged={flaggedCount} total={TOTAL}
          onConfirm={submitExam} onCancel={()=>setShowSubmit(false)}/>}
      </AnimatePresence>
      <ResourcesPanel open={showResources} onClose={()=>setShowResources(false)}/>

      <div className="min-h-screen" style={{backgroundColor:'#f8f9fa',fontFamily:'Inter,sans-serif'}}>
        {submitError && (
          <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#ffdad6', color: '#9e4036', boxShadow: '0 8px 24px rgba(25,28,29,0.12)', maxWidth: '420px' }}>
            {submitError}
          </div>
        )}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#ffdad6', color: '#9e4036', boxShadow: '0 8px 24px rgba(25,28,29,0.12)', maxWidth: '90vw', border: '1px solid rgba(158,64,54,0.2)' }}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navbar — single timer */}
        <nav className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 h-16"
          style={{backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',boxShadow:'0 1px 0 rgba(188,203,185,0.3)'}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white flex-shrink-0" style={{backgroundColor:'#006e2f',borderRadius:'0.4rem'}}>{Ic.school}</div>
            <span className="font-bold hidden sm:block" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>School CBT System</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full hidden md:inline" style={{backgroundColor:'#e8f5ed',color:'#006e2f'}}>Exam Mode</span>
            <motion.button whileHover={{y:-1}} whileTap={{scale:0.96}} onClick={()=>setShowResources(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ml-1 transition-colors hidden md:flex"
              style={{color:'#3d4a3d'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='#f3f4f5';(e.currentTarget as HTMLElement).style.color='#006e2f'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';(e.currentTarget as HTMLElement).style.color='#3d4a3d'}}>
              {Ic.calc} Resources
            </motion.button>
          </div>

          {/* Timer */}
          <motion.div animate={isWarning?{scale:[1,1.04,1]}:{}} transition={{repeat:Infinity,duration:1}}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{backgroundColor:isWarning?'rgba(158,64,54,0.09)':'#e7e8e9',border:isWarning?'1px solid rgba(158,64,54,0.25)':'none'}}>
            <span style={{color:isWarning?'#9e4036':'#3d4a3d'}}>{Ic.timer}</span>
            <div>
              <p className="text-[9px] uppercase font-bold tracking-wider hidden sm:block" style={{color:isWarning?'#9e4036':'#6d7b6c'}}>Time Left</p>
              <p className="text-xl font-black tabular-nums leading-none" style={{fontFamily:'Manrope,sans-serif',color:isWarning?'#9e4036':'#191c1d'}}>{fmt(timeLeft)}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={()=>setShowResources(true)} className="flex md:hidden items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full" style={{backgroundColor:'#f3f4f5',color:'#3d4a3d'}}>{Ic.calc} Tools</button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none" style={{color:'#191c1d'}}>{studentName}</p>
              <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{color:'#6d7b6c'}}>{studentClass}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background:'linear-gradient(135deg,#006e2f,#22c55e)'}}>{studentInitials}</div>
          </div>
        </nav>

        <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 grid grid-cols-12 gap-6">

          {/* Header — shows actual subject name */}
          <header className="col-span-12 mb-2">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'#006e2f'}}>
                {serverSubjectName} — School CBT
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>
                {serverSubjectName} Examination
              </h1>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{backgroundColor:'#e7e8e9'}}>
              <motion.div animate={{width:`${((current+1)/TOTAL)*100}%`}} transition={{duration:0.4}}
                className="h-full rounded-full" style={{background:'linear-gradient(90deg,#006e2f,#22c55e)'}}/>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs font-medium" style={{color:'#6d7b6c'}}>Question {current+1} of {TOTAL}</span>
              <span className="text-xs font-medium" style={{color:'#6d7b6c'}}>{Math.round(((current+1)/TOTAL)*100)}% Completed</span>
            </div>
          </header>

          {/* Question card */}
          <section className="col-span-12 lg:col-span-8 space-y-3">
            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}}
                className="p-7 md:p-10 rounded-2xl flex flex-col"
                style={{backgroundColor:'#ffffff',boxShadow:'0 4px 24px rgba(25,28,29,0.07)',minHeight:'460px'}}>
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
                    style={{backgroundColor:'#e8f5ed',color:'#006e2f',fontFamily:'Manrope,sans-serif'}}>
                    {String(current+1).padStart(2,'0')}
                  </div>
                  <div className="flex-1 h-px" style={{backgroundColor:'#edeeef'}}/>
                  <motion.button whileTap={{scale:0.93}} onClick={toggleFlag}
                    disabled={!canEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{backgroundColor:flagged.has(q.id)?'rgba(158,64,54,0.1)':'#f3f4f5',color:flagged.has(q.id)?'#9e4036':'#6d7b6c',border:flagged.has(q.id)?'1px solid rgba(158,64,54,0.2)':'1px solid transparent',opacity:canEdit?1:0.55,cursor:canEdit?'pointer':'not-allowed'}}>
                    {Ic.flag} {flagged.has(q.id)?'Flagged':'Flag for Review'}
                  </motion.button>
                </div>
                <p className="leading-relaxed font-medium mb-7" style={{fontSize:`${fontSize}px`,color:'#191c1d',lineHeight:1.7}}>{q.text}</p>
                <div className="flex flex-col gap-3 flex-1">
                  {q.options.map((opt,i)=>{
                    const sel=answers[q.id]===i
                    return(
                      <motion.div key={i} whileHover={{x:2}} whileTap={{scale:0.99}} onClick={()=>selectAnswer(i)}
                        className="flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-150"
                        style={{backgroundColor:sel?'#e8f5ed':'#f3f4f5',border:`1.5px solid ${sel?'#006e2f':'transparent'}`,opacity:canEdit?1:0.7,pointerEvents:canEdit?'auto':'none'}}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                          style={{backgroundColor:sel?'#006e2f':'#fff',color:sel?'#fff':'#6d7b6c',boxShadow:sel?'none':'0 1px 4px rgba(25,28,29,0.1)'}}>
                          {letters[i]}
                        </div>
                        <span className="text-base flex-1" style={{color:'#191c1d',fontWeight:sel?600:400}}>{opt}</span>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{borderColor:sel?'#006e2f':'#bccbb9',backgroundColor:sel?'#006e2f':'transparent'}}>
                          {sel&&<div className="w-2 h-2 rounded-full bg-white"/>}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-8 pt-6" style={{borderTop:'1px solid #edeeef'}}>
                  <motion.button whileTap={{scale:0.96}} onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                    style={{backgroundColor:'#f3f4f5',color:current===0?'#bccbb9':'#191c1d',cursor:current===0?'not-allowed':'pointer'}}>
                    {Ic.prev} Previous
                  </motion.button>
                  <div className="flex gap-3">
                    <motion.button whileTap={{scale:0.96}} onClick={clearAnswer}
                      disabled={!canEdit}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm"
                      style={{backgroundColor:'#f3f4f5',color:'#6d7b6c',border:'1px solid #e7e8e9',opacity:canEdit?1:0.55,cursor:canEdit?'pointer':'not-allowed'}}>
                      {Ic.clear} Clear
                    </motion.button>
                    {current===TOTAL-1?(
                      <motion.button whileHover={{y:-1}} whileTap={{scale:0.96}} onClick={()=>setShowSubmit(true)}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                        style={{background:'linear-gradient(135deg,#006e2f,#22c55e)',boxShadow:'0 4px 14px rgba(34,197,94,0.3)',opacity:submitting?0.75:1}}>
                        {Ic.submit} {submitting ? 'Submitting...' : 'Submit Exam'}
                      </motion.button>
                    ):(
                      <motion.button whileHover={{y:-1}} whileTap={{scale:0.96}} onClick={()=>setCurrent(c=>Math.min(TOTAL-1,c+1))}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                        style={{background:'linear-gradient(135deg,#006e2f,#22c55e)',boxShadow:'0 4px 14px rgba(34,197,94,0.25)'}}>
                        Next Question {Ic.next}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{color:'#6d7b6c'}}>Text size:</span>
              {([{v:16,l:'S'},{v:18,l:'M'},{v:20,l:'L'},{v:22,l:'XL'}]).map(({v,l})=>(
                <button key={v} onClick={()=>setFontSize(v)}
                  className="w-7 h-7 rounded-full text-xs font-bold"
                  style={{backgroundColor:fontSize===v?'#006e2f':'#e7e8e9',color:fontSize===v?'#fff':'#3d4a3d'}}>
                  {l}
                </button>
              ))}
            </div>
          </section>

          {/* Right panel */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl sticky top-24"
              style={{background:'rgba(255,255,255,0.78)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',boxShadow:'0 4px 24px rgba(25,28,29,0.07)'}}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold uppercase tracking-tight text-sm" style={{fontFamily:'Manrope,sans-serif',color:'#191c1d'}}>Question Navigator</h3>
                {Ic.grid}
              </div>
              <div className="flex flex-wrap gap-3 mb-5">
                {[{color:'#006e2f',label:'Answered',border:'none'},{color:'#e1e3e4',label:'Not Visited',border:'none'},{color:'#ff8b7c',label:'Flagged',border:'none'},{color:'#fff',label:'Current',border:'2px solid #006e2f'}]
                  .map(({color,label,border})=>(
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:color,border}}/>
                      <span className="text-[10px] font-bold uppercase" style={{color:'#6d7b6c'}}>{label}</span>
                    </div>
                  ))}
              </div>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {QUESTIONS.map((qItem,idx)=>{
                  const s=nodeStyle(qItem.id)
                  return(
                    <motion.button key={qItem.id} whileTap={{scale:0.88}} onClick={()=>setCurrent(idx)}
                      className="aspect-square rounded-full flex items-center justify-center text-xs font-black"
                      style={{backgroundColor:s.bg,color:s.color,border:s.border,fontFamily:'Manrope,sans-serif'}}>
                      {idx+1}
                    </motion.button>
                  )
                })}
              </div>
              <div className="p-3.5 rounded-xl mb-4 text-xs" style={{backgroundColor:'rgba(158,64,54,0.07)',border:'1px solid rgba(158,64,54,0.1)'}}>
                <div className="flex items-center gap-1.5 font-bold uppercase mb-1.5" style={{color:'#9e4036'}}>{Ic.info} Final Check</div>
                <p style={{color:'#3d4a3d',lineHeight:1.6}}><span className="font-bold">{flaggedCount} flagged</span> · <span className="font-bold">{TOTAL-answered} unanswered</span>. Answer all before submitting.</p>
              </div>
              <motion.button whileTap={{scale:0.97}} onClick={()=>setShowSubmit(true)}
                disabled={submitting}
                className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
                style={{backgroundColor:'#e7e8e9',color:'#191c1d',fontFamily:'Manrope,sans-serif',opacity:submitting?0.7:1,cursor:submitting?'not-allowed':'pointer'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#006e2f,#22c55e)';(e.currentTarget as HTMLElement).style.color='#fff'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#e7e8e9';(e.currentTarget as HTMLElement).style.color='#191c1d'}}>
                {submitting ? 'Submitting...' : 'Submit Examination'}
              </motion.button>
            </div>
            <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}} onClick={()=>setShowResources(true)}
              className="w-full p-4 rounded-2xl flex items-center gap-3 text-left"
              style={{backgroundColor:'#fff',boxShadow:'0 2px 12px rgba(25,28,29,0.06)',border:'1px solid #edeeef'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#e8f5ed',color:'#006e2f'}}>{Ic.calc}</div>
              <div>
                <p className="font-bold text-sm" style={{color:'#191c1d'}}>Scientific Calculator</p>
                <p className="text-xs" style={{color:'#6d7b6c'}}>sin · cos · log · √ · Notepad</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{backgroundColor:'#e8f5ed',color:'#006e2f'}}>Open</span>
            </motion.button>
          </aside>
        </main>
      </div>
    </>
  )
}