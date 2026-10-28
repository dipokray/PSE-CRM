export type F={k:string;l:string;t:'text'|'number'|'date'|'datetime-local'|'textarea'|'select'|'user'|'contact';o?:string[];req?:boolean;when?:(f:any)=>boolean}
export type Mod={title:string;table:string;fields:F[];defaults?:any;cols:string[]}
const KIND=['individual','company'], CUR=['BDT','USD','EUR','GBP']
export const contacts:Mod={title:'Contacts',table:'contacts',cols:['kind','name','email','phone','organization'],defaults:{kind:'individual'},fields:[
{k:'kind',l:'Individual / Company',t:'select',o:KIND,req:true},{k:'name',l:'Contact name',t:'text',req:true},
{k:'email',l:'Email address',t:'text'},{k:'phone',l:'Phone number',t:'text'},
{k:'designation',l:'Designation',t:'text',when:f=>f.kind==='individual'},{k:'organization',l:'Organization',t:'text',when:f=>f.kind==='individual'},
{k:'website',l:'Website',t:'text',when:f=>f.kind==='company'},{k:'industry',l:'Industry',t:'text',when:f=>f.kind==='company'},{k:'notes',l:'Notes',t:'textarea'}]}
export const pipelines:Mod={title:'Pipelines',table:'pipelines',cols:['deal_name','kind','category','stage','expected_fund','currency','expected_closing'],defaults:{kind:'individual',stage:'New',currency:'BDT'},fields:[
{k:'deal_name',l:'Deal name',t:'text',req:true},{k:'focal_person',l:'Focal person (employee)',t:'user'},
{k:'contribution_type',l:'Contribution type',t:'select',o:['cash','in_kind'],req:true},
{k:'category',l:'Contribution category',t:'select',o:['DSP','SAC','Disaster Campaign','Project','Event & Campaign','General'],req:true},
{k:'vertical',l:'Target vertical',t:'select',o:['DSP','VBD','Project']},
{k:'kind',l:'Individual / Company',t:'select',o:KIND,req:true},
{k:'company_name',l:'Company name',t:'text',when:f=>f.kind==='company'},{k:'website',l:'Website',t:'text',when:f=>f.kind==='company'},
{k:'contact_id',l:'Contact name / Point of contact',t:'contact',req:true},
{k:'secondary_contact_id',l:'Secondary contact',t:'contact',when:f=>f.kind==='company'},
{k:'stage',l:'Stage',t:'select',o:['New','Scoping','Preparation','Submitted','Pending','Won','Lost','Abandoned'],req:true},
{k:'expected_fund',l:'Budgeted / expected fund',t:'number',req:true},{k:'confirmed_amount',l:'Confirmed amount (achievement)',t:'number'},
{k:'currency',l:'Currency',t:'select',o:CUR},{k:'payment_interval',l:'Payment interval',t:'select',o:['One-time','Monthly','Quarterly','Half-yearly','Yearly']},
{k:'expected_closing',l:'Expected closing',t:'date'},{k:'won_at',l:'Won / realized date',t:'date'},{k:'country',l:'Country',t:'text'},
{k:'description',l:'Description',t:'textarea'},{k:'operational_budget',l:'Operational budget (optional)',t:'number'},{k:'notes',l:'Notes & Google Drive links',t:'textarea'}]}
export const meetings:Mod={title:'Meetings',table:'meetings',cols:['organization','meeting_at','status','description'],defaults:{status:'Scheduled'},fields:[
{k:'contact_id',l:'Point of contact',t:'contact',req:true},{k:'pipeline_id',l:'Linked pipeline ID (optional)',t:'text'},
{k:'organization',l:'Organization (optional)',t:'text'},{k:'designation',l:'Designation (optional)',t:'text'},
{k:'meeting_at',l:'Meeting date and time',t:'datetime-local',req:true},{k:'status',l:'Scheduled / Done',t:'select',o:['Scheduled','Done']},{k:'description',l:'Description',t:'textarea'}]}
export const activities:Mod={title:'Activities',table:'activities',cols:['type','class','related_name','status','occurred_at'],defaults:{type:'task',class:'independent',status:'Open'},fields:[
{k:'type',l:'Type',t:'select',o:['task','email','call','meeting','event','campaign','proposal','visit','donor_servicing','potential_donor_engagement','general'],req:true},
{k:'class',l:'Work kind',t:'select',o:['stewardship','potential_donor','independent'],req:true},
{k:'related_name',l:'Related person / organization',t:'text'},{k:'contact_id',l:'Contact (optional)',t:'contact'},
{k:'pipeline_id',l:'Linked pipeline ID (optional)',t:'text'},{k:'meeting_id',l:'Linked meeting ID (optional)',t:'text'},
{k:'status',l:'Status',t:'select',o:['Open','Done']},{k:'occurred_at',l:'Date and time',t:'datetime-local'},{k:'notes',l:'Notes / context',t:'textarea'}]}
