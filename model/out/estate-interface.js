/* Investor interface. Move the existing controls: cost and scheme ownership stays
 * in viewer.html. No polling, render-loop work or independent financial engine. */
export function installEstateInterface() {
 const $=id=>document.getElementById(id), E=window.ESTATE;
 const author=new URLSearchParams(location.search).get('author')==='1';
 document.body.classList.add('estate-ui');document.body.classList.toggle('estate-author',author);
 const rail=$('rail'),scroll=$('railscroll'),header=rail.querySelector('header');
 rail.classList.add('min');document.body.classList.add('railmin');
 header.querySelector('h1').innerHTML='<span class="estate-kicker">HENLEY-ON-THAMES</span>Fawley Court';
 $('modelref').textContent=author?'Estate authoring · measured model':'Hotel conversion & residential proposal';
 // Retain the native totals nodes for their existing update handlers, off screen.
 $('totals').hidden=true;
 const nav=document.createElement('nav');nav.className='estate-tabs';nav.setAttribute('aria-label','Estate information');rail.insertBefore(nav,scroll);
 const panes={},buttons={};
 for(const [id,label] of [['explore','Estate'],['scheme','Scheme'],['selection','Building'],...(author?[['workbench','Authoring']]:[])]){
  const b=document.createElement('button');b.textContent=label;b.dataset.pane=id;b.setAttribute('aria-controls','estate-pane-'+id);nav.append(b);buttons[id]=b;
  const pane=document.createElement('section');pane.id='estate-pane-'+id;pane.className='estate-pane';pane.setAttribute('aria-label',label);panes[id]=pane;scroll.append(pane);b.onclick=()=>show(id);
 }
 const technical=document.createElement('div');technical.hidden=!author;
 const move=(id,target)=>target.append($(id).closest('.sect'));
 const intro=document.createElement('div');intro.className='estate-intro';
 intro.innerHTML='<p class="estate-kicker">THE PROPOSAL</p><h2>A house, its parkland.<br>A new chapter.</h2><p>A hotel conversion of Fawley Court, with courtyard accommodation, a new spa, river facilities and branded residences.</p><div class="estate-programme"><div><strong>Hotel</strong><span>Historic fabric & new accommodation</span></div><div><strong>Residences</strong><span>Twelve proposed private homes</span></div></div><p class="estate-hint">Select a building in the model to explore its use, area and investment.</p>';
 panes.explore.append(intro);move('views',panes.explore);
 const schemeIntro=document.createElement('div');schemeIntro.className='estate-intro';schemeIntro.innerHTML='<p class="estate-kicker">SHAPE THE SCHEME</p><h2>Consider the options.</h2><p>Explore the scope of the hotel and its amenities. Each decision updates the scope and its associated works costs.</p><p class="estate-hint">The twelve residences form part of the base scheme. Revenue-only options do not change works cost.</p>';panes.scheme.append(schemeIntro);
 move('switches',panes.scheme);move('smasssect',panes.scheme);
 $('smasssect').querySelector('h2').textContent='Courtyard design option';
 const massNote=document.createElement('p');massNote.className='estate-hint';massNote.textContent='Changes the courtyard form only; the works budget is unchanged.';$('smasssect').append(massNote);
 $('resetsw').textContent='Restore base scheme';
 const financialNote=document.createElement('p');financialNote.className='estate-hint';financialNote.textContent='Options use the registered v19 schedule. Historical one-at-a-time IRR deltas are not presented as a current return forecast.';panes.scheme.append(financialNote);
 for(const id of ['modes','themes','laysect','markbtn','demosect'])move(id,technical);
 technical.append($('variants'));if(author)panes.workbench.append(technical);else scroll.append(technical);
 if(!author)$('views').querySelector('[data-v="fly"]').hidden=true;
 const card=$('card');panes.selection.append(card);
 const empty=document.createElement('p');empty.className='estate-hint';empty.textContent='Select a building in the model to see its registered details.';panes.selection.prepend(empty);
 for(const pane of Object.values(panes))scroll.append(pane);
 const footer=document.createElement('footer');footer.className='estate-footer';
 const u=new URL(location.href);if(author)u.searchParams.delete('author');else u.searchParams.set('author','1');
 footer.innerHTML='<span>FAWLEY COURT · ESTATE STUDY</span>';const link=document.createElement('a');link.href=u.href;link.textContent=author?'Return to investor view':'Open authoring mode';footer.append(link);rail.append(footer);
 const min=$('railmin');min.textContent='+';min.title='Expand sidebar';min.setAttribute('aria-label','Open estate panel');min.addEventListener('click',()=>min.setAttribute('aria-label',rail.classList.contains('min')?'Open estate panel':'Collapse estate panel'));
 function show(id){
  for(const [key,pane] of Object.entries(panes))pane.hidden=key!==id;
  for(const [key,b] of Object.entries(buttons))b.setAttribute('aria-pressed',String(key===id));
  document.body.dataset.estatePane=id;scroll.scrollTop=0;
 }
 function groupSwitches(){
  const wrap=$('switches');
  const groups=[['Hotel & hospitality',['Sch_MainHouseWing','Sch_RidingMezzanine','Sch_DayMeetings','Sch_Club']],['Leisure & landscape',['Sch_RiverClub','Sch_LongWaterSwim','Sch_TennisPadel','Sch_SpaGarden','Sch_CourtyardPool','Sch_FloatingBar']],['Staff & operations',['Sch_StaffVillage','Sch_Gatehouses']]];
  const rows=[...wrap.querySelectorAll('.sw')];
  wrap.replaceChildren();
  for(const [title,ids] of groups){
   const group=document.createElement('section');group.className='estate-switch-group';const h=document.createElement('h3');h.textContent=title;group.append(h);
   for(const id of ids){
    const row=rows.find(r=>r.querySelector('input').dataset.sw===id);if(!row)continue;
    const spec=E.schemes.find(s=>s.switch===id),input=row.querySelector('input');input.setAttribute('aria-label',spec.label);
    row.removeAttribute('title');
    // Keep the native capex figure, remove only its obsolete IRR suffix.
    const detail=row.querySelector('.detail');detail.innerHTML=detail.innerHTML.split(' · flip ')[0].replace('moves <b>','<b>').replace('</b> of works','</b> works scope');
    const note=document.createElement('details');note.className='estate-switch-note';const summary=document.createElement('summary');summary.textContent='Scope & assumptions';const p=document.createElement('p');p.textContent=spec.what_it_moves;note.append(summary,p);row.append(note);group.append(row);
   }
   wrap.append(group);
  }
  const on=E.schemes.filter(s=>wrap.querySelector('input[data-sw="'+s.switch+'"]')?.checked).length;
  schemeIntro.querySelector('.estate-kicker').textContent=`CURRENT SCHEME · ${on} OF ${E.schemes.length} OPTIONS INCLUDED`;
 }
 function selection(el,reveal){
  empty.hidden=true;buttons.selection.textContent='Selected';
  const body=$('cBody');
  const summary=document.createElement('div');summary.className='estate-selection-summary';
  if(el.gia_m2||el.area_m2){const area=document.createElement('p');area.className='estate-area';area.textContent=Number(el.gia_m2||el.area_m2).toLocaleString('en-GB')+' m²';const label=document.createElement('span');label.textContent=el.gia_m2?'Registered gross internal area':'Recorded footprint area';area.append(label);summary.append(area);}
  const uses={
   'bldg.main-house':'The historic house forms the heart of the proposed hotel, with guest accommodation, dining and shared guest spaces.',
   'bldg.main-house-north-wing':'Existing service wing retained within the hotel estate.',
   'prop.south-wing-keys':'Additional hotel accommodation in the south connector wing.',
   'prop.north-courtyard':'New guest accommodation within the north courtyard scheme.',
   'prop.south-courtyard':'New guest accommodation within the south courtyard scheme.',
   'bldg.south-courtyard-ranges':'Retained courtyard fabric converted to guest accommodation.',
   'bldg.riding-school':'The Riding School provides food and beverage facilities for the hotel.',
   'prop.spa-building':'A new spa building serving the hotel wellness programme.',
   'prop.river-club':'Riverside hospitality and outdoor guest spaces on the Thames frontage.',
   'prop.residences':'Twelve proposed branded residences with private outdoor spaces.',
   'prop.staff-village':'Staff accommodation supporting operation of the hotel.',
   'prop.gatehouses':'Gatehouse and lodge extensions for staff accommodation.'
  };
  if(uses[el.id]){const p=document.createElement('p');p.textContent=uses[el.id];summary.append(p);}
  body.prepend(summary);
  const table=body.querySelector('table');if(table){const d=document.createElement('details');d.className='estate-disclosure';d.innerHTML='<summary>Works cost breakdown</summary>';table.before(d);d.append(table);}
  const notes=[...body.querySelectorAll('.note,.qtr')];if(notes.length||el.gia_note){const d=document.createElement('details');d.className='estate-disclosure';d.innerHTML='<summary>Design basis & programme</summary>';if(el.gia_note){const p=document.createElement('p');p.textContent=el.gia_note;d.append(p);}d.append(...notes);body.append(d);}
  if(!body.querySelector('.cost')){const p=document.createElement('p');p.className='estate-hint';p.textContent='No direct works allocation on this element. See the basis for any costs carried elsewhere.';body.append(p);}
  if(!author)body.querySelector('.demo')?.remove();
  if(el.switch){const chip=$('cChips').querySelector('.swon,.swoff');if(chip)chip.textContent=(E.schemes.find(s=>s.switch===el.switch)?.label||'Scheme option')+' · '+(window.__fcm.switches()[el.switch]?'included':'excluded');}
  if(reveal){show('selection');rail.classList.remove('min');document.body.classList.remove('railmin');}
 }
 document.addEventListener('estate:schemes',groupSwitches);
 document.addEventListener('estate:selection',e=>selection(e.detail.element,e.detail.reveal));
 document.addEventListener('estate:selection-cleared',()=>{empty.hidden=false;buttons.selection.textContent='Building';if(document.body.dataset.estatePane==='selection')show('explore');});
 $('cClose').setAttribute('aria-label','Close building details');$('cClose').addEventListener('click',()=>{empty.hidden=false;buttons.selection.textContent='Building';show('explore');});
 groupSwitches();show('explore');
}
