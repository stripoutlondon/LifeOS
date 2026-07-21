(() => {
  const capacitor = window.Capacitor;
  const isNative = Boolean(capacitor?.isNativePlatform?.());
  document.documentElement.classList.toggle('native-app',isNative);
  if(!isNative)return;

  const haptics = capacitor.Plugins?.Haptics;
  document.addEventListener('change',event=>{
    if(event.target.matches('.custom-check'))haptics?.impact?.({style:'LIGHT'}).catch(()=>{});
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('.primary-button,.profile-switch,.bottom-nav a'))haptics?.impact?.({style:'LIGHT'}).catch(()=>{});
  });

  window.LifeOSNative = {
    isNative:true,
    async scheduleDailyReminder(hour=6,minute=0){
      const notifications=capacitor.Plugins?.LocalNotifications;if(!notifications)return false;
      const permission=await notifications.requestPermissions();if(permission.display!=='granted')return false;
      await notifications.cancel({notifications:[{id:1001}]});
      await notifications.schedule({notifications:[{id:1001,title:'Life OS',body:'Set your intention, protect your energy and choose today’s top three.',schedule:{on:{hour,minute},repeats:true},sound:null,smallIcon:'ic_stat_icon_config_sample'}]});
      return true;
    }
  };
})();
