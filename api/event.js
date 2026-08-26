const ALLOWED = new Set([
  "viewer_profiled","impact_generated","proof_opened","assumption_corrected",
  "artifact_submitted","artifact_completed","next_action_selected",
  "referral_arrival","referral_shared","referral_first_value","second_artifact_submitted"
]);
function clean(v,max=120){return typeof v==="string"?v.slice(0,max):"";}
module.exports = async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"POST required."});
  const e=req.body||{};
  if(!ALLOWED.has(e.name)) return res.status(204).end();
  const safe={name:e.name,at:clean(e.at,40),session_id:clean(e.session_id,80),role_family:clean(e.role_family,40),intent:clean(e.intent,40),artifact_type:clean(e.artifact_type,40),ref:clean(e.ref,80),action:clean(e.action,80),proof_id:clean(e.proof_id,100)};
  console.log(JSON.stringify({type:"impact_lens_event",...safe}));
  return res.status(204).end();
};