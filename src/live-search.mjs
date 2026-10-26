// Keep one worker request in flight and replace queued work with the latest input.
export function createLatestSearchQueue({send,onResult}){
  let sequence=0,running=null,pending=null;
  function pump(){if(!running&&pending){running=pending;pending=null;send(running);}}
  return {
    submit(payload){pending={...payload,id:++sequence};pump();},
    invalidate(){sequence++;pending=null;},
    receive(result){
      if(result.id!==running?.id)return;
      running=null;
      if(result.id===sequence)onResult(result);
      pump();
    },
    reset(){sequence++;running=null;pending=null;}
  };
}

export function createDebouncedSearch({run,delay=220,setTimer=setTimeout,clearTimer=clearTimeout}){
  let timer=null;
  function cancel(){if(timer!==null)clearTimer(timer);timer=null;}
  return {
    cancel,
    schedule(){cancel();timer=setTimer(()=>{timer=null;run();},delay);}
  };
}
