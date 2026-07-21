const LEGACY_STORAGE_KEY = 'life-os-v1';
const PROFILE_STORAGE_KEY = 'life-os-profiles-v1';
const profileDataKey = id => `life-os-data:${id}`;
const todayKey = () => new Date().toISOString().slice(0, 10);
const defaults = {
  date: todayKey(), greatDay: '', priorities: ['', '', ''], priorityDone: [false, false, false],
  morning: { water:false, gratitude:false, breathe:false, walk:false, stretch:false, breakfast:false, principles:false, plan:false },
  energy:7, mood:7, dailyWin:'', tinyStep:'', alcoholDates:[], cigarettesToday:0, cigaretteTarget:10,
  triggers:[], goals:[], journal:[]
};
const morningItems = [
  ['water','◒','Drink water'],['gratitude','♡','Gratitude'],['breathe','≈','Breathe / meditate'],['walk','↗','Morning walk'],
  ['stretch','⌁','Stretch / exercise'],['breakfast','◉','Healthy breakfast'],['principles','✦','Read your principles'],['plan','✓','Review top 3']
];
const defaultPrinciples = ['We tell the truth.','We protect each other.','We work smart.','We are kind.','We keep our promises.','We take care of our health.','We are wise with our money.','We help other people.','We face challenges with courage.','We never stop learning.','We enjoy life together.'];
const philosophyBase = [
  ['Kaizen','Improve','Make the next step so small that starting feels easy. One percent compounds.'],
  ['Hara Hachi Bu','Enough','Stop before excess—in food, alcohol, cigarettes and screens. Leave energy for tomorrow.'],
  ['Wabi-Sabi','Accept','An imperfect day is still a day you can continue. Progress does not require perfection.'],
  ['Gambaru','Persist','Keep going with patience and dignity, especially when motivation is low.']
];
const templates = {
  balanced:[],
  parent:[{area:'Family',text:'Create a consistent daily connection ritual',done:false},{area:'Health',text:'Build a calm and energising morning routine',done:false}],
  entrepreneur:[{area:'Financial freedom',text:'Define and increase recurring monthly income',done:false},{area:'Business',text:'Remove one recurring operational bottleneck',done:false}],
  health:[{area:'Health',text:'Complete a consistent 30-day energy reset',done:false},{area:'Personal',text:'Build a sleep routine that makes mornings easier',done:false}]
};
let profileRegistry = loadProfileRegistry();
let activeProfile = profileRegistry.items.find(item=>item.id===profileRegistry.activeId)||null;
let state = activeProfile ? loadProfileState(activeProfile.id) : structuredClone(defaults);
let activeRecognition = null;
function uid(){return globalThis.crypto?.randomUUID?.()||`profile-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function loadProfileRegistry(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if(saved?.items?.length)return saved;
    const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if(legacy){
      const migrated={id:'joe-thornton',name:'Joe',familyName:'Thornton',purpose:'Build wealth, protect your energy, lead your family and enjoy the day.',principles:defaultPrinciples,createdAt:new Date().toISOString()};
      const registry={activeId:migrated.id,items:[migrated]};
      localStorage.setItem(profileDataKey(migrated.id),JSON.stringify(merge(defaults,legacy)));
      localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(registry));
      return registry;
    }
  }catch{}
  return {activeId:null,items:[]};
}
function loadProfileState(id){try{const saved=JSON.parse(localStorage.getItem(profileDataKey(id)));return saved?merge(defaults,saved):structuredClone(defaults)}catch{return structuredClone(defaults)}}
function merge(base,extra){return {...structuredClone(base),...extra,morning:{...base.morning,...(extra.morning||{})}}}
function saveRegistry(){localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(profileRegistry))}
function save(){if(activeProfile)localStorage.setItem(profileDataKey(activeProfile.id),JSON.stringify(state));flashSaved();updateScore()}
function flashSaved(){const el=document.getElementById('savedNote');if(!el)return;el.textContent='Saved privately just now';clearTimeout(flashSaved.t);flashSaved.t=setTimeout(()=>el.textContent='Saved privately on this device',1300)}
function createProfile({name,familyName,purpose,template='balanced'}){
  const profile={id:uid(),name:name.trim(),familyName:familyName.trim(),purpose:purpose.trim()||'Live intentionally. Improve continuously. Protect what matters.',principles:[...defaultPrinciples],createdAt:new Date().toISOString()};
  const profileState=structuredClone(defaults);profileState.goals=(templates[template]||[]).map(goal=>({...goal,id:uid()}));
  profileRegistry.items.push(profile);profileRegistry.activeId=profile.id;saveRegistry();localStorage.setItem(profileDataKey(profile.id),JSON.stringify(profileState));return profile;
}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function resetDailyIfNeeded(){if(state.date!==todayKey()){state={...state,date:todayKey(),greatDay:'',priorities:['','',''],priorityDone:[false,false,false],morning:Object.fromEntries(Object.keys(defaults.morning).map(k=>[k,false])),energy:7,mood:7,dailyWin:'',tinyStep:'',cigarettesToday:0};save()}}
function bindValue(id,key,event='input'){const el=document.getElementById(id);el.value=state[key]??'';el.addEventListener(event,()=>{state[key]=el.type==='range'||el.type==='number'?Number(el.value):el.value;save()})}
function renderPriorities(){const list=document.getElementById('priorityList');list.innerHTML=state.priorities.map((p,i)=>`<div class="priority"><span class="number">${i+1}</span><input type="text" aria-label="Priority ${i+1}" data-priority="${i}" data-voice-label="priority ${i+1}" value="${esc(p)}" placeholder="${i===0?'The one thing that matters most…':'Another meaningful outcome…'}"><input class="custom-check" type="checkbox" data-priority-done="${i}" ${state.priorityDone[i]?'checked':''} aria-label="Complete priority ${i+1}"></div>`).join('');list.querySelectorAll('[data-priority]').forEach(el=>el.oninput=()=>{state.priorities[+el.dataset.priority]=el.value;save();updatePriorityStatus()});list.querySelectorAll('[data-priority-done]').forEach(el=>el.onchange=()=>{state.priorityDone[+el.dataset.priorityDone]=el.checked;save();updatePriorityStatus()});setupVoiceInputs(list);updatePriorityStatus()}
function updatePriorityStatus(){document.getElementById('priorityStatus').textContent=`${state.priorityDone.filter(Boolean).length} of 3`}
function renderMorning(){const grid=document.getElementById('morningChecks');grid.innerHTML=morningItems.map(([key,icon,label])=>{const ownLabel=key==='principles'&&activeProfile?`Read The ${activeProfile.familyName} Way`:label;return `<div class="check-item ${state.morning[key]?'done':''}" data-morning-card="${key}"><span>${icon}</span><label>${ownLabel}</label><input class="custom-check" type="checkbox" data-morning="${key}" ${state.morning[key]?'checked':''} aria-label="${ownLabel}"></div>`}).join('');grid.querySelectorAll('[data-morning-card]').forEach(card=>card.onclick=e=>{if(e.target.matches('input'))return;const key=card.dataset.morningCard;state.morning[key]=!state.morning[key];save();renderMorning()});grid.querySelectorAll('[data-morning]').forEach(el=>el.onchange=()=>{state.morning[el.dataset.morning]=el.checked;save();renderMorning()})}
function updateScore(){const checks=[...Object.values(state.morning),...state.priorityDone,state.alcoholDates.includes(todayKey()),Boolean(state.dailyWin.trim()),Boolean(state.tinyStep.trim())];const score=Math.round(100*checks.filter(Boolean).length/checks.length);document.getElementById('dailyScore').textContent=`${score}%`;document.getElementById('scoreRing').style.setProperty('--score',`${score}%`)}
function renderIdentity(){
  if(!activeProfile)return;
  const wayName=`The ${activeProfile.familyName} Way`;
  document.getElementById('brandWay').textContent=wayName;
  document.getElementById('greetingName').textContent=activeProfile.name;
  document.getElementById('heroPurpose').textContent=activeProfile.purpose;
  document.getElementById('profileInitial').textContent=activeProfile.name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent=activeProfile.name;
  document.getElementById('familyWayTitle').textContent=wayName;
  document.getElementById('familyWayIntro').textContent=`The ${activeProfile.familyName} family code to live, teach and remember.`;
  document.getElementById('familyCrest').textContent=activeProfile.familyName.charAt(0).toUpperCase();
  const wayPrompt=[...document.getElementById('journalPrompt').options].find(option=>option.textContent.includes('Way?'));if(wayPrompt)wayPrompt.textContent=`How did I live ${wayName}?`;
}
function renderWay(){
  const ownPrinciples=activeProfile?.principles?.length?activeProfile.principles:defaultPrinciples;
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
  document.getElementById('settingsPurpose').value=activeProfile.purpose;
  document.getElementById('settingsPrinciples').value=(activeProfile.principles||defaultPrinciples).join('\n');
  document.getElementById('profileList').innerHTML=profileRegistry.items.map(item=>`<button type="button" class="profile-switch ${item.id===activeProfile.id?'active':''}" data-profile-id="${esc(item.id)}"><span>${esc(item.name.charAt(0).toUpperCase())}</span><div><strong>${esc(item.name)} ${esc(item.familyName)}</strong><small>${item.id===activeProfile.id?'Current profile':'Switch profile'}</small></div></button>`).join('');
  document.querySelectorAll('[data-profile-id]').forEach(button=>button.onclick=()=>{if(button.dataset.profileId===activeProfile.id)return;profileRegistry.activeId=button.dataset.profileId;saveRegistry();location.hash='#today';location.reload()});
}
function alcoholStreak(){const dates=new Set(state.alcoholDates);let d=new Date();let count=0;if(!dates.has(todayKey()))d.setDate(d.getDate()-1);while(dates.has(d.toISOString().slice(0,10))){count++;d.setDate(d.getDate()-1)}return count}
function renderHabits(){const marked=state.alcoholDates.includes(todayKey());document.getElementById('alcoholStreak').textContent=alcoholStreak();const btn=document.getElementById('alcoholToday');btn.textContent=marked?'Alcohol-free today ✓':'Mark today alcohol-free';btn.classList.toggle('done',marked);document.getElementById('cigarettesToday').value=state.cigarettesToday;document.getElementById('cigaretteTarget').value=state.cigaretteTarget;document.getElementById('cigaretteTargetLabel').textContent=state.cigaretteTarget;renderTriggers()}
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
}
function startVoiceInput(field,button){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){field.focus();toast('Use the microphone on your phone keyboard to dictate here.');return}
  if(activeRecognition){activeRecognition.stop();activeRecognition=null}
  const recognition=new Recognition();activeRecognition=recognition;recognition.lang='en-GB';recognition.continuous=false;recognition.interimResults=true;
  const original=field.value.trim();button.classList.add('listening');button.querySelector('.voice-label').textContent='Listening…';button.setAttribute('aria-pressed','true');
  recognition.onresult=event=>{let words='';for(let i=0;i<event.results.length;i++)words+=event.results[i][0].transcript;field.value=`${original}${original&&words?' ':''}${words}`.trim();field.dispatchEvent(new Event('input',{bubbles:true}))};
  recognition.onerror=event=>{if(event.error==='not-allowed'||event.error==='service-not-allowed')toast('Microphone access was not allowed. You can still use keyboard dictation.');else if(event.error!=='aborted')toast('I could not hear that. Tap Speak and try again.')};
  recognition.onend=()=>{button.classList.remove('listening');button.querySelector('.voice-label').textContent='Speak';button.removeAttribute('aria-pressed');if(activeRecognition===recognition)activeRecognition=null;field.focus()};
  try{recognition.start()}catch{button.classList.remove('listening');toast('Voice input is already active.')}
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
function init(){resetDailyIfNeeded();const now=new Date();document.getElementById('dateLabel').textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();document.getElementById('dayPart').textContent=now.getHours()<12?'morning':now.getHours()<18?'afternoon':'evening';bindValue('greatDay','greatDay');bindValue('energy','energy');bindValue('mood','mood');bindValue('dailyWin','dailyWin');bindValue('tinyStep','tinyStep');['energy','mood'].forEach(id=>{const el=document.getElementById(id),out=document.getElementById(`${id}Value`);out.textContent=el.value;el.addEventListener('input',()=>out.textContent=el.value)});renderIdentity();renderPriorities();renderMorning();renderWay();renderHabits();renderGoals();renderJournal();renderProfile();setupVoiceInputs();updateScore();navigate();
  document.getElementById('alcoholToday').onclick=()=>{const key=todayKey();state.alcoholDates=state.alcoholDates.includes(key)?state.alcoholDates.filter(d=>d!==key):[...state.alcoholDates,key];save();renderHabits()};
  document.getElementById('cigarettesToday').oninput=e=>{state.cigarettesToday=Math.max(0,+e.target.value||0);save()};document.getElementById('cigaretteTarget').oninput=e=>{state.cigaretteTarget=Math.max(0,+e.target.value||0);save();renderHabits()};document.getElementById('cigMinus').onclick=()=>{state.cigarettesToday=Math.max(0,state.cigarettesToday-1);save();renderHabits()};document.getElementById('cigPlus').onclick=()=>{state.cigarettesToday++;save();renderHabits()};
  document.getElementById('triggerForm').onsubmit=e=>{e.preventDefault();state.triggers.unshift({type:document.getElementById('triggerType').value,intensity:document.getElementById('triggerIntensity').value,note:document.getElementById('triggerNote').value.trim(),time:new Date().toISOString()});document.getElementById('triggerNote').value='';save();renderTriggers();toast('Reflection added')};document.getElementById('clearTriggers').onclick=()=>{if(confirm('Clear all trigger reflections?')){state.triggers=[];save();renderTriggers()}};
  document.getElementById('goalForm').onsubmit=e=>{e.preventDefault();state.goals.push({id:uid(),area:document.getElementById('goalArea').value,text:document.getElementById('goalText').value.trim(),done:false});document.getElementById('goalText').value='';save();renderGoals();toast('Goal added')};
  document.getElementById('journalForm').onsubmit=e=>{e.preventDefault();state.journal.unshift({prompt:document.getElementById('journalPrompt').value,text:document.getElementById('journalText').value.trim(),time:new Date().toISOString()});document.getElementById('journalText').value='';save();renderJournal();toast('Journal entry saved')};
  document.getElementById('resetDay').onclick=()=>{if(confirm("Clear today's check-ins and priorities? Your goals and journal will stay safe.")){state={...state,greatDay:'',priorities:['','',''],priorityDone:[false,false,false],morning:Object.fromEntries(Object.keys(defaults.morning).map(k=>[k,false])),energy:7,mood:7,dailyWin:'',tinyStep:'',cigarettesToday:0};save();location.reload()}};
  document.getElementById('profileButton').onclick=()=>{location.hash='#profile'};
  document.getElementById('profileForm').onsubmit=e=>{e.preventDefault();activeProfile.name=document.getElementById('settingsName').value.trim();activeProfile.familyName=document.getElementById('settingsFamily').value.trim();activeProfile.purpose=document.getElementById('settingsPurpose').value.trim();activeProfile.principles=document.getElementById('settingsPrinciples').value.split('\n').map(x=>x.trim()).filter(Boolean);saveRegistry();renderIdentity();renderWay();renderProfile();toast('Personalisation saved')};
  document.getElementById('onboardingForm').onsubmit=e=>{e.preventDefault();createProfile({name:document.getElementById('onboardingName').value,familyName:document.getElementById('onboardingFamily').value,purpose:document.getElementById('onboardingPurpose').value,template:document.getElementById('onboardingTemplate').value});closeOnboarding();location.hash='#today';location.reload()};
  document.getElementById('addProfile').onclick=()=>{document.getElementById('onboardingForm').reset();showOnboarding(true)};document.getElementById('onboardingCancel').onclick=closeOnboarding;
  document.getElementById('exportProfile').onclick=exportCurrentProfile;
  document.getElementById('deleteProfile').onclick=()=>{if(!confirm(`Delete ${activeProfile.name}'s profile and all of its locally saved information? This cannot be undone.`))return;localStorage.removeItem(profileDataKey(activeProfile.id));profileRegistry.items=profileRegistry.items.filter(item=>item.id!==activeProfile.id);profileRegistry.activeId=profileRegistry.items[0]?.id||null;saveRegistry();location.hash='#today';location.reload()};
  document.getElementById('shareLifeOS').onclick=async()=>{const shareData={title:'Life OS',text:'I have been using Life OS to live more intentionally. Create your own private version here:',url:location.origin};try{if(navigator.share)await navigator.share(shareData);else{await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);toast('Invitation link copied')}}catch(error){if(error.name!=='AbortError')toast('Copy this page link to share Life OS')}};
  if(!activeProfile)showOnboarding(false);
  window.addEventListener('hashchange',navigate);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
