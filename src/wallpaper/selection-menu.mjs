function installSelectionMenu() {
  const KEY='gpt-gemini-guarder-selection';
  window.__gptGuarderSelectionCleanup?.();
  document.getElementById(KEY)?.remove();
  const host=document.createElement('div'); host.id=KEY;
  const shadow=host.attachShadow({mode:'open'});
  shadow.innerHTML=`<style>
    :host{all:initial}.menu{position:fixed;z-index:2147483600;display:flex;gap:6px;padding:6px;border:1px solid #ffffff70;border-radius:14px;background:#17233cf2;box-shadow:0 14px 40px #0005;backdrop-filter:blur(18px);font:13px 'Microsoft YaHei UI',system-ui;color:#fff}
    .menu[hidden]{display:none}.menu button{border:0;border-radius:9px;padding:9px 12px;background:#ffffff20;color:#fff;cursor:pointer;white-space:nowrap}.menu button:hover{background:#8b73e0}.menu button.primary{background:linear-gradient(125deg,#366fe8,#8d5bdb)}
    .message{position:fixed;z-index:2147483601;right:20px;bottom:86px;max-width:350px;border-radius:10px;padding:9px 13px;background:#17233cf2;color:#fff;font:13px system-ui}.message[hidden]{display:none}
  </style><div class="menu" hidden><button class="primary" data-action="translate">✦ 划词翻译</button><button data-action="save">＋ 加入生词本</button><button data-action="copy">复制</button><button data-action="google">Google 搜索</button></div><div class="message" hidden></div>`;
  const menu=shadow.querySelector('.menu'), message=shadow.querySelector('.message');
  let selected='',nextId=500000000;
  const pending=new Map();
  const previous=window.__gptDaddyControlResponse;
  const abort=new AbortController();
  const responder=(id,value,error)=>{
    const slot=pending.get(id);
    if(!slot){previous?.(id,value,error);return}
    pending.delete(id);clearTimeout(slot.timer);
    if(error)slot.reject(new Error(error));else slot.resolve(value);
  };
  window.__gptGuarderSelectionCleanup=()=>{abort.abort();host.remove();if(window.__gptDaddyControlResponse===responder)window.__gptDaddyControlResponse=previous;delete window.__gptGuarderSelectionCleanup};
  window.__gptDaddyControlResponse=responder;
  function request(action,payload) {
    return new Promise((resolve,reject)=>{
      if(typeof window.__gptDaddyDesktopControl!=='function'){reject(new Error('本地控制通道未连接'));return}
      const id=nextId++;
      const timer=setTimeout(()=>{pending.delete(id);reject(new Error('操作超时'))},30000);
      pending.set(id,{resolve,reject,timer});
      window.__gptDaddyDesktopControl(JSON.stringify({id,action,payload}));
    });
  }
  function notice(text){message.textContent=text;message.hidden=false;setTimeout(()=>message.hidden=true,4500)}
  function show(x,y,text){
    selected=text.trim().slice(0,1500);if(!selected){menu.hidden=true;return}
    menu.hidden=false;menu.style.left=Math.max(8,Math.min(window.innerWidth-menu.offsetWidth-8,x))+'px';
    menu.style.top=Math.max(8,Math.min(window.innerHeight-menu.offsetHeight-8,y))+'px';
  }
  document.addEventListener('mouseup',e=>{
    if(host.contains(e.target))return;
    const text=window.getSelection()?.toString().trim();
    if(text) setTimeout(()=>show(e.clientX+8,e.clientY+8,text),40); else menu.hidden=true;
  },{capture:true,signal:abort.signal});
  document.addEventListener('contextmenu',e=>{
    const text=window.getSelection()?.toString().trim();
    if(!text)return;
    e.preventDefault();show(e.clientX,e.clientY,text);
  },{capture:true,signal:abort.signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.hidden=true},{capture:true,signal:abort.signal});
  shadow.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{
    const action=button.dataset.action,text=selected;menu.hidden=true;
    try{
      if(action==='translate'){await request('translateSelection',{text});notice('翻译请求已发送到当前对话');}
      if(action==='save'){const saved=await request('vocabSave',{text});notice('已加入本地生词本：'+saved.source_text);}
      if(action==='copy'){await navigator.clipboard.writeText(text);notice('已复制');}
      if(action==='google')window.open('https://www.google.com/search?q='+encodeURIComponent(text),'_blank','noopener');
    }catch(error){notice(error.message)}
  }));
  document.body.append(host);
  return true;
}
export function buildSelectionScript(){return `(${installSelectionMenu.toString()})()`}
