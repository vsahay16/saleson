/* Internal follow-up rules, not churn prediction. Keep snapshots out of marketing analytics. */
export function assessCustomerHealth(snapshot,{now=Date.now(),setupGraceDays=3,inactiveDays=7}={}){
 const insufficient=()=>({status:'insufficient_data',reasons:[]});
 if(!snapshot||snapshot.snapshotComplete!==true||!Number.isFinite(now)||!Number.isFinite(setupGraceDays)||setupGraceDays<0||!Number.isFinite(inactiveDays)||inactiveDays<=0)return insufficient();
 const names=['createdAt','firstProductAt','firstSalespersonInviteAt','firstOrderAt','lastCoreActivityAt'];
 const times={};
 for(const key of names){if(!Object.hasOwn(snapshot,key))return insufficient();const v=snapshot[key];if(v===null&&key!=='createdAt'){times[key]=null;continue;}if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||Date.parse(v)>now)return insufficient();times[key]=Date.parse(v);}
 if(names.slice(1).some(k=>times[k]!==null&&times[k]<times.createdAt))return insufficient();
 const day=86400000,age=(now-times.createdAt)/day,reasons=[];
 if(age>=setupGraceDays){if(times.firstProductAt===null)reasons.push('products_not_added');if(times.firstSalespersonInviteAt===null)reasons.push('salesperson_not_invited');if(times.firstOrderAt===null)reasons.push('first_order_not_completed');}
 if(times.firstOrderAt!==null){
  if(times.lastCoreActivityAt===null||times.lastCoreActivityAt<times.firstOrderAt)return insufficient();
  if((now-times.lastCoreActivityAt)/day>=inactiveDays)reasons.push('no_recent_core_activity');
  const baseline=snapshot.prior28ActiveDays,recent=snapshot.recent7ActiveDays;
  if(baseline!==undefined||recent!==undefined){if(!Number.isInteger(baseline)||baseline<0||baseline>28||!Number.isInteger(recent)||recent<0||recent>7)return insufficient();if(age>=35&&baseline>=8&&recent<(baseline/4)*.5)reasons.push('activity_below_own_baseline');}
 }
 return {status:reasons.length?'follow_up':'no_flag',reasons};
}
