(()=>{
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const isTextField=el=>el&&(el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&(!el.type||['text','search','email','url','tel'].includes(el.type))));
  const labelFor=el=>{
    if(el.dataset.voiceLabel)return el.dataset.voiceLabel;
    if(el.id){const l=document.querySelector(`label[for="${CSS.escape(el.id)}"]`);if(l)return l.textContent.trim()}
    const wrap=el.closest('label,.next-field');const l=wrap?.querySelector('label');
    return l?.textContent.trim()||el.placeholder||'this field';
  };
  function decorate(root=document){
    if(!SpeechRecognition)return;
    root.querySelectorAll('textarea,input').forEach(el=>{
      if(!isTextField(el)||el.disabled||el.readOnly||el.dataset.voiceReady)return;
      el.dataset.voiceReady='1';
      const b=document.createElement('button');b.type='button';b.className='voice-button universal-voice-button';b.dataset.voiceTarget=el.id||'';b.setAttribute('aria-label',`Dictate ${labelFor(el)}`);b.title=`Dictate ${labelFor(el)}`;b.innerHTML='<span aria-hidden="true">🎙</span><span class="voice-label">Speak</span>';
      if(!el.id)el.id=`voice-field-${Math.random().toString(36).slice(2,9)}`;b.dataset.voiceTarget=el.id;
      el.insertAdjacentElement('afterend',b);
    });
  }
  function speak(button){
    const el=document.getElementById(button.dataset.voiceTarget);if(!el)return;
    if(!SpeechRecognition){alert('Voice input is not supported by this browser.');return}
    const recognition=new SpeechRecognition();recognition.lang=document.documentElement.lang||'en-GB';recognition.interimResults=false;recognition.continuous=false;
    button.classList.add('listening');button.querySelector('.voice-label').textContent='Listening…';
    recognition.onresult=e=>{const text=Array.from(e.results).map(r=>r[0].transcript).join(' ').trim();if(!text)return;const spacer=el.value&& !/\s$/.test(el.value)?' ':'';el.value=`${el.value||''}${spacer}${text}`;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
    recognition.onerror=e=>{if(e.error!=='aborted')console.warn('Life OS voice input:',e.error)};
    recognition.onend=()=>{button.classList.remove('listening');const s=button.querySelector('.voice-label');if(s)s.textContent='Speak'};
    try{recognition.start()}catch(e){console.warn('Life OS voice input could not start',e)}
  }
  document.addEventListener('click',e=>{const b=e.target.closest('.universal-voice-button');if(b){e.preventDefault();speak(b)}});
  const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)decorate(n.matches?.('input,textarea')?n.parentElement:n)})));
  function init(){decorate();observer.observe(document.body,{childList:true,subtree:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
