// Thornton Latest deliberately keeps the original personalised storage keys.
// This lets Joe upgrade the live app without losing profiles, goals or journals.
const LEGACY_STORAGE_KEY = 'life-os-v1';
const PROFILE_STORAGE_KEY = 'life-os-profiles-v1';
const profileDataKey = id => `life-os-data:${id}`;
const todayKey = () => new Date().toISOString().slice(0, 10);
const defaults = {
  date: todayKey(), greatDay: '', priorities: ['', '', ''], priorityDone: [false, false, false],
  morning: { water:false, gratitude:false, breathe:false, walk:false, stretch:false, breakfast:false, principles:false, plan:false },
  daytime: { focusDone:false, resetDone:false, finishDone:false, progress:'', nextAction:'' },
  energy:7, mood:7, dailyWin:'', tinyStep:'', alcoholDates:[], cigarettesToday:0, cigaretteTarget:10,
  triggers:[], goals:[], journal:[], customHabits:[], history:[]
};
const morningItems = [
  ['water','◒','Drink water'],['gratitude','♡','Gratitude'],['breathe','≈','Breathe / meditate'],['walk','↗','Morning walk'],
  ['stretch','⌁','Stretch / exercise'],['breakfast','◉','Healthy breakfast'],['principles','✦','Read your principles'],['plan','✓','Review top 3']
];
const defaultPrinciples = ['We tell the truth.','We protect each other.','We work smart.','We are kind.','We keep our promises.','We take care of our health.','We are wise with our money.','We help other people.','We face challenges with courage.','We never stop learning.','We enjoy life together.'];
const personalPrinciples = ['I tell the truth.','I work with purpose.','I am kind.','I keep my promises.','I take care of my health.','I use my time and money wisely.','I help other people.','I face challenges with courage.','I never stop learning.','I make time to enjoy life.'];
const defaultRoutineConfig = {
  morning: morningItems.map(([id,,label])=>({id,label})),
  daytime: [
    {id:'focus',label:'Focused progress',description:'Give one important outcome your full attention.'},
    {id:'reset',label:'Pause and reset',description:'Step back, breathe and choose what matters next.'},
    {id:'finish',label:'Finish intentionally',description:'Close the workday or main activity when planned.'}
  ],
  evening: {win:"Today's win",tinyStep:"Tomorrow's tiny step"}
};
const philosophyBase = [
  ['Kaizen','Improve','Make the next step so small that starting feels easy. One percent compounds.'],
  ['Hara Hachi Bu','Enough','Notice when enough is enough—in food, screens, work and consumption. Leave energy for tomorrow.'],
  ['Wabi-Sabi','Accept','An imperfect day is still a day you can continue. Progress does not require perfection.'],
  ['Gambaru','Persist','Keep going with patience and dignity, especially when motivation is low.']
];
const templates = {
  balanced:[],
  wellbeing:[{area:'Wellbeing',text:'Create a daily rhythm that supports calm and energy',done:false}],
  relationships:[{area:'Relationships',text:'Create a consistent connection ritual with people who matter',done:false}],
  career:[{area:'Work',text:'Define the most meaningful outcome for the next 90 days',done:false}],
  health:[{area:'Health',text:'Build a consistent routine for sleep, movement and energy',done:false}],
  money:[{area:'Money',text:'Define one practical step towards greater financial security',done:false}]
};
let profileRegistry = loadProfileRegistry();
let activeProfile = profileRegistry.items.find(item=>item.id===profileRegistry.activeId)||null;
let state = activeProfile ? loadProfileState(activeProfile.id) : structuredClone(defaults);
let activeRecognition = null;
let voiceLifecycleReady = false;
let cloudSession = null;
let familySpace = null;
let pendingFreshCloudProfile = false;
function uid(){return globalThis.crypto?.randomUUID?.()||`profile-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function normalizeProfile(profile){
  const normalized={...profile};
  if(!normalized.lifeMode)normalized.lifeMode=normalized.familyName?.trim()?'both':'personal';
  if(!normalized.wayName&&normalized.familyName?.trim().toLowerCase()==='thornton')normalized.wayName='The Thornton Way';
  if(!normalized.purpose)normalized.purpose='Build wealth, protect your energy, lead your family and enjoy the day.';
  if(!Array.isArray(normalized.principles)||!normalized.principles.length)normalized.principles=[...defaultPrinciples];
  normalized.routineConfig={
    morning:normalized.routineConfig?.morning?.length?normalized.routineConfig.morning:structuredClone(defaultRoutineConfig.morning),
    daytime:normalized.routineConfig?.daytime?.length?normalized.routineConfig.daytime:structuredClone(defaultRoutineConfig.daytime),
    evening:{...defaultRoutineConfig.evening,...(normalized.routineConfig?.evening||{})}
  };
  normalized.trackers={alcohol:normalized.trackers?.alcohol!==false,cigarettes:normalized.trackers?.cigarettes!==false};
  return normalized;
}
function loadProfileRegistry(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if(saved?.items?.length){
      const normalized={...saved,items:saved.items.map(normalizeProfile)};
      localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(normalized));
      return normalized;
    }
    const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if(legacy){
      const migrated=normalizeProfile({id:'joe-thornton',name:'Joe',familyName:'Thornton',wayName:'The Thornton Way',lifeMode:'both',purpose:'Build wealth, protect your energy, lead your family and enjoy the day.',principles:[...defaultPrinciples],createdAt:new Date().toISOString()});
      const registry={activeId:migrated.id,items:[migrated]};
      localStorage.setItem(profileDataKey(migrated.id),JSON.stringify(merge(defaults,legacy)));
      localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(registry));
      return registry;
    }
  }catch{}
  return {activeId:null,items:[]};
}
function loadProfileState(id){try{const saved=JSON.parse(localStorage.getItem(profileDataKey(id)));return saved?merge(defaults,saved):structuredClone(defaults)}catch{return structuredClone(defaults)}}
function merge(base,extra){return {...structuredClone(base),...extra,morning:{...base.morning,...(extra.morning||{})},daytime:{...base.daytime,...(extra.daytime||{})}}}
function saveRegistry(){localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(profileRegistry))}
function save(){if(activeProfile){localStorage.setItem(profileDataKey(activeProfile.id),JSON.stringify(state));window.LifeOSCloud?.queueSave(activeProfile,state)}flashSaved();updateScore()}
function flashSaved(){const el=document.getElementById('savedNote');if(!el)return;el.textContent='Saved privately just now';clearTimeout(flashSaved.t);flashSaved.t=setTimeout(()=>el.textContent='Saved privately on this device',1300)}
function createProfile({name,familyName,purpose,template='balanced',lifeMode='personal',wayName=''}){
  const profile={id:uid(),name:name.trim(),familyName:familyName.trim(),wayName:wayName.trim(),lifeMode,purpose:purpose.trim()||'Live intentionally. Improve continuously. Protect what matters.',principles:[...(lifeMode==='personal'?personalPrinciples:defaultPrinciples)],routineConfig:structuredClone(defaultRoutineConfig),trackers:{alcohol:true,cigarettes:true},createdAt:new Date().toISOString()};
  const profileState=structuredClone(defaults);profileState.goals=(templates[template]||[]).map(goal=>({...goal,id:uid()}));
  profileRegistry.items.push(profile);profileRegistry.activeId=profile.id;saveRegistry();localStorage.setItem(profileDataKey(profile.id),JSON.stringify(profileState));return profile;
}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function routines(){return {morning:activeProfile?.routineConfig?.morning?.length?activeProfile.routineConfig.morning:defaultRoutineConfig.morning,daytime:activeProfile?.routineConfig?.daytime?.length?activeProfile.routineConfig.daytime:defaultRoutineConfig.daytime,evening:{...defaultRoutineConfig.evening,...(activeProfile?.routineConfig?.evening||{})}}}
function routineId(prefix,label,index){return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)||index}-${Math.random().toString(36).slice(2,6)}`}
function wayTitle(profile=activeProfile){if(familySpace?.name)return familySpace.name;if(profile?.wayName?.trim())return profile.wayName.trim();if(profile?.lifeMode==='personal'||!profile?.familyName?.trim())return 'My Way';return `The ${profile.familyName.trim()} Way`}
function scoreValue(value=state){const config=routines();const custom=(value.customHabits||[]).map(habit=>(habit.dates||[]).includes(value.date));const checks=[...config.morning.map(item=>Boolean(value.morning[item.id])),...value.priorityDone,...config.daytime.map(item=>Boolean(value.daytime[`${item.id}Done`])),...custom,Boolean(value.dailyWin.trim()),Boolean(value.tinyStep.trim())];return Math.round(100*checks.filter(Boolean).length/Math.max(1,checks.length))}
function dailySnapshot(value=state){return {date:value.date,score:scoreValue(value),energy:value.energy,mood:value.mood,priorities:value.priorityDone.filter(Boolean).length,alcoholFree:value.alcoholDates.includes(value.date)}}
function resetDailyIfNeeded(){if(state.date!==todayKey()){const history=[...(state.history||[]).filter(item=>item.date!==state.date),dailySnapshot(state)].slice(-90);state={...state,date:todayKey(),greatDay:'',priorities:['','',''],priorityDone:[false,false,false],morning:{},daytime:{progress:'',nextAction:''},energy:7,mood:7,dailyWin:'',tinyStep:'',cigarettesToday:0,history};save()}}
function bindValue(id,key,event='input'){const el=document.getElementById(id);el.value=state[key]??'';el.addEventListener(event,()=>{state[key]=el.type==='range'||el.type==='number'?Number(el.value):el.value;save()})}
function renderPriorities(){const list=document.getElementById('priorityList');list.innerHTML=state.priorities.map((p,i)=>`<div class="priority"><span class="number">${i+1}</span><input type="text" aria-label="Priority ${i+1}" data-priority="${i}" data-voice-label="priority ${i+1}" value="${esc(p)}" placeholder="${i===0?'The one thing that matters most…':'Another meaningful outcome…'}"><input class="custom-check" type="checkbox" data-priority-done="${i}" ${state.priorityDone[i]?'checked':''} aria-label="Complete priority ${i+1}"></div>`).join('');list.querySelectorAll('[data-priority]').forEach(el=>el.oninput=()=>{state.priorities[+el.dataset.priority]=el.value;save();updatePriorityStatus()});list.querySelectorAll('[data-priority-done]').forEach(el=>el.onchange=()=>{state.priorityDone[+el.dataset.priorityDone]=el.checked;save();updatePriorityStatus()});setupVoiceInputs(list);updatePriorityStatus()}
function updatePriorityStatus(){document.getElementById('priorityStatus').textContent=`${state.priorityDone.filter(Boolean).length} of 3`}
function renderMorning(){const icons=['◒','♡','≈','↗','⌁','◉','✦','✓'];const grid=document.getElementById('morningChecks');grid.innerHTML=routines().morning.map((item,index)=>{const ownLabel=item.id==='principles'&&activeProfile?`Read ${wayTitle()}`:item.label;return `<div class="check-item ${state.morning[item.id]?'done':''}" data-morning-card="${esc(item.id)}"><span>${icons[index%icons.length]}</span><label>${esc(ownLabel)}</label><input class="custom-check" type="checkbox" data-morning="${esc(item.id)}" ${state.morning[item.id]?'checked':''} aria-label="${esc(ownLabel)}"></div>`}).join('');grid.querySelectorAll('[data-morning-card]').forEach(card=>card.onclick=e=>{if(e.target.matches('input'))return;const key=card.dataset.morningCard;state.morning[key]=!state.morning[key];save();renderMorning()});grid.querySelectorAll('[data-morning]').forEach(el=>el.onchange=()=>{state.morning[el.dataset.morning]=el.checked;save();renderMorning()})}
function renderDaytime(){
  document.getElementById('dayProgress').value=state.daytime.progress||'';document.getElementById('dayNextAction').value=state.daytime.nextAction||'';
  const grid=document.getElementById('daytimeChecks');const icons=['◎','↺','✓','◇'];grid.innerHTML=routines().daytime.map((item,index)=>{const key=`${item.id}Done`;return `<article class="card daytime-check ${state.daytime[key]?'done':''}" data-daytime-card="${esc(key)}"><span>${icons[index%icons.length]}</span><div><strong>${esc(item.label)}</strong><p>${esc(item.description||'Choose one clear action and complete it intentionally.')}</p></div><input class="custom-check" type="checkbox" data-daytime="${esc(key)}" ${state.daytime[key]?'checked':''} aria-label="${esc(item.label)}"></article>`}).join('');grid.querySelectorAll('[data-daytime-card]').forEach(card=>card.onclick=event=>{if(event.target.matches('input'))return;const key=card.dataset.daytimeCard;state.daytime[key]=!state.daytime[key];save();renderDaytime()});grid.querySelectorAll('[data-daytime]').forEach(input=>input.onchange=()=>{state.daytime[input.dataset.daytime]=input.checked;save();renderDaytime()})
}
function updateScore(){const score=scoreValue();document.getElementById('dailyScore').textContent=`${score}%`;document.getElementById('scoreRing').style.setProperty('--score',`${score}%`);renderWeeklyInsights()}
function renderIdentity(){
  if(!activeProfile)return;
  const wayName=wayTitle();
  document.getElementById('brandWay').textContent=wayName;
  document.getElementById('greetingName').textContent=activeProfile.name;
  document.getElementById('heroPurpose').textContent=activeProfile.purpose;
  document.getElementById('profileInitial').textContent=activeProfile.name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent=activeProfile.name;
  document.getElementById('familyWayTitle').textContent=wayName;
  document.getElementById('familyWayIntro').textContent=activeProfile.lifeMode==='personal'?'A personal code to live, practise and remember.':`A shared code to live, teach and remember.`;
  document.getElementById('familyCrest').textContent=(activeProfile.familyName||activeProfile.name).charAt(0).toUpperCase();
  const evening=routines().evening;[['dailyWin',evening.win],['tinyStep',evening.tinyStep]].forEach(([id,label])=>{const field=document.getElementById(id);document.querySelector(`label[for="${id}"]`).textContent=label;field.dataset.voiceLabel=label;const button=field.nextElementSibling;if(button?.classList.contains('voice-button')&&!button.classList.contains('listening')){button.dataset.voiceLabel=label;button.setAttribute('aria-label',`Dictate ${label}`);button.title=`Dictate ${label}`}});
  const wayPrompt=[...document.getElementById('journalPrompt').options].find(option=>option.textContent.includes('Way?'));if(wayPrompt)wayPrompt.textContent=`How did I live ${wayName}?`;
}
function renderWay(){
  const ownPrinciples=familySpace?.principles?.length?familySpace.principles:(activeProfile?.principles?.length?activeProfile.principles:defaultPrinciples);
  const philosophies=[['Ikigai','Purpose',activeProfile?.purpose||'Live intentionally. Improve continuously. Protect what matters.'],...philosophyBase];
  document.getElementById('thorntonPrinciples').innerHTML=ownPrinciples.map(x=>`<li>${esc(x)}</li>`).join('');
  document.getElementById('philosophyGrid').innerHTML=philosophies.map((p,i)=>`<article class="card philosophy-card ${i===0?'full':''}"><header><h3>${p[0]}</h3><span>${p[1]}</span></header><p>${esc(p[2])}</p></article>`).join('')
}
function renderProfile(){
  if(!activeProfile)return;
  document.getElementById('largeAvatar').textContent=activeProfile.name.charAt(0).toUpperCase();
  document.getElementById('profileHeading').textContent=`${activeProfile.name} ${activeProfile.familyName}`;
  document.getElementById('settingsName').value=activeProfile.name;
  document.getElementById('settingsFamily').value=activeProfile.familyName;
  document.getElementById('settingsLifeMode').value=activeProfile.lifeMode||'personal';
  document.getElementById('settingsWayName').value=activeProfile.wayName||'';
  document.getElementById('settingsPurpose').value=activeProfile.purpose;
  document.getElementById('settingsPrinciples').value=(familySpace?.principles||activeProfile.principles||defaultPrinciples).join('\n');
  const config=routines();document.getElementById('settingsMorningRoutine').value=config.morning.map(item=>item.label).join('\n');document.getElementById('settingsDaytimeRoutine').value=config.daytime.map(item=>`${item.label}${item.description?` | ${item.description}`:''}`).join('\n');document.getElementById('settingsEveningWin').value=config.evening.win;document.getElementById('settingsEveningStep').value=config.evening.tinyStep;document.getElementById('settingsAlcoholTracker').checked=activeProfile.trackers?.alcohol!==false;document.getElementById('settingsCigaretteTracker').checked=activeProfile.trackers?.cigarettes!==false;
  document.getElementById('profileList').innerHTML=profileRegistry.items.map(item=>`<button type="button" class="profile-switch ${item.id===activeProfile.id?'active':''}" data-profile-id="${esc(item.id)}"><span>${esc(item.name.charAt(0).toUpperCase())}</span><div><strong>${esc(item.name)} ${esc(item.familyName)}</strong><small>${item.id===activeProfile.id?'Current profile':'Switch profile'}</small></div></button>`).join('');
  document.querySelectorAll('[data-profile-id]').forEach(button=>button.onclick=()=>{if(button.dataset.profileId===activeProfile.id)return;profileRegistry.activeId=button.dataset.profileId;saveRegistry();location.hash='#today';location.reload()});
}
function alcoholStreak(){const dates=new Set(state.alcoholDates);let d=new Date();let count=0;if(!dates.has(todayKey()))d.setDate(d.getDate()-1);while(dates.has(d.toISOString().slice(0,10))){count++;d.setDate(d.getDate()-1)}return count}
function renderHabits(){const marked=state.alcoholDates.includes(todayKey());document.getElementById('alcoholTrackerCard').hidden=activeProfile?.trackers?.alcohol===false;document.getElementById('cigaretteTrackerCard').hidden=activeProfile?.trackers?.cigarettes===false;document.getElementById('cigaretteTargetCard').hidden=activeProfile?.trackers?.cigarettes===false;document.getElementById('alcoholStreak').textContent=alcoholStreak();const btn=document.getElementById('alcoholToday');btn.textContent=marked?'Alcohol-free today ✓':'Mark today alcohol-free';btn.classList.toggle('done',marked);document.getElementById('cigarettesToday').value=state.cigarettesToday;document.getElementById('cigaretteTarget').value=state.cigaretteTarget;document.getElementById('cigaretteTargetLabel').textContent=state.cigaretteTarget;renderCustomHabits();renderTriggers()}
function renderCustomHabits(){const list=document.getElementById('customHabitList');list.innerHTML=state.customHabits.length?state.customHabits.map(habit=>{const done=(habit.dates||[]).includes(todayKey());return `<article class="habit-row ${done?'done':''}"><input class="custom-check" type="checkbox" data-custom-habit="${esc(habit.id)}" ${done?'checked':''} aria-label="${esc(habit.name)}"><strong>${esc(habit.name)}</strong><button class="delete-button" data-delete-habit="${esc(habit.id)}" aria-label="Delete ${esc(habit.name)}">×</button></article>`}).join(''):'<div class="empty-state">Add any daily habit you want to practise. You can change this list whenever life changes.</div>';list.querySelectorAll('[data-custom-habit]').forEach(input=>input.onchange=()=>{const habit=state.customHabits.find(item=>item.id===input.dataset.customHabit);habit.dates=input.checked?[...(habit.dates||[]).filter(date=>date!==todayKey()),todayKey()]:(habit.dates||[]).filter(date=>date!==todayKey());save();renderCustomHabits()});list.querySelectorAll('[data-delete-habit]').forEach(button=>button.onclick=()=>{state.customHabits=state.customHabits.filter(item=>item.id!==button.dataset.deleteHabit);save();renderCustomHabits()})}
function renderWeeklyInsights(){const target=document.getElementById('weeklyInsights');if(!target)return;const entries=[...(state.history||[]).filter(item=>item.date!==todayKey()),dailySnapshot()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-7);const average=key=>entries.length?Math.round(entries.reduce((sum,item)=>sum+(Number(item[key])||0),0)/entries.length):0;target.innerHTML=`<div class="insight-stat"><strong>${average('score')}%</strong><span>average completion</span></div><div class="insight-stat"><strong>${average('energy')}/10</strong><span>average energy</span></div><div class="insight-stat"><strong>${average('mood')}/10</strong><span>average calm & mood</span></div><div class="week-bars">${entries.map(item=>`<div title="${esc(item.date)}: ${item.score}%"><i style="height:${Math.max(6,item.score)}%"></i><small>${new Date(`${item.date}T12:00:00`).toLocaleDateString('en-GB',{weekday:'short'}).slice(0,1)}</small></div>`).join('')}</div>`}
function renderTriggers(){const list=document.getElementById('triggerList');list.innerHTML=state.triggers.length?state.triggers.map(t=>`<article class="timeline-item"><header><strong>${esc(t.type)} · ${esc(t.intensity)}</strong><time>${new Date(t.time).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time></header><p>${esc(t.note)}</p></article>`).join(''):'<div class="empty-state">No triggers logged yet. Awareness is the first change.</div>'}
function renderGoals(){const list=document.getElementById('goalList');list.innerHTML=state.goals.length?state.goals.map(g=>`<article class="goal-item ${g.done?'completed':''}"><input class="custom-check" type="checkbox" data-goal="${g.id}" ${g.done?'checked':''} aria-label="Complete goal"><div class="goal-copy"><small>${esc(g.area)}</small><p>${esc(g.text)}</p></div><button class="delete-button" data-delete-goal="${g.id}" aria-label="Delete goal">×</button></article>`).join(''):'<div class="empty-state">Add one outcome that would make the next 90 days meaningful.</div>';list.querySelectorAll('[data-goal]').forEach(el=>el.onchange=()=>{state.goals.find(g=>g.id===el.dataset.goal).done=el.checked;save();renderGoals()});list.querySelectorAll('[data-delete-goal]').forEach(el=>el.onclick=()=>{state.goals=state.goals.filter(g=>g.id!==el.dataset.deleteGoal);save();renderGoals()});const done=state.goals.filter(g=>g.done).length;const pct=state.goals.length?Math.round(100*done/state.goals.length):0;document.getElementById('goalPercent').textContent=`${pct}%`;document.getElementById('goalProgress').style.width=`${pct}%`}
function renderJournal(){const list=document.getElementById('journalList');list.innerHTML=state.journal.length?state.journal.map(j=>`<article class="journal-entry"><header><strong>${esc(j.prompt)}</strong><time>${new Date(j.time).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time></header><p>${esc(j.text)}</p></article>`).join(''):'<div class="empty-state">Your reflections will build a record of how far you have come.</div>'}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1900)}
function setupVoiceInputs(root=document){
  const targets=root.querySelectorAll('textarea:not([data-voice-ready]), input[type="text"]:not([data-voice-ready]), input:not([type]):not([data-voice-ready])');
  targets.forEach((field,index)=>{
    field.dataset.voiceReady='true';
    const label=field.dataset.voiceLabel||field.getAttribute('aria-label')||document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim()||field.placeholder||`field ${index+1}`;
    const button=document.createElement('button');
    button.type='button';button.className='voice-button';button.setAttribute('aria-label',`Dictate ${label}`);button.title=`Dictate ${label}`;
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H8v2h8v-2h-3v-3.08A7 7 0 0 0 19 11h-2Z"/></svg><span class="voice-label">Speak</span>';
    button.addEventListener('click',()=>startVoiceInput(field,button));
    field.insertAdjacentElement('afterend',button);
  });
  if(!voiceLifecycleReady){
    voiceLifecycleReady=true;
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoiceInput({abort:true})});
    window.addEventListener('pagehide',()=>stopVoiceInput({abort:true}));
  }
}
function setVoiceButton(button,listening){
  button.classList.toggle('listening',listening);
  button.querySelector('.voice-label').textContent=listening?'Stop':'Speak';
  button.setAttribute('aria-label',listening?'Stop voice input':`Dictate ${button.dataset.voiceLabel}`);
  button.title=listening?'Stop voice input':`Dictate ${button.dataset.voiceLabel}`;
  if(listening)button.setAttribute('aria-pressed','true');else button.removeAttribute('aria-pressed');
}
function finishVoiceInput(recognition,{focus=true}={}){
  clearTimeout(recognition.voiceTimeout);
  const ownsButton=recognition.voiceButton.voiceRecognition===recognition;
  if(ownsButton){setVoiceButton(recognition.voiceButton,false);recognition.voiceButton.voiceRecognition=null}
  if(activeRecognition===recognition)activeRecognition=null;
  if(focus&&ownsButton)recognition.voiceField.focus();
}
function stopVoiceInput({abort=false,notify=false}={}){
  const recognition=activeRecognition;if(!recognition)return false;
  recognition.stoppedByUser=!abort;
  try{abort?recognition.abort():recognition.stop()}catch{}
  finishVoiceInput(recognition,{focus:!abort});
  if(notify)toast('Voice input stopped. Your words have been kept.');
  return true;
}
function startVoiceInput(field,button){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){field.focus();toast('Use the microphone on your phone keyboard to dictate here.');return}
  if(activeRecognition?.voiceButton===button){stopVoiceInput({notify:true});return}
  if(activeRecognition)stopVoiceInput({abort:true});
  const recognition=new Recognition();activeRecognition=recognition;recognition.lang='en-GB';recognition.continuous=false;recognition.interimResults=true;recognition.voiceButton=button;recognition.voiceField=field;button.voiceRecognition=recognition;
  const original=field.value.trim();button.dataset.voiceLabel=button.dataset.voiceLabel||button.getAttribute('aria-label').replace(/^Dictate /,'');setVoiceButton(button,true);
  recognition.onresult=event=>{let words='';for(let i=0;i<event.results.length;i++)words+=event.results[i][0].transcript;field.value=`${original}${original&&words?' ':''}${words}`.trim();field.dispatchEvent(new Event('input',{bubbles:true}))};
  recognition.onerror=event=>{if(event.error==='not-allowed'||event.error==='service-not-allowed')toast('Microphone access was not allowed. You can still use keyboard dictation.');else if(event.error!=='aborted'&&!recognition.stoppedByUser)toast('I could not hear that. Tap Speak and try again.');finishVoiceInput(recognition)};
  recognition.onend=()=>finishVoiceInput(recognition);
  recognition.voiceTimeout=setTimeout(()=>{if(activeRecognition===recognition){stopVoiceInput();toast('Voice input stopped after 45 seconds. Your words have been kept.')}},45000);
  try{recognition.start()}catch{finishVoiceInput(recognition);toast('Voice input could not start. Please tap Speak and try again.')}
}
function showOnboarding(canCancel=false){
  const overlay=document.getElementById('onboarding');overlay.hidden=false;document.body.classList.add('modal-open');
  document.getElementById('onboardingCancel').hidden=!canCancel;setTimeout(()=>document.getElementById('onboardingName').focus(),50)
}
function closeOnboarding(){document.getElementById('onboarding').hidden=true;document.body.classList.remove('modal-open')}
function exportCurrentProfile(){
  const payload={version:1,exportedAt:new Date().toISOString(),profile:activeProfile,data:state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`life-os-${activeProfile.name.toLowerCase()}-backup.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);toast('Backup downloaded')
}
function navigate(){const target=(location.hash||'#today').slice(1);document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===target));document.querySelectorAll('.bottom-nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${target}`));window.scrollTo({top:0,behavior:'smooth'})}
function setCloudStatus(message,badge='Cloud ready'){document.getElementById('cloudStatus').textContent=message;document.getElementById('cloudBadge').textContent=badge}
async function refreshFamilySpace(){
  familySpace=await window.LifeOSCloud.family();const card=document.getElementById('familyCloudCard');card.hidden=!cloudSession;if(!cloudSession)return;
  document.getElementById('familySetup').hidden=Boolean(familySpace);document.getElementById('familyConnected').hidden=!familySpace;
  if(familySpace){document.getElementById('connectedFamilyName').textContent=familySpace.name;document.getElementById('familyShareCode').textContent=familySpace.inviteCode||'Ask a family owner for an invitation';document.getElementById('familyCloudStatus').textContent=`You are connected as ${familySpace.role}. Shared principles stay together; personal goals, health and journals remain private.`}
  renderIdentity();renderWay();renderMorning();renderProfile();
}
async function applyCloudAccount(){
  const account=await window.LifeOSCloud.current();cloudSession=account.session;
  document.getElementById('cloudConnect').hidden=Boolean(cloudSession);document.getElementById('cloudSignOut').hidden=!cloudSession;document.getElementById('familyCloudCard').hidden=!cloudSession;
  document.getElementById('cloudDelete').hidden=!cloudSession;
  if(!cloudSession){setCloudStatus('Your profile is safe on this device. Connect an account to back it up and use it on your other devices.','Local only');familySpace=null;document.getElementById('cloudProfileChoice').hidden=true;renderIdentity();renderWay();renderMorning();renderProfile();return}
  const remote=await window.LifeOSCloud.load();
  if(remote?.profile||remote?.state){const existing=profileRegistry.items.find(item=>item.cloudUserId===cloudSession.user.id);const cloudProfile={...(remote.profile||existing||{}),id:existing?.id||remote.profile?.id||`cloud-${cloudSession.user.id}`,cloudUserId:cloudSession.user.id};if(existing)Object.assign(existing,cloudProfile);else profileRegistry.items.push(cloudProfile);profileRegistry.activeId=cloudProfile.id;activeProfile=cloudProfile;state=merge(defaults,remote.state||{});saveRegistry();localStorage.setItem(profileDataKey(cloudProfile.id),JSON.stringify(state))}
  else if(activeProfile?.cloudUserId===cloudSession.user.id)await window.LifeOSCloud.save(activeProfile,state);
  else{setCloudStatus('This is a new cloud account. Choose whether to start fresh or intentionally import this device profile.','Setup required');document.getElementById('cloudProfileChoice').hidden=false;document.body.classList.add('modal-open');return}
  setCloudStatus(`Signed in as ${cloudSession.user.email}. Your private Life OS is synchronised.`,'Synced');
  renderIdentity();renderPriorities();renderMorning();renderDaytime();renderWay();renderHabits();renderGoals();renderJournal();renderProfile();await refreshFamilySpace();
}
function setupCloud(){
  if(!window.LifeOSCloud?.configured){setCloudStatus('Cloud connection is being prepared. Your information is still saved privately on this device.','Local only');return}
  const auth=document.getElementById('cloudAuth');document.getElementById('cloudConnect').onclick=()=>{auth.hidden=false;document.body.classList.add('modal-open');setTimeout(()=>document.getElementById('cloudEmail').focus(),50)};
  document.getElementById('cloudAuthCancel').onclick=()=>{auth.hidden=true;document.body.classList.remove('modal-open')};
  document.getElementById('cloudAuthForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('cloudEmail').value.trim();try{await window.LifeOSCloud.signIn(email);auth.hidden=true;document.body.classList.remove('modal-open');toast('Check your email for the secure sign-in link')}catch(error){toast(error.message)}};
  const choice=document.getElementById('cloudProfileChoice');
  document.getElementById('cloudStartFresh').onclick=()=>{choice.hidden=true;pendingFreshCloudProfile=true;document.getElementById('onboardingForm').reset();document.body.classList.remove('modal-open');showOnboarding(true)};
  document.getElementById('cloudUseLocal').onclick=async()=>{if(!activeProfile)return toast('Create a local profile first');try{activeProfile.cloudUserId=cloudSession.user.id;saveRegistry();await window.LifeOSCloud.save(activeProfile,state);choice.hidden=true;document.body.classList.remove('modal-open');await applyCloudAccount();toast('Device profile imported securely')}catch(error){toast(error.message)}};
  document.getElementById('cloudChoiceCancel').onclick=async()=>{pendingFreshCloudProfile=false;choice.hidden=true;document.body.classList.remove('modal-open');await window.LifeOSCloud.signOut();await applyCloudAccount()};
  document.getElementById('cloudSignOut').onclick=async()=>{try{await window.LifeOSCloud.signOut();await applyCloudAccount();toast('Signed out')}catch(error){toast(error.message)}};
  document.getElementById('cloudDelete').onclick=async()=>{if(!confirm('Permanently delete your cloud account and all synchronised information? Your local profile on this device will remain until you delete it separately.'))return;try{await window.LifeOSCloud.deleteAccount();await applyCloudAccount();toast('Cloud account deleted')}catch(error){toast(error.message)}};
  document.getElementById('createFamilySpace').onclick=async()=>{const name=document.getElementById('familySpaceName').value.trim();if(!name)return toast('Give your family space a name');try{await window.LifeOSCloud.createFamily(name,activeProfile.principles||defaultPrinciples);await refreshFamilySpace();toast('Family space created')}catch(error){toast(error.message)}};
  document.getElementById('joinFamilySpace').onclick=async()=>{const code=document.getElementById('familyInviteCode').value.trim();if(!code)return toast('Enter the invitation code');try{await window.LifeOSCloud.joinFamily(code);await refreshFamilySpace();toast('Family space joined')}catch(error){toast(error.message)}};
  document.getElementById('copyFamilyCode').onclick=async()=>{if(!familySpace?.inviteCode)return toast('Ask a family owner for an invitation');try{await navigator.clipboard.writeText(familySpace.inviteCode);toast('Invitation code copied')}catch{toast(`Family code: ${familySpace.inviteCode}`)}};
  window.LifeOSCloud.on(event=>{if(event.type==='synced')setCloudStatus(`Signed in as ${cloudSession?.user?.email||'your account'}. Your private Life OS is synchronised.`,'Synced');if(event.type.includes('signed_in'))applyCloudAccount().catch(error=>toast(error.message));if(event.type==='error')toast(`Cloud sync: ${event.message}`)});
  applyCloudAccount().catch(error=>setCloudStatus(`Cloud needs attention: ${error.message}`,'Check cloud'));
}
function init(){resetDailyIfNeeded();const now=new Date();document.getElementById('dateLabel').textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();document.getElementById('dayPart').textContent=now.getHours()<12?'morning':now.getHours()<18?'afternoon':'evening';bindValue('greatDay','greatDay');bindValue('energy','energy');bindValue('mood','mood');bindValue('dailyWin','dailyWin');bindValue('tinyStep','tinyStep');document.getElementById('dayProgress').oninput=e=>{state.daytime.progress=e.target.value;save()};document.getElementById('dayNextAction').oninput=e=>{state.daytime.nextAction=e.target.value;save()};['energy','mood'].forEach(id=>{const el=document.getElementById(id),out=document.getElementById(`${id}Value`);out.textContent=el.value;el.addEventListener('input',()=>out.textContent=el.value)});renderIdentity();renderPriorities();renderMorning();renderDaytime();renderWay();renderHabits();renderGoals();renderJournal();renderProfile();setupVoiceInputs();updateScore();navigate();
  document.getElementById('alcoholToday').onclick=()=>{const key=todayKey();state.alcoholDates=state.alcoholDates.includes(key)?state.alcoholDates.filter(d=>d!==key):[...state.alcoholDates,key];save();renderHabits()};
  document.getElementById('cigarettesToday').oninput=e=>{state.cigarettesToday=Math.max(0,+e.target.value||0);save()};document.getElementById('cigaretteTarget').oninput=e=>{state.cigaretteTarget=Math.max(0,+e.target.value||0);save();renderHabits()};document.getElementById('cigMinus').onclick=()=>{state.cigarettesToday=Math.max(0,state.cigarettesToday-1);save();renderHabits()};document.getElementById('cigPlus').onclick=()=>{state.cigarettesToday++;save();renderHabits()};
  document.getElementById('triggerForm').onsubmit=e=>{e.preventDefault();state.triggers.unshift({type:document.getElementById('triggerType').value,intensity:document.getElementById('triggerIntensity').value,note:document.getElementById('triggerNote').value.trim(),time:new Date().toISOString()});document.getElementById('triggerNote').value='';save();renderTriggers();toast('Reflection added')};document.getElementById('clearTriggers').onclick=()=>{if(confirm('Clear all trigger reflections?')){state.triggers=[];save();renderTriggers()}};
  document.getElementById('goalForm').onsubmit=e=>{e.preventDefault();state.goals.push({id:uid(),area:document.getElementById('goalArea').value,text:document.getElementById('goalText').value.trim(),done:false});document.getElementById('goalText').value='';save();renderGoals();toast('Goal added')};
  document.getElementById('customHabitForm').onsubmit=e=>{e.preventDefault();const name=document.getElementById('customHabitName').value.trim();if(!name)return;state.customHabits.push({id:uid(),name,dates:[]});document.getElementById('customHabitName').value='';save();renderCustomHabits();toast('Habit added')};
  document.getElementById('journalForm').onsubmit=e=>{e.preventDefault();state.journal.unshift({prompt:document.getElementById('journalPrompt').value,text:document.getElementById('journalText').value.trim(),time:new Date().toISOString()});document.getElementById('journalText').value='';save();renderJournal();toast('Journal entry saved')};
  document.getElementById('resetDay').onclick=()=>{if(confirm("Clear today's check-ins and priorities? Your goals, habits and journal will stay safe.")){state={...state,greatDay:'',priorities:['','',''],priorityDone:[false,false,false],morning:{},daytime:{progress:'',nextAction:''},energy:7,mood:7,dailyWin:'',tinyStep:'',cigarettesToday:0};save();location.reload()}};
  document.getElementById('profileButton').onclick=()=>{location.hash='#profile'};
  document.getElementById('profileForm').onsubmit=async e=>{e.preventDefault();const previous=structuredClone(activeProfile);try{activeProfile.name=document.getElementById('settingsName').value.trim();activeProfile.familyName=document.getElementById('settingsFamily').value.trim();activeProfile.lifeMode=document.getElementById('settingsLifeMode').value;activeProfile.wayName=document.getElementById('settingsWayName').value.trim();activeProfile.purpose=document.getElementById('settingsPurpose').value.trim();const principles=document.getElementById('settingsPrinciples').value.split('\n').map(x=>x.trim()).filter(Boolean);const oldConfig=routines();const morningLines=document.getElementById('settingsMorningRoutine').value.split('\n').map(x=>x.trim()).filter(Boolean);const daytimeLines=document.getElementById('settingsDaytimeRoutine').value.split('\n').map(x=>x.trim()).filter(Boolean);activeProfile.routineConfig={morning:morningLines.map((label,index)=>oldConfig.morning.find(item=>item.label===label)||{id:routineId('morning',label,index),label}),daytime:daytimeLines.map((line,index)=>{const [label,...description]=line.split('|').map(x=>x.trim());const existing=oldConfig.daytime.find(item=>item.label===label);return existing?{...existing,description:description.join(' | ')||existing.description}:{id:routineId('daytime',label,index),label,description:description.join(' | ')}}),evening:{win:document.getElementById('settingsEveningWin').value.trim()||defaultRoutineConfig.evening.win,tinyStep:document.getElementById('settingsEveningStep').value.trim()||defaultRoutineConfig.evening.tinyStep}};activeProfile.trackers={alcohol:document.getElementById('settingsAlcoholTracker').checked,cigarettes:document.getElementById('settingsCigaretteTracker').checked};if(familySpace){await window.LifeOSCloud.saveFamilyPrinciples(familySpace.id,principles);familySpace.principles=principles}else activeProfile.principles=principles;saveRegistry();save();renderIdentity();renderWay();renderMorning();renderDaytime();renderHabits();renderProfile();toast(familySpace?'Family principles and your routines were saved':'Personalisation and routines saved')}catch(error){Object.assign(activeProfile,previous);renderProfile();toast(error.message)}};
  document.getElementById('onboardingForm').onsubmit=async e=>{e.preventDefault();const profile=createProfile({name:document.getElementById('onboardingName').value,familyName:document.getElementById('onboardingFamily').value,lifeMode:document.getElementById('onboardingLifeMode').value,wayName:document.getElementById('onboardingWayName').value,purpose:document.getElementById('onboardingPurpose').value,template:document.getElementById('onboardingTemplate').value});try{if(pendingFreshCloudProfile&&cloudSession){profile.cloudUserId=cloudSession.user.id;saveRegistry();await window.LifeOSCloud.save(profile,loadProfileState(profile.id));pendingFreshCloudProfile=false}closeOnboarding();location.hash='#today';location.reload()}catch(error){profile.cloudUserId=null;saveRegistry();pendingFreshCloudProfile=false;toast(error.message||'Your profile is saved on this device, but cloud sync could not start.')}};
  document.getElementById('addProfile').onclick=()=>{pendingFreshCloudProfile=false;document.getElementById('onboardingForm').reset();showOnboarding(true)};document.getElementById('onboardingCancel').onclick=async()=>{const wasCloudSetup=pendingFreshCloudProfile;pendingFreshCloudProfile=false;closeOnboarding();if(wasCloudSetup&&cloudSession){await window.LifeOSCloud.signOut();await applyCloudAccount()}};
  document.getElementById('exportProfile').onclick=exportCurrentProfile;
  document.getElementById('deleteProfile').onclick=()=>{if(!confirm(`Delete ${activeProfile.name}'s profile and all of its locally saved information? This cannot be undone.`))return;localStorage.removeItem(profileDataKey(activeProfile.id));profileRegistry.items=profileRegistry.items.filter(item=>item.id!==activeProfile.id);profileRegistry.activeId=profileRegistry.items[0]?.id||null;saveRegistry();location.hash='#today';location.reload()};
  document.getElementById('shareLifeOS').onclick=async()=>{const shareData={title:'Life OS',text:'I have been using Life OS to live more intentionally. Create your own private version here:',url:location.origin};try{if(navigator.share)await navigator.share(shareData);else{await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);toast('Invitation link copied')}}catch(error){if(error.name!=='AbortError')toast('Copy this page link to share Life OS')}};
  setupCloud();if(!activeProfile)showOnboarding(false);
  window.addEventListener('hashchange',navigate);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
