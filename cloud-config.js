// The publishable Supabase key is intentionally safe for browser and app clients when RLS is enabled.
// Never place a secret key or service-role key here.
window.LIFE_OS_CLOUD = {
  url: 'https://yxsaxbtnvgspxsvydmxd.supabase.co',
  publishableKey: 'sb_publishable_qdZMp4Px6GfA9ngo1JMx_w_V7fjigMA'
};

// Life OS operating-system extension. Loaded independently so the established
// profile/goals/journal application remains backward-compatible and rollbackable.
(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='lifeos-next.css';document.head.appendChild(css);
  const script=document.createElement('script');script.src='lifeos-next.js';script.defer=true;document.head.appendChild(script);
})();
