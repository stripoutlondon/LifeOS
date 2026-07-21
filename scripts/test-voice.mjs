import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

let lastRecognition;
const recognitions=[];
class MockRecognition {
  constructor(){lastRecognition=this;recognitions.push(this)}
  start(){this.started=true}
  stop(){this.stopped=true}
  abort(){this.aborted=true}
}

const toastElement={textContent:'',classList:{add(){},remove(){}}};
const context={
  console,structuredClone,crypto:globalThis.crypto,setTimeout,clearTimeout,Event:class {},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{hash:'',origin:'http://localhost'},navigator:{},confirm(){return true},
  document:{hidden:false,addEventListener(){},querySelector(){return null},getElementById(){return toastElement}},
  window:{SpeechRecognition:MockRecognition,addEventListener(){}}
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(await readFile('app.js','utf8'),context);

const label={textContent:'Speak'};
const classes=new Set();
const button={
  dataset:{},title:'',
  classList:{toggle(name,on){on?classes.add(name):classes.delete(name)}},
  querySelector(){return label},
  getAttribute(){return 'Dictate test field'},
  setAttribute(name,value){this[name]=value},
  removeAttribute(name){delete this[name]}
};
const field={value:'',focus(){this.focused=true},dispatchEvent(){}};

context.startVoiceInput(field,button);
assert.equal(lastRecognition.started,true);
const firstRecognition=lastRecognition;
assert.equal(label.textContent,'Stop');
assert.equal(button['aria-label'],'Stop voice input');
assert.equal(classes.has('listening'),true);

context.startVoiceInput(field,button);
assert.equal(lastRecognition.stopped,true);
assert.equal(label.textContent,'Speak');
assert.equal(button['aria-label'],'Dictate test field');
assert.equal(classes.has('listening'),false);

context.startVoiceInput(field,button);
assert.equal(label.textContent,'Stop');
firstRecognition.onend();
assert.equal(label.textContent,'Stop','A delayed end event from an old session must not stop a new session');
context.startVoiceInput(field,button);
assert.equal(recognitions.length,2);
assert.equal(label.textContent,'Speak');

console.log('Voice controls passed: Speak changes to Stop and the second tap safely ends recognition.');
