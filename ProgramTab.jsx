import React, { useEffect, useState } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const loadPrograms = () => JSON.parse(localStorage.getItem('programs') || '[]');
const savePrograms = (programs) => localStorage.setItem('programs', JSON.stringify(programs));

function CalendarPreview({ startDate, frequency, onSelect }) {
  const start = startDate ? new Date(startDate) : new Date();
  const weeks = [];
  for (let w=0; w<4; w++) {
    const days = [];
    for (let d=0; d<7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w*7 + d);
      days.push(date);
    }
    weeks.push(days);
  }
  return (
    <table className="calendar-preview">
      <thead>
        <tr>{DAYS.map(d=><th key={d}>{d}</th>)}</tr>
      </thead>
      <tbody>
        {weeks.map((week,i)=>(
          <tr key={i}>
            {week.map(date=>{
              const day= DAYS[date.getDay()===0?6:date.getDay()-1];
              const selected = frequency.includes(day);
              return (
                <td
                  key={date.toISOString()}
                  className={selected ? 'scheduled' : ''}
                  onClick={()=>onSelect(day)}
                >
                  {date.getDate()}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ProgramTab() {
  const [programs, setPrograms] = useState(loadPrograms());
  const [showDrawer, setShowDrawer] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [program, setProgram] = useState({
    name: '',
    startDate: '',
    frequency: [],
    progressionType: 'linear',
    progressionSettings: {
      linear:{ increment:2.5, unit:'kg', interval:'workout' },
      undulating:{ light:60, medium:75, heavy:90 },
      block:{ blockLength:3, loadPercent:85, deloadPercent:60 }
    },
    days: []
  });

  const handleFreqToggle = day => {
    setProgram(prev => {
      let freq = prev.frequency.includes(day)
        ? prev.frequency.filter(d=>d!==day)
        : [...prev.frequency, day];
      // update days list
      let days = prev.days.filter(d=>freq.includes(d.original));
      freq.forEach(d=>{
        if(!days.find(x=>x.original===d)) {
          days.push({name:d, original:d, order:days.length+1});
        }
      });
      return {...prev, frequency:freq, days};
    });
  };

  const renameDay = (idx, name) => {
    setProgram(prev=>{
      const days=[...prev.days];
      days[idx]={...days[idx], name};
      return {...prev, days};
    });
  };

  const handleDrop = idx => {
    setProgram(prev=>{
      const days=[...prev.days];
      const [itm]=days.splice(dragIndex,1);
      days.splice(idx,0,itm);
      return {...prev, days:days.map((d,i)=>({...d, order:i+1}))};
    });
  };

  const save = async () => {
    const payload={
      name:program.name,
      startDate:program.startDate,
      frequency:program.frequency,
      progressionType:program.progressionType,
      progressionSettings:program.progressionSettings[program.progressionType],
      days:program.days.map((d,i)=>({name:d.name, order:i+1}))
    };
    const res = await fetch('/createProgram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const json = await res.json();
    if(json.id){
      const newPrograms=[...programs,{...payload,id:json.id}];
      setPrograms(newPrograms);
      savePrograms(newPrograms);
      setShowDrawer(false);
    }
  };

  const doShare = async (username) => {
    if(!shareId) return;
    await fetch('/shareProgram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({programId:shareId,recipientUsername:username})});
    setShowShare(false);
  };

  return (
    <div className="program-tab-react">
      <button onClick={()=>setShowDrawer(true)}>New Program</button>
      <div className="program-list">
        {programs.map(p=>(
          <div key={p.id} className="program-row">
            {p.name}
            <button onClick={()=>{setShareId(p.id);setShowShare(true);}}>Share Program</button>
          </div>
        ))}
      </div>

      {showDrawer && (
        <div className="drawer">
          <h3>Create Program</h3>
          <label>
            Name <input value={program.name} onChange={e=>setProgram({...program,name:e.target.value})}/>
          </label>
          <label>
            Start Date <input type="date" value={program.startDate} onChange={e=>setProgram({...program,startDate:e.target.value})}/>
          </label>
          <div>
            Frequency:
            {DAYS.map(d=>(
              <label key={d} style={{marginRight:'6px'}}>
                <input type="checkbox" checked={program.frequency.includes(d)} onChange={()=>handleFreqToggle(d)}/> {d}
              </label>
            ))}
          </div>
          <div>
            Progression Type:
            {['linear','undulating','block'].map(t=>(
              <label key={t} style={{marginRight:'10px'}}>
                <input type="radio" name="progType" value={t} checked={program.progressionType===t} onChange={()=>setProgram({...program,progressionType:t})}/> {t}
              </label>
            ))}
          </div>
          {program.progressionType==='linear' && (
            <div>
              <label title="Amount to add each interval">Increment <input type="number" value={program.progressionSettings.linear.increment} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,linear:{...program.progressionSettings.linear,increment:Number(e.target.value)}}})}/></label>
              <select value={program.progressionSettings.linear.unit} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,linear:{...program.progressionSettings.linear,unit:e.target.value}}})}><option value="kg">kg</option><option value="lbs">lbs</option></select>
              <select value={program.progressionSettings.linear.interval} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,linear:{...program.progressionSettings.linear,interval:e.target.value}}})}><option value="workout">per workout</option><option value="week">per week</option></select>
            </div>
          )}
          {program.progressionType==='undulating' && (
            <div>
              <table>
                <thead><tr><th>Day</th><th>% Intensity</th></tr></thead>
                <tbody>
                  {['Light','Medium','Heavy'].map(k=>(
                    <tr key={k}><td>{k}</td><td><input type="number" value={program.progressionSettings.undulating[k.toLowerCase()]} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,undulating:{...program.progressionSettings.undulating,[k.toLowerCase()]:Number(e.target.value)}}})}/></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {program.progressionType==='block' && (
            <div>
              <label>Block Length (weeks) <input type="number" value={program.progressionSettings.block.blockLength} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,block:{...program.progressionSettings.block,blockLength:Number(e.target.value)}}})}/></label>
              <label>Load % <input type="number" value={program.progressionSettings.block.loadPercent} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,block:{...program.progressionSettings.block,loadPercent:Number(e.target.value)}}})}/></label>
              <label>Deload % <input type="number" value={program.progressionSettings.block.deloadPercent} onChange={e=>setProgram({...program,progressionSettings:{...program.progressionSettings,block:{...program.progressionSettings.block,deloadPercent:Number(e.target.value)}}})}/></label>
            </div>
          )}

          <button onClick={()=>setShowAdvanced(!showAdvanced)}>Advanced Progression Rules</button>
          {showAdvanced && (
            <div className="advanced">Type specific details above.</div>
          )}

          <div className="day-order">
            {program.days.map((d,idx)=>(
              <div
                key={idx}
                className="day-card"
                draggable
                onDragStart={()=>setDragIndex(idx)}
                onDragOver={e=>e.preventDefault()}
                onDrop={()=>handleDrop(idx)}
              >
                <input value={d.name} onChange={e=>renameDay(idx,e.target.value)} />
              </div>
            ))}
          </div>
          <CalendarPreview startDate={program.startDate} frequency={program.frequency} onSelect={(day)=>{
            const idx=program.days.findIndex(d=>d.original===day);
            if(idx>=0){
              document.getElementsByClassName('day-card')[idx]?.scrollIntoView({behavior:'smooth'});
            }
          }}/>
          <div style={{marginTop:'10px'}}>
            <button onClick={save}>Save Program</button>
            <button onClick={()=>{setShareId(null);setShowShare(true);}}>Share Program</button>
            <button onClick={()=>setShowDrawer(false)}>Close</button>
          </div>
        </div>
      )}

      {showShare && (
        <div className="share-modal">
          <input id="shareUser" placeholder="Username" />
          <button onClick={()=>{const user=document.getElementById('shareUser').value;doShare(user);}}>Send</button>
          <button onClick={()=>setShowShare(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('programTabReactRoot'));
root.render(<ProgramTab />);
