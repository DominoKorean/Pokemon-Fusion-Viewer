// An edit transaction spans all valid keystrokes in one numeric field.
export function createComparison(){
  let previous=null,pinned=null,edit=null,source=null;
  const copy=value=>value?structuredClone(value):null;
  return {
    begin(key,snapshot){if(edit?.key!==key)edit={key,snapshot:copy(snapshot),changed:false};},
    change(snapshot,key=null){
      source=key;
      if(key&&edit?.key===key){if(!edit.changed){previous=edit.snapshot;edit.changed=true;}}
      else{previous=copy(snapshot);edit=null;}
    },
    end(key){if(edit?.key===key)edit=null;},
    pin(snapshot){pinned=copy(snapshot);},
    unpin(){pinned=null;},
    isPinned:()=>pinned!==null,
    baseline:()=>pinned||previous,
    reset(){previous=null;pinned=null;edit=null;source=null;},
    view({mode,current,natureBaseline}){
      const empty={kind:'none',baseline:null,deltas:current.actual.map(()=>0)};
      if(mode!=='actual')return empty;
      const samePair=snapshot=>snapshot&&snapshot.pair===current.pair;
      let baseline,kind;
      if(samePair(pinned)){baseline=pinned;kind='pinned';}
      else if(!samePair(previous))return empty;
      else if(source==='nature'&&samePair(natureBaseline)){baseline=natureBaseline;kind='nature';}
      else{baseline=previous;kind='previous';}
      return {kind,baseline,deltas:current.actual.map((value,i)=>value-baseline.actual[i])};
    }
  };
}
