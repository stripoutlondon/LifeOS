(()=>{
  async function connect(){
    if(!window.LifeOSCloud?.configured){alert('Life OS Cloud is not configured on this deployment yet.');return}
    const account=await window.LifeOSCloud.current().catch(()=>null);
    if(account?.session){alert(`Already signed in as ${account.session.user.email}.`);return}
    const email=window.prompt('Enter your email address to connect Life OS Cloud. We will send you a secure sign-in link.');
    if(!email?.trim())return;
    const value=email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){alert('Please enter a valid email address.');return}
    try{
      await window.LifeOSCloud.signIn(value);
      alert(`Secure sign-in link sent to ${value}. Open the email on this device and tap the link, then return to Life OS.`);
    }catch(error){console.error('Life OS cloud sign-in',error);alert(error?.message||'Could not start cloud sign-in. Please try again.')}
  }
  function install(){
    const button=document.getElementById('cloudConnect');
    if(!button)return;
    const replacement=button.cloneNode(true);
    button.replaceWith(replacement);
    replacement.addEventListener('click',connect);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,150));else setTimeout(install,150);
})();