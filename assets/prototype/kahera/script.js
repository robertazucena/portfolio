/* Kahera — store system for sari-sari stores */
(function(){try{var th=localStorage.getItem('suki:theme');if(th)document.documentElement.dataset.theme=th;var tl=(localStorage.getItem('suki:lang')||'tl')==='tl';var m=tl?['Binubuksan ang tindahan…','Inaayos ang estante…','Binibilang ang sukli…']:['Opening the store…','Stocking the shelves…','Counting the sukli…'];document.querySelectorAll('#pre .pre-msg span').forEach(function(e,i){e.textContent=m[i]});document.getElementById('pre').setAttribute('aria-label',tl?'Binubuksan ang Kahera':'Loading Kahera')}catch(e){}})();

(function(){
"use strict";
/* ================= Utilities ================= */
const $=s=>document.querySelector(s);
const DAY=864e5;
const PLANS={
  trial:{id:'trial',name:'Free trial',price:0,days:14,per:'',note:'14 days to try everything'},
  monthly:{id:'monthly',name:'Monthly',price:249,days:30,per:'/month',note:'Billed every 30 days'},
  yearly:{id:'yearly',name:'Yearly',price:2490,days:365,per:'/year',note:'Two months free'}
};
const METHODS={gcash:{name:'GCash',sub:'Pay with your GCash number'},maya:{name:'Maya',sub:'Pay with your Maya wallet'},card:{name:'Card',sub:'Visa or Mastercard'}};
const UNITS=['pc','pack','sachet','bottle','can','cup','bar','kg','box'];
const peso=n=>'₱'+(Math.round((+n||0)*100)/100).toLocaleString(LOC(),{minimumFractionDigits:2,maximumFractionDigits:2});
const pesoR=n=>'₱'+Math.round(+n||0).toLocaleString(LOC());
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const pad=n=>String(n).padStart(2,'0');
const dayKey=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const fmtDate=t=>new Date(t).toLocaleDateString(LOC(),{month:'short',day:'numeric',year:'numeric'});
const fmtTime=t=>new Date(t).toLocaleTimeString(LOC(),{hour:'numeric',minute:'2-digit'});
const fmtDT=t=>new Date(t).toLocaleDateString(LOC(),{month:'short',day:'numeric'})+', '+fmtTime(t);
const num=v=>{const n=parseFloat(String(v).replace(/[^0-9.\-]/g,''));return isFinite(n)?n:0};
const newCode=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let c;do{c='KH-';for(let i=0;i<4;i++)c+=a[Math.floor(Math.random()*a.length)]}while(S.platform&&S.platform.stores.some(s=>s.code===c));return c};
const newPin=()=>String(Math.floor(1000+Math.random()*9000));
const val=id=>{const el=document.getElementById(id);return el?el.value.trim():''};

const I={
  sell:'<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  truck:'<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart:'<path d="M4 20V11M10 20V5M16 20v-7M2 20h20"/>',
  gear:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  out:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  store:'<path d="M3 9l1.5-5h15L21 9M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v7h14v-7M10 20v-4h4v4"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  check:'<path d="m5 12 5 5 9-10"/>', alert:'<path d="M12 4 2 20h20zM12 10v4M12 17v.5"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>', bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  back:'<path d="M15 6l-6 6 6 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  bag:'<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>', receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>'
};
const ico=(n,s=20)=>`<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]||''}</svg>`;
const LOGO_SVG=`<svg class="logo" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="slg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7389F4"/><stop offset="1" stop-color="#3A4BCB"/></linearGradient><linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#slg)"/><rect width="32" height="32" rx="9" fill="url(#shine)"/><path d="M12.1 8.4v15.2M21.7 8.8l-7.3 7 7.5 7.3" fill="none" stroke="#fff" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.1 11.6h6.4M8.1 15.1h6.4" stroke="#FFC76B" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const logoMark=(sz=30)=>LOGO_SVG.replace(/width="30" height="30"/,`width="${sz}" height="${sz}"`);
const logo=()=>`<div class="brand">${logoMark()}<span>Kahera</span></div>`;
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches};
const langBtn=()=>`<button class="langbtn" data-act="lang" data-notl aria-label="${S.lang==='tl'?'Switch to English':'Lumipat sa Tagalog'}"><span class="${S.lang==='tl'?'on':''}">TL</span><span class="${S.lang==='en'?'on':''}">EN</span></button>`;
const themeOnly=()=>`<button class="iconbtn" data-act="theme" aria-label="Switch to ${isDark()?'light':'dark'} mode" title="Switch to ${isDark()?'light':'dark'} mode">${ico(isDark()?'sun':'moon',19)}</button>`;
const themeBtn=()=>themeOnly();
try{const th=localStorage.getItem('suki:theme');if(th)document.documentElement.dataset.theme=th}catch(e){}
Object.assign(I,{
  arw:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  spark:'<path d="M12 3c.6 4.6 3.4 7.4 9 9-5.6 1.6-8.4 4.4-9 9-.6-4.6-3.4-7.4-9-9 5.6-1.6 8.4-4.4 9-9z" fill="currentColor" stroke="none"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  hook:'<path d="M6 4v8a3 3 0 0 0 3 3h10M15 11l4 4-4 4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet:'<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1zM4 7l11-3v3M16 13h1"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20h4"/>',
  gearc:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  c_noodles:'<path d="M3 11h18a9 9 0 0 1-18 0zM8 3l2 8M12 2l1 9M16 3l-1 8"/>',
  c_drinks:'<path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3zM8 13h8"/>',
  c_coffee:'<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3"/>',
  c_milk:'<path d="M8 2h8v3l2 4v13H6V9l2-4zM6 9h12M10 14h4"/>',
  c_staples:'<path d="M8 3h8l-1.5 3.5C18 8.5 20 12 20 15a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6c0-3 2-6.5 5.5-8.5zM9.5 6.5h5"/>',
  c_canned:'<ellipse cx="12" cy="5" rx="6" ry="2"/><path d="M6 5v14c0 1.1 2.7 2 6 2s6-.9 6-2V5M6 10c0 1.1 2.7 2 6 2s6-.9 6-2"/>',
  c_snacks:'<circle cx="12" cy="12" r="9"/><path d="M9 8.5h.01M15 9.5h.01M9.5 15h.01M15 15h.01M12 12h.01" stroke-width="2.6"/>',
  c_toiletries:'<path d="M8.5 10h7l1 3v8h-9v-8zM12 10V5h4M10 5h2M10.5 15h3"/>',
  c_household:'<path d="M7 9h7v12H7zM7 9l1.5-5h4L14 9M14 5.5h3l2 1.5M10.5 13v4"/>',
  c_eggs:'<path d="M12 3c3.5 0 6.5 5 6.5 9.5a6.5 6.5 0 0 1-13 0C5.5 8 8.5 3 12 3z"/>',
  c_bread:'<path d="M5 11a4 4 0 0 1 1-8h12a4 4 0 0 1 1 8v10H5zM9 11v6M15 11v6"/>',
  c_candy:'<circle cx="12" cy="12" r="4"/><path d="M8.5 10 3 7v10l5.5-3M15.5 10 21 7v10l-5.5-3"/>',
  c_frozen:'<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/>',
  c_load:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  c_cond:'<path d="M10 2h4v3l1.5 2v14h-7V7L10 5zM8.5 11h7"/><path d="M12 14.5c-1 1.3-1.5 2-1.5 2.7a1.5 1.5 0 0 0 3 0c0-.7-.5-1.4-1.5-2.7z"/>',
  c_misc:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="3.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="3.5"/><path d="M17 13.5v7M13.5 17h7"/>'
});
const CATS={pansit:'c_noodles',inumin:'c_drinks',kape:'c_coffee',gatas:'c_milk',sitsirya:'c_snacks',kendi:'c_candy',tinapay:'c_bread','de-lata':'c_canned',delata:'c_canned',pangunahin:'c_staples',bigas:'c_staples',sawsawan:'c_cond',malamig:'c_frozen',yelo:'c_frozen',panligo:'c_toiletries',panlinis:'c_household',ibapa:'c_misc',itlog:'c_eggs',candy:'c_candy',candies:'c_candy',sweets:'c_candy',chocolate:'c_candy',condiments:'c_cond',condiment:'c_cond',sauce:'c_cond',sauces:'c_cond',ice:'c_frozen',others:'c_misc',other:'c_misc',misc:'c_misc',noodles:'c_noodles',drinks:'c_drinks',softdrinks:'c_drinks',coffee:'c_coffee',milk:'c_milk',staples:'c_staples',rice:'c_staples',canned:'c_canned',snacks:'c_snacks',biscuits:'c_snacks',toiletries:'c_toiletries',household:'c_household',cleaning:'c_household',eggs:'c_eggs',bread:'c_bread',bakery:'c_bread',candy:'c_candy',frozen:'c_frozen',load:'c_load'};
const catMeta=c=>{const k=(c||'').toLowerCase().replace(/\s+/g,'');const m=CATS[k]||(Object.entries(CATS).find(([n])=>k.includes(n))||[])[1]||'bag';return{i:m}};
const thumb=c=>`<span class="thumb" aria-hidden="true">${ico(catMeta(c).i,19)}</span>`;
const pthumb=p=>{if(!p)return thumb('');const src=(p.id&&S.imgs[p.id])||(!p.imgOff&&p.name?genImg(p):'');return src?`<span class="thumb ph" aria-hidden="true"><img src="${src}" alt=""></span>`:thumb(p.cat)};
function fileToThumb(file,size=200){return new Promise((res,rej)=>{if(!file||!/^image\//.test(file.type))return rej(new Error('type'));const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=size;const m=Math.min(img.naturalWidth,img.naturalHeight);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.drawImage(img,(img.naturalWidth-m)/2,(img.naturalHeight-m)/2,m,m,0,0,size,size);res(c.toDataURL('image/jpeg',.74))}catch(e){rej(e)}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('decode'))};img.src=url})}
const arw=()=>ico('arw',18).replace('class="ico"','class="ico arw"');
/* Synthetic portraits (SFHQ dataset, MIT licence): generated faces, not real people */
const FACES={"AN": "data:image/jpeg;base64,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", "MJ": "data:image/jpeg;base64,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", "RS": "data:image/jpeg;base64,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", "LB": "data:image/jpeg;base64,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"};
/* Sample product photos (illustrated, generic packaging) used for the common sari-sari items */
const SAMPLE_IMG={"Lucky Me Pancit Canton Original": "data:image/jpeg;base64,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", "Lucky Me Beef Mami": "data:image/jpeg;base64,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", "Nissin Cup Noodles Seafood": "data:image/jpeg;base64,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", "Coke Mismo 295ml": "data:image/jpeg;base64,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", "Royal Tru-Orange 1L": "data:image/jpeg;base64,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", "Kopiko Brown 3-in-1": "data:image/jpeg;base64,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", "Great Taste White 3-in-1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEFAgMEBgf/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAQIDBAX/2gAMAwEAAhADEAAAAfoYyuAAAAAAAAAAAAQJQJQJQJQJQJQJQJQJQJQJQJQCBKBKBOvPnrPHtqNnNtbbvM5HqcvKpj1Tzudov1HutFs4O7SkoWiUCUAEgAOfo46TwbtO3m01Zeb7q2tsK/ZDrx5emJxdQi54+zrxDWoAECAACvsKvO2nLHThegi431v5W2uohQcXqeMs2MxFh08/R2YheAAIAAAqLekyvlq26cL45uis6OK0SqMrBWZQLbbjl3c4SAAgQAAUN5Q46btOzXjdn18V5zz4ca27WjdSJnHZEXI7+cAACAAAaqW2qufWdmjqpPoR6XKBoq7Li5ta3fzdfHvaDu5wAAICQAOKv7OLm14unxfoKz6vdRkeh2eaXi08xY/Pa2+jd1dZ0nvHbgAAAQJQJQKrjtePm1qunNjfE10nbOuE7Y1ZmdtS3O2fah2YygSgSgEISgSgRo6MJV+ix1zFfjYQcEd8xNfNhlSa+yy2meULRKBKBKAQJQJQJQAISISISEwJQJQJQJQAAAAAAAAAAAAAP//EAC0QAAEDAgQFAwQDAQAAAAAAAAIAAQMEERITMDMQFCAhQQUxMiIjQEI0Q1Bg/9oACAEBAAEFAv8AqzLAHO92rI3TVcLppo3V2f8AEn7wYCuwOydnYLtja12ImDNkYmqZk1ZJbnHvFVDKerPtMvHDCyywWUKylk9ssr0kbjLq1HwFOnr5Bp+d+7zw8mVbEBjX0xO1REXGDWqUKdDRyZ8EMgUklNgpaf6vVKMRIqKJz4wfHVqdwVMeCPPEVmjhTWTRAIjQ04ScIdvVn3mRsxLAJPkA4HCJwy0TOLwTYhacZOEe3qyd5vDpl/SftLudA/HV9z8LEyzRw5guJExPx86r+wp0zYiL09FRzCnikZYDTNK3ENzVl7RCiVN3qOia2TJEOWod3VqNkUSpP5HROzvFbIplT7urVbTKeoigUZoa3s1bGmqolnxKoqMSf1OHmFTfLVq/bx6jfnPTmdqPoLuLRG8zdmpfbVq3+tGASL2V1fo8qm2tWWDMd6Ymd4CYXEl3Yv0e1/P6+b9qd/s6xIuiywrAsCybqNsI6zsnFYFlrLWWstZawJhTN+FZWVlZW/3f/8QAHhEAAQMFAQEAAAAAAAAAAAAAAQACMRESEyAwEED/2gAIAQMBAT8B+0K0LGFjWMqwoim4nWqeands7Gd29W+BzSqDk2EY9YjHBsILG1YgqWwnRwBFFUaPjnUq4ouJ+/8A/8QAJREAAQIFAwQDAAAAAAAAAAAAAQACAxARMTITIDASFCFAI1Fh/9oACAECAQE/AfdNkIjlrFdx+LXC1moODvI3vtIyoqBQhRu+JjOqrJmO+LaQVlWQtviorScF0lEU4Yl03ITiip8pt+B+Sc2gqhHeu5ch8lS5Q8uBzXVRa5WnBy46BdDfpBjW29//xAAvEAABAwEFBgUEAwAAAAAAAAABAAIRIQMQEjFhIjAyQFFxBCBBgZETI2ChM0Ji/9oACAEBAAY/Avysu6KDZmmqFHV0XH+l/I35VCOUeOoTsqpuzkog5p50orMIkE59UR9R1Am7WeiJhphQWa5rDhI5PILhXqhU0UYkTSohEnpvhe50Avx4UGBs/bxk9EPEOYQCYhFrpBaJNFAtQqWjfm875t9qXDZ2sPuvEPew4y3CArAy+XmrfReIPQQvE2jmgw6ia42Vm4YuKai874dri7omF39hPVMNSH0F0iEQGgB2aD2sgjXkTdBAKBIFEJkCz4YKdNMdKKccOOkUTiLXNNaXkj1Ol43zu/kHdM7I+Ub435qEBOSnkjfHVbD/AJXDPZVs3fC4XfCktMa3jfO7Xt8rpyX1LMyLhvjeO3lLRmU4O4nenIe933HRKD2HUFbTPhZOXF+lxhAWZ91gJJ/16XO3zRc6dIQn1JjykaL6WE48oQCdvhoEB1QL2B0dVlluPffTihTiFFFE6mabTJRqnJqlGuSCHMZoD8s//8QAKBAAAgIBAwQCAgIDAAAAAAAAAREAITEQQVEwYXGBIKFAkVBgwdHh/9oACAEBAAE/If7XuMrigmAMqLQPZlOAeSmHgGYvB/EEhMohOZUrOIWMl4w9vFsdoeAUb1BKhZv9wJ2US8ovkOy9opWSauAigCWE4Kpaw7HFIQnfWJF3My0E3BCXJvUJNkNmDzcUEgLbCbjQl2Ib4cA+x7dY6OTMphCIDkASoQUSGW4OAFYoFmGkEcxAwSYGgCCIaRZ41bvWPDzoOEXmCtkwHFrC0piyQIaeoAMAEClmibDCce62JfS1yu/WKjjQMKAJBo7xQBbbw/eZUWQIBzGN4GLbcbzBPQAnDKj2EWtB79Yn2FMYKSOCHCUEcDxAUtQRV7TMMF8jArE8YAW2OZWyMQCRz/yFEIkmtU35NjUV4+scAQV6D9uY0lXxQ+IIHbrEscmGDmLyEDrhN+IVUdG9op8kX5+AsB1jRuBModQ4hySlbs4CcF9zmHPtEH/MgzycNRYe/WJvQKB7L+PiKYZOQdtAfWyXfqYQotnJfETLSBC8hogfgOsSAcxhCgt4BMxocjAicg8lCMi9QvcPJQG/3wJFEC0hmVk+gbO3WL2idHnJ9E5vjw+IEMUSQEX30CDaNBOBd361E937jO0wcDh4qRqOwYbu0Wu8TmPVCyD50BNz1j9rADDgCBkViAlqLzGD+2BgSpD7Isa7QAI5zGchzCwDYcJglXPY3B1ToaEGEGIzwnhENKXdm4y8e07aiDrM0T8oBKYj8FfIC/nP/9oADAMBAAIAAwAAABD777777777777488888888888880018SgEIw0000AAABJpF4wkAAAIIJb2AzcssIILDDDSFvIJDHDDDPPPygLrjvPPPPPPPJVzzkvPPPPzzygnN747zzzwwwzTpOZqMQwww447A3MhdeY444888++8/wDvPPPPBBBBBBBBBBBBB//EAB4RAQACAQUBAQAAAAAAAAAAAAEAESEQIDAxQVFA/9oACAEDAQE/EP2i0Ixs6Y/LH6ROIqd5wjAmZbLzsOEHZ3b+8IwzK0cu/wBwnpT2GJHHDYvVUFOb6mK4RW1FPI+LKAIxfAalw+8KetKmPEqAdMB9gFP7/wD/xAAiEQEAAgEDBAMBAAAAAAAAAAABABFBECExIDBRYUCBofD/2gAIAQIBAT8Q+a0STJfyV8hDy/UMowXMIsvrVOHEtEMkR40iEOtRiKxTMtBQ61sItEXL4js29aLhoHWtwngRwWPBEVMN2uw9pNxezUEptXPh/sTeT32HahGXeAzcMgR3RDZ7DmhMsYjyma03fTsEuXFeQi+EYs/P/8QAKhAAAwABAwIFBQADAQAAAAAAAAERITFBUWGhcYGRscEQIDDR8EBg4fH/2gAIAQEAAT8Q/wBLpSlKUpSlKUpSlKUpSlKUv4Es1DZssQllsG3FE95yhRkKYKzNnyIm8Kw5J2NSj4he528VkfD/ACUpSlKUa2lAb0yyz5yJcy58B3glzSddb+UPUlRspEy92ONPJoJdCl6UnLMenTa/JdyTVFCmGe/REPjOWok56sWyNwtxVL5YgnLUam+vQVq0s5xdRcCk/Wpk0oUpSlL+CN4EZluCxzWc+J3MFEsfk1DbdUWMnyvMTexraTSzfcTW4m1ar16knYZFamEuOELkEnSarLa++lKUpSk/7KRkH0oqDeZGittLohrQ9CdcBLfb1JxhFNRq7LY0V0EQTK3yhGs9MQ3xlGS/yFt4hSi9hFKUpSlKUpSlMvRb2+mSEtMVo4osbYE9EPVBFhL+wMzvZvF4MXYdJqrZfAvKsMl6zHGw2cnl5PXLOVgpRJzPiUpSlKUpSlKUrwDu2aB5JCMejMxnQbGERrsq1SUWpqhr0cZ10W6DYnhjLuw826a5Wu5aljpYJajeDTbCVeqbKUSvk33KUpSl/BNcE7GBam27EnoyINrLMNNTzSfkKcrC6eD5SV1+SmnigoLdvhWTq0QQspTJiIyhtwlukNO7SbHSWGVvlG1rGK2M5gUtEpg2TuxSkD4vvpSlKX6VPUvTA0FjoHkd2v0Q0Rwkr8222QU0nwkkilKXB0OVdilKUpSlKUpS5Oua+40DUrHq4tEG3MivNbTHihzIbTcqpTo6JTcLXVsbRSlF6g0hYU4KUpSlKUpSlOro+xlXJAqPqCrxHynhnCvRr9F9yh6rry1M6p5f6hYhD/jYVsiSbKS82Up1KX3KUpSlL9/RBv19OAiuG9CYtPs3duTxHGfamc/l5MpL8Nvt+bye9T+hkNYR+qn/AL9tmASsub8F+2FI7MQpmOV/gpSlKU6bfZNmJmJoBmLmLYUjGJMamtmNQoOsKfkz2CT+TUf4jYU1Y+Y9xaTUxV6JL1LfbrmR2at2XF0KW4KruUpSlKUpSlKU8Vdgv2JwsyamQ6VJ6PuRs0kJ83j1dfmUpSl2TDhtNJmHkzjLXN6LW8DXlVNyilPEqLt/0pSlKUpSlKUoxpIk96taqLtFJJtNf0TeodDNr6Co9hMElE/odQtlTyJ+31Ej0afmUpBsyo4Va4pSxyH7FKUpSl+9V0tVKRO+5i1xTViNfJSaHM1qsXHQvGbYiOK39CIRSrjfL92UkZNMzanSDMook9SVXoOZyiw9cv4IOlsVnaX9DKTTVLV4/YzFS3JpHDU1HWHiNfy6BXGJX0vUjFu9UfkQ3ZpFkS4TM7RevekiKIivUNrWSvJo++lKUpR5+grsV2H0D6Twi6RdBHY4X0SwUpSlKUpSlKX6REEcEcEcEcEcE8EX0pSlKUpSlKUpSlKUpSlKUpSlKUpf8r//2Q==", "Bear Brand Swak 33g": "data:image/jpeg;base64,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", "Eggs": "data:image/jpeg;base64,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", "Rice (per kilo)": "data:image/jpeg;base64,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", "Argentina Corned Beef 150g": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEFAgMGBAf/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBQT/2gAMAwEAAhADEAAAAfoQx0AAAAAAAAAAAAgAAAAAAAAAAAAECAAAABFSgSIAAAAAgKAAFebz+3wdOIzswZQMtessN9Db46egY2AAAQJQJQJnHyNeito6x366eImb7XDjITssOOizr7f5v2jnfoOMoEoEoBAlAlAmtsarPfm6u1rOHs+Vmz11xsizXG7Wzr7Ljeq6fL2SHbx5QJQJQCCygSgTTXFHn6KT0+ar5ene2PGYp2urkMbnsPLzetNXQ89cTX0NDv40oEoEoBAlAlAnn7/ncfXWVNtS8fUucaRGdtSw1a1mEXONhX77j6mh9HhygSgSgBAADmOoqc/Tz9L2VTj7ufX8TpQRf4pQxe43NFN1jc97no39fJCAAICgIYme/wAWW+e2u3eTeNrTFm3DCIywYka9gsfX4Pby7ZomaAAgADHKDT5/bCV2NjFVqxgrpsBX5e+Tw7fVJr3JlkAAEAAAAAAAAAAAAAgAAAAAAAAAAAAH/8QAKhAAAgECBQMEAQUAAAAAAAAAAAIBAxIEERMVMAUUMRAgIzMyISIkYHD/2gAIAQEAAQUC/wAeerMGvJqyajGoxqMajGqwrzJE5xzuM0xMOXl8Goask1nGZmKP087D+Y9+G+nmxLymHbEVipia2fdVzuq53Vc7qud1XO5rnc1jpFSamD5sdP8AHYqeff0Ofh5sfPxsMrOyozTCMxY2drSTTeBlZfTobfv5seMTrbfHc7ezKuIh2TqMoqDXbpX1tvOizljObHfYwzsjLUdJuk1HyvYmrUkZ2f06VOXUObGfe5M5VXxVFiri6ckTET3NCHh6NXF1bdUwE24/mxP3v4qfl78PNuJ5qs51H8P+XvWcmX9V5I8zgGH6fOTdMaW2tja2NrY2tjbGNsY21jbmKP08i/nI/ifPBQn4uORWtecQg2IWSakZ6kGrBqQXwXGfpZMlKJVY5JglSwsLCwsLCwsLCFIjmyMi0tLS0tLS0yMv6n//xAAmEQABAgQFBAMAAAAAAAAAAAAAAQIDBBFREhQVMDMQE1BSITJh/9oACAEDAQE/AfHtXYRuJcJkXXNOfc099zT33HyroSYlXYgcidK9Kk1x7EtyDmYhZeplv0SBShH412JX7iHZaOYjhG0InyxdiXiNZXEJNQrmbg+xm4PsZuDcWZhX2HFFKKUUopRRPF//xAAeEQABBAMBAQEAAAAAAAAAAAAAAQIRExIwMRBQIP/aAAgBAgEBPwH57tNqFyFyFyGaO0O5+Wd0O4IsGZmZDe6H88n1O6HIqlbitxW4rcVu0ISSSSSL8v8A/8QAMBAAAQICCAQFBAMAAAAAAAAAAQACETMDEBIhMDEykRMiYXEEFCNBUSBicIFAUFL/2gAIAQEABj8C/D2VeazWdd4/h5BaQtAWgLILNXlN/qCWmBU1ymuU126nP3U126mu3U126mu3U1yNoxIdj/vCpW9cdo61crS7sFBrSewVzSewULJiOiHKb1odf0XMCO9VK3oDjsFVH5W1G0bdjNejb43FPFs5xXizaLDwm2yzMFUlLqHl7TT/AKXguHodTWm/tUF3iIcQzMv0vE+ajr9K1nU4fLccdquVxb2Ki15bH4KPMb8781rd8ZocxuyvyQ9R5h9y5nF3c1N6g45qBPyqSF1psNPdUlgagALoQTfaBzVJHma59oCyuaBFmEXXX/KfY0xuqou+O/vhUZ+4Y7z1wgeqBxpg2UwbKaNlNGymjZTRspo2U0bKaNlMGymDZM7YoxBixKyKyNXuvf64fgT/xAArEAEAAgAEBAUEAwEAAAAAAAABABEhMDFhEEFRcSCBoeHxkbHB8EBgcNH/2gAIAQEAAT8h/wAIuWS/4mgtj0al/M+k/QT9BP0E3j6Q6QzXkOsAE0c81mPgBObeUpz4UUNIvKPynIA7E1RY77dZ5r4YYxjGKzspntswASe7YX8nxuw4xrfKx4V0tcc+gHU5T7aL6Z/cSfTgcCRuRMnNRGo0jZqI1BGV1C1kCIQVFGrFgTcALxiNK7K4d7Z4X0FmiM+uqcrqUF/5AriJMbqjdbwAgO0ysWW1W/aBdRu4DjLpZu6H3141tXDdB++erLpOmL2+1sI4XalS4HgD9hlFKAMFtOkrCGYx9iLpZiFTUatrceHb4z1e2B6TQwtCAX6zXtAHu/BIdYUhuLlY47HX6QoJELRcTB5VrhLDymqPULncn5bw4Xvtz1fl8oNkvuZxqTch/fKrYYMW6Bm6PeYi8SHxPzBz5vPm8+Rz5HH3nH3FH3NH3tFd2tMxY7Ka/CLGMYxmHdLg5gcYrbhkKOJUzbjZjbZtMrvKs1mwl6dcwy7gsPiAIOBrhmVwVlOPXj0leCv6l//aAAwDAQACAAMAAAAQxxxxxxxxxxxxxxxxxxxxxxxxxxzzzzz19zzzzzzyyykD7z1WyyyyPPPIRaTZNPPPPNNNeiKRH4NNNNMMMdsAEh9MMMMNNNYG6mxvNNNNDDDnamWN4gDDDyy+MAtb3fb6yyyy2bhksgl+yyyxxxxhBBBxxxxx9999999999999//EACgRAQACAAQFAwUBAAAAAAAAAAEAESExYdEwQVGhsSDw8RBAUHGRwf/aAAgBAwEBPxD8U5RV+txFp4DEOeEx6p3mh77TS99poe8qQTLgCx1gg2ygZxSUcmC3pXngCw9LjMrk3jlFTifzqj2qiWKrkrsh58xUrMK5Y4N4fvJhsdOAcTp/pDbAOvutpnEs2PKoaOj44CaVZQrj2u094do/Edo/BdosrxdoZesKx6U0ppTSmlL0X66lSpUqV9//AP/EACARAAMAAgEEAwAAAAAAAAAAAAABETAxYRAgIUFAUHH/2gAIAQIBAT8Q+qQkuxEvOCzyKWjiOI4DUSwbOk6TGQUH4HdNWEZYnC01YEig2ejjOM4RI9D33ukhIQQQQbYKUpS/P//EACkQAAMAAQIEBgIDAQAAAAAAAAABESExURBBYXEwgZGhwfCx0SBQ4fH/2gAIAQEAAT8Q/sqUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSl4UjdHUXqRui8KUpSlKUvgN4wq9kMZvTS0HOTuTOSQL5jyQ+pBLejzQS3qhX8ClWCWrQYkmipp1Px9MRZRXcgE01s1SYJz2X2GgXnIPsIP8sGFOwqNAvZvHoX23tNrx9M0jnQP+QY3Pyl+fHsJbBGq+RcwtMUUrThkMszzFMEzrPQKiImr4FKUpSlMgr4ibOY1hcGMYxlaFZ/PMfBSlKUpSlKUpSkLuQdk/ZpYumFac6XWIy4PYHcksGo/kDuSWBGsqtiN2pUUBa2tbS3fRDb6RBtslM+Qsu7KTXfqMhVyCbNr5KUpSlKUpSlKUq6PE3dpfBrDAi9SvX6yT4HQKvjd7RzNOnuIWOmnqBNMINHh1WU0FlvD8hmnnLZDdU215Ew8Uk3ePBaS68iiXGhZk6ufgozO7mJ2RlKUpSlKUpSlKar4/dtmuNl6RrK6xmBpTY7mnkSqkwhl2ZZ8xIlYqIpJ9dWj20E7UInSbdLh9UNLBUTaVO4fYQUZhNyvVjJvl7D/hSlKUpSlKUpSkT590P54JHFWEtSRv2GDrbGWU7k6sCvGNkhguSzQXMvVYWGOBHOfLVHyYj7jl1CgxpcCSYZcmonWKMqnSsDlVLdGM7FSwyszc3SDOqfvJrhSlKUvgX6mGw6JL4MWGyFwYxjGdRdlzkL4q1W7SNBHfjTUa5rC4MYxjNLOcaYaFqmmmsdvFzWtYLKbZt58/MbcPn/AGNmD6bmP6nqNP1Pcf3z8j+sfk+kPyIfS9xL7XuJfa9x7zVFNyVrHx4kDvg37cBuH5D/AJh03RPcp/KlKUo2BOWyJqCj4F+yQXoL9jUPRP8AmIf+Ehs/SN/6Rv5B6BMaegWgfmHBqeTUGwJlKUpSlKUWo2w5vQdsN2G+xexexewn2G7DthyehsBYilKUpSlKUeRoxq+Q3ch7RGxOx0idhJsLaErkJVyEiFgpSlKUpSlKXhgwRERERERgxwpSlKUv9n//2Q==", "555 Sardines 155g": "data:image/jpeg;base64,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", "Piattos Cheese 40g": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEDAgQFBgf/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAQIEAwX/2gAMAwEAAhADEAAAAfoiHC8oEoEoEoEoEoEoEoEoEoEoEoAAAAAAAAAAAAAECADDPXrOo5F3nauhPHms9hyVZ6s8fM6scvA7Dkjq7/mfQ6OWyN+cACBEgKraaTwtjXv8TZSiiltpydCZ9K4fPs9Y873ea1Ckz2uJ2t/C8etlAAIEoE0200nhX0XeLspwnDnbUxyXmLM5hRuau1C5DnOXa4fb3cNhD1ssoEoAQAUX0VnhXU2+Ltozwy5WyRdWaltIBKBPb4fb3cNgerlAAgJAU3UUnh515+Psq3NTe5zGURLLXyorJClpQJ7nC7m7hsD1coAECACm6is8PLGfH2VZ158b7uers2rrVbVFbZ4blcxqIUtPd4Pd3cNgeplAAIEoE0XU0nm5Q8vVp24bnDpEymI1JppbNXeX07VVo0+9we7q5bKHqZZQJQCEJQJou16zxa86/K2tjVz4X3KqImMoxyiRiZwE97z/AHtfHaQ9PJKBKAAAqtxieRT19fnbmxvYmnG3EtSdoazayNXPZtidbp43TGQ6UAAgRIAEY5iuLRSuFK5KmbUK5zESAAAAAAAAAAAAAAAAH//EACcQAAEDAwQCAwEAAwAAAAAAAAEAAgMREjMEEBQwE0EgITEyNFBg/9oACAEBAAEFAv8AqXusZzm15rVz205rVzWrmtXObTmtXNauc2nNaua1c5qjf5I+qf709CXBpRYaUKoagOVrrSDUA1tdaQ5UNbHW6f60/VLh9+ih1Q4eqXCF6Kmk8UEEc7g3WEQMlkM3JkDZpn8iM1i3hw9UuEL0U9gkjignjTdKW6dulIk0+m8KmhmkMUfii3hw9U2EL0pH+OM6lzSdUVHPfJLK5qZO6yN/kj3hw9U2EI/nyP2AABvDh6psLUfhYiz5w4eqbC1HYNFKCuz/AN+MOHqmwNTk00cPvaq8gRNflBh6psDU7dooE8UK8ZRFvwgwdU2BqduJNntqGf0n/wA7wYOqbBG2gcnNoWNqrRu8UdcUKudY1PZTaDB1TYWOBTk5wPwc812jcAU9wAUGDqmwBO2bIQvKE6UnogwdU+D8X6R/K9r179+l79af/H6pG3sOnXhovH9Wq1Wq1UVqsViEaGnqo22M6yEWKxWKxWKxWKxWKxBiA7qK1Wq1Wq1Wq1Wq1U/3X//EAB8RAAEEAwADAQAAAAAAAAAAAAEAAiAxAxATESFAEv/aAAgBAwEBPwH7Ba5tXJq5NXJq5NXJqysDR6kLRQ153mqQtFCOapC9COapC4DeapC4+dZqkLgBvNUhe/UM1T/bl0cujl0cujl0ci4m/u//xAAlEQABAgUDBQEBAAAAAAAAAAABAAIDBBEyURATIBIUITFBQCL/2gAIAQIBAT8B/Y40aShMOyjNPH1d2/K7t+V3b8ru35UvHdEdQ8n2lNR8mi2ifSEElOZ0iukjeeT7Sgj78L+0S4+E7qpTSSvPJ9pQTlRU1krzyfaV81OsleeT7SviOhCppJ3nk+0r4vuhOsneeT7SiFQqhVCuldJUpeeXtbLMLYh4WxDwtiHhbEPC2IeE2G1nlv7v/8QAKhAAAQIDBwQCAwEAAAAAAAAAAgABESExAxIgIjBhcRAyQVEjgQQTYBT/2gAIAQEABj8C/qXL0nyFJN8ZTXYSfIUl2F7TZCmo3CT5CkmyFNRuEnyFJdhe12EmJvOmfCKVUMqKCKXcqeIIZdqdoeUUqoZUTNDyil3KniCZoUQaZcaw6ZcYCP0gtSt3nNx8K1YjL9kcq/Fa88CGe6Iv9D3mKDB7ULS1KxGEoMhzXpV94B0y4wOD0dCP7mezHaatbO82d1Yleb42givQJ3eMYImG1G4Xh2ohD1gHTPjBehFFki3iH0n+PxGqcbsJIIC83nsjJx7UxYB0z40YOoNLAOmfGOWMdM+NYdM+MVNAdM+NYdM+MM+m+MdM+MEXVMFelFFug6ZcdYNgh1n0h0HTPjB76SloDpnwn2TbqKfZfUU26in2TbqKLZfUUz+0Gm4+0+euy7qKqedVVVoqqqqqp51Xcu5MPr+q/8QAKBAAAgIBAwQCAgIDAAAAAAAAAREAMSEQMEFRYXGhIIGR0VDxYLHh/9oACAEBAAE/If8AKRnwwLxCAGbI5EBiHUDImEcRKsT8SHImRcXIVATwoyJlYQKsQgIZsjkQEIZshkTCwiVYhB4U5EyLi5CoQgHAayIAGIANHbFEWThOOFX4/UGJcCuCilF3H9477y9+X2UC7x33neprhZuFX4/UDNwq/P7naprhXeO+8vfl9lCTqjmCQjYG5QgRfbehuVbReL8MjiGIOIp0hVhjKoUmZjHKJAGkHJCDnAmOHhfb4ehuVbRaUaqMJkIKsHSHqQmIKqcmjBXBBkiHBBwHUf0ghpYFP4evuJeGDcYUFHcDsix/xm4AcuBy8P3CPIBmfrj7gOqqNH25hL1hgBLNfUxim+Xyvh6+4l9A3Bo9QBgMHiAQAAoD4evuJaVnMGg6zMOXz9fcS0rBkwbIMyyhqID9fl6+6CkAAmEAwXD7ncUPACYU2fl6e7CkGnkTemdHOgIMkCHLPw9Hdg4sQaGGAcz0mS4RFeiO/r4ejuR5LRmhRnbE7KV40EkQDooCRMVHamno7ZI8BcGEBZUW9SAIIcahkBQGNSKj0MWyeNPR3IrLQTCnCY6MwHxHr6+2S8+DIXRwsN0cZOoqEEXuojg/6IATeymX6CoQQF0cAJC6OZXqKhBFrqI4P+hwsd4hfg22MUiiyTdUFgLdGIgR8ZqH/cYln0KpgvoxKKLk8u0GQPDtKAMrqZW9WI02pVAiA6HaZmfVtmP0DJ176XgkaRcG4tZIsWLFixNVfzP/2gAMAwEAAgADAAAAEDjjjjjjjjjjjjsccccccccccccccYVnTmZTi8ccfvrx8ssO/rPvvjDDVT1qcfDTDDAw1ctfggwRQww8MJmAQDAghMMMPvrI+aWJP7fvvjDC9vAKuYJTDDDzzUAlWdVRjzz8cZu23fSWtscccssksogIsksssgQQQQQQQQQQQQf/xAAhEQACAQMFAQEBAAAAAAAAAAAAATEQEWEgIUFxobFAMP/aAAgBAwEBPxD9ipomNXHom8emP0x+mP0x+ia5X1REqL2ksFSPvVESIF0bSK1I+9UQ5obsLesfeqIcjojrH3qiORDTUiewmvSPvVEcl2lRi3HtAm7kfeqITUm3JZC6LouiPvUnZ3RmM/wz/DP8M/wz/BfZv5W/J//EACcRAAECAwgCAwEAAAAAAAAAAAEAESGh0RAgMUFhweHwUbFAcYHx/9oACAECAQE/EPmGAZAos0DzRcAHiq6ANOVAoGvCgUDTldAGvCNSuGf1elj6WBCWGaBBBu32iTA9cjZEAWdkhuL0sfSwpzMyiiGj9Ik/PkphzAUslNxelj6WFYkCOCJDFaWSm4vSB9IIwewwzWyG4vSBsYkCDgoiItZKbi9IFQQgGw5BCJiiAylNxekCisy8Cdgs7vYJ2NgLOeKXiADFDNmNV3E1XcTVdxNV3E1R/qNUWYY/t906dOnT/C//xAAnEAADAAEEAAYCAwEAAAAAAAAAAREhMUFRYRAgkaHR8HHBMIGxQP/aAAgBAQABPxD/AKaUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKX/qpSlKNPNXWppDMzOBWO+0IRVORWe+mcJQe5jvtDXmu+EdnPJzT6Qt14Gyptco7OeRo1iD3MvnpjCLTDQWO+0II9MNRZ76YmaRB7mHz2hsrTXCOznk5p9IW68DDqrWpHHuRiqaizP0UpSl8zdHAiFa0EYBkVfGZ1+RB1z3GcJfod6VFMcZP9mz+KfzDV5dWxzg/0N0CquMYanuQ3WOpwEN3nqcglQK64zhKew1eVFMcZP9mz+KfzEkFuRmumFfJ9X/H7mP4BxoKUpSlKUp9/t+alKUo/r/BTgYsVFVHo3ov9GL+HVp9nDg2vFpdytM6LcaFtOPDZyxr6nRMjUqc+VBJu/wB0wHZo9jD/AF5H+/llKUpSlKUo/r/DbDFZLbstV2KO0axobnwL00VpfI37k9Rq+crjUbSrrZK9qxNgo7GEdDDaum/ZSlG+nllKUpfN7j4LBy1PR0liVaVbjiVrxohaYleJFKrnL+gnUjSdapv7WSq3RJOSujeG1JOPQ+mMVKe3sRNbNWumGJ1PROUbJu83BNvh6GLN0ihhtUXFKUp9Ht+alKUo3qfDYMXiK+WVyy9somAtG2U0KJlEIkilKN9PLKUpSlKUpR/W+AxobAq2kq29BUTfeEQZtb4ZSlKUo/28spSlL5vffAc1FKt6IWobjYlQU0tUvFKTbWilKUp93t+alKUo/qTWMNIpPYSWpOjB1X8FS1o1ysiyzHeEWreFwUpSlG+3llKUpSlKUp7iaxg2ROZFqWuRufBCoJZzgosOptKLihp6NFKUb6eWUpSl83ufhRGRflGsuBOoOimGJstv5Y2J3Q76L2pJZV528Nv6eopSn2+3/H7iKXVnlsyw8ohI4unwLVpulLkSFEtfge/L9UK3hJrt4HTDUm12K5F6i0y3u3mISEy7bYhEh7WuH4ff7fmpSlKdBMykg+HhmcQnbENTSpvZiFKiSJeGokcw0aWRtt15bKKFtBJ7CyqsoZZGqJMlH+/llKUpfN7v4T3IcQR4K8r+xZDW+MCCMbu1lKUonSibSfDKU+n2/wCOy4CoN6ya6fIsBWsmmvwNklliaYT/AGOVl8DXMNg/i/KDhYXE0zBtLlgidP4IAvWTXT5IhrWTTX4E2uWWJ0n+xxhcNGuYbR55/QPVJ7E0jg5sf3X5qUpSiGoj3aWlE2NpMGmO+kKTPaTDpn5Y1SwaMNcfBR0+Vwc0e43haSf4KktlcHNJu0brxv8AWO2mqx4dfBBJ6sWHfyJNLHHb6jPWRcHNE3g+PpJ/g266zHfLErXVJSlyUpSl8y1eEc3oO4G8Dfgvg6i+BcQ3gZwOWxjCxfyOxo9ho9h8Q+A6jqOo6BcQkWwkWwpJ5qUpSlKUvjjgxwY48aUpSlKUv/V//9k=", "SkyFlakes Crackers 25g": "data:image/jpeg;base64,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", "Safeguard Bar Soap": "data:image/jpeg;base64,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", "Palmolive Shampoo sachet": "data:image/jpeg;base64,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", "Joy Dishwashing sachet": "data:image/jpeg;base64,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", "Tide Powder 66g": "data:image/jpeg;base64,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", "Lollipop": "data:image/jpeg;base64,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", "Mint candies (per pc)": "data:image/jpeg;base64,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", "Chocolate bar 25g": "data:image/jpeg;base64,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", "Pandesal (10 pcs)": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAECAwQFBgf/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAQIDBAX/2gAMAwEAAhADEAAAAfoYyuAAAAAAAAAAABAiQAAAAAAAAAAAIAAAAAAAAAAAABAAABEJadK339bnczHXuZ/N2zv6xxOh0YbbX2NKBMAAAQIAAU851OJydSa35963rUupUyREld7UtMenvy+p6HEFqAAQEgAYfM+sxY6+Xi7j68TIiaTTKTWccxkU9NejZO7jCYAAgQAY8kHn1HN0QlBEpQkIkRkoL9rhei0zsNcwAIAAmB56mbDzdBw7y7Ll4YdpyoOs5uM6zS3SfR+f9BrmGmYABAlAlA4utuaXPvh197BE0xbAxsgwswxbsDY7nH7GuUoaUlAlAIRMoEwqc7ndDn46hWwAAAG/1eV0tssiFqygSgECUBjyUNDS6+GJ5joVidBvQaTdGk3pNG29cxb1Mtq3mBKBKAQhKBKAiRWLjGyDGyDHNxWZAEoEoEoAJAAAAAAAAAAAA//EACkQAAEDBAAGAgEFAAAAAAAAAAEAAgMEERIwEBMUISIxIzNBIDJAUHD/2gAIAQEAAQUC/wAhfURsXWxplRE/+I6qiausiVROXt/C9mCoMZNTCE2eJ297wxksz5SbJoyQF1g7FxvI66GNjwZM+B7XB7dlcfhB728r4F9g8kkg2KBsgE0o4lUJ+PZLHzY3AsQIXv8ARYghhQAKJ8j5up4uVFtfE2QCwkALpC7yLb8GSYI9j+SbuigZFtk+vJyycrcB2XtW42Vlk5ZOUN+XqPra3s3W7s7WPeyXtMpZniaSeQSSTOZV82QxGSSNRPkdHTyXdBM909M9zwo+8myo+9NjDZOkjKFO2/SN5Qp2hrYC1vT9+kjCbT4PUH37Kr7eHne773kv8iBcWfIvPjTfdsq/eul/fsqfWum2FSguGBWJWJVirKysrFYlYlYFRNLQNhasFgsFgsFgsFgsFgsEGobbKysrLFYrFWVlZW/uv//EACARAAEDBAIDAAAAAAAAAAAAAAEAAhIDESAxITBAUFH/2gAIAQMBAT8B9XB3xMpX2jRajTIViOik3i+J52nCxtmypHF7oIm/Pa/tfmNZP3m3WTt5hxCkVMqZUypHz//EACERAAEDBAIDAQAAAAAAAAAAAAEAAhIDESAxITAyQFBR/9oACAECAQE/Aflzb+p9a3ihXcm1AQgb66KzuY4jjkJrpC+dSnLFjJoC3HazotizM7yZrN28m6zLQVAKAUAoBQHv/wD/xAAqEAABAwEGBgIDAQAAAAAAAAABAAIRIRASIjAxMgNBUWFxgRNAIHCRI//aAAgBAQAGPwL9Q1dXstHKjv79TdPhan+I3DhFPK1sN0JrHbeq3qjxnlx0Ck6dFRaiyYVZCnloEZNVrNkVI6FBw0OaPKg6KEQK90Y0Uk/gL0gFRMTzRM8k4dDmlqLXNqqifa5CLTVQq4QFuhVb6WFsdgo5886HNlGI9rFSaq82b08046AdbNAgCD3skrCK9c13hbitxytxW4oSZ+yMw/Zd5s4o+Ui7tbGqmYDIvhCv+cVTMZBPEuyuLwy+9DbwcnEO4jnXdHCig8R5MVa4IXjg4k3Qn3jMPIsb5zTY987069iLuakknDcTWB7sJvSn4nEvoXFR8ryIjwiXcRznEXZ6Jt3CW81I4rwCZixub6tGqMW91p+HrNbmHxmjMd+hP//EACkQAAICAQMDAwMFAAAAAAAAAAERACExMEFREGFxIJHBgbHwQFBwodH/2gAIAQEAAT8h/iEmmcLS34IUSDxT9GSAGSgIWXtHAU4fMBRZmIhC6N4m9xXBZWUIkFhuahRKfFwqmu9a5EVC5A27BLLEjvGkAFblOEZKg7MBk0/BGBzLdkRgBHkdhAtI2BZgAJBTbpYoKcjkvVCAIwbypY9hqbMjKzUuYBhBtB8hC9oUEEnJhWD+76FZKwrESSUmCBBI2K8FGVQbBBB8Q521GqIrTweDDqQTmCg/ZJiS0PeY6AAhkQrvCIIWZaNwi8/TmVJyU8QyKCWCcJIC1CCI878tb62TcQqYDKN1AOxXUoE3NjtAAEHacuOhMDZR3FQV9QoT9owGGHvO7BluzkzqsVZaX/LL/licAxPNwNlHkQjdnmIsBxVVS2CDiI8CI8CX/LL/AJYA5wGHnTBkORrCnwBqAnwTqAwHJ1RR6BILRDQECj70nMzcASPYlOU4xo4hZ0rSIl5Mwi3bmO7ZIl3EKTfAEYw1AfHQEuzVBd1HoNhEoxwoQ1NEvkQC5XPcQABFKjcCBBmDMMscBXsgctiBKkDcGgVyYYjwdUegPyPVBCeeodge65/yEilA1LATDCPMB4CPw3biEsAhFsw/kdRfiWqF3YjUG/jUEw2Xg6hpvEB0j0rI5hHx6InjR/RED8QwB3OpIjIYOg/iBCIGovUZPU5fvP8A/9oADAMBAAIAAwAAABDHHHHHHHHHHHHHLLLLLLLLLLLLIAAAAAAAAAAAADHHHfSDHbDHHHHPPOM8OMe/DPPPDDR5G7bEdzDDDLLE791321PLLL321L3/AD398999NNNBzDDjB3NNNOOSZxxxxx0GOONNkFumG2sVlNNPPPPPvPvPfPPPCCCCCCCCCCCCC//EAB4RAQACAgMBAQEAAAAAAAAAAAEAESAxITBBUUBQ/9oACAEDAQE/EP5YhdpStzwRqguOwdBH1i+E5eSBNQnAcS/zarqX7L+xs1C2CBTmIlZG5Utly2XHmaGZrLxnq7TR2wFGUBKrb+7/xAAgEQADAAMAAgIDAAAAAAAAAAAAAREgITEQUTBBQFCB/9oACAECAQE/EP1bU5BVE/pTvZXNwR0vwPfoEvZpaZTo72NknN0rpPonoU+xxDGaT0IVJk+FZPE8LXDdvN6fhCEGcvPsU2bK/hO2XLNhXkqqSSizpSlKX8L/xAAoEAADAAEEAQMEAwEBAAAAAAAAAREhMUFRYXGBkaEgMLHBQFDh0fD/2gAIAQEAAT8QpSlKUpSlKUpSlKUpSlKUv9nSlKUpSlKUpSlKUpSlKUpf75tXRqq17Gkx3Wf+iWq/RNv3x/De1shtuJDJR1s75aE0+y2fA4ghSNOlddliTcgu0NdSmvENIR9rQeeKp0yRyxib2JLXlN9bTYojXVp8ISKrRNXyWq3X7FKUpSkIwr5fS7GpqLivm5ZJcYWUjsz8jXqJmvaF2MaJR4LC879D8xEaW7TeSXnHqKXUuVbjPXVjWYyeAm8GUv2MOR9K16rgYpQRvLD4zui4EtUrRZVXMudE+wqf6fZSlKUpSlKUpShIexOGsjFeGe2u3kbuhbm1yTXjsdTx1mPQ0un+hLarjlGyr2arAh5YxSbaawWpTcoxZGo0Hh/vsQsOFA3xPUSpSOzw3pqXjQTChKrbkX45GRrVfqWfwUpSlKUpSlKP8rLiNGJ/KHVqXWzT5E897h1Cjx7x+gloSYtOOOXuPJp4hR1JeiRurp0Y6kmkmnbpoPV5BXlHG5bpFBV4UXhu29thB7lUaYS57a3KZE33ffVmD7bZctvTQpSlKX64+GIySLC0eB7CxZNC2i6njfE03N78CRpLUnFsIDHHWLtbVTL1pAJq1G39E3ZSi2CVCjHFvXHIpBanRbuW9iqhiWpSWWLuMczNnNvAgpao87f89CPh/cRCzWA047BZmJ7WJTZk++BUdodyskpJlRNrKXBgNo6Ymv8ATKct8uK2+Ru0HJLA5ZImeqSw+mPQhrF0uOhyNQ3UIK1DdQheJ7WJTZk++DG0SzJLlpvfr7dO0Ys+DTHBSlKUpSlKUbwyK7LHj6qUpSieUO4VfJSlKUpSlKUYu2F8mmOMFKUpSlKUpTAUyfvko9X0UrNKrT/1MNjZOC9KLhPs2r4C2mZkzpN5xLTYccw+dJzAiY4zodQWh7I7YrOEauM6cT3Q0WPASSIpie38xSlKUpSlKUp4q+BFHPKZkkJgZD27qr4mMDhEqFWDfyIYLU1oCd46o8LZFZzeabI4WGoMSKRo2axJalj07svNxkaKAllN1p402KSvDZdJlKUpS/X1E/DZSlsCo9rJcutk3FWmxUktsb5yQcVKEJVN98DdbTHo0s6Y101zqYeKqTSsTi84J0wUEW2Ny6w5m4KpXSN5x+SlID5H6/f3KeT/ACP9KUpSlKUpSniYvd/4X7TJmh1Yvj/ClKUpSlKUpsTMfkuhfaM4Jc6qyzVvkNPHueD3PAeE8Z4TwFOPcTePc0b5EmbTDuw7gvppSlGWRxC2x0j6DbgrgvgrgTcC6HSS2OIRQilKX6oNGNBrwTwTwRwdBHBPAl4Ei2EgkQl/AhCEJ9ulKUpSlKUpSlKUpSlKUpSn/9k=", "Soy sauce 200ml": "data:image/jpeg;base64,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", "Vinegar 385ml": "data:image/jpeg;base64,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", "Ice (tube)": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGgABAQEBAQEBAAAAAAAAAAAAAAEEAgMFB//EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/2gAMAwEAAhADEAAAAf0IbwAAAAAAAAAAABAgAAAACXwru+K50jOgAAACCoKgqCoKnkeHnx6173u3PbmzVRFQVBUAUAAAAy6sB5as2tPVLZ2lmgAAAIAAAACfN3fPT0249llS2djOwAAAIEAAAAy5vTJZu1Ydmp1ePTNCUAAAAgqCoKgseVYfl/T9tZx5vtefTnr74649aiWoKgqCoAoAABk1/OPPRn13PvObZ31z1nQKAAABAAAAT5n0fnJ1q8NGs99cdnQzoFAAAAISoKgOfI9cXfmevrl71nUx8S72Dqa3XH7HveOkqCoKgAAA4z6eDD57uVw87oYm0ZOtXRn0deh13zUoAAIKAAAiiTocuhFEoAAAAQIAAAAAAAAAAAB//8QAJBAAAQMDAwQDAAAAAAAAAAAAAQACEQMSQBAhMQQTIkEwMlD/2gAIAQEAAQUC/fJhF4hmzMZ5E47nlyagFGLUMMTeeNBiVTozX3h1D5JuMTA5I5aNsWp9U3HrHRmnoYjzL+4BWp1qTnYp4VRlQv6d3TdjomPJOJUPgmqxpFLp2UTOJWO6ahESveHUMvQ1HGEdhyQNwitsR/0CG5U7c4kpzITeF7neVKnAJRcr13F3QjVV6vV6DkD8xRR0hQoUKNAmofNCtVisVisVisVitUYcKFH73//EABoRAAMAAwEAAAAAAAAAAAAAAAERMAASUED/2gAIAQMBAT8B8j6boQ81sJmqOAc7/8QAGhEAAgIDAAAAAAAAAAAAAAAAARFAUAASMP/aAAgBAgEBPwGIrNdAVm0kXn//xAAlEAABAwMDAwUAAAAAAAAAAAABAAIRAyFAEiJQMWBhIDJBUXD/2gAIAQEABj8C7AlDj7dORjkr9lFNp/LlpbUaXfU5FdwafZDU3TpJYNXkJrnCqJ3TO044RBaL9USwkeJUYkZJzLYp9EY8Zdvwr//EACUQAQACAgICAgICAwAAAAAAAAEAESExQEEQUTBhIJFQcYGxwf/aAAgBAQABPyH+fAZgH6Fw0+6zx8JZ5NcV1FX+0A7Jh3B3xbj7xCvdQmkrS7hV54rOUvEBXEJWrYF48XaeJa4LqOgrFTccQK4dg+peTJYe0yX1Grw8Xp9+DmY6K8G+ImDqa07gidmprbfUGL4m6YI0g1Kf4n0uB5ZoHrhqkxu87l6QX/fupYdJqyBlmQJ6cX1UVuLo1fEqVd+BjSL8A1huDEnF2kMP24igD4MyB/cECdMKshRxRG5dy78NGm+IKx9Q/ZNGayl7V9wq3d10m+Jl/RKdqQ2uX7hLfRLAezh34WFvHUadX/fFFARiB6Pw1/Msp8LBTon1s9KvOeDbB+YYGIy0tLS0tAYGD5jGGH8xhJSHz1KlfgKlSv5v/9oADAMBAAIAAwAAABDLLLLLLLLLLLLL/wD/AP8A/wD8j3//AP8A888888sTsw888/DDDDCDe5jDDDDLLLLLcqnLLLLL/wD/AP8A/WB7/wD/AP8A88888kRA88888/HHHHb43vHHHHHzzzzrUn3zzzzw88+2fEFzi088/POPuh30jo/PPPDDACBDACBDDDD/AP8A/wD/AP8A/wD/AP8A/wD/AP/EAB8RAAMBAAIBBQAAAAAAAAAAAAABETAhMVEQQEFQYf/aAAgBAwEBPxD2bc1Mgnc2/RZt6NpciR9C5zkhVX4LzkxlOmXydhZwYeTOlKX6D//EAB0RAQADAAEFAAAAAAAAAAAAAAEAETAxIUBBUGH/2gAIAQIBAT8Q7MLdFQ5lysw1NAvpFHMc7lylP2OZKjl4nCOgkX13/8QAJBAAAwACAgIDAQADAQAAAAAAAAERITFBUTBhEHGBQCCRobH/2gAIAQEAAT8Q/ppSlKUpSlKUpfilKUpSlKXzVXIyurom4isuoj+zy/8Ar8VKUpSlKUpSlIuclqid0xNrTgzm7hSlKUpS+RtJNtxIkGNJYYYNUfDuhOkfYgtk8VKUpSlKUpR6SeXCMss16HkpztodsHshkSG11RsTopSlKUpfIpOJs+mQCNv0c2fVOvY5kkX2xONPowlS8fyKVWc5q1DUPFozDNyWxJskstiqFXeU1pjFj3vw0pSlKUpSln4NjdtPc5G4pGhVSeHDIZzXDkNsWFClKUpSlKUpSlKUpRnaYqN9I5xn6LUVnYOrTMswjNSlKUpSlKUpSlKUpSiDVVGWVy01OOPQpS6EJLZeK8jbQkrWTTj7Gqqw8IpSlKUpS+PIZ0LuD1NZSWEtqOiuxA3+d/h7hoxRxpqeKlKUpSlKemFTNhqs0g+L3Dr/AIq/TYm+G4HKd/8ASj1xDcdTcN/ohCZsXIi4KUpSlKUvictVaYG2223WzKRKnlPLzya+csmvTayIpRjHm1J6HNZUtOZfjpSlKUpSjRCw257+JrKHgZVUirT6EFeiosxcCbpSlKUpSlL4qzhOL8MlGbStyUViwosyZFn2/ju/BsqFVbbGJ2jjmBIg14ThyGgNgawG5R/zx0pSlKUojXW6Mt6hpXIxG020jFGRWTs9iqcYolE139lRSlKUpSlKUpSlKNoaoail3bhv0SJJHtradMWjdUmdIlqyaTqRPYk7EolYmilKUpf85fGjye0Tzl/oUsrfporj7DyynyJuz2lefjWXkZoOLvhMH8AgXwK4Zg0F5EpfgW+BHQ74J6PoR0JehJ0IXB1hJ5p8JJ6I6I6I6J6J+E8FKUpSlKUpSlKUpSlKUpSl/q//2Q==", "Candle (white)": "data:image/jpeg;base64,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", "AA Batteries (pair)": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wgARCADIAMgDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEFAwYHAgT/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAgEDBAX/2gAMAwEAAhADEAAAAegjcAAAAAAAAAAAAIEoEoEoEoEoEoEoEoEoEoEoEoAACJrdVWHQHSN/aAN/aBZG2rDRc3amgNzf2gDomz8V6rO2wigAIGgFbZVjOTodolAn14u+deqayy86pUPRzlAnqnKuqztuOdgAQABW2VazkxHaJRmMVvgjnVl8vx4+VYH3/L6eeJAnqvKuqTtuOdgAQABW2Vazk2XFcdJxXe513y/VpHy79Q9Z15kufXxq7i4jwejSvk33UfTyquq8q6p6uduOdAAQGAK2yrTk13SWVz1Ctp634nu2ek+D5O0YrujyfQ8+5edaj5Xr2PU89b7OPx9V5V1T3cLcRoABAlAmtsa3XJrGusbmwrLOs5dPGTHk3MmP34uccTHK0xNz8nVeVdVqbdCKlAlAAAVtlWa5NY11jc2mL1Wefr9Hz+Pdzkx+/HScv1Vjz9PfmHWPk6ryrqtzbiKAAhDUoE1tjWHJ7Gu+q5uaz7fj53j9x63PXj3FZij2514e8NZ83VeVdUrLhCdlAlAAAjFl8mnfLuuI02Nw861GNug1Jtk41Kdtk1L1tvs1jbvOY9TEgAEAAAiPQ8RkGOMoxMoxsg8T6ESAAAAAAAAAAAAAAAAH/8QALBAAAAQEBQQCAQUAAAAAAAAAAAECAwQFEjURExUgMBAWMTMUISQlMjRQYP/aAAgBAQABBQL/AFTs9hkOdwMDuBgdwMDuBgdwMDuBgdwMDuBgdwMDuBgdwMBufQylkeJcUwPCW7YCF+ZGaLA0TGEKCi9srPGV8Uxtu1KlIVrMdStanF7ZVa+KY23bANNUfE/VI9pqjbK7XxTG27UR2TCaijNXHZ0LtlVr4pjberVBufjg/jkHCYJBU5CksETlJOdZXa+KY20IRUChjMmpOTjL0HlPZZEMtIy0mGoTMdckxIayAtFPSV2vimNtEvSS4lYV5EyIukvIsesYRE4JXa+KY20Sz+WsK8iZfsEu2R3tErtfFMbaIU8FLmTxEqZvY6m8HIhcQoIeWwvUnRqLo1F0OGakCV2vimNtEN5cCvIT0VsX6hKrXxTG2iG8uBXkJ6K2L9QlVr4pjbRDeVfashOY8hCAnooNoJaSh0GldJOL9QlVr4pjbRDeXAryE9FbF+oSq18UxtohvLgV5BdD2L9QlVr4phbgyuk1OEoGWIwBF0MhSKRSHFfQldr4lfZOyRo16KkaOkaOkaQQ0ghpBDSCGkENHIaOkaKkNyRoloIklxmkUCgUCgUCgUCgUCgUAk82AwGApFIpFIpGAwGH91//xAAiEQACAgEEAQUAAAAAAAAAAAAAAQIRAxASEzAhIDFAUGH/2gAIAQMBAT8B+bZZZ5LLE+mMdzo2Om9V0puPscktV0cH6Tw7VZGO50cBkx7RetCyxMmRONGN1KzliZZqS8C6WLRi6WIsYuix6WMX1f8A/8QAJBEAAgIBAgYDAQAAAAAAAAAAAAECEQMEEhATFCAwQTFAUTL/2gAIAQIBAT8B+7tRtRtQqZtRtRJV4ck+XHcc6O5RXvjLwzhGf9C02NeuMu+TpWde/wAMOs5k9tGXJy4OR1z/AAwajmuqJd81ao6TIafTThkUmZ4OeNxR0uQ0uGUJWyXe+CH8cIku9jTZFUP4Gm/ZAl4KEhlEUPvsssssv7//xAAtEAAABAIHCAMBAQAAAAAAAAAAAQIRA3IEEBIgMDEzEyEyQVFxkaFgYYGSFP/aAAgBAQAGPwL5UaUpXEbmWQ0YnoaMT0NGJ6GjE9DRiehoxPQ0YnoaMT0NGJ6GjE9DRiegRKQtBdTDlh0iQ7yYRqslmYbZn3tA4aVWks5XoEuHSJDvEpJmSiyMg22/bJODWtRqUeZnegS4dIkO9EjR0kaCZJP1H+fla9BEaAkiQZmk263oEuHSJDvIhQ0E7uq0TjbbM9rs7P04XCiIJ802Sa9Alw6RIdwtobJ5hn55/Q3byIJsGZqfeFcNrl1Ge9uoOxw3IEuHSJDq+g+zV4CVmuy5ZMFIsmpubDeQyGQSiyZWjZ2ClbR2J2YcBj6qgS4dIkOqElRORruIVzqWfO4si61QJcOkSHVBnuQ+9UT8uRO9UCXDpEh1JMuoyQf4OFA4UB18uVVpA4UDhQMkhzzOqBLh0iQ6k98SBLh0iQ6k98SBLh0iQ6k9wRCKR8nsm4TYU9rfcidUk5bwh1WVKct58wqzwvurgS4dIkOpPfEgS4dIkOpPfEgS4dIkOvLBs1QJcQzREUgujONdX8jXV4GsrwNZXgayvA1leBrK8DWV4GsrwNdXga6v5BGuKpRdGYERExF8q//EACkQAQACAAQFBAMAAwAAAAAAAAEAESExQfEQMFFh8CBAgdFxobFQYOH/2gAIAQEAAT8h/wBpWi1ogobBhi/Fze43uN7je43uN7je43uN7je43uFa7pIfmoAII4ia8tEDT6oLFxTWjQ7zrP37ltUF2YOj6kst/wDT7FTl1tFIzQ3gYxIA2i19Xjd32KrIlF1GdB53+SjpC6D6vO7vsVYIwkIL2nztcPyTFWEQgPf1eN3eeoB9RRGGHWg4xeRLGtFz1iFfGLp5UzTMwYxTjLYWr+Z9soSHej0ed3eaqzbgIEDjraXyV2Lh+4pZnVFjF1KPR4IZQ17RNe4LCHu1up/caFp/DM4ZuHnd3mqrkJZ1mSJ1S5SqxKXwdXwADwV6sYblHB53d5qv00ycT9h/OHg+eLP0nDzu7zVM8pLjKYs6sfSD9zaH7l1jBgMjheAxwRyZsj9zbH7ipl/EcvaWvDzu77FWjXw0+o8bu+xVo1cNHqPG7vOVotCxazqNo0HAaw6w/KWvI0HvnNXDRHZvQgxuF1iWmuj4hAaiidTieN3fYq0auGj1Hjd32KtGvhp9V43d5d0jHhV/UbIJmJcuXlHCyWlpaFhN9eGEXxbymAQSxwRjdHjhA/ET+hKvpzY82/NnzZ82fNvzZ82nB/oQwHzqtALAoDIOWksjDyP8kiiBzK5jBq/zP//aAAwDAQACAAMAAAAQ/wD/AP8A/wD/AP8A/wD/AP8A/OOOOOOOOOOOOOCCUe+/8++DCCCwwnOOe+OOZwwwwwzkIWTIMlwwwyyzyAEXYBkyyy//AO41ezSPpv8A/wDPPMi8qIWVzPPPDDEyKddrnzDDD99s31tYbCy999xx5awQayyQ5xxxxhxxRxRxhxxxBBBBBBBBBBBBB//EAB8RAQEBAAICAwEBAAAAAAAAAAEAERAxICEwQEFR8P/aAAgBAwEBPxD7u7dqUW7cj5PXKYJ1H5z38nrncYt6X/PPfyYNcgpsBS2TM/2xiN38m9EgEmEJLgAE7+THfHS7cdfMx3CHZPbtAPz4YsSMh92JCfAwsLCwsLCz73//xAAkEQACAgIBAgcBAAAAAAAAAAABEQAxECEgQWFAUXGRodHh8f/aAAgBAgEBPxDxg2cgQbgahkA7DkLyMhB9hZeoFpVvptkP1RXpmvIXkKADALhAEbBLsqXbNOQuNi6Tdv5/kIA1feaBag63z/Ic5otynIXGPmELOnvEAofUsAP3OwPeEXkynIXKYvmvKchcpKwqGQEvFSJ/IC1KchcNRoQGbBRoQHcrzaNGjRo0JJ8d/8QAKBAAAwAABAUEAwEBAAAAAAAAAAERITFBURBhkcHwIHGhsTBAgdFQ/9oACAEBAAE/EP2aUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKUpSlKX99DEEKttxJDV7PFQuZWuZ5d3PLu55d3PLu55d3PLu55d3PLu55d3PLu55d3GJpj976WcxGF0wqR5NPVeqlKUo4MiDWeUHn6Z7iWUiumr4xegkUbEr+u2fA4O7cY5kaqZ6qP0rNDjcymvZKS6IpSlL6+PP0ocIkCyaYl47hL+o7GO6YQbt+lZny35Ljz9LmVGwaVf8TXVjfNZ3d+hpWugmo/6k+i9KzPnvVUpSlHMbxKUpRzrvfuyi6bvY/02FcNs0mw5d1/3Zxdd1uUpSieI3XFSlKUpSlKOY3iUowgxuFyjwwxzghTotUrEdbaVsmHvskWaoWtXEk4uyGkcpea5E1MsHu6Oj3d1TEirCtNYNaT3eiHWlXas0m8VvOaGtwFUcOk29MVWk3jyKUTxH64qUpSlKUpeHG8WWGPMTUQT6pXprewamTO7nejqY/wlQWnrE78j+q86Jr+HhbFl8YJM22NCqhoN6shHMqsCszFVCSrbVBDp7bJjoJ4o+eKlKUvr482IeIj8kuT6DNOk4uQo+LqNt31MBlnqaiaXBxEeqhJ2zoht7vqNZs/oz3YhQtYlkrH3Fmj578kx5vg7O4bPI7OGUjHweC2Qs0fPeqpSlKOY82NuzxmmsmIKAWLCb54Ocf48wC0FYh5z/eCciaR6nZobQjeEdEmmsGnc6sYZsDNtsWaH64qUpS+vjeL4Br4+YU7nFn2r7E8UfLeqpSlKOY3ixga+PnFO9xY3zX2J4obripSlKUpSlHMbxY5kuBCySM03u8i6rRjKnG6uDUkWLY2mV40d5gMqxfwzC8JZmIsDgo088G3hsWmMoKptlN6SbubHlgMa0OJv3zPuX2J4obripSlL6+PN8OysVaV04ZuIaTzSZFjgunD7l9izR8t+Ocx5vh2vj5+DLxM+xfYs0N134pksNngL2HmLQbSxPk+Rhxp6ZjIvk9oYrubIMXDBo9k9k56EUWa1loLNFIDTxx7NyF6aUpRhQZZoKmnmmh3+Wi8gs2nOTprz4bj8gfI0eR8njHc847nnHc847njHcTfI+RO8D5NKfDcdUSwHK2m3PYSQYviGCSWiEylKUpSlGWRtC2hyB8o+UvY9pewuUXKcglobQkhFKUvqaHY12Gmw12I2I2I2I2I2EuwkWgl2FIlP0IQhCf8T//Z"};
const SUGGESTED_CATS=['Pansit','Inumin','Kape','Gatas','Sitsirya','Kendi','Tinapay','De-lata','Pangunahin','Sawsawan','Malamig','Panligo','Panlinis','Iba pa'];
const CAT_TL={Noodles:'Pansit',Drinks:'Inumin',Coffee:'Kape',Milk:'Gatas',Snacks:'Sitsirya',Candy:'Kendi',Bread:'Tinapay',Canned:'De-lata',Staples:'Pangunahin',Condiments:'Sawsawan',Frozen:'Malamig',Toiletries:'Panligo',Household:'Panlinis',Others:'Iba pa'};
const NAME_TL={'Eggs':'Itlog','Rice (per kilo)':'Bigas (kada kilo)','Mint candies (per pc)':'Mint na kendi (kada piraso)','Chocolate bar 25g':'Tsokolate 25g','Pandesal (10 pcs)':'Pandesal (10 piraso)','Soy sauce 200ml':'Toyo 200ml','Vinegar 385ml':'Suka 385ml','Ice (tube)':'Yelo (tubo)','Candle (white)':'Kandila (puti)','AA Batteries (pair)':'Baterya AA (pares)','Joy Dishwashing sachet':'Joy panghugas ng pinggan (sachet)','Palmolive Shampoo sachet':'Palmolive shampoo (sachet)','Safeguard Bar Soap':'Safeguard sabon','Tide Powder 66g':'Tide sabong pulbos 66g'};
const NAME_EN=Object.fromEntries(Object.entries(NAME_TL).map(([a,b])=>[b,a]));
function migrateTL(d){let ch=false;(d.products||[]).forEach(p=>{if(NAME_TL[p.name]){p.name=NAME_TL[p.name];ch=true}if(CAT_TL[p.cat]){p.cat=CAT_TL[p.cat];ch=true}});
  (d.sales||[]).forEach(x=>x.items.forEach(i=>{if(NAME_TL[i.name]){i.name=NAME_TL[i.name];ch=true}}));(d.restocks||[]).forEach(x=>x.items.forEach(i=>{if(NAME_TL[i.name]){i.name=NAME_TL[i.name];ch=true}}));return ch}
const byRecent=list=>list.map((p,i)=>[p,i]).sort((a,b)=>((b[0].upd||0)-(a[0].upd||0))||(a[1]-b[1])).map(x=>x[0]);
function recentTag(p){const now=Date.now();if(p.created&&now-p.created<DAY&&(!p.upd||p.upd-p.created<60000))return '<span class="rtag new">New</span>';if(p.upd&&now-p.upd<DAY)return '<span class="rtag upd">Updated</span>';return ''}
function applySampleImgs(list){(list||[]).forEach(p=>{const k=SAMPLE_IMG[p.name]?p.name:NAME_EN[p.name];if(!S.imgs[p.id]&&!p.imgOff&&!p.noSample&&k&&SAMPLE_IMG[k])S.imgs[p.id]=SAMPLE_IMG[k]})}
/* ===== Auto-generated product pictures (drawn in the browser, same illustrated style as the samples) ===== */
const GEN={},GEN_PATHS={};
const GEN_PAL=[['#F7A21B','#E0601F'],['#3E9B4F','#256B35'],['#2F79D0','#1D4E99'],['#C8262C','#8E1A1E'],['#7B4A2B','#4E2C18'],['#8C5BD6','#6538A8'],['#D24FA3','#A2307C'],['#F5C934','#D99A1A'],['#1FA3A3','#13706F'],['#E8655F','#B5413C'],['#4A60E0','#3A44C4']];
const GEN_KW=[[/orange|dalandan/i,['#F7871F','#C85F0C']],[/cola|coke|root ?beer|sarsi/i,['#C8262C','#8E1A1E'],'#3A1F14'],[/soy|toyo/i,['#B3262B','#7A1A1D'],'#2A1408'],[/vinegar|suka/i,['#2F7A4A','#1F5A35'],'#F3EBD3'],[/patis|fish sauce/i,['#C9781A','#8A4D0E'],'#B5741B'],[/water|tubig|mineral/i,['#4FB3E8','#2A86C4'],'#DDF1FB'],[/oil|mantika/i,['#E9B735','#B98A16'],'#F4CC4A'],[/milk|gatas|evap|condensada|creamer/i,['#2F79D0','#1D4E99']],[/choco|cocoa/i,['#7B4A2B','#4E2C18']],[/coffee|kape|3-in-1|3 in 1/i,['#7B4A2B','#4E2C18']],[/lemon|calamansi|lime|menthol|mint/i,['#3FB24F','#258A35']],[/strawberry|pink|rose/i,['#E85A8C','#B83463']],[/ube|grape|lavender/i,['#8C5BD6','#6538A8']],[/mango|pineapple|pinya|banana|saging|cheese/i,['#F5C934','#D99A1A']],[/buko|coconut/i,['#9DB57A','#6E8A4E']],[/chicken|manok/i,['#F2B035','#C9781A']],[/beef|baka/i,['#B5532C','#7E3218']],[/pork|baboy|ham/i,['#E8655F','#B5413C']],[/fish|sardin|tuna|isda|mackerel/i,['#D0312D','#931F1C']],[/blue|ocean|cool/i,['#2F79D0','#1D4E99']]];
const GEN_WORDS=/^(itlog|bigas|toyo|suka|yelo|kandila|baterya|sabon|tsokolate|kendi|tinapay|gatas|kape|sardinas|asin|mantika|pancit|canton|mami|noodles?|sardines?|corned|beef|chicken|tuna|cola|orange|milk|coffee|kape|chips|crackers?|biscuits?|cookies|soap|shampoo|conditioner|powder|detergent|toyo|suka|vinegar|soy|sauce|ketchup|rice|bigas|sugar|asukal|salt|asin|bread|tinapay|pandesal|candy|candies|mints?|lollipop|chocolate|gum|ice|candle|kandila|batteries|matches|water|juice|oil|patis|eggs?|soda|cream|lotion|toothpaste|tissue|napkin|wafer|cupcake|peanuts?|mani|cornick|pulutan|yakult|yogurt|gin|beer|hotdog|longganisa|tocino)$/i;
function ghash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function gmix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const ch=s=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t);return '#'+[ch(16),ch(8),ch(0)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function genKind(name,cat){const n=(name||'').toLowerCase();let c=(cat||'').toLowerCase();
  c=c.replace('inumin','drink').replace('sawsawan','condiment').replace('de-lata','canned').replace('kendi','candy').replace('pangunahin','staple').replace('tinapay','bread').replace('malamig','frozen').replace('pansit','noodle').replace('sitsirya','snack').replace('kape','coffee').replace('gatas','milk').replace('panlinis','household').replace('panligo','toiletr');
  if(/\bcup\b/.test(n))return'cup';
  if(/sachet|3-in-1|3 in 1|\bstick\b/.test(n))return'sachet';
  if(/\bcan\b|sardin|corned|tuna|meat ?loaf|luncheon|vienna|\btin\b/.test(n)||c.includes('canned'))return'can';
  if(/\d+(\.\d+)?\s?(ml|l)\b|liter|litre|bottle|bote/.test(n)||c.includes('drink')||c.includes('condiment')||c.includes('sauce'))return'bottle';
  if(/per pc|per piece|candies|\bjar\b|garapon/.test(n)||c.includes('candy'))return'jar';
  if(/rice|bigas|sugar|asukal|flour|harina|salt|asin|pandesal|bread|tinapay|\bice\b/.test(n)||c.includes('staple')||c.includes('bread')||c.includes('frozen'))return'bag';
  if(c.includes('noodle')||c.includes('snack')||/chips|noodle|pancit|mami|canton|curls|crackers|biscuit/.test(n))return'pack';
  if(c.includes('coffee')||c.includes('milk')||c.includes('household')||c.includes('toiletr'))return'sachet';
  return'box'}
function genText(name,cat){
  const sz=(name||'').match(/(\d+(?:\.\d+)?)\s?(ml|l|g|kg|pcs|pc)\b/i);
  const words=(name||'').replace(/\(.*?\)/g,' ').replace(/(\d+(?:\.\d+)?)\s?(ml|l|g|kg|pcs|pc)\b/ig,' ').split(/[\s\-\/,]+/).filter(w=>w.length>1&&!/^\d+$/.test(w));
  const t=words.find(w=>GEN_WORDS.test(w))||words.slice().sort((a,b)=>b.length-a.length)[0]||cat||'Item';
  return{title:t.toUpperCase().slice(0,11),sub:sz?sz[1]+' '+sz[2].toLowerCase():(cat||'').toLowerCase()}}
function gIconPaths(name){if(GEN_PATHS[name])return GEN_PATHS[name];const out=[];(I[name]||I.bag).replace(/<(path|circle|rect|ellipse)([^>]*)\/?>/g,(m,tag,attrs)=>{const a={};attrs.replace(/([\w-]+)="([^"]*)"/g,(_,k,v)=>{a[k]=v});let d='';
  if(tag==='path')d=a.d;
  else if(tag==='circle'){const x=+a.cx,y=+a.cy,r=+a.r;d=`M${x-r} ${y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`}
  else if(tag==='ellipse'){const x=+a.cx,y=+a.cy,rx=+a.rx,ry=+a.ry;d=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0`}
  else if(tag==='rect'){const x=+a.x,y=+a.y,w=+a.width,h=+a.height,r=+(a.rx||0);d=r?`M${x+r} ${y}h${w-2*r}a${r} ${r} 0 0 1 ${r} ${r}v${h-2*r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w-2*r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h-2*r)}a${r} ${r} 0 0 1 ${r} ${-r}z`:`M${x} ${y}h${w}v${h}h${-w}z`}
  if(d){try{out.push(new Path2D(d))}catch(e){}}});return GEN_PATHS[name]=out}
function genImg(p){
  const name=p.name||'',cat=p.cat||'',gv=p.gv||0,key=name+'|'+cat+'|'+gv;
  if(GEN[key])return GEN[key];
  const c=document.createElement('canvas');c.width=c.height=240;const x=c.getContext('2d');if(!x)return '';
  x.scale(240/600,240/600);
  const h=ghash(name+cat),kw=GEN_KW.find(k=>k[0].test(name));
  const pal=gv||!kw?GEN_PAL[(h+gv*3)%GEN_PAL.length]:kw[1],[c1,c2]=pal,liquid=(!gv&&kw&&kw[2])||gmix(c1,'#1A0E08',.55);
  const kind=genKind(name,cat),{title,sub}=genText(name,cat),iconName=catMeta(cat||title).i;
  const FONT=s=>`700 ${s}px Geist, "Helvetica Neue", Arial, sans-serif`;
  const rr=(X,Y,W,H,R)=>{x.beginPath();x.roundRect?x.roundRect(X,Y,W,H,R):x.rect(X,Y,W,H)};
  const vg=(y0,y1,a,b)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const cyl=(x0,x1,base)=>{const g=x.createLinearGradient(x0,0,x1,0);g.addColorStop(0,gmix(base,'#000000',.35));g.addColorStop(.28,gmix(base,'#ffffff',.28));g.addColorStop(.42,base);g.addColorStop(1,gmix(base,'#000000',.42));return g};
  const shadow=(cx,cy,rx)=>{x.save();x.translate(cx,cy);x.scale(1,.16);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba(30,25,45,.32)');g.addColorStop(1,'rgba(30,25,45,0)');x.fillStyle=g;x.fillRect(-rx,-rx,rx*2,rx*2);x.restore()};
  const sheen=(X0,X1,Y0,Y1)=>{x.save();x.clip();const g=x.createLinearGradient(X0,0,X1,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.45,'rgba(255,255,255,.38)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(X0,Y0,X1-X0,Y1-Y0);x.restore()};
  const text=(t,X,Y,size,col,maxW,stroke)=>{let s=size;x.font=FONT(s);while(x.measureText(t).width>maxW&&s>14){s-=2;x.font=FONT(s)}x.textAlign='center';x.textBaseline='middle';if(stroke){x.lineWidth=5;x.strokeStyle=stroke;x.lineJoin='round';x.strokeText(t,X,Y)}x.fillStyle=col;x.fillText(t,X,Y)};
  const crimp=(X0,X1,Y,len)=>{x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let i=X0;i<X1;i+=14){x.beginPath();x.moveTo(i,Y);x.lineTo(i,Y+len);x.stroke()}};
  const icon=(cx,cy,size,col,lw=1.7)=>{x.save();x.translate(cx-size/2,cy-size/2);x.scale(size/24,size/24);x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';x.lineJoin='round';gIconPaths(iconName).forEach(pp=>x.stroke(pp));x.restore()};
  // background
  x.fillStyle=vg(0,600,gmix(c1,'#ffffff',.9),gmix(c1,'#ffffff',.78));x.fillRect(0,0,600,600);
  const tilt=((h>>3)%9-4)*1.2*Math.PI/180;
  if(kind==='pack'||kind==='sachet'){
    const W=kind==='pack'?410:270,H=kind==='pack'?310:370,X0=300-W/2,Y0=kind==='pack'?150:120;
    shadow(300,Y0+H+20,W*.55);
    x.save();x.translate(300,300);x.rotate(kind==='sachet'?tilt:0);x.translate(-300,-300);
    rr(X0,Y0,W,H,kind==='pack'?34:12);x.fillStyle=vg(Y0,Y0+H,c1,c2);x.fill();
    x.fillStyle=c2;[Y0,Y0+H-24].forEach(y=>{rr(X0,y,W,24,8);x.fill();crimp(X0+8,X0+W-8,y+4,16)});
    x.beginPath();x.arc(300,Y0+H*.62,kind==='pack'?80:74,0,Math.PI*2);x.fillStyle='rgba(255,255,255,.2)';x.fill();
    icon(300,Y0+H*.62,kind==='pack'?100:92,'#ffffff',1.6);
    text(title,300,Y0+(kind==='pack'?76:82),50,'#ffffff',W-50,c2);
    if(sub)text(sub,300,Y0+(kind==='pack'?118:124),22,'rgba(255,255,255,.9)',W-60);
    rr(X0,Y0,W,H,kind==='pack'?34:12);sheen(X0,X0+W*.45,Y0,Y0+H);
    x.restore();
  }else if(kind==='bottle'){
    const cx=300,bw=140,top=70,neck=118,sh=225,bot=522,nw=36;
    shadow(cx,bot,bw+20);
    x.beginPath();x.moveTo(cx-nw,neck);x.lineTo(cx+nw,neck);x.lineTo(cx+nw+6,sh-70);x.lineTo(cx+bw,sh);x.lineTo(cx+bw,bot-20);x.quadraticCurveTo(cx+bw,bot,cx+bw-20,bot);x.lineTo(cx-bw+20,bot);x.quadraticCurveTo(cx-bw,bot,cx-bw,bot-20);x.lineTo(cx-bw,sh);x.lineTo(cx-nw-6,sh-70);x.closePath();
    x.fillStyle=cyl(cx-bw,cx+bw,liquid);x.fill();
    x.save();x.clip();x.fillStyle=cyl(cx-bw,cx+bw,'#E8EEF2');x.fillRect(0,neck,600,40);x.restore();
    rr(cx-bw,300,bw*2,120,4);x.fillStyle=cyl(cx-bw,cx+bw,c1);x.fill();
    text(title,cx,346,40,'#ffffff',bw*2-30);if(sub)text(sub,cx,388,20,'rgba(255,255,255,.88)',bw*2-30);
    rr(cx-nw-6,top,(nw+6)*2,neck-top+4,8);x.fillStyle=c2;x.fill();
    x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=2;for(let i=0;i<6;i++){x.beginPath();x.moveTo(cx-nw+i*14,top+6);x.lineTo(cx-nw+i*14,neck-2);x.stroke()}
    x.beginPath();x.rect(cx-bw+16,sh,30,bot-sh-30);sheen(cx-bw+10,cx-bw+56,sh,bot);
  }else if(kind==='can'){
    const w=150,top=150,bot=470;shadow(300,bot,w+20);
    rr(300-w,top,w*2,bot-top,18);x.fillStyle=cyl(300-w,300+w,'#C9CED6');x.fill();
    rr(300-w,top+40,w*2,bot-top-70,4);x.fillStyle=cyl(300-w,300+w,c1);x.fill();
    x.beginPath();x.ellipse(300,top,w,22,0,0,Math.PI*2);x.fillStyle='#E3E6EB';x.fill();
    x.beginPath();x.ellipse(300,top,w-14,14,0,0,Math.PI*2);x.fillStyle='#C2C7CF';x.fill();
    text(title,300,262,42,'#ffffff',w*2-40);if(sub)text(sub,300,304,20,'rgba(255,255,255,.88)',w*2-40);
    icon(300,370,64,'rgba(255,255,255,.9)',1.5);
    rr(300-w,top,w*2,bot-top,18);sheen(300-w+10,300-w+70,top,bot);
  }else if(kind==='cup'){
    shadow(300,488,150);
    x.beginPath();x.moveTo(165,150);x.lineTo(435,150);x.lineTo(400,490);x.lineTo(200,490);x.closePath();x.fillStyle=cyl(165,435,'#FAFAFA');x.fill();
    x.beginPath();x.moveTo(176,250);x.lineTo(424,250);x.lineTo(414,340);x.lineTo(186,340);x.closePath();x.fillStyle=cyl(176,424,c1);x.fill();
    text(title,300,296,40,'#ffffff',220);if(sub)text(sub,300,205,24,c1,240);
    icon(300,410,60,c2,1.5);
    x.beginPath();x.ellipse(300,150,140,22,0,0,Math.PI*2);x.fillStyle='#D7DBE2';x.fill();x.beginPath();x.ellipse(300,150,132,16,0,0,Math.PI*2);x.fillStyle='#EEF0F4';x.fill();
  }else if(kind==='jar'){
    shadow(300,498,170);
    rr(150,170,300,325,50);x.fillStyle=gmix(c1,'#ffffff',.85);x.fill();
    x.save();rr(150,170,300,325,50);x.clip();let r=h;
    for(let i=0;i<120;i++){r=(r*1664525+1013904223)>>>0;const px=150+(r%300);r=(r*1664525+1013904223)>>>0;const py=225+(r%275);const col=[c1,'#ffffff',c2,gmix(c1,'#ffffff',.5)][i%4];x.beginPath();x.ellipse(px,py,19,15,0,0,Math.PI*2);x.fillStyle=col;x.fill();x.strokeStyle='rgba(0,0,0,.08)';x.stroke()}
    x.fillStyle='rgba(255,255,255,.22)';x.fillRect(150,170,300,325);x.restore();
    rr(180,130,240,50,14);x.fillStyle=c2;x.fill();
    rr(205,296,190,78,12);x.fillStyle='#ffffff';x.fill();text(title,300,325,34,c2,170);if(sub)text(sub,300,356,16,gmix(c2,'#ffffff',.3),170);
    rr(150,170,300,325,50);sheen(160,230,170,495);
  }else if(kind==='bag'){
    shadow(300,495,190);
    x.beginPath();x.moveTo(150,170);x.lineTo(450,170);x.lineTo(470,490);x.lineTo(130,490);x.closePath();x.fillStyle=vg(170,490,gmix(c1,'#ffffff',.92),gmix(c1,'#ffffff',.78));x.fill();
    x.save();x.clip();let r=h;for(let i=0;i<500;i++){r=(r*1664525+1013904223)>>>0;const px=130+(r%340);r=(r*1664525+1013904223)>>>0;const py=190+(r%300);x.fillStyle=`rgba(255,255,255,${.5+(i%3)*.15})`;x.fillRect(px,py,7,3)}x.restore();
    x.beginPath();x.moveTo(150,170);x.lineTo(450,170);x.lineTo(360,120);x.lineTo(240,120);x.closePath();x.fillStyle=gmix(c1,'#ffffff',.9);x.fill();
    x.fillStyle=c1;x.fillRect(262,100,76,22);
    rr(185,290,230,100,14);x.fillStyle=c1;x.fill();text(title,300,328,38,'#ffffff',200);if(sub)text(sub,300,366,18,'rgba(255,255,255,.88)',200);
    icon(300,445,44,c2,1.6);
    x.beginPath();x.moveTo(150,170);x.lineTo(450,170);x.lineTo(470,490);x.lineTo(130,490);x.closePath();sheen(150,230,170,490);
  }else{ // box
    shadow(300,478,200);
    rr(120,170,360,300,22);x.fillStyle=vg(170,470,c1,c2);x.fill();
    rr(160,300,280,140,14);x.fillStyle='rgba(255,255,255,.92)';x.fill();
    icon(300,370,86,c2,1.5);
    text(title,300,222,46,'#ffffff',320,c2);if(sub)text(sub,300,266,20,'rgba(255,255,255,.88)',320);
    rr(120,170,360,300,22);sheen(130,240,170,470);
  }
  let url='';try{url=c.toDataURL('image/jpeg',.84)}catch(e){}
  return GEN[key]=url;
}

function blossom(cx,cy,sz,c1,c2,id){
  // decorative mini sari-sari store (kept the old name so callers stay the same)
  let aw='';for(let i=0;i<4;i++){const x=14+i*18;aw+=`<path d="M${x} 27h18v11a9 9 0 0 1-18 0z" fill="${i%2?'#fff':`url(#${id}a)`}"/>`}
  return `<svg class="blossom" viewBox="0 0 100 100" style="left:${cx};top:${cy};width:${sz}px;height:${sz}px" aria-hidden="true"><defs>
    <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
    <ellipse cx="50" cy="90" rx="36" ry="4" fill="${c1}" opacity=".14"/>
    <rect x="20" y="40" width="60" height="47" rx="4" fill="#fff"/>
    <rect x="27" y="51" width="28" height="19" rx="2.5" fill="url(#${id}b)"/>
    <path d="M34 51v19M41 51v19M48 51v19" stroke="${c1}" stroke-width="1.2" opacity=".45"/>
    <rect x="24" y="69" width="35" height="4" rx="2" fill="${c1}"/>
    <rect x="61" y="51" width="13" height="36" rx="2.5" fill="url(#${id}a)" opacity=".85"/>
    <circle cx="71" cy="70" r="1.3" fill="#fff"/>
    <rect x="12" y="19" width="76" height="8" rx="4" fill="${c1}"/>
    ${aw}
    <path d="M14 27h72v11${[0,1,2,3].map(()=>'a9 9 0 0 1-18 0').join('')}z" fill="none" stroke="${c1}" stroke-width="1" opacity=".35"/>
  </svg>`;
}

/* ===== Parallax and motion (landing page) ===== */
const PX={mx:0,my:0,tx:0,ty:0,raf:0,bound:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,fine:matchMedia('(pointer:fine)').matches};
function pxSchedule(){if(!PX.raf)PX.raf=requestAnimationFrame(pxFrame)}
function pxFrame(){PX.raf=0;if(S.view!=='landing'||PX.reduced)return;
  PX.mx+=(PX.tx-PX.mx)*.08;PX.my+=(PX.ty-PX.my)*.08;
  const y=window.scrollY,vh=innerHeight;
  const hero=document.querySelector('.hero4');
  if(hero&&y<hero.offsetHeight+300){
    const p=Math.min(1,y/420);
    const inn=hero.querySelector('.hero4-in');if(inn){inn.style.translate=`0 ${(y*.32).toFixed(1)}px`;inn.style.opacity=Math.max(0,1-y/560).toFixed(3);inn.style.scale=(1-p*.04).toFixed(4)}
    const gl=hero.querySelector('.hglow');if(gl)gl.style.translate=`${(PX.mx*-18).toFixed(1)}px ${(y*.45+PX.my*-14).toFixed(1)}px`;
    hero.querySelectorAll('.floaters>*').forEach((el,i)=>{const d=el.classList.contains('blossom')?1:el.classList.contains('avt')?.65+(i%3)*.08:.38+(i%2)*.1;
      el.style.translate=`${(PX.mx*26*d).toFixed(1)}px ${(-y*.55*d+PX.my*22*d).toFixed(1)}px`});
    const gc=hero.querySelector('.glasscard');if(gc)gc.style.transform=`perspective(1400px) rotateX(${(24*(1-p)+PX.my*-3).toFixed(2)}deg) rotateY(${(PX.mx*4).toFixed(2)}deg) scale(${(.93+.07*p).toFixed(4)})`;
    const pl=hero.querySelector('.peek.l'),pr=hero.querySelector('.peek.r');
    if(pl)pl.style.translate=`${(-40*p+PX.mx*14).toFixed(1)}px ${(-y*.22+PX.my*10).toFixed(1)}px`;
    if(pr)pr.style.translate=`${(40*p+PX.mx*14).toFixed(1)}px ${(-y*.3+PX.my*10).toFixed(1)}px`;
  }
  document.querySelectorAll('[data-par]').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;const c=(r.top+r.height/2)-vh/2;el.style.translate=`0 ${(-c*parseFloat(el.dataset.par)).toFixed(1)}px`});
  if(Math.abs(PX.tx-PX.mx)>.001||Math.abs(PX.ty-PX.my)>.001)pxSchedule();
}
function tiltMove(e){const el=e.currentTarget,r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  el.style.transform=`perspective(1000px) rotateX(${((.5-y)*7).toFixed(2)}deg) rotateY(${((x-.5)*9).toFixed(2)}deg) translateZ(0)`;
  el.style.setProperty('--gx',(x*100).toFixed(1)+'%');el.style.setProperty('--gy',(y*100).toFixed(1)+'%');el.classList.add('tilting')}
function tiltLeave(e){const el=e.currentTarget;el.style.transform='';el.classList.remove('tilting')}
function countUp(el){const m=el.textContent.match(/^(\D*)(\d+)(.*)$/);if(!m||+m[2]===0||el.dataset.counted)return;el.dataset.counted='1';const to=+m[2],t0=performance.now(),dur=1100;
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=m[1]+Math.round(to*e)+m[3];if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
function initParallax(){
  if(!PX.bound){PX.bound=true;
    addEventListener('scroll',pxSchedule,{passive:true});addEventListener('resize',pxSchedule,{passive:true});
    addEventListener('pointermove',e=>{if(!PX.fine||S.view!=='landing')return;PX.tx=e.clientX/innerWidth*2-1;PX.ty=e.clientY/innerHeight*2-1;pxSchedule()},{passive:true});}
  if(S.view!=='landing'||PX.reduced)return;
  if(PX.fine)document.querySelectorAll('[data-tilt]').forEach(el=>{if(el.dataset.tb)return;el.dataset.tb='1';el.addEventListener('pointermove',tiltMove);el.addEventListener('pointerleave',tiltLeave)});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.querySelectorAll('b').forEach(countUp);io.unobserve(en.target)}}),{threshold:.4});document.querySelectorAll('.wstats').forEach(e=>io.observe(e))}
  pxSchedule();
}

function hidePre(t0){const el=document.getElementById('pre');if(!el)return;const min=matchMedia('(prefers-reduced-motion: reduce)').matches?250:2300;
  setTimeout(()=>{el.classList.add('done');document.body.classList.add('pre-out');setTimeout(()=>{el.remove();document.body.classList.remove('pre-out')},900)},Math.max(0,min-(performance.now()-t0)))}
function initReveal(){
  const els=document.querySelectorAll('[data-reveal]:not(.in)');if(!els.length)return;
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.18});
  els.forEach(e=>io.observe(e));
}
const initials=n=>String(n||'').split(/\s+/).filter(w=>w&&!/^(ni|ng|sa|the|of)$/i.test(w)).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'S';

/* ================= Persistence ================= */
const P={mode:'local',col:null,timers:{},writing:{},pending:{},
  async init(){
    try{
      if(!window.claude||typeof window.claude.use!=='function')return;
      const t=ms=>new Promise(r=>setTimeout(()=>r(null),ms));
      const db=await Promise.race([window.claude.use('db'),t(6000)]);
      if(!db)return;
      const user=await Promise.race([window.claude.use('user'),t(4000)]);
      const id=user?await user.id():null;
      if(!id)return;
      this.col=db.collection('data/users/'+id);this.mode='db';
    }catch(e){this.mode='local'}
  },
  lget(k){try{const v=localStorage.getItem('suki:'+k);return v?JSON.parse(v):null}catch(e){return null}},
  async get(k){
    if(this.mode==='db'){
      try{const s=await this.col.doc(k).get();if(s.exists)return JSON.parse(JSON.stringify(s.data()));}catch(e){}
    }
    return this.lget(k);
  },
  save(k,v){this.pending[k]=v;clearTimeout(this.timers[k]);this.timers[k]=setTimeout(()=>this.flush(k),350)},
  async flush(k){
    if(this.writing[k]){this.timers[k]=setTimeout(()=>this.flush(k),250);return}
    if(!(k in this.pending))return;
    const json=JSON.stringify(this.pending[k]);delete this.pending[k];
    try{localStorage.setItem('suki:'+k,json)}catch(e){}
    if(this.mode!=='db')return;
    this.writing[k]=true;
    try{await this.col.doc(k).set(JSON.parse(json))}
    catch(e){
      if(e&&e.code==='quota_exceeded')toast('Storage is full. Older history may not be saved.');
      else if(e&&e.code==='invalid_argument'){this.mode='local';toast('Saving on this device only.')}
    }finally{this.writing[k]=false}
  }
};
const savePlatform=()=>P.save('platform',S.platform);
const saveStore=id=>P.save('s_'+id,S.data[id]);

/* ================= State ================= */
const LOC=()=>S.lang==='tl'?'fil-PH':'en-PH';
const S={lang:(()=>{try{return localStorage.getItem('suki:lang')||'tl'}catch(e){return 'tl'}})(),avs:{},imgs:{},pf:null,platform:null,data:{},session:null,view:'landing',tab:'sell',reg:null,cart:[],cash:'',q:'',cat:'All',cartOpen:false,
  invQ:'',invF:'all',rs:{items:[],supplier:''},adQ:'',adF:'all'};
const store=()=>S.session&&S.platform.stores.find(s=>s.id===S.session.storeId);
const data=()=>S.session&&S.data[S.session.storeId];
const findStore=id=>S.platform.stores.find(s=>s.id===id);
function storeState(st){
  if(st.status==='suspended')return'suspended';
  if(st.expires<Date.now())return'expired';
  if(st.expires-Date.now()<5*DAY)return'expiring';
  return st.plan==='trial'?'trial':'active';
}
function statePill(st){
  const s=storeState(st);
  const map={active:['ok','Active'],trial:['warn','Free trial'],expiring:['warn','Renew soon'],expired:['bad','Expired'],suspended:['bad','Paused']};
  const [c,t]=map[s];return `<span class="pill ${c}"><span class="dot"></span>${t}</span>`;
}
async function loadData(id){
  if(!S.data[id]){
    const d=await P.get('s_'+id);
    S.data[id]=Object.assign({products:[],sales:[],restocks:[],daily:{}},d||{});
    await Promise.all(S.data[id].products.filter(p=>p.hasImg&&!S.imgs[p.id]).map(async p=>{try{const r=await P.get('img_'+p.id);if(r&&r.d)S.imgs[p.id]=r.d}catch(e){}}));
    if(migrateTL(S.data[id]))saveStore(id);
    applySampleImgs(S.data[id].products);
  }
  return S.data[id];
}
function setSession(s){S.session=s;try{s?localStorage.setItem('suki:session',JSON.stringify(s)):localStorage.removeItem('suki:session')}catch(e){}}
function rememberStore(code){try{let r=JSON.parse(localStorage.getItem('suki:recent')||'[]');r=[code,...r.filter(c=>c!==code)].slice(0,4);localStorage.setItem('suki:recent',JSON.stringify(r))}catch(e){}}
function recentCodes(){try{return JSON.parse(localStorage.getItem('suki:recent')||'[]').filter(c=>S.platform.stores.some(s=>s.code===c))}catch(e){return[]}}

/* ================= Toast / modal ================= */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)}
function openModal(html){const m=$('#modal');m.innerHTML=`<div class="scrim" data-act="closeModal"></div><div class="dialog" role="dialog" aria-modal="true"><button class="iconbtn x" data-act="closeModal" aria-label="Close">${ico('x',18)}</button>${html}</div>`;m.classList.add('open');const f=m.querySelector('[data-autofocus]')||m.querySelector('input,select');if(f)setTimeout(()=>f.focus(),30)}
function closeModal(){const m=$('#modal');m.classList.remove('open');m.innerHTML=''}

/* ================= Render ================= */
function render(){
  const views={landing:vLanding,register:vRegister,signin:vSignin,store:vStore,blocked:vBlocked,adminLogin:vAdminLogin,admin:vAdmin};
  $('#app').innerHTML=(views[S.view]||vLanding)();
  initReveal();initParallax();
  const f=$('#app [data-autofocus]');if(f&&window.matchMedia('(min-width:900px)').matches)f.focus();
}

/* ---------- Landing ---------- */
function planCard(p,opts={}){
  const feats={trial:['All features included','No payment needed','Upgrade any time'],monthly:['Unlimited products','Sales, restock and reports','Cancel any time'],yearly:['Everything in Monthly','Pay once a year','Priority support']}[p.id];
  return `<button class="plan ${opts.sel?'sel':''} ${opts.feat?'feat':''}" data-act="${opts.act||'startReg'}" data-plan="${p.id}">
    <span class="pname">${p.name}</span>
    <span class="pprice num">${p.price?pesoR(p.price):'Free'}<small>${p.per}</small></span>
    <span class="pnote">${p.note}</span>
    <ul>${feats.map(f=>`<li>${ico('check',16)}<span>${f}</span></li>`).join('')}</ul>
  </button>`;
}
function pricingHtml(){
  const y=S.bill==='yearly',paid=y?PLANS.yearly:PLANS.monthly;
  const perDay=Math.round(paid.price/paid.days);
  const feat=[['sell','Unlimited sales and products'],['camera','Product and owner photos'],['bell','Low-stock warnings'],['chart','Daily sales and profit reports'],['bag','Restock records'],['shield','Your own store code and PIN']];
  const faqs=[['Do I need special hardware?','No. Kahera runs in the browser of any phone, tablet or computer you already have.'],
    ['What happens after the free trial?','Your products and sales stay saved. Pick Monthly or Yearly to keep selling, whenever you are ready.'],
    ['Can I switch between Monthly and Yearly?','Yes. Go to Settings, then Renew or change plan, and pick the one that suits your store.']];
  return `<div class="pr-head" data-reveal>
      <span class="eyebrow">Pricing</span>
      <h2>One simple price <span class="soft">per store.</span></h2>
      <p>Start free for 14 days. No payment needed until you're sure.</p>
      <div class="billtog" role="tablist" aria-label="Billing period">
        <button class="${y?'':'on'}" role="tab" aria-selected="${!y}" data-act="bill" data-b="monthly">Monthly</button>
        <button class="${y?'on':''}" role="tab" aria-selected="${y}" data-act="bill" data-b="yearly">Yearly<span class="save">2 months free</span></button>
        <i class="thumbx ${y?'r':''}"></i>
      </div>
    </div>
    <div class="pr-grid" data-reveal>
      <article class="pcard" data-tilt><span class="glare"></span>
        <div class="ph"><span class="pn">Free trial</span></div>
        <div class="pp"><b>₱0</b><span>for 14 days</span></div>
        <p class="pd">Try every feature with your real paninda. No card, no GCash, no commitment.</p>
        <button class="btn lg block" data-act="startReg" data-plan="trial">Start free trial</button>
        <ul>${['All features included','No payment needed','Upgrade any time'].map(t=>`<li>${ico('check',15)}${t}</li>`).join('')}</ul>
      </article>
      <article class="pcard feat" data-tilt><span class="glare"></span>
        <div class="pglow" aria-hidden="true"></div>
        ${blossom('86%','-40px',84,'#EE6E6A','#FFD9C2','blp')}
        <div class="ph"><span class="pn">Kahera Store</span><span class="badge">Most stores pick this</span></div>
        <div class="pp"><b class="num" key="${S.bill}">₱${paid.price.toLocaleString(LOC())}</b><span>${y?'per year':'per month'}</span></div>
        <p class="pd">${y?`Works out to about ₱${Math.round(paid.price/12)} a month.`:'Billed every 30 days. Cancel any time.'} That's around <b>₱${perDay} a day</b>, less than a sachet of 3-in-1.</p>
        <button class="btn white lg block" data-act="startReg" data-plan="${y?'yearly':'monthly'}">Register your store${arw()}</button>
        <ul>${['Everything in the free trial','Keep all your sales history','Priority help when you need it'].map(t=>`<li>${ico('check',15)}${t}</li>`).join('')}</ul>
      </article>
    </div>
    <div class="incl" data-reveal>
      <div class="incl-h"><span>Included in every plan</span><span class="paym"><em>GCash</em><em>Maya</em><em>Card</em></span></div>
      <div class="incl-g">${feat.map(([i,t])=>`<div><span class="ii">${ico(i,16)}</span>${t}</div>`).join('')}</div>
    </div>
    <div class="faq" data-reveal>${faqs.map(([q,a],k)=>`<details ${k===0?'open':''}><summary>${q}<span class="pm" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}</div>`;
}
function whyHtml(){
  const i=S.why||0;
  const items=[
    {t:'Set your rules once',d:'Store hours, low-stock warnings and how you take payment. Kahera applies them every time you sell or restock.',chip:'Applied to every sale',q:'Wala nang listahan sa notebook.'},
    {t:'Sell at the counter',d:'Tap what the customer bought and enter their cash. The sukli shows right away and stock updates on its own.',chip:'Sukli shown instantly',q:'Mabilis na, tama pa ang sukli.'},
    {t:'Restock before it runs out',d:'Every sale updates your stock. When something runs low, Kahera flags it so your palengke list is ready.',chip:'Palengke list ready',q:'Hindi na ako nauubusan ng Tide.'}];
  const row=(ic,t,sub,ctl)=>`<div class="srow"><span class="si">${ico(ic,16)}</span><div><b>${t}</b><small>${sub}</small></div>${ctl}</div>`;
  const sel=v=>`<span class="selp">${v}${ico('chevd',12)}</span>`;
  const cards=[
    `<div class="sc-h"><span class="sci">${ico('gearc',18)}</span><div><b>Your store rules</b><small>Set them once. Kahera handles the rest.</small></div></div>
     ${row('clock','Store hours','When you are open',sel('6:00 AM - 10:00 PM'))}
     ${row('bell','Low-stock warning','Flag items running out',sel('5 pieces'))}
     ${row('wallet','Payment','How customers usually pay',sel('Cash and GCash'))}
     ${row('receipt','Daily summary','Sales and profit at closing',`<span class="tgl on"></span>`)}`,
    `<div class="sc-h"><span class="sci">${ico('sell',18)}</span><div><b>Current sale</b><small>3 items, ready to charge</small></div></div>
     ${row('c_noodles','Pancit Canton','₱18.00 each',sel('×2'))}
     ${row('c_coffee','Kopiko Brown','₱10.00 each',sel('×3'))}
     ${row('c_eggs','Eggs','₱9.00 each',sel('×4'))}
     <div class="srow tot"><span></span><div><b>Sukli</b><small>Cash ₱200.00</small></div><span class="big">₱78.00</span></div>`,
    `<div class="sc-h"><span class="sci">${ico('bag',18)}</span><div><b>Needs restocking</b><small>Flagged from today's sales</small></div></div>
     ${row('c_household','Tide Powder 66g','Warn at 10',`<span class="warnp">3 left</span>`)}
     ${row('c_drinks','Royal Tru-Orange 1L','Warn at 4',`<span class="warnp">4 left</span>`)}
     ${row('c_canned','555 Sardines','Warn at 8',`<span class="okp">24 left</span>`)}
     ${row('c_milk','Bear Brand Swak','Warn at 10',`<span class="okp">30 left</span>`)}`];
  const it=items[i];
  return `<div class="why2">
    <div class="why-l">
      <span class="eyebrow">Why Kahera</span>
      <h2>Set it once.<br><span class="soft">Kahera remembers the rest.</span></h2>
      <div class="wlist" role="tablist">${items.map((x,k)=>`<button class="witem ${k===i?'on':''}" role="tab" aria-selected="${k===i}" data-act="whyTab" data-i="${k}"><span class="wn">0${k+1}</span><span class="wt">${x.t}</span><span class="wd">${x.d}</span><span class="wprog"><i></i></span></button>`).join('')}</div>
    </div>
    <div class="why-r"><div class="stage2" aria-hidden="true" data-tilt><span class="glare"></span>
      ${blossom('82%','-46px',96,'#EE6E6A','#FFD9C2','bl3')}
      <div class="fl fchip2" key="${i}">${ico('check',13)}${it.chip}</div>
      <div class="setcard" data-k="${i}">${cards[i]}</div>
      <div class="fl owner"><img src="${FACES.AN}" alt=""><div><b>Aling Nena</b><small>“${it.q}”</small></div></div>
    </div></div>
  </div>
  <div class="wstats">
    <div><b>3 taps</b><span>to ring up a sale</span></div>
    <div><b>₱0</b><span>extra hardware to buy</span></div>
    <div><b>Any phone</b><span>or tablet you already have</span></div>
    <div><b>14 days</b><span>free to try everything</span></div>
  </div>`;
}
function vLanding(){
  const scale=[['Ubos','var(--g2)'],['Kaunti','var(--warn)'],['Sakto','var(--brand-2)'],['Marami','var(--brand)'],['Puno','var(--brand-3)']];
  const bars=[52,40,58,71,46,63,88],bd=['Sat','Sun','Mon','Tue','Wed','Thu','Today'];
  const seg=n=>`<span class="segs" style="max-width:110px">${[0,1,2,3,4].map(i=>`<i class="${i<n?'on':''}" ${i<n&&n<=2?'style="background:var(--warn)"':''}></i>`).join('')}</span>`;
  return `<div class="land">
  <header class="lnav"><div class="wrap">${logo()}
    <nav><button class="navlink hide-m hide-md" data-act="scrollTo" data-to="why">Why Kahera</button><button class="navlink hide-m hide-md" data-act="scrollTo" data-to="how">How it works</button><button class="navlink hide-m" data-act="scrollTo" data-to="pricing">Pricing</button><button class="navlink hide-xs" data-act="go" data-v="signin">Sign in</button>${themeBtn()}<button class="btn primary" data-act="startReg">Register store${arw()}</button>${langBtn()}</nav>
  </div></header>
  <section class="hero4"><div class="hglow" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="floaters" aria-hidden="true">
      ${blossom('5%','4%',88,'#EE6E6A','#FFD9C2','bl1')}${blossom('86%','46%',92,'#4C6FE6','#D3DEFF','bl2')}
      <span class="fchip ok" style="left:77%;top:2%">${ico('check',12)}Sale recorded</span>
      <span class="avt" style="left:87%;top:10%;--h:#FFD9C7"><img src="${FACES.AN}" alt=""></span>
      <span class="fchip vi" style="left:2%;top:32%">${ico('c_staples',12)}Paninda added</span>
      <span class="avt" style="left:5%;top:20%;--h:#DCE3FF"><img src="${FACES.MJ}" alt=""></span>
      <span class="avt" style="left:10%;top:58%;--h:#FFE3EC"><img src="${FACES.RS}" alt=""></span>
      <span class="fchip pk" style="left:3%;top:70%">${ico('bell',12)}Low stock alert</span>
      <span class="avt" style="left:84%;top:70%;--h:#DDF3E6"><img src="${FACES.LB}" alt=""></span>
      <span class="fchip gr" style="left:79%;top:82%">${ico('bag',12)}Restock saved</span>
    </div>
    <div class="wrap hero4-in">
      <span class="eyebrow">Para sa tindahan</span>
      <h1>Your next sale is<br>already counted.</h1>
      <p class="lede">Kahera keeps track of every sale, every sukli and every restock, so your sari-sari store runs itself while you serve your suki.</p>
      <div class="hero-actions"><button class="btn white lg" data-act="startReg">${ico('hook',17)}Register your store</button><button class="btn outlineb lg" data-act="demo">Try a demo</button></div>
    </div>
    <div class="stage" aria-hidden="true">
      <div class="peek l"><span class="t">8:12 AM</span><span class="b">₱1,390<small>today</small></span></div>
      <div class="glasscard">
        <div class="gc-in">
          <div class="gc-h">${logoMark(26)}<b>Kahera</b><span class="st">Counting sukli…<i class="spin"></i></span></div>
          <div class="opt"><span class="rd"></span><div><b>Pancit Canton ×2</b><small>Noodles</small></div><span class="pr">₱36.00</span></div>
          <div class="opt on"><span class="rd"></span><div><b>Kopiko Brown ×3</b><small>Coffee</small></div><span class="tagb">Best seller</span><span class="pr">₱30.00</span></div>
          <div class="opt"><span class="rd"></span><div><b>Eggs ×4</b><small>Staples</small></div><span class="pr">₱36.00</span></div>
          <div class="gc-f"><span>Sukli</span><b>₱78.00</b><span class="btn primary">Charge ₱122.00</span></div>
        </div>
      </div>
      <div class="peek r"><span class="ic">${ico('c_household',16)}</span><span class="t">Tide 66g</span><span class="warnp">3 left</span></div>
    </div>
  </section>
  <section class="why" id="why"><div class="wrap">${whyHtml()}</div></section>
  <section class="sec how" id="how"><div class="wrap">
    <div class="how-head" data-reveal>
      <div><span class="eyebrow">How it works</span><h2>Ready before your first <span class="soft">customer of the day.</span></h2></div>
      <div class="how-side"><p>Three steps from sign-up to your first sale. No training, no hardware to buy. Any phone or tablet will do.</p>
        <button class="arrowlink" data-act="startReg">Start free for 14 days${arw()}</button></div>
    </div>
    <ol class="tl" data-reveal>
      <li class="tstep"><span class="node">01</span><div class="tcard">
        <div class="tstage s1" aria-hidden="true"><div class="mini m-reg" data-par=".08">
          <div class="mh">${logoMark(22)}<b>Tindahan ni Aling Nena</b></div>
          <small>Your store code</small><div class="code">KH-7KQ2</div>
          <div class="pinrow"><span>PIN</span><i></i><i></i><i></i><i></i></div>
          <div class="ready">${ico('check',13)}Store ready</div>
        </div></div>
        <div class="tbody"><span class="tpill">${ico('clock',12)}About 2 minutes</span><h3>Register your store</h3><p>Pick a plan, add your store details and get a store code with your own PIN.</p></div>
      </div></li>
      <li class="tstep"><span class="node">02</span><div class="tcard">
        <div class="tstage s2" aria-hidden="true"><div class="mini m-grid" data-par=".13">
          <div class="mt"><span class="thumb">${ico('c_noodles',15)}</span><b>Pancit Canton</b><em>₱18</em></div>
          <div class="mt"><span class="thumb">${ico('c_drinks',15)}</span><b>Coke Mismo</b><em>₱20</em></div>
          <div class="mt"><span class="thumb">${ico('c_coffee',15)}</span><b>Kopiko Brown</b><em>₱10</em></div>
          <div class="mt add">${ico('plus',16)}<b>Add item</b></div>
        </div></div>
        <div class="tbody"><span class="tpill">${ico('clock',12)}About 10 minutes</span><h3>Add your paninda</h3><p>Start from a list of common sari-sari items, snap a photo, then set your own prices and stock.</p></div>
      </div></li>
      <li class="tstep"><span class="node">03</span><div class="tcard">
        <div class="tstage s3" aria-hidden="true"><div class="mini m-sale" data-par=".18">
          <div class="rr"><span>Pancit Canton ×2</span><span>₱36.00</span></div>
          <div class="rr"><span>Kopiko Brown ×3</span><span>₱30.00</span></div>
          <div class="rr"><span>Eggs ×4</span><span>₱36.00</span></div>
          <div class="sk"><span>Sukli</span><b>₱78.00</b></div>
          <div class="chg">Charge<span>₱122.00</span></div>
        </div></div>
        <div class="tbody"><span class="tpill">${ico('clock',12)}Every day</span><h3>Sell and restock</h3><p>Tap to sell, see the sukli right away, and record what you buy at the grocery or palengke.</p></div>
      </div></li>
    </ol>
    <div class="bento" data-reveal>
      <div class="bcard"><p class="eyebrow">Restock</p><h3>Know what to buy before it runs out.</h3><p>Low items are flagged as you sell, so your palengke list writes itself.</p>
        <div class="brow"><span class="thumb">${ico('c_household',19)}</span><span class="nm">Tide Powder 66g<small>Warn at 10</small></span>${seg(1)}<span class="pill warn"><span class="dot"></span>3 left</span></div>
        <div class="brow"><span class="thumb">${ico('c_drinks',19)}</span><span class="nm">Royal Tru-Orange 1L<small>Warn at 4</small></span>${seg(2)}<span class="pill warn"><span class="dot"></span>6 left</span></div>
        <div class="brow"><span class="thumb">${ico('c_noodles',19)}</span><span class="nm">Pancit Canton<small>Warn at 12</small></span>${seg(4)}<span class="pill ok"><span class="dot"></span>48 left</span></div>
      </div>
      <div class="bcard"><p class="eyebrow">Reports</p><h3>See your day, and your week.</h3><p>Sales, estimated profit and best sellers, worked out from every sale you ring up.</p>
        <div class="minibars">${bars.map((v,i)=>`<div class="${i===6?'t':''}"><i style="height:${v}%"></i>${bd[i]}</div>`).join('')}</div>
      </div>
    </div>
  </div></section>
  <section class="sec pricing2" id="pricing"><div class="wrap">${pricingHtml()}</div></section>
  <footer class="foot"><div class="wrap"><span>© ${new Date().getFullYear()} Kahera. Made for Filipino small stores. <span class="credit">Portraits are AI-generated faces from the SFHQ dataset.</span></span><span class="mono">121.1029° E</span><button class="link" data-act="go" data-v="adminLogin">Platform admin</button></div></footer>
  </div>`;
}

/* ---------- Register ---------- */
function vRegister(){
  const r=S.reg,p=PLANS[r.plan];
  const steps=['Plan','Store details',p.price?'Payment':'Confirm','Done'];
  const stepper=`<ol class="steps">${steps.map((s,i)=>`<li class="${i===r.step?'on':i<r.step?'done':''}">${s}</li>`).join('')}</ol>`;
  let body='';
  if(r.step===0){
    body=`<h1>Choose a plan</h1><p class="sub">You can change your plan later from your store settings.</p>
    <div class="plans">${Object.values(PLANS).map(pl=>planCard(pl,{sel:pl.id===r.plan,act:'regPlan'})).join('')}</div>
    <div class="actions"><button class="btn ghost" data-act="go" data-v="landing">Cancel</button><button class="btn primary lg" data-act="regNext">Continue${arw()}</button></div>`;
  }else if(r.step===1){
    body=`<h1>Tell us about your store</h1><p class="sub">This is what appears on your sales screen and receipts.</p>
    <div class="stack" data-enter="regNext">
      <div id="avwrap">${avPanelFor()}</div>
      <div class="field"><label for="f-name">Store name</label><input class="input" id="f-name" value="${esc(r.name)}" placeholder="e.g. Tindahan ni Aling Nena" data-autofocus></div>
      <div class="row2">
        <div class="field"><label for="f-owner">Owner's name</label><input class="input" id="f-owner" value="${esc(r.owner)}" placeholder="Full name"></div>
        <div class="field"><label for="f-phone">Mobile number</label><div class="prefix"><span>+63</span><input class="input" id="f-phone" inputmode="numeric" value="${esc(r.phone)}" placeholder="917 123 4567"></div></div>
      </div>
      <div class="row2">
        <div class="field"><label for="f-brgy">Barangay</label><input class="input" id="f-brgy" value="${esc(r.brgy)}" placeholder="e.g. San Roque"></div>
        <div class="field"><label for="f-city">City or municipality</label><input class="input" id="f-city" value="${esc(r.city)}" placeholder="e.g. Marikina"></div>
      </div>
      <div class="row2">
        <div class="field"><label for="f-pin">Create a 4-digit PIN</label><input class="input pin" id="f-pin" type="password" inputmode="numeric" maxlength="4" value="${esc(r.pin)}"><span class="hint">You'll use this to sign in to your store.</span></div>
        <div class="field"><label for="f-pin2">Enter the PIN again</label><input class="input pin" id="f-pin2" type="password" inputmode="numeric" maxlength="4" value="${esc(r.pin)}"></div>
      </div>
      <p class="err" id="err"></p>
    </div>
    <div class="actions"><button class="btn ghost" data-act="regBack">${ico('back',18)}Back</button><button class="btn primary lg" data-act="regNext">Continue${arw()}</button></div>`;
  }else if(r.step===2){
    const sum=`<div class="summary">
      <div class="rline"><span>${esc(r.name)}</span><span>${p.name} plan</span></div>
      <div class="rline"><span>Access until</span><span>${fmtDate(Date.now()+p.days*DAY)}</span></div>
      <div class="rsep"></div>
      <div class="rline rtotal"><span>Amount due today</span><span>${peso(p.price)}</span></div></div>`;
    if(!p.price){
      body=`<h1>Start your free trial</h1><p class="sub">No payment needed. You'll get a reminder before the 14 days are up.</p>${sum}
      <div class="actions"><button class="btn ghost" data-act="regBack">${ico('back',18)}Back</button><button class="btn primary lg" data-act="regPay">Start free trial</button></div>`;
    }else{
      body=`<h1>Pay for your plan</h1><p class="sub">Choose how you'd like to pay.</p>${sum}${payFields(r.method)}
      <p class="err" id="err"></p>
      <div class="actions"><button class="btn ghost" data-act="regBack">${ico('back',18)}Back</button><button class="btn primary lg" data-act="regPay" id="paybtn">Pay ${peso(p.price)}</button></div>
      <p class="notice">This prototype simulates payment. No money is charged.</p>`;
    }
  }else{
    const st=findStore(r.storeId);
    body=`<h1>Your store is ready</h1><p class="sub">${esc(st.name)} is registered on the ${PLANS[st.plan].name.toLowerCase()} plan.</p>
    <div class="codebox"><div class="label">Your store code</div><div class="code">${st.code}</div><div class="label">Sign in with this code and your 4-digit PIN.</div></div>
    <p class="notice" style="margin-top:0">Write the code down or take a screenshot. Anyone who will use the store's device needs it.</p>
    <div class="actions"><span></span><button class="btn primary lg" data-act="openStore" data-id="${st.id}">Open my store${arw()}</button></div>`;
  }
  return `<div class="authwrap"><div class="aura" aria-hidden="true"></div><header class="topbar">${logo()}<nav>${themeBtn()}${langBtn()}</nav></header><div class="authcard ${r.step===0?'wide':''}">${stepper}${body}</div></div>`;
}
function payFields(method){
  return `<div class="methods" role="radiogroup" aria-label="Payment method">${Object.entries(METHODS).map(([k,m])=>`<button class="method ${k===method?'sel':''}" role="radio" aria-checked="${k===method}" data-act="pickMethod" data-m="${k}">${m.name}<small>${m.sub}</small></button>`).join('')}</div>
  <div class="stack" style="margin-top:16px" id="payfields">${method==='card'?`
    <div class="field"><label for="p-card">Card number</label><input class="input" id="p-card" inputmode="numeric" placeholder="4242 4242 4242 4242"></div>
    <div class="row2"><div class="field"><label for="p-exp">Expiry</label><input class="input" id="p-exp" placeholder="MM/YY"></div><div class="field"><label for="p-cvc">CVC</label><input class="input" id="p-cvc" inputmode="numeric" placeholder="123"></div></div>`:`
    <div class="field"><label for="p-wallet">${METHODS[method].name} number</label><div class="prefix"><span>+63</span><input class="input" id="p-wallet" inputmode="numeric" placeholder="917 123 4567"></div></div>`}
  </div>`;
}
function payValid(method){
  if(method==='card'){return val('p-card').replace(/\D/g,'').length>=12&&val('p-exp').length>=4&&val('p-cvc').length>=3}
  return val('p-wallet').replace(/\D/g,'').length>=10;
}
function createStore(o){
  const p=PLANS[o.plan];
  const st={id:rid(),code:newCode(),name:o.name,owner:o.owner,phone:o.phone,brgy:o.brgy||'',city:o.city||'',pin:o.pin,plan:o.plan,status:'active',createdAt:Date.now(),expires:Date.now()+p.days*DAY,payments:[]};
  if(p.price&&o.paid)st.payments.push({amt:p.price,method:o.method,ref:o.ref||('REF'+Date.now().toString().slice(-8)),ts:Date.now(),plan:o.plan});
  S.platform.stores.push(st);savePlatform();
  st.avOff=!!o.avOff;st.avGv=o.avGv||0;S.data[st.id]={products:[],sales:[],restocks:[],daily:{}};saveStore(st.id);
  if(o.av){S.avs[st.id]=o.av;st.hasAv=true;P.save('av_'+st.id,{d:o.av});savePlatform()}
  return st;
}

/* ---------- Sign in ---------- */
function vSignin(){
  const rec=recentCodes();
  return `<div class="authwrap"><div class="aura" aria-hidden="true"></div><header class="topbar">${logo()}<nav>${themeBtn()}<button class="btn ghost" data-act="go" data-v="landing">Home</button>${langBtn()}</nav></header>
  <div class="authcard"><h1>Sign in to your store</h1><p class="sub">Enter your store code and PIN.</p>
  <div class="stack" data-enter="signin">
    <div class="field"><label for="s-code">Store code</label><input class="input" id="s-code" placeholder="KH-XXXX" autocapitalize="characters" style="text-transform:uppercase;font-weight:700;letter-spacing:.06em" data-autofocus>
    ${rec.length?`<div class="recent">${rec.map(c=>`<button class="chip" data-act="fillCode" data-c="${c}">${esc(S.platform.stores.find(s=>s.code===c).name)} <span class="num" style="opacity:.6">${c}</span></button>`).join('')}</div>`:''}</div>
    <div class="field"><label for="s-pin">PIN</label><input class="input pin" id="s-pin" type="password" inputmode="numeric" maxlength="4"></div>
    <p class="err" id="err"></p>
    <button class="btn primary lg block" data-act="signin">Sign in</button>
    <p class="notice" style="text-align:center">New to Kahera? <button class="link" data-act="startReg">Register your store</button></p>
  </div></div></div>`;
}

/* ---------- Blocked ---------- */
function vBlocked(){
  const st=store(),s=storeState(st);
  const susp=s==='suspended';
  return `<div class="authwrap"><div class="aura" aria-hidden="true"></div><header class="topbar">${logo()}<nav>${themeBtn()}<button class="btn ghost" data-act="signout">Sign out</button>${langBtn()}</nav></header>
  <div class="authcard"><div class="donebig" style="text-align:left;padding:0"><div class="ring" style="margin:0 0 16px;background:var(--sili-soft);color:var(--sili)">${ico('alert',28)}</div></div>
  <h1>${susp?'This store is paused':'Your plan has ended'}</h1>
  <p class="sub">${susp?`${esc(st.name)} was paused by Kahera. Contact support to turn it back on. Your products and sales are kept safe.`:`${esc(st.name)}'s ${PLANS[st.plan].name.toLowerCase()} plan ended on ${fmtDate(st.expires)}. Renew to keep selling. Your products and sales are kept safe.`}</p>
  ${susp?'':`<button class="btn primary lg block" data-act="renew">Renew plan</button>`}
  </div></div>`;
}

/* ---------- Store app ---------- */
const TABS=[['sell','Sell','sell'],['products','Products','box'],['restock','Restock','bag'],['reports','Dashboard','chart'],['settings','Settings','gear']];
function lowCount(){const d=data();return d.products.filter(p=>p.stock<=p.low).length}
function vStore(){
  const st=store(),lc=lowCount();
  const titles={sell:['Sell','Tap products to add them to the sale.',new Date().toLocaleDateString(LOC(),{weekday:'long',month:'long',day:'numeric'})],products:['Products','Everything on your shelves, with prices and stock.','Inventory'],restock:['Restock','Record what you bought to refill your shelves.','Restocking'],reports:['Dashboard','How your store is doing today, this month and this year.','Performance'],settings:['Settings','Store details, plan and PIN.','Account']};
  const [t,sub,eb]=titles[S.tab];
  const navBtns=TABS.map(([k,l,i])=>`<button class="${S.tab===k?'on':''}" data-act="tab" data-t="${k}" ${S.tab===k?'aria-current="page"':''}>${ico(i)}<span>${l}</span>${k==='products'&&lc?`<span class="badge num">${lc}</span>`:''}</button>`).join('');
  return `<div class="shell">
    <aside class="side">${logo()}
      <button class="storecard sc-btn" data-act="tab" data-t="settings" title="Change store photo"><span class="av-wrap">${avatarHtml(st)}<span class="av-cam">${ico('camera',11)}</span></span><div><b>${esc(st.name)}</b><span class="num">${st.code}</span></div></button>
      <nav class="nav" aria-label="Store">${navBtns}</nav>
      <div class="spacer"></div>
      <div class="foot-row"><div class="nav">${S.session.admin?`<button data-act="backAdmin">${ico('shield')}<span>Back to admin</span></button>`:''}<button data-act="signout">${ico('out')}<span>Sign out</span></button></div>${themeBtn()}</div>
    </aside>
    <main class="main">
      <header class="mhead"><div><p class="eyebrow">${eb}</p><h2>${t}</h2><p>${sub}</p></div><div class="mh-r">${statePill(st)}${langBtn()}</div></header>
      <div id="tab">${tabView()}</div>
    </main>
    <nav class="bottomnav" aria-label="Store">${TABS.map(([k,l,i])=>`<button class="${S.tab===k?'on':''}" data-act="tab" data-t="${k}">${ico(i,22)}<span>${l}</span></button>`).join('')}</nav>
  </div>`;
}
function tabView(){return({sell:tSell,products:tProducts,restock:tRestock,reports:tReports,settings:tSettings})[S.tab]()}

/* ----- Sell ----- */
function cats(){const d=data();return['All',...[...new Set(d.products.map(p=>p.cat).filter(Boolean))].sort()]}
function tSell(){
  const d=data();
  if(!d.products.length)return emptyProducts();
  return `<div class="sell ${S.cartOpen?'cart-open':''}" id="sell">
    <section>
      <div class="searchbar">${ico('search')}<input id="q" type="search" placeholder="Search products" value="${esc(S.q)}" autocomplete="off" aria-label="Search products" data-autofocus><kbd class="hide-m">/</kbd></div>
      <div class="chips" id="chips">${chipsHtml()}</div>
      <div class="grid" id="grid">${gridHtml()}</div>
    </section>
    <section class="cart" id="cart" aria-label="Current sale">${cartHtml()}</section>
    <button class="cartbar" id="cartbar" data-act="cartOpen" ${S.cart.length?'':'hidden'}>${cartBarHtml()}</button>
  </div>`;
}
function emptyProducts(){
  return `<div class="empty"><div class="eico">${ico('box',28)}</div><h3>Add your paninda to start selling</h3><p>Add the products you sell with their prices and current stock. You can also start with a list of common sari-sari items and edit from there.</p>
  <div class="btns"><button class="btn primary" data-act="addProduct">${ico('plus',18)}Add a product</button><button class="btn" data-act="sample">Use common sari-sari items</button></div></div>`;
}
function chipsHtml(){return cats().map(c=>`<button class="chip ${S.cat===c?'on':''}" data-act="cat" data-c="${esc(c)}">${c==='All'?'':`<span class="ce" aria-hidden="true">${ico(catMeta(c).i,15)}</span>`}${esc(c)}</button>`).join('')}
function inCart(id){const l=S.cart.find(x=>x.id===id);return l?l.qty:0}
function gridHtml(){
  const d=data(),q=S.q.toLowerCase();
  const list=byRecent(d.products).filter(p=>(S.cat==='All'||p.cat===S.cat)&&(!q||p.name.toLowerCase().includes(q)||(p.cat||'').toLowerCase().includes(q)));
  if(!list.length)return `<p style="color:var(--ink-3);grid-column:1/-1;padding:20px 0">No products match "${esc(S.q)}".</p>`;
  return list.map(p=>{
    const n=inCart(p.id),out=p.stock<=0,low=!out&&p.stock<=p.low;
    const lvl=out?0:Math.max(1,Math.min(5,Math.ceil(p.stock/Math.max(1,(p.low||1)*4)*5)));
    return `<button class="tile ${out?'out':low?'low':''} ${n?'sel':''} ${S.bump===p.id?'bump':''} ${S.flash===p.id?'flash':''}" data-act="add" data-id="${p.id}" aria-label="Add ${esc(p.name)}, ${peso(p.price)}">
      ${n?`<span class="incart num">${n}</span>`:''}${recentTag(p)}
      ${pthumb(p)}
      <span class="tname">${esc(p.name)}</span>
      <span class="tfoot"><span class="tprice">${peso(p.price)}</span><span class="tstock num"><span class="segs">${[0,1,2,3,4].map(i=>`<i class="${i<lvl?'on':''}"></i>`).join('')}</span>${out?'Out':p.stock+' left'}</span></span>
    </button>`}).join('');
}
const cartTotal=()=>S.cart.reduce((a,l)=>a+l.qty*l.price,0);
const cartCount=()=>S.cart.reduce((a,l)=>a+l.qty,0);
function cartHtml(){
  const total=cartTotal();
  const d=data();
  const lines=S.cart.length?S.cart.map(l=>{const p=d.products.find(x=>x.id===l.id);return `<div class="line ${S.bump===l.id&&l.qty===1?'fresh':''}">
      ${pthumb(p)}
      <div class="ln">${esc(l.name)}</div>
      <div class="lt">${peso(l.qty*l.price)}</div>
      <div class="lp num">${peso(l.price)} each</div><div></div>
      <div class="lctl"><div class="stepper"><button data-act="dec" data-id="${l.id}" aria-label="Remove one">${ico('minus',15)}</button><span class="num">${l.qty}</span><button data-act="inc" data-id="${l.id}" aria-label="Add one">${ico('plus',15)}</button></div>
      <button class="rmv" data-act="rm" data-id="${l.id}">Remove</button></div>
    </div>`}).join(''):`<div class="cart-empty"><span class="eico">${ico('bag',24)}</span>Tap a product to add it to the sale.</div>`;
  return `<div class="cart-h"><div class="top"><span class="eyebrow">Benta</span><time class="num">${fmtTime(Date.now())}</time></div><div class="row"><h3>Current sale${S.cart.length?`<span class="count num">${cartCount()} item${cartCount()===1?'':'s'}</span>`:''}</h3><div style="display:flex;gap:6px">${S.cart.length?`<button class="btn ghost sm" data-act="clearCart">Clear</button>`:''}<button class="iconbtn hide-desk" data-act="cartClose" aria-label="Close" style="${S.cartOpen?'':'display:none'}">${ico('x',18)}</button></div></div></div>
    <div class="lines">${lines}</div>
    <div class="cart-f" id="cartf">${cartFootHtml(total)}</div>`;
}
function cartFootHtml(total){
  total=total==null?cartTotal():total;
  const cash=S.cash===''?null:num(S.cash);
  const quicks=[20,50,100,200,500,1000].filter(v=>v>total).slice(0,4);
  let ch='';
  if(total>0&&cash!=null){
    ch=cash>=total?`<div class="change"><span>Sukli</span><b>${peso(cash-total)}</b></div>`:`<div class="change short"><span>Kulang pa</span><b>${peso(total-cash)}</b></div>`;
  }
  return `<div class="tot"><span>Total</span><b>${peso(total)}</b></div>
    ${total>0?`<div class="field"><label for="cash">Cash received</label><div class="prefix"><span>₱</span><input class="input num" id="cash" inputmode="decimal" placeholder="${total.toFixed(2)}" value="${esc(S.cash)}"></div></div>
    <div class="quick"><button class="${cash!=null&&Math.abs(cash-total)<.001?'on':''}" data-act="cashSet" data-v="${total}">Exact</button>${quicks.map(v=>`<button class="${cash===v?'on':''}" data-act="cashSet" data-v="${v}">₱${v}</button>`).join('')}</div>${ch}`:''}
    <button class="btn primary lg block charge" data-act="checkout" ${total>0&&(cash==null||cash>=total)?'':'disabled'}><span>${total>0?'Charge':'Complete sale'}</span>${total>0?`<span class="num">${peso(total)}</span>`:''}</button>`;
}
function cartBarHtml(){return `<span class="num">Review sale, ${cartCount()} item${cartCount()===1?'':'s'}</span><b class="num">${peso(cartTotal())}</b>`}
function refreshSell(){
  const g=$('#grid');if(g)g.innerHTML=gridHtml();
  const c=$('#cart');if(c)c.innerHTML=cartHtml();
  const b=$('#cartbar');if(b){b.innerHTML=cartBarHtml();b.hidden=!S.cart.length}
  const s=$('#sell');if(s)s.classList.toggle('cart-open',S.cartOpen&&S.cart.length>0);
  S.bump=null;
}
function addToCart(id,delta=1){
  const p=data().products.find(x=>x.id===id);if(!p)return;
  let l=S.cart.find(x=>x.id===id);
  const want=(l?l.qty:0)+delta;
  if(delta>0&&want>p.stock){toast(p.stock<=0?`${p.name} is out of stock. Restock it first.`:`Only ${p.stock} ${p.unit||'pc'} of ${p.name} left.`);return}
  if(!l){l={id,name:p.name,price:p.price,qty:0};S.cart.push(l)}
  l.qty=want;S.bump=delta>0?id:null;
  if(l.qty<=0)S.cart=S.cart.filter(x=>x.id!==id);
  if(!S.cart.length)S.cartOpen=false;
  refreshSell();
}
function checkout(){
  const st=store(),d=data(),total=cartTotal();
  const cash=S.cash===''?total:num(S.cash);
  if(!S.cart.length)return;
  if(cash<total){toast('Cash received is less than the total.');return}
  const items=S.cart.map(l=>{const p=d.products.find(x=>x.id===l.id);if(p)p.stock=Math.max(0,p.stock-l.qty);return{pid:l.id,name:l.name,qty:l.qty,price:l.price,cost:p?p.cost||0:0}});
  const profit=items.reduce((a,i)=>a+(i.price-(i.cost||i.price))*i.qty,0);
  const sale={id:rid(),ts:Date.now(),items,total,cash,change:cash-total};
  d.sales.unshift(sale);if(d.sales.length>400)d.sales.length=400;
  const k=dayKey();const day=d.daily[k]||(d.daily[k]={t:0,p:0,n:0});day.t+=total;day.p+=profit;day.n+=1;
  saveStore(st.id);
  S.cart=[];S.cash='';S.cartOpen=false;
  render();
  openModal(`<div class="donebig"><div class="ring">${ico('check',30)}</div><h3>Sale complete</h3><p class="sub" style="margin:0">Total ${peso(total)}, cash ${peso(cash)}</p>
    <div style="margin-top:18px;color:var(--ink-2);font-weight:600">Sukli</div><div class="amt">${peso(cash-total)}</div>
    <button class="btn primary lg block" style="margin-top:22px" data-act="closeModal" data-autofocus>Next customer</button></div>`);
}

/* ----- Products ----- */
function tProducts(){
  const d=data();
  if(!d.products.length)return emptyProducts();
  const units=d.products.reduce((a,p)=>a+p.stock,0);
  const value=d.products.reduce((a,p)=>a+p.stock*(p.cost||0),0);
  const lc=lowCount();
  return `<div class="kpis">
    <div class="kpi"><span>Products</span><b>${d.products.length}</b></div>
    <div class="kpi"><span>Items on hand</span><b>${units.toLocaleString(LOC())}</b></div>
    <div class="kpi"><span>Stock value at cost</span><b>${pesoR(value)}</b></div>
    <div class="kpi"><span>Low or out of stock</span><b style="${lc?'color:var(--sili)':''}">${lc}</b></div>
  </div>
  <div class="toolbar">
    <div class="searchbar">${ico('search')}<input id="invq" type="search" placeholder="Search products" value="${esc(S.invQ)}" aria-label="Search products"></div>
    <div class="seg" role="tablist">${[['all','All'],['low','Low stock'],['out','Out of stock']].map(([k,l])=>`<button class="${S.invF===k?'on':''}" data-act="invF" data-f="${k}">${l}</button>`).join('')}</div>
    <button class="btn" data-act="sample">${ico('c_misc',17)}Add common items</button>
    <button class="btn primary" data-act="addProduct">${ico('plus',18)}Add product</button>
  </div>
  <div class="tablewrap" id="invtable">${invTable()}</div>`;
}
function invTable(){
  const d=data(),q=S.invQ.toLowerCase();
  const list=d.products.filter(p=>(!q||p.name.toLowerCase().includes(q)||(p.cat||'').toLowerCase().includes(q))&&(S.invF==='all'||(S.invF==='low'&&p.stock>0&&p.stock<=p.low)||(S.invF==='out'&&p.stock<=0))).sort((a,b)=>((b.upd||0)-(a.upd||0))||a.name.localeCompare(b.name));
  if(!list.length)return `<p style="padding:24px;color:var(--ink-3)">No products here.</p>`;
  return `<table><thead><tr><th>Product</th><th class="r">Price</th><th class="r hide-m">Cost</th><th class="r">Stock</th><th class="r"><span class="hide-m">Actions</span></th></tr></thead><tbody>
  ${list.map(p=>{const out=p.stock<=0,low=!out&&p.stock<=p.low;return `<tr class="${S.flash===p.id?'flash':''}">
    <td><div class="pcell">${pthumb(p)}<div><b style="font-weight:600">${esc(p.name)}</b>${recentTag(p)}<span class="sm">${esc(p.cat||'Uncategorized')}</span></div></div></td>
    <td class="r">${peso(p.price)}</td><td class="r hide-m">${p.cost?peso(p.cost):'—'}</td>
    <td class="r"><span class="pill ${out?'bad':low?'warn':''}">${p.stock} ${esc(p.unit||'pc')}</span></td>
    <td class="r"><div class="rowacts"><button class="btn sm hide-m" data-act="quickRestock" data-id="${p.id}">Restock</button><button class="iconbtn" data-act="editProduct" data-id="${p.id}" aria-label="Edit ${esc(p.name)}">${ico('edit',18)}</button></div></td>
  </tr>`}).join('')}</tbody></table>`;
}
function productForm(p){
  const d=data();const isNew=!p;p=p||{name:'',cat:'',price:'',cost:'',stock:'',low:5,unit:'pc'};
  const catList=[...new Set(d.products.map(x=>x.cat).filter(Boolean))];
  S.pf={img:p.id?S.imgs[p.id]||null:null,changed:false,cat:p.cat,off:!!p.imgOff,gv:p.gv||0};
  openModal(`<h3>${isNew?'Add product':'Edit product'}</h3><p class="sub">${isNew?'Add something you sell.':'Update the details of this product.'}</p>
  <div class="stack" data-enter="saveProduct">
    <div class="phrow"><div class="phbox" id="phbox">${phPreview()}</div>
      <div class="phctl" id="phctl">${phCtl()}</div></div>
    <div class="field"><label for="p-name">Product name</label><input class="input" id="p-name" value="${esc(p.name)}" placeholder="e.g. Lucky Me Pancit Canton" data-autofocus></div>
    <div class="row2">
      <div class="field"><label for="p-cat">Category</label><input class="input" id="p-cat" list="catlist" value="${esc(p.cat)}" placeholder="e.g. Candy"><datalist id="catlist">${[...new Set([...SUGGESTED_CATS,...catList])].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="field"><label for="p-unit">Sold per</label><select class="select" id="p-unit">${UNITS.map(u=>`<option value="${u}" ${u===p.unit?'selected':''}>${u}</option>`).join('')}</select></div>
    </div>
    <div class="catpick" id="catpick">${catPickHtml(p.cat)}</div>
    <div class="row2">
      <div class="field"><label for="p-price">Selling price</label><div class="prefix"><span>₱</span><input class="input" id="p-price" inputmode="decimal" value="${p.price}"></div></div>
      <div class="field"><label for="p-cost">Your cost <span style="font-weight:400">(optional)</span></label><div class="prefix"><span>₱</span><input class="input" id="p-cost" inputmode="decimal" value="${p.cost||''}"></div></div>
    </div>
    <div class="row2">
      <div class="field"><label for="p-stock">Stock on hand</label><input class="input" id="p-stock" inputmode="numeric" value="${p.stock}"></div>
      <div class="field"><label for="p-low">Warn me at</label><input class="input" id="p-low" inputmode="numeric" value="${p.low}"><span class="hint">Flag as low stock at this count.</span></div>
    </div>
    <p class="err" id="perr"></p>
    <div class="actions" style="margin-top:4px">${isNew?'<span></span>':`<button class="btn danger" data-act="delProduct" data-id="${p.id}">${ico('trash',18)}Delete</button>`}<button class="btn primary lg" data-act="saveProduct" data-id="${isNew?'':p.id}">${isNew?'Add product':'Save changes'}</button></div>
  </div>`);
}
function avatarHtml(st,cls=''){cls=({sm:'av-sm',lg:'av-lg'})[cls]||cls;if(!st)return `<span class="avatar ${cls}">S</span>`;const src=S.avs[st.id];
  if(src)return `<span class="avatar ph ${cls}"><img src="${src}" alt="${esc(st.name)}"></span>`;
  if(!st.avOff&&st.name){const g=genStoreAv({name:st.name,gv:st.avGv||0});if(g)return `<span class="avatar ph gen ${cls}"><img src="${g}" alt="${esc(st.name)}"></span>`}
  return `<span class="avatar ${cls}">${esc(initials(st.owner||st.name))}</span>`}
const GEN_AV={};
function genStoreAv(o){const name=o.name||'',gv=o.gv||0,key=name+'|'+gv;if(GEN_AV[key])return GEN_AV[key];
  const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');if(!x)return '';x.scale(200/32,200/32);
  const [c1,c2]=GEN_PAL[(ghash(name)+gv*3)%GEN_PAL.length];
  const g=x.createLinearGradient(0,0,32,32);g.addColorStop(0,gmix(c1,'#ffffff',.12));g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,32,32);
  const rg=x.createRadialGradient(9,6,0,9,6,22);rg.addColorStop(0,'rgba(255,255,255,.35)');rg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=rg;x.fillRect(0,0,32,32);
  const light=gmix(c1,'#ffffff',.6);
  x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.ellipse(16,26.6,9.5,1.2,0,0,Math.PI*2);x.fill();
  x.fillStyle='#ffffff';x.beginPath();x.roundRect?x.roundRect(6.4,8,19.2,2.4,1.2):x.rect(6.4,8,19.2,2.4);x.fill();
  for(let i=0;i<4;i++){const X=6.6+i*4.7;x.fillStyle=i%2?'#ffffff':light;x.beginPath();x.moveTo(X,10.9);x.lineTo(X+4.7,10.9);x.lineTo(X+4.7,13.6);x.arc(X+2.35,13.6,2.35,0,Math.PI);x.closePath();x.fill()}
  x.fillStyle='#ffffff';x.fillRect(8.2,16.2,15.6,9.6);
  x.fillStyle=light;x.fillRect(10,17.6,7.2,4.6);
  x.strokeStyle=gmix(c1,'#ffffff',.25);x.lineWidth=.45;for(let i=1;i<4;i++){x.beginPath();x.moveTo(10+i*1.8,17.6);x.lineTo(10+i*1.8,22.2);x.stroke()}
  x.fillStyle=gmix(c2,'#ffffff',.15);x.fillRect(9.4,22.2,8.8,.9);
  x.fillStyle=gmix(c1,'#ffffff',.35);x.fillRect(19,17.6,3.4,8.2);x.fillStyle='#ffffff';x.beginPath();x.arc(21.6,21.8,.35,0,Math.PI*2);x.fill();
  let url='';try{url=c.toDataURL('image/jpeg',.88)}catch(e){}return GEN_AV[key]=url}
async function loadAv(id){const st=findStore(id);if(st&&st.hasAv&&!S.avs[id]){try{const r=await P.get('av_'+id);if(r&&r.d)S.avs[id]=r.d}catch(e){}}}
function avCtx(){if(S.view==='register'){const r=S.reg;return{photo:r.av,off:r.avOff,gv:r.avGv||0,name:val('f-name')||r.name||'',owner:val('f-owner')||r.owner||''}}const st=store()||{};return{photo:S.avs[st.id],off:st.avOff,gv:st.avGv||0,name:st.name||'',owner:st.owner||''}}
function avPanelFor(){const c=avCtx(),auto=!c.photo&&!c.off&&c.name;
  const img=c.photo?`<img src="${c.photo}" alt="">`:auto?`<img src="${genStoreAv({name:c.name,gv:c.gv})}" alt=""><span class="autob">${ico('spark',10)}Auto</span>`:`<span class="phdef ini">${esc(initials(c.owner||c.name||'S'))}</span>`;
  const head=c.photo?['Store photo','Your own photo is shown on your store card.']:auto?['Auto-generated store picture','Made from your store name. Take a photo of your store or yourself any time.']:['Initials',c.name?'Showing your initials instead of a picture.':'Type your store name and a picture is drawn for you.'];
  const extra=c.photo?`<button class="btn ghost sm" data-act="avRemove">Remove photo</button>`:auto?`<button class="btn ghost sm" data-act="avShuffle">${ico('spark',14)}New look</button><button class="btn ghost sm" data-act="avInitials">Use initials</button>`:(c.name?`<button class="btn ghost sm" data-act="avAuto">${ico('spark',14)}Use auto picture</button>`:'');
  return `<div class="phrow"><div class="phbox round" id="avbox">${img}</div><div class="phctl"><b>${head[0]}</b><small>${head[1]}</small><div class="phbtns"><label class="btn primary sm">${ico('camera',16)}Take photo<input type="file" accept="image/*" capture="environment" id="av-cam" hidden></label><label class="btn sm">${ico('image',16)}Choose<input type="file" accept="image/*" id="av-lib" hidden></label>${extra}</div></div></div>`}
function refreshAvPanel(){const w=$('#avwrap');if(w)w.innerHTML=avPanelFor()}
function catPickHtml(cur){const d=data();const list=[...new Set([...SUGGESTED_CATS,...d.products.map(x=>x.cat).filter(Boolean)])];return list.map(c=>`<button type="button" class="cp ${(cur||'').toLowerCase()===c.toLowerCase()?'on':''}" data-act="catPick" data-c="${esc(c)}">${ico(catMeta(c).i,14)}${esc(c)}</button>`).join('')}
function phPreview(){const f=S.pf||{};if(f.img)return `<img src="${f.img}" alt="Product photo">`;
  const nm=val('p-name');if(!f.off&&nm)return `<img src="${genImg({name:nm,cat:f.cat||val('p-cat'),gv:f.gv})}" alt="Auto-generated product picture"><span class="autob">${ico('spark',10)}Auto</span>`;
  return `<span class="phdef">${ico(catMeta(f.cat||val('p-cat')).i,34)}</span>`}
function phCtl(){const f=S.pf||{},nm=val('p-name');
  const head=f.img?['Product photo','Your own photo is shown on the Sell screen.']:(!f.off?['Auto-generated picture',nm?'Made from the name and category. Take a real photo any time.':'Type the product name and a picture is drawn for you.']:['Category icon','Using the simple category icon instead of a picture.']);
  const extra=f.img?`<button class="btn ghost sm" data-act="phRemove">Remove photo</button>`:(!f.off?`<button class="btn ghost sm" data-act="phShuffle" ${nm?'':'disabled'}>${ico('spark',14)}New look</button><button class="btn ghost sm" data-act="phIcon">Use icon</button>`:`<button class="btn ghost sm" data-act="phAuto">${ico('spark',14)}Use auto picture</button>`);
  return `<b>${head[0]}</b><small>${head[1]}</small><div class="phbtns"><label class="btn primary sm">${ico('camera',16)}Take photo<input type="file" accept="image/*" capture="environment" id="ph-cam" hidden></label><label class="btn sm">${ico('image',16)}Choose<input type="file" accept="image/*" id="ph-lib" hidden></label>${extra}</div>`}
function refreshPh(){const b=$('#phbox');if(b)b.innerHTML=phPreview();const c=$('#phctl');if(c)c.innerHTML=phCtl()}
function saveProduct(id){
  const d=data();
  const name=val('p-name'),price=num(val('p-price'));
  if(!name){$('#perr').textContent='Enter a product name.';return}
  if(!(price>0)){$('#perr').textContent='Enter a selling price.';return}
  const o={name,cat:val('p-cat'),unit:val('p-unit')||'pc',price,cost:num(val('p-cost')),stock:Math.max(0,Math.round(num(val('p-stock')))),low:Math.max(0,Math.round(num(val('p-low'))))};
  let prod;
  if(id){prod=d.products.find(p=>p.id===id);Object.assign(prod,o);prod.upd=Date.now();toast('Product saved. It is now at the top.')}
  else{prod=Object.assign({id:rid()},o);prod.created=prod.upd=Date.now();d.products.push(prod);toast(`${name} added at the top.`)}
  S.flash=prod.id;setTimeout(()=>{S.flash=null},2200);
  if(S.pf){prod.gv=S.pf.gv||0;prod.imgOff=!!S.pf.off&&!S.pf.img}
  if(S.pf&&S.pf.changed){
    if(S.pf.img){S.imgs[prod.id]=S.pf.img;prod.hasImg=true;P.save('img_'+prod.id,{d:S.pf.img})}
    else{delete S.imgs[prod.id];prod.hasImg=false;prod.noSample=true;P.save('img_'+prod.id,{d:''})}
  }
  S.pf=null;saveStore(S.session.storeId);closeModal();rerenderTab();
  requestAnimationFrame(()=>{const el=document.querySelector('.flash');if(el)el.scrollIntoView({block:'center',behavior:'smooth'})});
}

/* ----- Restock ----- */
function tRestock(){
  const d=data();
  if(!d.products.length)return emptyProducts();
  const total=S.rs.items.reduce((a,i)=>a+num(i.qty)*num(i.cost),0);
  const opts=d.products.slice().sort((a,b)=>a.name.localeCompare(b.name)).filter(p=>!S.rs.items.some(i=>i.pid===p.id));
  return `<div class="cols">
  <section class="panel">
    <h3>New restock</h3>
    <div class="stack">
      <div class="field"><label for="rs-sup">Where you bought it <span style="font-weight:400">(optional)</span></label><input class="input" id="rs-sup" value="${esc(S.rs.supplier)}" placeholder="e.g. Puregold, palengke, grocery"></div>
      <div class="field"><label for="rs-pick">Add a product</label>
        <div style="display:flex;gap:8px"><select class="select" id="rs-pick"><option value="">Choose a product…</option>${opts.map(p=>`<option value="${p.id}">${esc(p.name)} (${p.stock} left)</option>`).join('')}</select></div>
        ${lowCount()?`<div><button class="link" data-act="rsLow">Add all ${lowCount()} low-stock items</button></div>`:''}
      </div>
      ${S.rs.items.length?`<div><div class="rshead"><span>Product</span><span>Qty</span><span>Cost each</span><span></span></div>
      ${S.rs.items.map((it,i)=>`<div class="rsrow"><span style="font-weight:600;line-height:1.3">${esc(it.name)}</span>
        <input class="input num" inputmode="numeric" data-rs="${i}" data-f="qty" value="${esc(it.qty)}" aria-label="Quantity">
        <div class="prefix"><span style="left:10px">₱</span><input class="input num" style="padding-left:26px" inputmode="decimal" data-rs="${i}" data-f="cost" value="${esc(it.cost)}" aria-label="Cost each"></div>
        <button class="iconbtn" style="width:34px;height:34px" data-act="rsRm" data-i="${i}" aria-label="Remove">${ico('x',16)}</button></div>`).join('')}
      <div class="tot" style="margin-top:14px"><span>Total spent</span><b style="font-size:26px" id="rstotal">${peso(total)}</b></div></div>`:`<p style="color:var(--ink-3)">Pick the products you bought. Quantities are added to your stock when you save.</p>`}
      <button class="btn primary lg block" data-act="saveRestock" ${S.rs.items.length?'':'disabled'}>Save restock</button>
    </div>
  </section>
  <section class="panel"><h3>Recent restocks</h3>
    ${d.restocks.length?`<div class="list">${d.restocks.slice(0,12).map(r=>`<button class="li" data-act="viewRestock" data-id="${r.id}"><div><b>${esc(r.supplier||'Restock')}</b><div class="sm num">${fmtDT(r.ts)} · ${r.items.length} product${r.items.length===1?'':'s'}</div></div><b class="num">${peso(r.total)}</b></button>`).join('')}</div>`:`<p style="color:var(--ink-3)">No restocks yet. Saved restocks appear here.</p>`}
  </section></div>`;
}
function rsAdd(pid){
  const p=data().products.find(x=>x.id===pid);if(!p||S.rs.items.some(i=>i.pid===pid))return;
  S.rs.items.push({pid,name:p.name,qty:'',cost:p.cost?String(p.cost):''});
}
function saveRestock(){
  const st=store(),d=data();
  S.rs.supplier=val('rs-sup');
  const items=S.rs.items.map(i=>({pid:i.pid,name:i.name,qty:Math.round(num(i.qty)),cost:num(i.cost)})).filter(i=>i.qty>0);
  if(!items.length){toast('Enter how many arrived for at least one product.');return}
  items.forEach(i=>{const p=d.products.find(x=>x.id===i.pid);if(p){p.stock+=i.qty;if(i.cost>0)p.cost=i.cost}});
  const total=items.reduce((a,i)=>a+i.qty*i.cost,0);
  d.restocks.unshift({id:rid(),ts:Date.now(),supplier:S.rs.supplier,items,total});if(d.restocks.length>150)d.restocks.length=150;
  saveStore(st.id);S.rs={items:[],supplier:''};rerenderTab();toast(`Restock saved. ${items.reduce((a,i)=>a+i.qty,0)} items added to stock.`);
}

/* ----- Reports ----- */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pesoK=n=>n>=1e6?'₱'+(n/1e6).toFixed(1)+'M':n>=1000?'₱'+(n/1000).toFixed(n>=1e4?0:1)+'k':'₱'+Math.round(n);
function calState(){if(!S.cal){const t=new Date();S.cal={view:'month',y:t.getFullYear(),m:t.getMonth(),d:dayKey()}}return S.cal}
const keyOf=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
function sumRange(daily,keys){let t=0,p=0,n=0,days=0;keys.forEach(k=>{const v=daily[k];if(v&&v.t){t+=v.t;p+=v.p;n+=v.n;days++}});return{t,p,n,days}}
function monthKeys(y,m){const len=new Date(y,m+1,0).getDate();return [...Array(len)].map((_,i)=>keyOf(y,m,i+1))}
function pctChange(a,b){if(!b)return'';const c=Math.round((a-b)/b*100);return `<span class="delta ${c>=0?'up':'down'}">${c>=0?'▲':'▼'} ${Math.abs(c)}%</span>`}
function calHtml(){
  const d=data(),c=calState(),today=dayKey();
  const tabs=`<div class="seg calseg">${['day','month','year'].map(v=>`<button class="${c.view===v?'on':''}" data-act="calView" data-v="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div>`;
  let title='',body='',stats='';
  if(c.view==='month'){
    const keys=monthKeys(c.y,c.m),sum=sumRange(d.daily,keys);
    const pm=c.m?[c.y,c.m-1]:[c.y-1,11],nowD=new Date(),isCur=c.y===nowD.getFullYear()&&c.m===nowD.getMonth(),prev=sumRange(d.daily,monthKeys(pm[0],pm[1]).filter((_,i)=>!isCur||i<nowD.getDate()));
    const vals=keys.map(k=>(d.daily[k]||{}).t||0),max=Math.max(...vals,1),pos=vals.filter(Boolean),min=pos.length?Math.min(...pos):0;
    const bestI=vals.indexOf(Math.max(...vals));
    title=`${MONTHS[c.m]} ${c.y}`;
    stats=`<div class="cstat"><span>Month total</span><b>${peso(sum.t)}</b>${pctChange(sum.t,prev.t)}<small>${isCur?'vs same days last month':'vs last month'}</small></div>
      <div class="cstat"><span>Customers</span><b>${sum.n.toLocaleString(LOC())}</b></div>
      <div class="cstat"><span>Est. profit</span><b>${pesoR(sum.p)}</b></div>
      <div class="cstat"><span>Best day</span><b>${vals[bestI]?`${MONTHS[c.m].slice(0,3)} ${bestI+1}`:'—'}</b>${vals[bestI]?`<small>${pesoR(vals[bestI])}</small>`:''}</div>`;
    const first=new Date(c.y,c.m,1).getDay();
    let cells='';for(let i=0;i<first;i++)cells+='<span class="cd blank"></span>';
    keys.forEach((k,i)=>{const v=vals[i],fut=k>today,lvl=v?(max>min?.14+.86*(v-min)/(max-min):.6):0;
      cells+=`<button class="cd ${lvl>=.62?'hot':''} ${k===today?'today':''} ${k===c.d?'sel':''} ${fut?'fut':''} ${v?'has':''}" style="--lvl:${lvl.toFixed(2)}" data-act="calDay" data-k="${k}" ${fut?'disabled':''} aria-label="${MONTHS[c.m]} ${i+1}: ${v?peso(v):'no sales'}"><span class="dn">${i+1}</span>${v?`<span class="dv">${pesoK(v)}</span>`:''}</button>`});
    body=`<div class="cgrid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<span class="cw">${w}</span>`).join('')}${cells}</div>
      <div class="clegend"><span>Less</span>${[.12,.35,.6,.85,1].map(l=>`<i style="--lvl:${l}"></i>`).join('')}<span>More</span></div>`;
  }else if(c.view==='year'){
    const ms=[...Array(12)].map((_,m)=>sumRange(d.daily,monthKeys(c.y,m)));
    const tot=ms.reduce((a,x)=>a+x.t,0),nd=new Date(),curY=c.y===nd.getFullYear(),prevY=[...Array(12)].reduce((a,_,m)=>a+(curY&&m>nd.getMonth()?0:sumRange(d.daily,monthKeys(c.y-1,m).filter((_,i)=>!(curY&&m===nd.getMonth())||i<nd.getDate())).t),0);
    const max=Math.max(...ms.map(x=>x.t),1),best=ms.reduce((b,x,i)=>x.t>ms[b].t?i:b,0);
    const nowY=new Date().getFullYear(),nowM=new Date().getMonth();
    title=`${c.y}`;
    stats=`<div class="cstat"><span>Year total</span><b>${peso(tot)}</b>${pctChange(tot,prevY)}<small>${prevY?(curY?'vs same period last year':'vs last year'):''}</small></div>
      <div class="cstat"><span>Customers</span><b>${ms.reduce((a,x)=>a+x.n,0).toLocaleString(LOC())}</b></div>
      <div class="cstat"><span>Est. profit</span><b>${pesoR(ms.reduce((a,x)=>a+x.p,0))}</b></div>
      <div class="cstat"><span>Best month</span><b>${ms[best].t?MONTHS[best]:'—'}</b>${ms[best].t?`<small>${pesoR(ms[best].t)}</small>`:''}</div>`;
    body=`<div class="ygrid">${ms.map((x,m)=>{const fut=c.y>nowY||(c.y===nowY&&m>nowM);return `<button class="ym ${c.y===nowY&&m===nowM?'cur':''} ${fut?'fut':''}" data-act="calMonth" data-m="${m}" ${fut?'disabled':''}>
      <span class="yn">${MONTHS[m].slice(0,3)}</span><span class="ybar"><i style="height:${Math.round(x.t/max*100)}%"></i></span><b>${x.t?pesoK(x.t):'—'}</b><small>${x.days?x.days+' selling days':'No sales'}</small></button>`}).join('')}</div>`;
  }else{
    const [yy,mm,dd]=c.d.split('-').map(Number),dt=new Date(yy,mm-1,dd);
    const v=d.daily[c.d]||{t:0,p:0,n:0};
    const prevK=dayKey(dt.getTime()-DAY),pv=(d.daily[prevK]||{}).t||0;
    const list=d.sales.filter(x=>dayKey(x.ts)===c.d).sort((a,b)=>a.ts-b.ts);
    title=dt.toLocaleDateString(LOC(),{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    stats=`<div class="cstat"><span>Sales</span><b>${peso(v.t)}</b>${pctChange(v.t,pv)}<small>${pv?'vs the day before':''}</small></div>
      <div class="cstat"><span>Customers</span><b>${v.n}</b></div>
      <div class="cstat"><span>Est. profit</span><b>${peso(v.p)}</b></div>
      <div class="cstat"><span>Average sale</span><b>${v.n?peso(v.t/v.n):'—'}</b></div>`;
    const hrs=[...Array(17)].map((_,i)=>i+6),hv=hrs.map(h=>list.filter(x=>new Date(x.ts).getHours()===h).reduce((a,x)=>a+x.total,0)),hm=Math.max(...hv,1);
    const peak=hv.indexOf(Math.max(...hv));
    body=`<div class="dayv">
      <div class="hours"><div class="hh"><span>Sales by hour</span>${list.length&&hv[peak]?`<span class="peak">Busiest at ${hrs[peak]>12?hrs[peak]-12:hrs[peak]} ${hrs[peak]>=12?'PM':'AM'}</span>`:''}</div>
        <div class="hbars">${hv.map((x,i)=>`<div title="${hrs[i]}:00 ${peso(x)}"><i style="height:${x?Math.max(4,x/hm*100):0}%" class="${i===peak&&x?'pk':''}"></i><span>${i%3===0?(hrs[i]>12?hrs[i]-12:hrs[i])+(hrs[i]>=12?'p':'a'):''}</span></div>`).join('')}</div></div>
      <div class="dlist"><div class="hh"><span>Receipts</span><span>${list.length}</span></div>
        ${list.length?`<div class="list">${list.slice().reverse().slice(0,30).map(x=>`<button class="li" data-act="viewSale" data-id="${x.id}"><div><b>${x.items.map(i=>esc(i.name)).slice(0,2).join(', ')}${x.items.length>2?` +${x.items.length-2}`:''}</b><div class="sm num">${fmtTime(x.ts)}</div></div><b class="num">${peso(x.total)}</b></button>`).join('')}</div>`
        :`<p class="cempty">${v.n?'Receipts for this day are no longer kept. Kahera keeps the daily totals for every day and the full receipts for your most recent 400 sales.':'No sales recorded on this day.'}</p>`}
      </div></div>`;
  }
  return `<div class="cal-top"><div class="cal-nav"><button class="iconbtn" data-act="calPrev" aria-label="Previous">${ico('back',18)}</button><h3 class="ctitle">${title}</h3><button class="iconbtn flip" data-act="calNext" aria-label="Next">${ico('back',18)}</button><button class="btn ghost sm" data-act="calToday">Today</button></div>${tabs}</div>
    <div class="cstats">${stats}</div><div class="cal-body" data-v="${c.view}">${body}</div>`;
}
function calStep(dir){const c=calState();
  if(c.view==='year')c.y+=dir;
  else if(c.view==='month'){c.m+=dir;if(c.m<0){c.m=11;c.y--}if(c.m>11){c.m=0;c.y++}}
  else{const [y,m,d]=c.d.split('-').map(Number);const nd=new Date(y,m-1,d+dir);if(dayKey(nd.getTime())>dayKey())return;c.d=dayKey(nd.getTime());c.y=nd.getFullYear();c.m=nd.getMonth()}
  refreshCal()}
function refreshCal(){const el=$('#cal');if(el)el.innerHTML=calHtml()}
function sparkline(vals,w=120,h=36,cls=''){
  const max=Math.max(...vals,1),min=Math.min(...vals,0),r=max-min||1,step=w/(vals.length-1||1);
  const pts=vals.map((v,i)=>[i*step,h-3-((v-min)/r)*(h-8)]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
  const last=pts[pts.length-1];
  return `<svg class="spark ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L${w} ${h}L0 ${h}Z" class="sf"/><path d="${d}" class="sl"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.6" class="sd"/></svg>`;
}
function smoothPath(pts,lo=-1e9,hi=1e9){if(pts.length<2)return'';const cl=v=>Math.min(hi,Math.max(lo,v));let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=cl(p1[1]+(p2[1]-p0[1])/6),c2x=p2[0]-(p3[0]-p1[0])/6,c2y=cl(p2[1]-(p3[1]-p1[1])/6);d+=`C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}return d}
function trendHtml(){
  const d=data(),n=S.rng||14;
  const days=[...Array(n)].map((_,i)=>{const ts=Date.now()-(n-1-i)*DAY;const k=dayKey(ts);const v=d.daily[k]||{};return{ts,t:v.t||0,p:v.p||0}});
  const W=720,H=250,pl=6,pr=6,pt=24,pb=30,max=Math.max(...days.map(x=>x.t),1)*1.12;
  const X=i=>pl+i*(W-pl-pr)/(n-1),Y=v=>pt+(H-pt-pb)*(1-v/max);
  const pts=days.map((x,i)=>[X(i),Y(x.t)]),pp=days.map((x,i)=>[X(i),Y(x.p)]);
  const line=smoothPath(pts,pt,H-pb),pline=smoothPath(pp,pt,H-pb);
  const tot=days.reduce((a,x)=>a+x.t,0),avg=tot/n;
  const prevTot=[...Array(n)].reduce((a,_,i)=>a+((d.daily[dayKey(Date.now()-(2*n-1-i)*DAY)]||{}).t||0),0);
  const grid=[.25,.5,.75,1].map(f=>`<line x1="0" x2="${W}" y1="${Y(max/1.12*f).toFixed(1)}" y2="${Y(max/1.12*f).toFixed(1)}" class="gl"/><text x="4" y="${(Y(max/1.12*f)-5).toFixed(1)}" class="gt">${pesoK(max/1.12*f)}</text>`).join('');
  const lbl=days.map((x,i)=>{const show=n<=7||i%Math.ceil(n/7)===0||i===n-1;return show?`<text x="${X(i).toFixed(1)}" y="${H-8}" text-anchor="middle" class="${i===n-1?'tl':''}">${i===n-1?'Today':new Date(x.ts).toLocaleDateString(LOC(),n<=7?{weekday:'short'}:{month:'short',day:'numeric'})}</text>`:''}).join('');
  const hits=days.map((x,i)=>`<g class="hit"><rect x="${(X(i)-(W/n)/2).toFixed(1)}" y="0" width="${(W/n).toFixed(1)}" height="${H}" fill="transparent"/><line x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${pt}" y2="${H-pb}" class="hl"/><circle cx="${X(i).toFixed(1)}" cy="${Y(x.t).toFixed(1)}" r="4.5" class="hd"/><g class="tip" transform="translate(${Math.min(Math.max(X(i),70),W-70).toFixed(1)} ${Math.max(Y(x.t)-44,4).toFixed(1)})"><rect x="-66" y="0" width="132" height="34" rx="9"/><text x="0" y="14" text-anchor="middle" class="t1">${new Date(x.ts).toLocaleDateString(LOC(),{weekday:'short',month:'short',day:'numeric'})}</text><text x="0" y="27" text-anchor="middle" class="t2">${peso(x.t)}</text></g></g>`).join('');
  return `<div class="tr-h"><div><h3 class="ph3">Sales trend</h3><div class="tr-big"><b>${peso(tot)}</b>${pctChange(tot,prevTot)}<small>vs previous ${n} days</small></div></div>
      <div class="tr-r"><span class="lgnd"><i class="a"></i>Sales</span><span class="lgnd"><i class="b"></i>Est. profit</span><div class="seg">${[7,14,30].map(v=>`<button class="${n===v?'on':''}" data-act="rng" data-n="${v}">${v}D</button>`).join('')}</div></div></div>
    <svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales for the last ${n} days"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".28"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>
      ${grid}<line x1="0" x2="${W}" y1="${Y(avg).toFixed(1)}" y2="${Y(avg).toFixed(1)}" class="avg"/><text x="${W*.5}" y="${(Y(avg)-6).toFixed(1)}" text-anchor="middle" class="avgt">Average ${pesoK(avg)}</text>
      <path d="${line}L${X(n-1)} ${H-pb}L${X(0)} ${H-pb}Z" fill="url(#tg)"/><path d="${pline}" class="pl"/><path d="${line}" class="ln"/>
      <circle cx="${X(n-1).toFixed(1)}" cy="${Y(days[n-1].t).toFixed(1)}" r="5" class="now"/><circle cx="${X(n-1).toFixed(1)}" cy="${Y(days[n-1].t).toFixed(1)}" r="11" class="pulse"/>
      ${lbl}${hits}</svg>`;
}
function tReports(){
  const d=data(),st=store(),today=dayKey(),now=new Date();
  const t=d.daily[today]||{t:0,p:0,n:0};
  const ydayK=dayKey(Date.now()-DAY),cut=Date.now()-DAY;
  const ySoFar=d.sales.filter(x=>dayKey(x.ts)===ydayK&&x.ts<=cut);
  const yT=ySoFar.reduce((a,x)=>a+x.total,0),yN=ySoFar.length,yP=ySoFar.reduce((a,x)=>a+x.items.reduce((b,i)=>b+(i.price-(i.cost||i.price))*i.qty,0),0);
  const last=k=>[...Array(14)].map((_,i)=>(d.daily[dayKey(Date.now()-(13-i)*DAY)]||{})[k]||0);
  const mk=monthKeys(now.getFullYear(),now.getMonth()),mSum=sumRange(d.daily,mk);
  const pm=now.getMonth()?[now.getFullYear(),now.getMonth()-1]:[now.getFullYear()-1,11];
  const pmSum=sumRange(d.daily,monthKeys(pm[0],pm[1]).filter((_,i)=>i<now.getDate()));
  const months=[...Array(6)].map((_,i)=>{const dt=new Date(now.getFullYear(),now.getMonth()-6+i,1);return sumRange(d.daily,monthKeys(dt.getFullYear(),dt.getMonth())).t});
  const h=now.getHours(),greet=h<11?'Magandang umaga':h<13?'Magandang tanghali':h<18?'Magandang hapon':'Magandang gabi';
  const first=(st.owner||'').split(/\s+/)[0]||'po';
  const top={};d.sales.filter(x=>x.ts>Date.now()-30*DAY).forEach(x=>x.items.forEach(i=>{const o=top[i.name]||(top[i.name]={q:0,a:0,pid:i.pid});o.q+=i.qty;o.a+=i.qty*i.price}));
  const topL=Object.entries(top).sort((a,b)=>b[1].a-a[1].a).slice(0,5),topMax=topL.length?topL[0][1].a:1;
  const low=d.products.filter(p=>p.stock<=p.low).sort((a,b)=>a.stock-b.stock).slice(0,5);
  const ago=ts=>{const m=Math.round((Date.now()-ts)/60000);return m<1?'Just now':m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} hr ago`:fmtDate(ts)};
  const kpi=(cls,icon,label,val,delta,sub,spark)=>`<div class="kpi2 ${cls}"><div class="k-h"><span class="k-i">${ico(icon,16)}</span><span>${label}</span></div><b class="num">${val}</b><div class="k-f"><span>${delta}${sub?`<small>${sub}</small>`:''}</span>${spark}</div></div>`;
  return `<div class="dash-hero">
      <div class="dh-l">${avatarHtml(st,'lg')}<div><span class="dh-g">${greet}, ${esc(first)}</span><p>${t.n?`You've made <b>${peso(t.t)}</b> from <b>${t.n} customer${t.n===1?'':'s'}</b> so far today.`:'No sales yet today. Your first suki is on the way.'}</p></div></div>
      <div class="dh-r"><button class="btn sm" data-act="tab" data-t="restock">${ico('bag',15)}Restock</button><button class="btn primary sm" data-act="tab" data-t="sell">${ico('sell',15)}New sale</button></div>
    </div>
    <div class="kpis2">
      ${kpi('hl','sell','Sales today',peso(t.t),pctChange(t.t,yT),yT?'vs this time yesterday':'',sparkline(last('t'),120,36,'w'))}
      ${kpi('','users','Customers today',t.n,pctChange(t.n,yN),yN?'vs this time yesterday':'',sparkline(last('n')))}
      ${kpi('','chart','Est. profit today',peso(t.p),t.t?`<span class="delta flat">${Math.round(t.p/t.t*100)}% margin</span>`:'','',sparkline(last('p')))}
      ${kpi('','clock','This month',pesoR(mSum.t),pctChange(mSum.t,pmSum.t),pmSum.t?'vs same days last month':'',sparkline(months))}
    </div>
    <div class="dgrid">
      <section class="panel trendp" id="trend">${trendHtml()}</section>
      <section class="panel"><h3>Best sellers, 30 days</h3>${topL.length?`<ol class="rank">${topL.map(([nm,o],i)=>{const pr=d.products.find(x=>x.id===o.pid)||{name:nm};return `<li><span class="rn">${i+1}</span>${pthumb(pr)}<div class="rb"><div class="rt"><b>${esc(nm)}</b><span class="num">${pesoR(o.a)}</span></div><div class="rbar"><i style="width:${Math.round(o.a/topMax*100)}%"></i></div><small>${o.q} sold</small></div></li>`}).join('')}</ol>`:`<p class="cempty">Sales you make will show up here.</p>`}</section>
    </div>
    <section class="panel calp" id="cal">${calHtml()}</section>
    <div class="dgrid b">
      <section class="panel"><h3>Recent sales</h3>${d.sales.length?`<div class="feed">${d.sales.slice(0,7).map(x=>`<button class="fi" data-act="viewSale" data-id="${x.id}"><span class="fdot"></span><div class="fb"><b>${x.items.map(i=>esc(i.name)).slice(0,2).join(', ')}${x.items.length>2?` +${x.items.length-2} more`:''}</b><small>${ago(x.ts)} · ${x.items.reduce((a,i)=>a+i.qty,0)} items</small></div><span class="famt num">${peso(x.total)}</span></button>`).join('')}</div>`:`<p class="cempty">No sales yet. Head to Sell to make your first one.</p>`}</section>
      <section class="panel"><h3>Needs restocking</h3>${low.length?`<div class="lowl">${low.map(p=>{const lvl=p.stock<=0?0:Math.max(1,Math.min(5,Math.ceil(p.stock/Math.max(1,p.low*4)*5)));return `<div class="lw">${pthumb(p)}<div class="lb"><b>${esc(p.name)}</b><span class="segs">${[0,1,2,3,4].map(i=>`<i class="${i<lvl?'on':''}"></i>`).join('')}</span></div><span class="pill ${p.stock<=0?'bad':'warn'} num"><span class="dot"></span>${p.stock<=0?'Out':p.stock+' left'}</span></div>`}).join('')}</div><button class="btn block" style="margin-top:14px" data-act="restockLow">${ico('bag',16)}Restock these</button>`:`<div class="allgood"><span>${ico('check',20)}</span><b>All stocked up</b><small>Nothing is running low right now.</small></div>`}</section>
    </div>`;
}

/* ----- Settings ----- */
function tSettings(){
  const st=store(),s=storeState(st);
  return `<div class="cols">
    <section class="panel"><h3>Store details</h3><div class="stack"><div id="avwrap">${avPanelFor()}</div>
      <div class="field"><label for="e-name">Store name</label><input class="input" id="e-name" value="${esc(st.name)}"></div>
      <div class="row2"><div class="field"><label for="e-owner">Owner's name</label><input class="input" id="e-owner" value="${esc(st.owner)}"></div>
      <div class="field"><label for="e-phone">Mobile number</label><div class="prefix"><span>+63</span><input class="input" id="e-phone" value="${esc(st.phone)}"></div></div></div>
      <div class="row2"><div class="field"><label for="e-brgy">Barangay</label><input class="input" id="e-brgy" value="${esc(st.brgy)}"></div>
      <div class="field"><label for="e-city">City or municipality</label><input class="input" id="e-city" value="${esc(st.city)}"></div></div>
      <div><button class="btn primary" data-act="saveDetails">Save details</button></div>
    </div></section>
    <div class="stack" style="gap:18px">
      <section class="panel"><h3>Your plan</h3>
        <div class="summary" style="margin-bottom:14px">
          <div class="rline"><span>Plan</span><b>${PLANS[st.plan].name}</b></div>
          <div class="rline"><span>Status</span>${statePill(st)}</div>
          <div class="rline"><span>${s==='expired'?'Ended':'Active until'}</span><b>${fmtDate(st.expires)}</b></div>
          <div class="rline"><span>Store code</span><b>${st.code}</b></div>
        </div>
        <button class="btn primary block" data-act="renew">${st.plan==='trial'?'Upgrade to a paid plan':'Renew or change plan'}</button>
        ${st.payments.length?`<div class="list" style="margin-top:12px">${st.payments.slice().reverse().slice(0,4).map(p=>`<div class="li"><div><b style="font-weight:600">${PLANS[p.plan].name} plan</b><div class="sm num">${fmtDate(p.ts)} via ${METHODS[p.method]?METHODS[p.method].name:esc(p.method)}</div></div><b class="num">${peso(p.amt)}</b></div>`).join('')}</div>`:''}
      </section>
      <section class="panel"><h3>Change PIN</h3><div class="stack" data-enter="savePin">
        <div class="row2"><div class="field"><label for="n-pin">New PIN</label><input class="input pin" id="n-pin" type="password" inputmode="numeric" maxlength="4"></div>
        <div class="field"><label for="n-pin2">Enter it again</label><input class="input pin" id="n-pin2" type="password" inputmode="numeric" maxlength="4"></div></div>
        <p class="err" id="pinerr"></p><div><button class="btn" data-act="savePin">Change PIN</button></div></div></section>
    </div>
  </div>`;
}
function renewModal(adminMode){
  const st=adminMode?findStore(adminMode):store();
  const sel=S.renewPlan||'monthly',m=S.renewMethod||'gcash',p=PLANS[sel];
  const base=Math.max(Date.now(),st.expires);
  openModal(`<h3>${adminMode?'Record payment':'Renew plan'}</h3><p class="sub">${esc(st.name)}</p>
  <div class="methods" style="grid-template-columns:1fr 1fr;margin-bottom:16px">${['monthly','yearly'].map(k=>`<button class="method ${k===sel?'sel':''}" data-act="renewPlan" data-p="${k}" data-store="${adminMode||''}">${PLANS[k].name}<small class="num">${pesoR(PLANS[k].price)}${PLANS[k].per}</small></button>`).join('')}</div>
  <div class="summary"><div class="rline"><span>New end date</span><b>${fmtDate(base+p.days*DAY)}</b></div><div class="rline rtotal"><span>Amount</span><span>${peso(p.price)}</span></div></div>
  ${adminMode?`<div class="field"><label for="a-method">Paid through</label><select class="select" id="a-method"><option value="gcash">GCash</option><option value="maya">Maya</option><option value="card">Card</option><option value="cash">Cash</option><option value="bank">Bank transfer</option></select></div>`:payFields(m)}
  <p class="err" id="err"></p>
  <button class="btn primary lg block" style="margin-top:18px" data-act="renewPay" data-store="${adminMode||''}" id="paybtn">${adminMode?'Record payment and extend':'Pay '+peso(p.price)}</button>
  ${adminMode?'':'<p class="notice">This prototype simulates payment. No money is charged.</p>'}`);
}
function applyPayment(st,plan,method){
  const p=PLANS[plan];
  st.expires=Math.max(Date.now(),st.expires)+p.days*DAY;st.plan=plan;
  st.payments.push({amt:p.price,method,ref:'REF'+Date.now().toString().slice(-8),ts:Date.now(),plan});
  savePlatform();
}

/* ---------- Admin ---------- */
function vAdminLogin(){
  const set=!S.platform.adminPin;
  return `<div class="authwrap"><div class="aura" aria-hidden="true"></div><header class="topbar">${logo()}<nav>${themeBtn()}<button class="btn ghost" data-act="go" data-v="landing">Home</button>${langBtn()}</nav></header>
  <div class="authcard"><h1>Platform admin</h1><p class="sub">${set?'Create a 4-digit admin PIN. You\'ll use it to manage every store on Kahera.':'Enter the admin PIN to manage stores.'}</p>
  <div class="stack" data-enter="adminLogin">
    <div class="field"><label for="a-pin">${set?'New admin PIN':'Admin PIN'}</label><input class="input pin" id="a-pin" type="password" inputmode="numeric" maxlength="4" data-autofocus></div>
    ${set?`<div class="field"><label for="a-pin2">Enter it again</label><input class="input pin" id="a-pin2" type="password" inputmode="numeric" maxlength="4"></div>`:''}
    <p class="err" id="err"></p>
    <button class="btn primary lg block" data-act="adminLogin">${set?'Create PIN and continue':'Continue'}</button>
  </div></div></div>`;
}
function vAdmin(){
  const ss=S.platform.stores;
  const active=ss.filter(s=>['active','expiring'].includes(storeState(s))).length;
  const trial=ss.filter(s=>storeState(s)==='trial').length;
  const soon=ss.filter(s=>s.status!=='suspended'&&s.expires>Date.now()&&s.expires-Date.now()<7*DAY).length;
  const rev=ss.reduce((a,s)=>a+s.payments.reduce((b,p)=>b+p.amt,0),0);
  return `<header class="adminbar"><div class="brand">${logoMark()}<span>Kahera</span><small>Admin</small></div><div class="right">${themeBtn()}<button class="btn ghost" data-act="signout">${ico('out',18)}Sign out</button>${langBtn()}</div></header>
  <main class="admin-main">
    <header class="mhead"><div><p class="eyebrow">Platform admin</p><h2>Stores</h2><p>Every store registered on Kahera, their plans and payments.</p></div>${S.platform.stores.some(x=>x.sample)?`<button class="btn ghost" data-act="removeSamples">${ico('trash',16)}Remove sample stores</button>`:''}<button class="btn primary" data-act="adminAdd">${ico('plus',18)}Add store</button></header>
    <div class="kpis">
      <div class="kpi hl"><span>Payments collected</span><b>${pesoR(rev)}</b></div>
      <div class="kpi"><span>Paying stores</span><b>${active}</b></div>
      <div class="kpi"><span>On free trial</span><b>${trial}</b></div>
      <div class="kpi"><span>Ending within 7 days</span><b style="${soon?'color:#b07400':''}">${soon}</b></div>
    </div>
    <div class="toolbar">
      <div class="searchbar">${ico('search')}<input id="adq" type="search" placeholder="Search store, owner, code or city" value="${esc(S.adQ)}" aria-label="Search stores"></div>
      <div class="seg">${[['all','All'],['paying','Paying'],['trial','Trial'],['attention','Needs attention']].map(([k,l])=>`<button class="${S.adF===k?'on':''}" data-act="adF" data-f="${k}">${l}</button>`).join('')}</div>
    </div>
    <div class="tablewrap" id="adtable">${adminTable()}</div>
  </main>`;
}
function planCell(s){const st=storeState(s),left=Math.ceil((s.expires-Date.now())/DAY);
  const map={trial:['warn',[`${Math.max(0,left)} days left`]],active:['ok',['Active']],expiring:['warn',[`${Math.max(0,left)} days left`]],expired:['bad',['Expired']],suspended:['bad',['Paused']]};
  const [c,parts]=map[st];
  return `<b class="pl-name">${PLANS[s.plan].name}</b><span class="sm stt ${c}"><i></i>${parts.map(t=>`<span>${t}</span>`).join('<em>·</em>')}</span>`}
function pager(page,pages,from,count,total){
  const nums=[];for(let i=1;i<=pages;i++){if(i===1||i===pages||Math.abs(i-page)<=1)nums.push(i);else if(nums[nums.length-1]!=='…')nums.push('…')}
  return `<div class="pager"><span class="pg-info num">Showing ${from+1}–${from+count} of ${total} stores</span>
    <div class="pg-btns"><button class="pg-b" data-act="adPage" data-p="${page-1}" ${page<=1?'disabled':''} aria-label="Previous page">${ico('back',16)}</button>
    ${nums.map(n=>n==='…'?'<span class="pg-gap">…</span>':`<button class="pg-b num ${n===page?'on':''}" data-act="adPage" data-p="${n}" ${n===page?'aria-current="page"':''}>${n}</button>`).join('')}
    <button class="pg-b flip" data-act="adPage" data-p="${page+1}" ${page>=pages?'disabled':''} aria-label="Next page">${ico('back',16)}</button></div></div>`}
function adminTable(){
  const q=S.adQ.toLowerCase();
  const list=S.platform.stores.filter(s=>{
    const st=storeState(s);
    const fm=S.adF==='all'||(S.adF==='paying'&&['active','expiring'].includes(st))||(S.adF==='trial'&&st==='trial')||(S.adF==='attention'&&['expiring','expired','suspended'].includes(st));
    return fm&&(!q||[s.name,s.owner,s.code,s.city,s.brgy,s.phone].join(' ').toLowerCase().includes(q));
  }).sort((a,b)=>b.createdAt-a.createdAt);
  const per=10,pages=Math.max(1,Math.ceil(list.length/per));S.adPage=Math.min(Math.max(1,S.adPage||1),pages);
  const from=(S.adPage-1)*per,shown=list.slice(from,from+per);
  if(!S.platform.stores.length)return `<div class="empty" style="border:0"><h3>No stores yet</h3><p>Stores appear here when owners register, or when you add one for them.</p><div class="btns"><button class="btn primary" data-act="adminAdd">${ico('plus',18)}Add store</button></div></div>`;
  if(!list.length)return `<p style="padding:24px;color:var(--ink-3)">No stores match.</p>`;
  return `<table><thead><tr><th>Store</th><th class="hide-m">Owner</th><th class="hide-m">Location</th><th>Plan</th><th class="hide-m">Ends</th><th class="r hide-m">Sales, 30 days</th><th class="r"></th></tr></thead><tbody>
  ${shown.map(s=>{const d=S.data[s.id];let sales=0;if(d){for(let i=0;i<30;i++){const k=dayKey(Date.now()-i*DAY);sales+=(d.daily[k]||{}).t||0}}
  return `<tr>
    <td><div class="pcell">${avatarHtml(s,"sm")}<div><b>${esc(s.name)}</b><span class="sm mono">${s.code}${s.sample?'<span class="smp">Sample</span>':''}</span></div></div></td>
    <td class="hide-m">${esc(s.owner)}<span class="sm num">+63 ${esc(s.phone)}</span></td>
    <td class="hide-m">${esc([s.brgy,s.city].filter(Boolean).join(', ')||'—')}</td>
    <td>${planCell(s)}</td>
    <td class="hide-m num nw">${fmtDate(s.expires)}</td>
    <td class="r hide-m">${pesoR(sales)}</td>
    <td class="r"><button class="btn sm" data-act="adminManage" data-id="${s.id}">Manage</button></td></tr>`}).join('')}</tbody></table>${pager(S.adPage,pages,from,shown.length,list.length)}`;
}
function adminManage(id){
  const s=findStore(id),susp=s.status==='suspended';
  const paid=s.payments.reduce((a,p)=>a+p.amt,0);
  openModal(`<div class="mhero">${avatarHtml(s,"lg")}<div><h3>${esc(s.name)}</h3><p class="sub" style="margin:0">${statePill(s)} <span class="num" style="margin-left:6px">${s.code}</span></p></div></div>
  <div class="summary">
    <div class="rline"><span>Owner</span><b>${esc(s.owner)}</b></div>
    <div class="rline"><span>Mobile</span><span class="num">+63 ${esc(s.phone)}</span></div>
    <div class="rline"><span>Location</span><span>${esc([s.brgy,s.city].filter(Boolean).join(', ')||'—')}</span></div>
    <div class="rline"><span>Registered</span><span>${fmtDate(s.createdAt)}</span></div>
    <div class="rline"><span>Plan ends</span><span>${fmtDate(s.expires)}</span></div>
    <div class="rline"><span>Total paid</span><b>${peso(paid)}</b></div>
  </div>
  <div class="stack" style="gap:10px">
    <button class="btn primary block" data-act="adminPay" data-id="${s.id}">Record payment and extend</button>
    <button class="btn block" data-act="adminOpen" data-id="${s.id}">${ico('store',18)}Open store</button>
    <div class="row2" style="gap:10px"><button class="btn" data-act="adminPin" data-id="${s.id}">Reset PIN</button>
    <button class="btn ${susp?'':'danger'}" data-act="adminSuspend" data-id="${s.id}">${susp?'Turn store back on':'Pause store'}</button></div>
    <button class="btn ghost block" style="color:var(--sili)" data-act="adminDelete" data-id="${s.id}">${ico('trash',16)}Delete store</button>
  </div>`);
}
function adminAddModal(){
  openModal(`<h3>Add a store</h3><p class="sub">Register a store on behalf of an owner, for example after they pay you directly.</p>
  <div class="stack" data-enter="adminCreate">
    <div class="field"><label for="n-name">Store name</label><input class="input" id="n-name" data-autofocus></div>
    <div class="row2"><div class="field"><label for="n-owner">Owner's name</label><input class="input" id="n-owner"></div>
    <div class="field"><label for="n-phone">Mobile number</label><div class="prefix"><span>+63</span><input class="input" id="n-phone" inputmode="numeric"></div></div></div>
    <div class="row2"><div class="field"><label for="n-brgy">Barangay</label><input class="input" id="n-brgy"></div>
    <div class="field"><label for="n-city">City or municipality</label><input class="input" id="n-city"></div></div>
    <div class="row2"><div class="field"><label for="n-plan">Plan</label><select class="select" id="n-plan">${Object.values(PLANS).map(p=>`<option value="${p.id}" ${p.id==='monthly'?'selected':''}>${p.name}${p.price?' — '+pesoR(p.price):''}</option>`).join('')}</select></div>
    <div class="field"><label for="n-method">Paid through</label><select class="select" id="n-method"><option value="cash">Cash</option><option value="gcash">GCash</option><option value="maya">Maya</option><option value="bank">Bank transfer</option></select><span class="hint">Ignored for free trials.</span></div></div>
    <p class="err" id="nerr"></p>
    <button class="btn primary lg block" data-act="adminCreate">Add store</button>
  </div>`);
}

/* ================= Demo data ================= */
function sampleProducts(){
  const L=[['Lucky Me Pancit Canton Original','Pansit',18,14.5,48,12,'pack'],['Lucky Me Beef Mami','Pansit',15,12,36,12,'pack'],['Nissin Cup Noodles Seafood','Pansit',32,26,12,6,'cup'],
  ['Coke Mismo 295ml','Inumin',20,16,24,12,'bottle'],['Royal Tru-Orange 1L','Inumin',45,38,6,4,'bottle'],['Kopiko Brown 3-in-1','Kape',10,8,60,20,'sachet'],['Great Taste White 3-in-1','Kape',10,8,40,20,'sachet'],
  ['Bear Brand Swak 33g','Gatas',13,11,30,10,'sachet'],['Itlog','Pangunahin',9,7.5,60,24,'pc'],['Bigas (kada kilo)','Pangunahin',52,45,25,10,'kg'],['Argentina Corned Beef 150g','De-lata',42,36,18,6,'can'],
  ['555 Sardines 155g','De-lata',26,22,24,8,'can'],['Piattos Cheese 40g','Sitsirya',18,15,20,8,'pack'],['SkyFlakes Crackers 25g','Sitsirya',8,6.5,50,15,'pack'],['Safeguard sabon','Panligo',25,21,10,5,'bar'],
  ['Palmolive shampoo (sachet)','Panligo',7,5.5,60,20,'sachet'],['Joy panghugas ng pinggan (sachet)','Panlinis',8,6.5,40,12,'sachet'],['Tide sabong pulbos 66g','Panlinis',12,10,3,10,'sachet'],
  ['Lollipop','Kendi',5,3.5,40,10,'pc'],['Mint na kendi (kada piraso)','Kendi',1,.6,200,50,'pc'],['Tsokolate 25g','Kendi',15,12,24,8,'pc'],
  ['Pandesal (10 piraso)','Tinapay',30,24,10,3,'pack'],['Toyo 200ml','Sawsawan',18,14,12,4,'bottle'],['Suka 385ml','Sawsawan',20,16,12,4,'bottle'],
  ['Yelo (tubo)','Malamig',5,2,30,10,'pc'],['Kandila (puti)','Iba pa',10,7,20,5,'pc'],['Baterya AA (pares)','Iba pa',30,22,8,3,'pack']];
  return L.map(([name,cat,price,cost,stock,low,unit])=>({id:rid(),name,cat,price,cost,stock,low,unit}));
}
async function makeDemo(){
  const st=createStore({plan:'trial',name:'Tindahan ni Aling Nena',owner:'Nena Reyes',phone:'9171234567',brgy:'San Roque',city:'Marikina',pin:'1234'});st.demo=true;
  const d=S.data[st.id];d.products=sampleProducts();applySampleImgs(d.products);
  S.avs[st.id]=FACES.AN;st.hasAv=true;P.save('av_'+st.id,{d:FACES.AN});savePlatform();
  const now=new Date();
  for(let day=420;day>=0;day--){
    const base=new Date(now.getFullYear(),now.getMonth(),now.getDate()-day);
    const dow=base.getDay(),dom=base.getDate();
    let n=7+Math.floor(Math.random()*10);
    if(dow===0||dow===6)n=Math.round(n*1.3);
    if(dom===15||dom===30||dom===31)n=Math.round(n*1.45);
    n=Math.round(n*(0.75+0.35*(1-day/420)));
    if(Math.random()<.04)n=0;
    const maxH=day?21:Math.max(6,Math.min(21,now.getHours()));
    for(let j=0;j<n;j++){
      const h=6+Math.floor(Math.random()*(maxH-6+1));
      const ts=base.getTime()+h*3600e3+Math.floor(Math.random()*3600e3);
      if(ts>Date.now())continue;
      const items=[...Array(1+Math.floor(Math.random()*3))].map(()=>{const p=d.products[Math.floor(Math.random()*d.products.length)];return{pid:p.id,name:p.name,qty:1+Math.floor(Math.random()*3),price:p.price,cost:p.cost}});
      const total=items.reduce((a,i)=>a+i.qty*i.price,0),profit=items.reduce((a,i)=>a+(i.price-i.cost)*i.qty,0);
      const cash=[20,50,100,200,500].find(v=>v>=total)||Math.ceil(total);
      d.sales.push({id:rid(),ts,items,total,cash,change:cash-total});
      const k=dayKey(ts);const a=d.daily[k]||(d.daily[k]={t:0,p:0,n:0});a.t+=total;a.p+=profit;a.n++;
    }
  }
  d.sales.sort((a,b)=>b.ts-a.ts);if(d.sales.length>400)d.sales.length=400;saveStore(st.id);
  return st;
}

/* ================= Navigation ================= */
async function openStore(id,asAdmin){
  await loadData(id);await loadAv(id);
  const st=findStore(id);
  setSession({role:'store',storeId:id,admin:!!asAdmin});
  rememberStore(st.code);
  S.cart=[];S.cash='';S.q='';S.cat='All';S.cartOpen=false;S.rs={items:[],supplier:''};S.tab='sell';
  S.view=['expired','suspended'].includes(storeState(st))?'blocked':'store';
  closeModal();render();window.scrollTo(0,0);
}

/* Sample stores so the admin list has enough rows to page through */
function seedSampleStores(){
  if(S.platform.seededSamples)return false;
  const names=[['Tindahan ni Aling Rosa','Rosa Mendoza'],['Sari-Sari ni Mang Lito','Lito Ramos'],['JM Mini Mart','Jose Mari Santos'],['Tindahan ng Bayan','Corazon Villanueva'],['Bebeng Store','Bebeng Castillo'],['Kuya Jun Sari-Sari','Junel Bautista'],['Nanay Fe Store','Felicidad Navarro'],['Dela Cruz Grocery','Ramon dela Cruz'],['Tindahan sa Kanto','Arnel Pascual'],['Lola Iska Store','Francisca Aquino'],['RJ Sari-Sari','Rodel Jimenez'],['Ate Joy Mini Store','Joy Salazar'],['Mabuhay Store','Danilo Reyes'],['Tatay Ben Store','Benjamin Cruz'],['Malou Sari-Sari','Maria Lourdes Tan'],['Kapitbahay Store','Edwin Manalo'],['Tindahan ni Inday','Inday Fernandez'],['Gemma Mini Mart','Gemma Soriano'],['Bahay Kubo Store','Ricardo Mercado'],['Tita Baby Store','Baby Garcia'],['Sto. Niño Sari-Sari','Lourdes Domingo'],['Pinoy Tindahan','Marlon Agustin'],['Kuya Nonoy Store','Nonoy Valdez'],['Ellen Grocery','Ellen Ocampo'],['Masagana Store','Teresita Lim'],['Ka Pedring Store','Pedro Alcantara'],['Liza Mini Store','Liza Robles'],['Bagong Pag-asa Store','Antonio Rivera']];
  const places=[['San Roque','Marikina'],['Malanday','Marikina'],['Pinagbuhatan','Pasig'],['Kapitolyo','Pasig'],['Bagong Silang','Caloocan'],['Commonwealth','Quezon City'],['Batasan Hills','Quezon City'],['Tondo','Manila'],['Sampaloc','Manila'],['Poblacion','Makati'],['Tambo','Parañaque'],['Pamplona','Las Piñas'],['Putatan','Muntinlupa'],['Malinta','Valenzuela'],['Tangos','Navotas'],['Lahug','Cebu City'],['Mabolo','Cebu City'],['Talamban','Cebu City'],['Matina','Davao City'],['Buhangin','Davao City'],['Jaro','Iloilo City'],['Mandurriao','Iloilo City'],['Poblacion','Baguio City'],['San Fernando','Pampanga'],['Dasmariñas','Cavite'],['Calamba','Laguna'],['Antipolo','Rizal'],['Lipa','Batangas']];
  const now=Date.now();let r=97;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296};
  names.forEach(([name,owner],i)=>{
    const kind=i%9===4?'trial':i%5===0?'yearly':i%7===3?'trial':'monthly';
    const p=PLANS[kind],created=now-Math.round((20+rnd()*340)*DAY);
    let expires=now+Math.round((rnd()*p.days)*DAY);
    if(i%8===2)expires=now-Math.round((1+rnd()*20)*DAY);
    if(i%10===6)expires=now+Math.round((1+rnd()*3)*DAY);
    const st={id:'smp'+i+rid(),code:newCode(),name,owner,phone:'9'+String(170000000+Math.floor(rnd()*29999999)),brgy:places[i][0],city:places[i][1],pin:'0000',plan:kind,status:i%11===9?'suspended':'active',createdAt:created,expires,payments:[],sample:true,avGv:i%3};
    if(p.price){const n=Math.max(1,Math.round((now-created)/(p.days*DAY)));for(let k=0;k<Math.min(n,6);k++)st.payments.push({amt:p.price,method:['gcash','maya','card','gcash'][k%4],ref:'REF'+(10000000+Math.floor(rnd()*89999999)),ts:created+k*p.days*DAY,plan:kind})}
    const daily={};const base=400+rnd()*1600;
    for(let d=0;d<35;d++){if(st.status==='suspended'||(expires<now&&d<Math.round((now-expires)/DAY)))continue;if(rnd()<.06)continue;const t=Math.round(base*(.6+rnd()*.8));daily[dayKey(now-d*DAY)]={t,p:Math.round(t*.17),n:Math.max(1,Math.round(t/70))}}
    S.platform.stores.push(st);S.data[st.id]={products:[],sales:[],restocks:[],daily};saveStore(st.id);
  });
  S.platform.seededSamples=true;S.platform.prunedOne=true;savePlatform();return true;
}
function removeSampleStores(){const gone=S.platform.stores.filter(x=>x.sample);gone.forEach(x=>{P.save('s_'+x.id,{products:[],sales:[],restocks:[],daily:{}});delete S.data[x.id]});S.platform.stores=S.platform.stores.filter(x=>!x.sample);savePlatform();return gone.length}
async function openAdmin(){
  seedSampleStores();
  setSession({role:'admin'});S.view='admin';render();
  await Promise.all(S.platform.stores.map(s=>Promise.all([loadData(s.id),loadAv(s.id)])));
  if(S.view==='admin'){const t=$('#adtable');if(t)t.innerHTML=adminTable()}
}
function rerenderTab(){if(S.view!=='store')return render();const t=$('#tab');if(t){t.innerHTML=tabView()}else render();
  /* refresh low-stock badge */const nb=document.querySelectorAll('.nav .badge');const lc=lowCount();
  document.querySelectorAll('[data-t="products"]').forEach(b=>{const bd=b.querySelector('.badge');if(bd){lc?bd.textContent=lc:bd.remove()}else if(lc&&b.closest('.side')){b.insertAdjacentHTML('beforeend',`<span class="badge num">${lc}</span>`)}});
}

/* ================= Actions ================= */
const A={
  go:a=>{S.view=a.dataset.v;render();window.scrollTo(0,0)},
  avShuffle:()=>{if(S.view==='register'){S.reg.avGv=(S.reg.avGv||0)+1;refreshAvPanel();return}const st=store();if(!st)return;st.avGv=(st.avGv||0)+1;savePlatform();render()},
  avInitials:()=>{if(S.view==='register'){S.reg.avOff=true;refreshAvPanel();return}const st=store();if(!st)return;st.avOff=true;savePlatform();render()},
  avAuto:()=>{if(S.view==='register'){S.reg.avOff=false;refreshAvPanel();return}const st=store();if(!st)return;st.avOff=false;savePlatform();render()},
  avRemove:()=>{
    if(S.view==='register'){S.reg.av=null;S.reg.avOff=false;refreshAvPanel();return}
    const st=store();if(!st)return;delete S.avs[st.id];st.hasAv=false;P.save('av_'+st.id,{d:''});savePlatform();render();toast('Photo removed.')},
  catPick:a=>{const i=$('#p-cat');if(!i)return;i.value=a.dataset.c;if(S.pf)S.pf.cat=a.dataset.c;$('#catpick').innerHTML=catPickHtml(a.dataset.c);if(S.pf&&!S.pf.img)refreshPh()},
  phRemove:()=>{if(S.pf){S.pf.img=null;S.pf.changed=true;S.pf.off=false;refreshPh()}},
  phShuffle:()=>{if(S.pf){S.pf.gv=(S.pf.gv||0)+1;refreshPh()}},
  phIcon:()=>{if(S.pf){S.pf.off=true;refreshPh()}},
  phAuto:()=>{if(S.pf){S.pf.off=false;refreshPh()}},
  bill:a=>{S.bill=a.dataset.b;const w=document.querySelector('#pricing .wrap');if(w){w.innerHTML=pricingHtml();w.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('in'));initParallax()}},
  calView:a=>{const c=calState();c.view=a.dataset.v;if(c.view!=='day'){const [y,m]=c.d.split('-').map(Number);c.y=y;c.m=m-1}refreshCal()},
  calDay:a=>{const c=calState();c.d=a.dataset.k;c.view='day';refreshCal()},
  calMonth:a=>{const c=calState();c.m=+a.dataset.m;c.view='month';refreshCal()},
  calToday:()=>{const t=new Date();S.cal={view:calState().view,y:t.getFullYear(),m:t.getMonth(),d:dayKey()};refreshCal()},
  calPrev:()=>calStep(-1),calNext:()=>calStep(1),
  rng:a=>{S.rng=+a.dataset.n;const el=$('#trend');if(el)el.innerHTML=trendHtml()},
  whyTab:a=>{S.why=+a.dataset.i;const w=document.querySelector('#why .wrap');if(w){w.innerHTML=whyHtml();initParallax()}},
  scrollTo:a=>{const t=document.getElementById(a.dataset.to);if(t)window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-76,behavior:'smooth'})},
  lang:()=>{S.lang=S.lang==='tl'?'en':'tl';try{localStorage.setItem('suki:lang',S.lang)}catch(e){}document.documentElement.lang=S.lang==='tl'?'fil':'en';closeModal();render()},
  theme:()=>{const t=isDark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('suki:theme',t)}catch(e){}document.querySelectorAll('[data-act=theme]').forEach(b=>{b.outerHTML=themeOnly()})},
  closeModal,
  startReg:a=>{S.reg={step:0,plan:a.dataset.plan||'trial',name:'',owner:'',phone:'',brgy:'',city:'',pin:'',method:'gcash'};S.view='register';render();window.scrollTo(0,0)},
  regPlan:a=>{S.reg.plan=a.dataset.plan;render()},
  regBack:()=>{S.reg.step--;render()},
  regNext:()=>{
    const r=S.reg;
    if(r.step===1){
      r.name=val('f-name');r.owner=val('f-owner');r.phone=val('f-phone').replace(/\D/g,'').replace(/^0/,'');r.brgy=val('f-brgy');r.city=val('f-city');
      const pin=val('f-pin'),pin2=val('f-pin2');const e=$('#err');
      if(!r.name)return e.textContent='Enter your store name.';
      if(!r.owner)return e.textContent="Enter the owner's name.";
      if(r.phone.length!==10)return e.textContent='Enter a 10-digit mobile number, like 917 123 4567.';
      if(!r.city)return e.textContent='Enter your city or municipality.';
      if(!/^\d{4}$/.test(pin))return e.textContent='Your PIN must be 4 digits.';
      if(pin!==pin2)return e.textContent="The two PINs don't match.";
      r.pin=pin;
    }
    r.step++;render();window.scrollTo(0,0);
  },
  pickMethod:a=>{
    if(S.view==='register'){S.reg.method=a.dataset.m;render()}
    else{S.renewMethod=a.dataset.m;renewModal()}
  },
  regPay:async()=>{
    const r=S.reg,p=PLANS[r.plan];
    if(p.price){
      if(!payValid(r.method)){$('#err').textContent=r.method==='card'?'Enter your card number, expiry and CVC.':'Enter your 10-digit '+METHODS[r.method].name+' number.';return}
      const b=$('#paybtn');b.disabled=true;b.innerHTML='<span class="spinner"></span>Processing payment';
      await new Promise(res=>setTimeout(res,1400));
    }
    const st=createStore({...r,paid:!!p.price});
    r.storeId=st.id;r.step=3;render();
  },
  openStore:a=>openStore(a.dataset.id),
  fillCode:a=>{$('#s-code').value=a.dataset.c;$('#s-pin').focus()},
  signin:()=>{
    const code=val('s-code').toUpperCase().replace(/\s/g,''),pin=val('s-pin');
    const st=S.platform.stores.find(s=>s.code===code||s.code.replace('-','')===code);
    if(!st)return $('#err').textContent='No store has that code. Check it and try again.';
    if(st.pin!==pin)return $('#err').textContent='That PIN is incorrect.';
    openStore(st.id);
  },
  demo:async()=>{const ex=S.platform.stores.find(x=>x.demo||(x.name==='Tindahan ni Aling Nena'&&x.pin==='1234'));if(ex){await openStore(ex.id);toast(`Demo store opened. Code ${ex.code}, PIN 1234.`);return}const st=await makeDemo();await openStore(st.id);toast(`Demo store created. Code ${st.code}, PIN 1234.`)},
  signout:()=>{const wasAdmin=S.session&&S.session.admin;setSession(null);S.view='landing';if(wasAdmin){openAdmin();return}render();window.scrollTo(0,0)},
  backAdmin:()=>openAdmin(),
  tab:a=>{S.tab=a.dataset.t;S.cartOpen=false;render();window.scrollTo(0,0)},
  cat:a=>{S.cat=a.dataset.c;$('#chips').innerHTML=chipsHtml();$('#grid').innerHTML=gridHtml()},
  add:a=>addToCart(a.dataset.id,1),
  inc:a=>addToCart(a.dataset.id,1),
  dec:a=>addToCart(a.dataset.id,-1),
  rm:a=>{S.cart=S.cart.filter(x=>x.id!==a.dataset.id);if(!S.cart.length){S.cartOpen=false;S.cash=''}refreshSell()},
  clearCart:()=>{S.cart=[];S.cash='';S.cartOpen=false;refreshSell()},
  cartOpen:()=>{S.cartOpen=true;refreshSell()},
  cartClose:()=>{S.cartOpen=false;refreshSell()},
  cashSet:a=>{S.cash=String(a.dataset.v);$('#cartf').innerHTML=cartFootHtml()},
  checkout,
  addProduct:()=>productForm(null),
  editProduct:a=>productForm(data().products.find(p=>p.id===a.dataset.id)),
  saveProduct:a=>saveProduct(a.dataset.id),
  delProduct:a=>{
    const d=data(),p=d.products.find(x=>x.id===a.dataset.id);
    if(a.dataset.confirm!=='1'){a.dataset.confirm='1';a.innerHTML=ico('trash',18)+'Tap again to delete';return}
    if(p.hasImg){P.save('img_'+p.id,{d:''});delete S.imgs[p.id]}d.products=d.products.filter(x=>x.id!==p.id);S.cart=S.cart.filter(x=>x.id!==p.id);saveStore(S.session.storeId);closeModal();rerenderTab();toast(`${p.name} deleted.`);
  },
  sample:()=>{const d=data();const have=new Set(d.products.map(p=>p.name.toLowerCase()));const add=sampleProducts().filter(p=>!have.has(p.name.toLowerCase()));if(!add.length){toast('You already have all the common items.');return}applySampleImgs(add);d.products=d.products.concat(add);saveStore(S.session.storeId);render();toast(`Added ${add.length} common item${add.length===1?'':'s'}. Edit prices and stock to match your store.`)},
  invF:a=>{S.invF=a.dataset.f;rerenderTab()},
  quickRestock:a=>{S.tab='restock';rsAdd(a.dataset.id);render()},
  rsLow:()=>{data().products.filter(p=>p.stock<=p.low).forEach(p=>rsAdd(p.id));S.rs.supplier=val('rs-sup');rerenderTab()},
  restockLow:()=>{S.tab='restock';data().products.filter(p=>p.stock<=p.low).forEach(p=>rsAdd(p.id));render()},
  rsRm:a=>{S.rs.supplier=val('rs-sup');S.rs.items.splice(+a.dataset.i,1);rerenderTab()},
  saveRestock,
  viewRestock:a=>{const r=data().restocks.find(x=>x.id===a.dataset.id);openModal(`<h3>${esc(r.supplier||'Restock')}</h3><p class="sub num">${fmtDT(r.ts)}</p><div class="summary">${r.items.map(i=>`<div class="rline"><span>${esc(i.name)} <span style="color:var(--ink-3)">×${i.qty}</span></span><span>${i.cost?peso(i.cost*i.qty):'—'}</span></div>`).join('')}<div class="rsep"></div><div class="rline rtotal"><span>Total</span><span>${peso(r.total)}</span></div></div>`)},
  viewSale:a=>{const s=data().sales.find(x=>x.id===a.dataset.id);openModal(`<h3>Sale</h3><p class="sub num">${fmtDT(s.ts)}</p><div class="summary">${s.items.map(i=>`<div class="rline"><span>${esc(i.name)} <span style="color:var(--ink-3)">×${i.qty}</span></span><span>${peso(i.qty*i.price)}</span></div>`).join('')}<div class="rsep"></div><div class="rline rtotal"><span>Total</span><span>${peso(s.total)}</span></div><div class="rline"><span>Cash</span><span>${peso(s.cash)}</span></div><div class="rline"><span>Sukli</span><span>${peso(s.change)}</span></div></div>`)},
  saveDetails:()=>{
    const st=store();const name=val('e-name');if(!name)return toast('Enter a store name.');
    Object.assign(st,{name,owner:val('e-owner'),phone:val('e-phone').replace(/\D/g,'').replace(/^0/,''),brgy:val('e-brgy'),city:val('e-city')});savePlatform();render();toast('Store details saved.');
  },
  savePin:()=>{
    const a=val('n-pin'),b=val('n-pin2'),e=$('#pinerr');
    if(!/^\d{4}$/.test(a))return e.textContent='Your PIN must be 4 digits.';
    if(a!==b)return e.textContent="The two PINs don't match.";
    store().pin=a;savePlatform();$('#n-pin').value='';$('#n-pin2').value='';e.textContent='';toast('PIN changed.');
  },
  renew:()=>{S.renewPlan='monthly';S.renewMethod='gcash';renewModal()},
  renewPlan:a=>{S.renewPlan=a.dataset.p;renewModal(a.dataset.store||undefined)},
  renewPay:async a=>{
    const adminId=a.dataset.store;
    if(adminId){const st=findStore(adminId);applyPayment(st,S.renewPlan||'monthly',val('a-method'));closeModal();render();toast(`${st.name} extended to ${fmtDate(st.expires)}.`);return}
    const m=S.renewMethod||'gcash';
    if(!payValid(m)){$('#err').textContent=m==='card'?'Enter your card number, expiry and CVC.':'Enter your 10-digit '+METHODS[m].name+' number.';return}
    const b=$('#paybtn');b.disabled=true;b.innerHTML='<span class="spinner"></span>Processing payment';
    await new Promise(res=>setTimeout(res,1400));
    const st=store();applyPayment(st,S.renewPlan||'monthly',m);closeModal();
    S.view=['expired','suspended'].includes(storeState(st))?'blocked':'store';if(S.view==='store'&&S.tab!=='settings')S.tab='settings';
    render();toast(`Payment received. Your plan runs until ${fmtDate(st.expires)}.`);
  },
  adminLogin:()=>{
    const pin=val('a-pin'),e=$('#err');
    if(!S.platform.adminPin){
      if(!/^\d{4}$/.test(pin))return e.textContent='The PIN must be 4 digits.';
      if(pin!==val('a-pin2'))return e.textContent="The two PINs don't match.";
      S.platform.adminPin=pin;savePlatform();
    }else if(pin!==S.platform.adminPin)return e.textContent='That PIN is incorrect.';
    openAdmin();
  },
  adPage:a=>{S.adPage=+a.dataset.p;$('#adtable').innerHTML=adminTable();const t=$('#adtable');if(t&&t.getBoundingClientRect().top<0)t.scrollIntoView({block:'start',behavior:'smooth'})},
  removeSamples:()=>{const n=removeSampleStores();S.adPage=1;render();toast(`Removed ${n} sample stores.`)},
  adF:a=>{S.adF=a.dataset.f;S.adPage=1;document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.f===S.adF));$('#adtable').innerHTML=adminTable()},
  adminAdd:adminAddModal,
  adminCreate:()=>{
    const e=$('#nerr');const o={name:val('n-name'),owner:val('n-owner'),phone:val('n-phone').replace(/\D/g,'').replace(/^0/,''),brgy:val('n-brgy'),city:val('n-city'),plan:val('n-plan'),method:val('n-method')};
    if(!o.name)return e.textContent='Enter the store name.';
    if(!o.owner)return e.textContent="Enter the owner's name.";
    if(o.phone.length!==10)return e.textContent='Enter a 10-digit mobile number.';
    o.pin=newPin();o.paid=true;
    const st=createStore(o);render();
    openModal(`<div class="donebig"><div class="ring">${ico('check',30)}</div><h3>${esc(st.name)} is on Kahera</h3><p class="sub">Send these to ${esc(st.owner)} so they can sign in.</p></div>
    <div class="codebox" style="margin-top:0"><div class="label">Store code</div><div class="code">${st.code}</div><div class="label">PIN <b class="num" style="font-size:22px;letter-spacing:.2em;margin-left:6px">${st.pin}</b></div></div>
    <button class="btn primary lg block" data-act="closeModal">Done</button>`);
  },
  adminManage:a=>adminManage(a.dataset.id),
  adminDelete:a=>{const st=findStore(a.dataset.id);if(!st)return;if(a.dataset.confirm!=='1'){a.dataset.confirm='1';a.innerHTML=ico('trash',16)+(S.lang==='tl'?'Pindutin ulit para burahin ang tindahan':'Tap again to delete this store');return}
    S.platform.stores=S.platform.stores.filter(x=>x.id!==st.id);savePlatform();P.save('s_'+st.id,{products:[],sales:[],restocks:[],daily:{}});P.save('av_'+st.id,{d:''});delete S.data[st.id];closeModal();render();toast(`${st.name} deleted.`)},
  adminPay:a=>{S.renewPlan='monthly';renewModal(a.dataset.id)},
  adminOpen:a=>openStore(a.dataset.id,true),
  adminPin:a=>{const s=findStore(a.dataset.id);s.pin=newPin();savePlatform();openModal(`<h3>New PIN for ${esc(s.name)}</h3><p class="sub">Give this PIN to ${esc(s.owner)}. The old PIN no longer works.</p><div class="codebox"><div class="label">PIN</div><div class="code">${s.pin}</div></div><button class="btn primary lg block" data-act="closeModal">Done</button>`)},
  adminSuspend:a=>{const s=findStore(a.dataset.id);s.status=s.status==='suspended'?'active':'suspended';savePlatform();closeModal();render();toast(s.status==='suspended'?`${s.name} is paused.`:`${s.name} is back on.`)}
};

document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  const fn=A[a.dataset.act];if(fn){e.preventDefault();fn(a,e)}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='q'){S.q=t.value;$('#grid').innerHTML=gridHtml()}
  else if(t.id==='cash'){S.cash=t.value;const f=$('#cartf');const pos=t.selectionStart;f.innerHTML=cartFootHtml();const n=$('#cash');n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}
  else if(t.id==='invq'){S.invQ=t.value;$('#invtable').innerHTML=invTable()}
  else if(t.id==='adq'){S.adQ=t.value;S.adPage=1;$('#adtable').innerHTML=adminTable()}
  else if(t.dataset.rs!=null){S.rs.items[+t.dataset.rs][t.dataset.f]=t.value;const tot=$('#rstotal');if(tot)tot.textContent=peso(S.rs.items.reduce((a,i)=>a+num(i.qty)*num(i.cost),0))}
  else if(t.id==='rs-sup'){S.rs.supplier=t.value}
  else if((t.id==='f-name'||t.id==='f-owner')&&S.view==='register'&&!S.reg.av){clearTimeout(S.avT);S.avT=setTimeout(refreshAvPanel,220)}
  else if(t.id==='p-name'&&S.pf&&!S.pf.img){clearTimeout(S.nmT);S.nmT=setTimeout(refreshPh,220)}
  else if(t.id==='p-cat'&&S.pf){S.pf.cat=t.value;if(!S.pf.img)refreshPh();const cp=$('#catpick');if(cp)cp.innerHTML=catPickHtml(t.value)}
});
document.addEventListener('animationend',e=>{
  if(e.animationName==='wfill'&&S.view==='landing'&&!document.hidden){S.why=((S.why||0)+1)%3;const w=document.querySelector('#why .wrap');if(w){w.innerHTML=whyHtml();initParallax()}}
});
document.addEventListener('change',async e=>{
  if((e.target.id==='av-cam'||e.target.id==='av-lib')&&e.target.files&&e.target.files[0]){
    const box=$('#avbox');if(box)box.innerHTML='<span class="phdef"><span class="spinner"></span></span>';
    let d=null;try{d=await fileToThumb(e.target.files[0],240)}catch(err){toast("That photo couldn't be used. Try another one.")}
    e.target.value='';
    if(S.view==='register'){if(d)S.reg.av=d;refreshAvPanel();return}
    const st=store();if(st&&d){S.avs[st.id]=d;st.hasAv=true;P.save('av_'+st.id,{d});savePlatform();toast('Photo saved.')}
    render();return;
  }
  if((e.target.id==='ph-cam'||e.target.id==='ph-lib')&&e.target.files&&e.target.files[0]){
    const box=$('#phbox');if(box)box.innerHTML='<span class="phdef"><span class="spinner"></span></span>';
    try{const d=await fileToThumb(e.target.files[0]);if(S.pf){S.pf.img=d;S.pf.changed=true;S.pf.off=false}}catch(err){toast("That photo couldn't be used. Try another one.")}
    e.target.value='';refreshPh();return;
  }
  if(e.target.id==='rs-pick'&&e.target.value){S.rs.supplier=val('rs-sup');rsAdd(e.target.value);rerenderTab()}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&$('#modal').classList.contains('open'))closeModal();
  if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){const f=$('#q')||$('#invq')||$('#adq');if(f){e.preventDefault();f.focus()}}
  if(e.key==='Enter'&&e.target.tagName==='INPUT'){
    if(e.target.id==='q'){const first=$('#grid .tile');if(first&&!first.classList.contains('out')){addToCart(first.dataset.id,1);S.q='';e.target.value='';$('#grid').innerHTML=gridHtml()}return}
    if(e.target.id==='cash'){const b=$('[data-act="checkout"]');if(b&&!b.disabled)checkout();return}
    const w=e.target.closest('[data-enter]');if(w&&A[w.dataset.enter]){e.preventDefault();const btn=w.querySelector(`[data-act="${w.dataset.enter}"]`)||document.querySelector(`[data-act="${w.dataset.enter}"]`);A[w.dataset.enter](btn||w,e)}
  }
});

/* ===== Tagalog (Filipino) interface ===== */
const TL={
"(optional)":"(opsyonal)",
", less than a sachet of 3-in-1.":", mas mura pa sa isang sachet ng 3-in-1.",
"/month":"/buwan","/year":"/taon",
"About 10 minutes":"Mga 10 minuto","About 2 minutes":"Mga 2 minuto",
"Access until":"May access hanggang","Account":"Account","Actions":"Aksyon","Active":"Aktibo","Active until":"Aktibo hanggang",
"Add a product":"Magdagdag ng paninda","Add a store":"Magdagdag ng tindahan","Add common items":"Idagdag ang karaniwang paninda","Add item":"Magdagdag","Add one":"Dagdagan ng isa",
"Add product":"Magdagdag ng paninda","Add something you sell.":"Magdagdag ng paninda mo.","Add store":"Magdagdag ng tindahan",
"Add the products you sell with their prices and current stock. You can also start with a list of common sari-sari items and edit from there.":"Ilagay ang mga paninda mo kasama ang presyo at stock. Puwede ka ring magsimula sa listahan ng karaniwang paninda sa sari-sari store at baguhin na lang.",
"Add your paninda":"Ilagay ang paninda mo","Add your paninda to start selling":"Ilagay ang paninda mo para makapagbenta",
"Admin":"Admin","All":"Lahat","All features included":"Kasama lahat ng feature","All stocked up":"Kumpleto ang stock","All features":"Lahat ng feature",
"Amount":"Halaga","Amount due today":"Babayaran ngayon","Any phone":"Kahit anong phone","Applied to every sale":"Sinusunod sa bawat benta",
"Auto":"Auto","Auto-generated picture":"Kusang ginawang larawan","Average sale":"Karaniwang benta","Back":"Bumalik","Bank transfer":"Bank transfer","Barangay":"Barangay",
"Benta":"Benta","Best day":"Pinakamabentang araw","Best month":"Pinakamabentang buwan","Best seller":"Pinakamabenta","Best sellers, 30 days":"Pinakamabenta, 30 araw",
"Billed every 30 days":"Sinisingil kada 30 araw","Billed every 30 days. Cancel any time. That's around":"Sinisingil kada 30 araw. Puwedeng ihinto anumang oras. Iyan ay mga",
"Billing period":"Panahon ng singil",
"Can I switch between Monthly and Yearly?":"Puwede ba akong lumipat sa Buwanan o Taunan?","Cancel":"Kanselahin","Cancel any time":"Puwedeng ihinto anumang oras",
"Card":"Card","Card number":"Numero ng card","Cash":"Cash","Cash and GCash":"Cash at GCash","Cash received":"Ibinayad na cash","Category":"Kategorya","Category icon":"Icon ng kategorya",
"Change PIN":"Palitan ang PIN","Charge":"Singilin","Choose":"Pumili","Choose a plan":"Pumili ng plano","Choose a product…":"Pumili ng paninda…","Choose how you'd like to pay.":"Piliin kung paano ka magbabayad.",
"City or municipality":"Lungsod o bayan","Clear":"Burahin","Close":"Isara","Complete sale":"Tapusin ang benta","Confirm":"Kumpirmahin","Continue":"Magpatuloy",
"Cost":"Puhunan","Cost each":"Puhunan bawat isa","Counting sukli…":"Binibilang ang sukli…","Create PIN and continue":"Gumawa ng PIN at magpatuloy","Create a 4-digit PIN":"Gumawa ng 4-digit na PIN",
"Create a 4-digit admin PIN. You'll use it to manage every store on Kahera.":"Gumawa ng 4-digit na admin PIN. Gagamitin mo ito sa pamamahala ng lahat ng tindahan sa Kahera.",
"Enter the admin PIN to manage stores.":"Ilagay ang admin PIN para mapamahalaan ang mga tindahan.","Admin PIN":"Admin PIN","Enter it again":"Ulitin ito",
"Current sale":"Kasalukuyang benta","Customers":"Mamimili","Customers today":"Mamimili ngayon","Daily sales and profit reports":"Araw-araw na ulat ng benta at kita","Daily summary":"Buod ng araw",
"Dashboard":"Dashboard","Day":"Araw","Delete":"Burahin","Deliveries":"Mga delivery","Delivery":"Delivery","Delivery and restock records":"Talaan ng delivery at restock","Delivery saved":"Naitala ang delivery",
"Delivery total":"Kabuuang delivery","Do I need special hardware?":"Kailangan ko ba ng espesyal na gamit?","Done":"Tapos na","Edit product":"I-edit ang paninda",
"Ending within 7 days":"Matatapos sa loob ng 7 araw","Ends":"Matatapos","Enter a selling price.":"Ilagay ang presyo ng benta.","Enter the PIN again":"Ulitin ang PIN",
"Enter the store name.":"Ilagay ang pangalan ng tindahan.","Enter your card number, expiry and CVC.":"Ilagay ang numero ng card, expiry at CVC.","Enter your store code and PIN.":"Ilagay ang store code at PIN mo.",
"Enter your store name.":"Ilagay ang pangalan ng tindahan mo.","Enter a product name.":"Ilagay ang pangalan ng paninda.","Enter a 10-digit mobile number, like 917 123 4567.":"Ilagay ang 10-digit na mobile number, tulad ng 917 123 4567.",
"Enter a 10-digit mobile number.":"Ilagay ang 10-digit na mobile number.","Enter the owner's name.":"Ilagay ang pangalan ng may-ari.","Enter your city or municipality.":"Ilagay ang lungsod o bayan mo.",
"That PIN is incorrect.":"Mali ang PIN.","The PIN must be 4 digits.":"Dapat 4 na digit ang PIN.","Your PIN must be 4 digits.":"Dapat 4 na digit ang PIN mo.","The two PINs don't match.":"Hindi magkapareho ang dalawang PIN.",
"No store has that code. Check it and try again.":"Walang tindahang may ganyang code. Suriin at subukan ulit.",
"Est. profit":"Tantyang kita","Est. profit today":"Tantyang kita ngayon","Every day":"Araw-araw",
"Every sale updates your stock. When something runs low, Kahera flags it so your palengke list is ready.":"Bawat benta ay nagbabawas sa stock mo. Kapag paubos na ang isang paninda, sasabihan ka ng Kahera para handa na ang listahan mo sa palengke.",
"Every store registered on Kahera, their plans and payments.":"Lahat ng tindahang naka-rehistro sa Kahera, ang kanilang plano at bayad.","Everything in Monthly":"Lahat ng nasa Buwanan","Everything in the free trial":"Lahat ng nasa libreng trial",
"Everything on your shelves, with prices and stock.":"Lahat ng nasa estante mo, kasama ang presyo at stock.","Exact":"Eksakto","Expiry":"Expiry","Flag as low stock at this count.":"Markahang paubos kapag umabot sa bilang na ito.",
"Flag items running out":"Markahan ang paubos na paninda","Flagged from today's sales":"Ayon sa benta ngayong araw","Free":"Libre","Free trial":"Libreng trial","Full name":"Buong pangalan",
"GCash":"GCash","GCash number":"GCash number","Home":"Home","How customers usually pay":"Paano karaniwang nagbabayad ang mamimili","How it works":"Paano ito gumagana",
"How your store is doing today, this month and this year.":"Kumusta ang tindahan mo ngayong araw, ngayong buwan at ngayong taon.","Ignored for free trials.":"Hindi kailangan sa libreng trial.",
"Included in every plan":"Kasama sa bawat plano","Inventory":"Imbentaryo","Items on hand":"Hawak na stock","Keep all your sales history":"Itago ang lahat ng kasaysayan ng benta",
"Know what to buy before it runs out.":"Alamin kung ano ang bibilhin bago maubos.","Kulang pa":"Kulang pa","Less":"Mas kaunti","Location":"Lokasyon",
"Low items are flagged as you sell, so your palengke list writes itself.":"Minamarkahan ang paubos habang nagbebenta ka, kaya kusang nabubuo ang listahan mo sa palengke.",
"Low or out of stock":"Paubos o ubos na","Low stock":"Paubos","Low stock alert":"Babala: paubos","Low-stock warning":"Babala sa paubos","Low-stock warnings":"Babala sa paubos na paninda",
"MM/YY":"MM/YY","Made from the name and category. Take a real photo any time.":"Ginawa mula sa pangalan at kategorya. Puwede kang kumuha ng totoong litrato anumang oras.",
"Manage":"Pamahalaan","Maya":"Maya","Mobile":"Mobile","Mobile number":"Mobile number","Month":"Buwan","Month total":"Kabuuan ng buwan","Monthly":"Buwanan","Monthly plan":"Buwanang plano",
"More":"Mas marami","Most stores pick this":"Ito ang pinipili ng karamihan","Needs attention":"Kailangang asikasuhin","Needs restocking":"Kailangang i-restock","New PIN":"Bagong PIN",
"New admin PIN":"Bagong admin PIN","New delivery":"Bagong delivery","New end date":"Bagong petsa ng pagtatapos","New look":"Ibang itsura","New sale":"Bagong benta","New to Kahera?":"Bago sa Kahera?",
"Next":"Susunod","Next customer":"Susunod na suki","No deliveries yet. Saved deliveries appear here.":"Wala pang delivery. Lalabas dito ang mga naitalang delivery.","No payment needed":"Walang kailangang bayaran",
"No products here.":"Walang paninda rito.","No sales":"Walang benta","No sales yet today. Your first suki is on the way.":"Wala pang benta ngayon. Parating na ang una mong suki.",
"No sales yet. Head to Sell to make your first one.":"Wala pang benta. Pumunta sa Benta para sa una mong benta.","No stores match.":"Walang tugmang tindahan.",
"No. Kahera runs in the browser of any phone, tablet or computer you already have.":"Hindi. Gumagana ang Kahera sa browser ng kahit anong phone, tablet o computer na meron ka na.",
"Nothing is running low right now.":"Walang paubos sa ngayon.","On free trial":"Naka-libreng trial","One simple price":"Isang simpleng presyo","Open my store":"Buksan ang tindahan ko","Open store":"Buksan ang tindahan",
"Optional. Add a photo of yourself so your store card feels like yours.":"Opsyonal. Maglagay ng litrato mo para mas personal ang store card mo.","Out of stock":"Ubos na","Owner":"May-ari","Owner photo":"Litrato ng may-ari",
"Owner's name":"Pangalan ng may-ari","PIN":"PIN","Paid through":"Binayaran sa","Palengke list ready":"Handa na ang listahan sa palengke","Paninda added":"Naidagdag ang paninda","Para sa tindahan":"Para sa tindahan",
"Pause store":"I-pause ang tindahan","Turn store back on":"Buksan muli ang tindahan","Pay for your plan":"Bayaran ang plano mo","Pay once a year":"Isang bayad kada taon","Pay with your GCash number":"Magbayad gamit ang GCash number mo","Pay with your Maya wallet":"Magbayad gamit ang Maya wallet mo",
"Paying":"Nagbabayad","Paying stores":"Nagbabayad na tindahan","Payment":"Bayad","Payment method":"Paraan ng pagbayad","Payments collected":"Nakolektang bayad","Performance":"Takbo ng negosyo",
"Pick a plan, add your store details and get a store code with your own PIN.":"Pumili ng plano, ilagay ang detalye ng tindahan, at kumuha ng store code na may sarili mong PIN.",
"Pick the products that arrived. Quantities are added to your stock when you save.":"Piliin ang mga dumating na paninda. Madadagdag sa stock ang dami kapag nag-save ka.","Plan":"Plano","Plan ends":"Matatapos ang plano",
"Platform admin":"Admin ng platform","Portraits are AI-generated faces from the SFHQ dataset.":"Ang mga mukha ay gawa ng AI mula sa SFHQ dataset.","Previous":"Nakaraan","Price":"Presyo","Pricing":"Presyo",
"Priority help when you need it":"Unang tulong kapag kailangan mo","Priority support":"Unang suporta","Product":"Paninda","Product and owner photos":"Litrato ng paninda at may-ari","Product name":"Pangalan ng paninda",
"Product photo":"Litrato ng paninda","Products":"Paninda","Qty":"Dami","Quantity":"Dami","Ready before your first":"Handa bago dumating ang una mong","Receipts":"Mga resibo","Recent deliveries":"Mga huling delivery",
"Recent sales":"Mga huling benta","Record deliveries and new stock.":"Itala ang mga delivery at bagong stock.","Record payment":"Itala ang bayad","Record payment and extend":"Itala ang bayad at i-extend",
"Register a store on behalf of an owner, for example after they pay you directly.":"Mag-rehistro ng tindahan para sa may-ari, halimbawa kapag direkta silang nagbayad sa iyo.","Register store":"Mag-rehistro",
"Register your store":"I-rehistro ang tindahan mo","Registered":"Naka-rehistro","Remove":"Alisin","Remove one":"Bawasan ng isa","Remove photo":"Alisin ang litrato","Renew or change plan":"I-renew o palitan ang plano",
"Renew plan":"I-renew ang plano","Reports":"Ulat","Reset PIN":"I-reset ang PIN","Restock":"Restock","Restock before it runs out":"Mag-restock bago maubos","Restock these":"I-restock ang mga ito",
"Sale":"Benta","Sale complete":"Tapos ang benta","Sale recorded":"Naitala ang benta","Sales":"Benta","Sales and profit at closing":"Benta at kita pagsara ng tindahan","Sales by hour":"Benta kada oras",
"Sales today":"Benta ngayon","Sales trend":"Takbo ng benta","Sales you make will show up here.":"Lalabas dito ang mga benta mo.","Sales, 30 days":"Benta, 30 araw",
"Sales, estimated profit and best sellers, worked out from every sale you ring up.":"Benta, tantyang kita at pinakamabenta, mula sa bawat benta mo.","Sales, restock and reports":"Benta, restock at ulat",
"Save changes":"I-save","Save delivery":"I-save ang delivery","Save details":"I-save ang detalye","Search products":"Maghanap ng paninda","Search store, owner, code or city":"Maghanap ng tindahan, may-ari, code o lungsod",
"Search stores":"Maghanap ng tindahan","See your day, and your week.":"Tingnan ang benta mo sa araw at linggo.","Sell":"Benta","Sell and restock":"Magbenta at mag-restock","Sell at the counter":"Magbenta sa tindahan",
"Selling price":"Presyo ng benta","Set it once.":"Isang beses lang i-set.","Set them once. Kahera handles the rest.":"Isang beses mo lang i-set. Ang Kahera na ang bahala.","Set your rules once":"I-set ang mga patakaran mo",
"Settings":"Settings","Shown on your store card so staff and Kahera support know who they're helping.":"Makikita sa store card mo para kilala ka ng mga katuwang at ng Kahera support.","Sign in":"Mag-sign in",
"Sign in to your store":"Mag-sign in sa tindahan mo","Sign in with this code and your 4-digit PIN.":"Mag-sign in gamit ang code na ito at ang 4-digit na PIN mo.","Sign out":"Mag-sign out","Sold per":"Benta kada",
"Start free for 14 days":"Libre sa unang 14 na araw","Start free for 14 days. No payment needed until you're sure.":"Libre sa unang 14 na araw. Walang bayad hangga't hindi ka sigurado.","Start free trial":"Simulan ang libreng trial",
"Start from a list of common sari-sari items, snap a photo, then set your own prices and stock.":"Magsimula sa listahan ng karaniwang paninda, kumuha ng litrato, at ilagay ang sarili mong presyo at stock.",
"Status":"Status","Stock":"Stock","Stock on hand":"Hawak na stock","Stock value at cost":"Halaga ng stock sa puhunan","Store":"Tindahan","Store code":"Store code","Store details":"Detalye ng tindahan",
"Store details, plan and PIN.":"Detalye ng tindahan, plano at PIN.","Store hours":"Oras ng tindahan","Store hours, low-stock warnings and how you take payment. Kahera applies them every time you sell or restock.":"Oras ng tindahan, babala sa paubos at paraan ng bayad. Sinusunod ito ng Kahera tuwing nagbebenta o nagre-restock ka.",
"Store name":"Pangalan ng tindahan","Store ready":"Handa na ang tindahan","Stores":"Mga tindahan","Kahera Store":"Kahera Store",
"Kahera keeps track of every sale, every sukli and every restock, so your sari-sari store runs itself while you serve your suki.":"Binabantayan ng Kahera ang bawat benta, sukli at restock, para tuloy-tuloy ang takbo ng sari-sari store mo habang inaasikaso mo ang mga suki.",
"Kahera remembers the rest.":"Ang Kahera na ang tatanda sa iba.","Sukli":"Sukli","Sukli shown instantly":"Agad makikita ang sukli","Supplier":"Supplier","Switch to dark mode":"Lumipat sa dark mode","Switch to light mode":"Lumipat sa light mode",
"Take photo":"Kumuha ng litrato","Tap a product to add it to the sale.":"Pindutin ang paninda para idagdag sa benta.","Tap again to delete":"Pindutin ulit para burahin","Tap products to add them to the sale.":"Pindutin ang mga paninda para idagdag sa benta.",
"Tap to sell, see the sukli right away, and record deliveries when your supplier comes.":"Pindutin para magbenta, makita agad ang sukli, at itala ang delivery pagdating ng supplier.",
"Tap what the customer bought and enter their cash. The sukli shows right away and stock updates on its own.":"Pindutin ang binili ng mamimili at ilagay ang cash nila. Agad lalabas ang sukli at kusang mababawasan ang stock.",
"Tell us about your store":"Ikuwento ang tindahan mo","This is what appears on your sales screen and receipts.":"Ito ang lalabas sa benta at mga resibo mo.","This month":"Ngayong buwan",
"This prototype simulates payment. No money is charged.":"Kunwaring bayad lang ito sa prototype. Walang perang sisingilin.",
"Three steps from sign-up to your first sale. No training, no hardware to buy. Any phone or tablet will do.":"Tatlong hakbang mula pag-sign up hanggang sa unang benta. Walang training, walang gamit na bibilhin. Puwede ang kahit anong phone o tablet.",
"Today":"Ngayon","Total":"Kabuuan","Total paid":"Kabuuang bayad","Trial":"Trial","Try a demo":"Subukan ang demo","Try a demo store":"Subukan ang demo",
"Try every feature with your real paninda. No card, no GCash, no commitment.":"Subukan ang lahat ng feature gamit ang totoong paninda mo. Walang card, walang GCash, walang obligasyon.",
"Two months free":"Libre ang dalawang buwan","Type the product name and a picture is drawn for you.":"I-type ang pangalan ng paninda at gagawan ka ng larawan.","Unlimited products":"Walang limitasyon sa paninda",
"Unlimited sales and products":"Walang limitasyon sa benta at paninda","Update the details of this product.":"Baguhin ang detalye ng paninda.","Upgrade any time":"Puwedeng mag-upgrade anumang oras","Upgrade to a paid plan":"Lumipat sa bayad na plano",
"Use auto picture":"Gamitin ang auto na larawan","Use common sari-sari items":"Gamitin ang karaniwang paninda","Use icon":"Gamitin ang icon","Using the simple category icon instead of a picture.":"Simpleng icon ng kategorya ang gamit sa halip na larawan.",
"Visa or Mastercard":"Visa o Mastercard","Warn me at":"Babalaan ako sa","What happens after the free trial?":"Ano ang mangyayari pagkatapos ng libreng trial?","When you are open":"Kung kailan bukas ang tindahan",
"Why Kahera":"Bakit Kahera","Write the code down or take a screenshot. Anyone who will use the store's device needs it.":"Isulat ang code o kumuha ng screenshot. Kailangan ito ng sinumang gagamit ng device ng tindahan.",
"Year":"Taon","Year total":"Kabuuan ng taon","Yearly":"Taunan","Yes. Go to Settings, then Renew or change plan, and pick the one that suits your store.":"Oo. Pumunta sa Settings, tapos I-renew o palitan ang plano, at piliin ang bagay sa tindahan mo.",
"You can change your plan later from your store settings.":"Puwede mong palitan ang plano mamaya sa settings ng tindahan.","You'll use this to sign in to your store.":"Gagamitin mo ito sa pag-sign in sa tindahan mo.",
"You've made":"Kumita ka na ng","Your cost":"Puhunan mo","Your next sale is":"Ang susunod mong benta,","Your own photo is shown on the Sell screen.":"Litrato mo mismo ang makikita sa Benta.","Your own store code and PIN":"Sariling store code at PIN",
"Your plan":"Plano mo","Your products and sales stay saved. Pick Monthly or Yearly to keep selling, whenever you are ready.":"Naka-save pa rin ang paninda at benta mo. Pumili ng Buwanan o Taunan para makapagbenta ulit, kapag handa ka na.",
"Your store code":"Store code mo","Your store is ready":"Handa na ang tindahan mo","Your store rules":"Mga patakaran ng tindahan mo","already counted.":"bilang na agad.",
"customer of the day.":"suki ng araw.","e.g. Candy":"hal. Kendi","e.g. Lucky Me Pancit Canton":"hal. Lucky Me Pancit Canton","e.g. Marikina":"hal. Marikina","e.g. Puregold, palengke, distributor":"hal. Puregold, palengke, distributor",
"e.g. San Roque":"hal. San Roque","e.g. Tindahan ni Aling Nena":"hal. Tindahan ni Aling Nena","extra hardware to buy":"dagdag na gamit na bibilhin","for 14 days":"sa loob ng 14 na araw","free to try everything":"libreng subukan ang lahat",
"from":"mula sa","or tablet you already have":"o tablet na meron ka na","per month":"kada buwan","per store.":"kada tindahan.","per year":"kada taon","so far today.":"ngayong araw.","to ring up a sale":"para makapagbenta","today":"ngayon",
"vs same days last month":"kumpara sa parehong araw noong nakaraang buwan","vs same period last year":"kumpara sa parehong panahon noong nakaraang taon","vs the day before":"kumpara kahapon","vs this time yesterday":"kumpara sa ganitong oras kahapon",
"vs last month":"kumpara sa nakaraang buwan","vs last year":"kumpara sa nakaraang taon","Built for the Filipino tindahan":"Gawa para sa tindahang Pilipino",
"© 2026 Kahera. Made for Filipino small stores.":"© 2026 Kahera. Gawa para sa maliliit na tindahang Pilipino.",
"This store is paused":"Naka-pause ang tindahang ito","Your plan has ended":"Tapos na ang plano mo",
"Cash received is less than the total.":"Kulang ang ibinayad na cash sa kabuuan.","Enter how many arrived for at least one product.":"Ilagay kung ilan ang dumating para sa kahit isang paninda.","PIN changed.":"Napalitan ang PIN.",
"Photo removed.":"Naalis ang litrato.","Photo saved.":"Na-save ang litrato.","Product saved. It is now at the top.":"Na-save ang paninda. Nasa itaas na ito.","Saving on this device only.":"Sa device na ito lang nase-save.",
"Storage is full. Older history may not be saved.":"Puno na ang storage. Maaaring hindi ma-save ang lumang kasaysayan.","Store details saved.":"Na-save ang detalye ng tindahan.","You already have all the common items.":"Nasa iyo na ang lahat ng karaniwang paninda.",
"That photo couldn't be used. Try another one.":"Hindi magamit ang litratong iyan. Subukan ang iba.","Photo":"Litrato","Ready":"Handa",
"Monday":"Lunes","Sun":"Lin","Mon":"Lun","Tue":"Mar","Wed":"Miy","Thu":"Huw","Fri":"Biy","Sat":"Sab",
"January":"Enero","February":"Pebrero","March":"Marso","April":"Abril","May":"Mayo","June":"Hunyo","July":"Hulyo","August":"Agosto","September":"Setyembre","October":"Oktubre","November":"Nobyembre","December":"Disyembre",
"Jan":"Ene","Feb":"Peb","Mar":"Mar","Apr":"Abr","Jun":"Hun","Jul":"Hul","Aug":"Ago","Sep":"Set","Oct":"Okt","Nov":"Nob","Dec":"Dis",
"Noodles":"Pansit","Drinks":"Inumin","Coffee":"Kape","Milk":"Gatas","Snacks":"Sitsirya","Candy":"Kendi","Bread":"Tinapay","Canned":"De-lata","Staples":"Pangunahin","Condiments":"Sawsawan","Frozen":"Malamig","Toiletries":"Panligo","Household":"Panlinis","Others":"Iba pa","Uncategorized":"Walang kategorya",
"pc":"piraso","pack":"pakete","sachet":"sachet","bottle":"bote","can":"lata","cup":"baso","bar":"bareta","kg":"kilo","box":"kahon",
"Out":"Ubos","Sample":"Sample","Remove sample stores":"Alisin ang mga sample na tindahan","Previous page":"Nakaraang pahina","Next page":"Susunod na pahina","Store photo":"Larawan ng tindahan","Your own photo is shown on your store card.":"Litrato mo mismo ang makikita sa store card mo.","Auto-generated store picture":"Kusang ginawang larawan ng tindahan","Made from your store name. Take a photo of your store or yourself any time.":"Ginawa mula sa pangalan ng tindahan mo. Puwede kang kumuha ng litrato ng tindahan o ng sarili mo anumang oras.","Initials":"Inisyal","Showing your initials instead of a picture.":"Inisyal mo ang ipinapakita sa halip na larawan.","Type your store name and a picture is drawn for you.":"I-type ang pangalan ng tindahan at gagawan ka ng larawan.","Use initials":"Gamitin ang inisyal","Change store photo":"Palitan ang larawan ng tindahan","Restock records":"Talaan ng restock","Restock saved":"Na-restock na","Tap to sell, see the sukli right away, and record what you buy at the grocery or palengke.":"Pindutin para magbenta, makita agad ang sukli, at itala ang mga pinamili mo sa grocery o palengke.","Record what you bought to refill your shelves.":"Itala ang mga pinamili mo para mapuno ulit ang estante.","Restocking":"Pagre-restock","Where you bought it":"Saan binili","e.g. Puregold, palengke, grocery":"hal. Puregold, palengke, grocery","New restock":"Bagong restock","Total spent":"Kabuuang gastos","Save restock":"I-save ang restock","Recent restocks":"Mga huling restock","No restocks yet. Saved restocks appear here.":"Wala pang restock. Lalabas dito ang mga naitalang restock.","Pick the products you bought. Quantities are added to your stock when you save.":"Piliin ang mga pinamili mong paninda. Madadagdag sa stock ang dami kapag nag-save ka.","14 days to try everything":"14 araw para subukan ang lahat","2 months free":"Libre ang 2 buwan","3 items, ready to charge":"3 item, handa nang singilin","Delete store":"Burahin ang tindahan","Eggs":"Itlog","Eggs ×4":"Itlog ×4","Language":"Wika","Switch to English":"Switch to English","New":"Bago","Updated":"Binago","Paused":"Naka-pause","Expired":"Expired","Renew soon":"Mag-renew na","Done ":"Tapos na"
};
const TL_MON={January:'Enero',February:'Pebrero',March:'Marso',April:'Abril',May:'Mayo',June:'Hunyo',July:'Hulyo',August:'Agosto',September:'Setyembre',October:'Oktubre',November:'Nobyembre',December:'Disyembre'};
const TL_UNIT={pc:'piraso',pack:'pakete',sachet:'sachet',bottle:'bote',can:'lata',cup:'baso',bar:'bareta',kg:'kilo',box:'kahon'};
const TLP=[
 [/^Add (.+), (₱[\d,.]+)$/,'Idagdag ang $1, $2'],
 [/^Edit (.+)$/,'I-edit ang $1'],
 [/^(.+) \((\d+) left\)$/,'$1 ($2 natitira)'],
 [/^(\d+) left$/,'$1 natitira'],
 [/^Low: (\d+) (\w+) left$/,(m,a,u)=>`Paubos: ${a} ${TL_UNIT[u]||u} natitira`],
 [/^(\d+) (pc|pack|sachet|bottle|can|cup|bar|kg|box) left$/,(m,a,u)=>`${a} ${TL_UNIT[u]} natitira`],
 [/^(\d+) (pc|pack|sachet|bottle|can|cup|bar|kg|box)$/,(m,a,u)=>`${a} ${TL_UNIT[u]}`],
 [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d+): no sales$/,(m,a,b)=>`${TL_MON[a]} ${b}: walang benta`],
 [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d+): (₱[\d,.]+)$/,(m,a,b,c)=>`${TL_MON[a]} ${b}: ${c}`],
 [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,(m,a,b)=>`${TL_MON[a]} ${b}`],
 [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d+)$/,(m,a,b)=>`${TL[a]||a} ${b}`],
 [/^(₱[\d,.]+) each$/,'$1 bawat isa'],
 [/^Showing (\d+)–(\d+) of (\d+) stores$/,'Ipinapakita ang $1–$2 sa $3 na tindahan'],
 [/^Removed (\d+) sample stores\.$/,'Naalis ang $1 sample na tindahan.'],
 [/^Busiest at (\d+) (AM|PM)$/,'Pinakamabenta ng $1 $2'],
 [/^Review sale, (\d+) items?$/,'Tingnan ang benta, $1 item'],
 [/^Charge (₱[\d,.]+)$/,'Singilin $1'],
 [/^Pay (₱[\d,.]+)$/,'Magbayad ng $1'],
 [/^Monthly — (₱[\d,.]+)$/,'Buwanan — $1'],[/^Yearly — (₱[\d,.]+)$/,'Taunan — $1'],[/^Free trial — (₱[\d,.]+)$/,'Libreng trial — $1'],
 [/^Warn at (\d+)$/,'Babala sa $1'],
 [/^Total (₱[\d,.]+), cash (₱[\d,.]+)$/,'Kabuuan $1, cash $2'],
 [/^(\d+) items?$/,'$1 item'],
 [/^(\d+) sold$/,'$1 nabenta'],
 [/^(\d+) customers?$/,'$1 mamimili'],
 [/^(\d+) selling days?$/,'$1 araw na may benta'],
 [/^(\d+) products?$/,'$1 paninda'],
 [/^Just now · (\d+) items?$/,'Ngayon lang · $1 item'],
 [/^(\d+) min ago · (\d+) items?$/,'$1 min ang nakalipas · $2 item'],
 [/^(\d+) hr ago · (\d+) items?$/,'$1 oras ang nakalipas · $2 item'],
 [/^(.+) · (\d+) items?$/,'$1 · $2 item'],
 [/^(.+) \+(\d+) more$/,'$1 +$2 pa'],
 [/^(.+) · (\d+) products?$/,'$1 · $2 paninda'],
 [/^Restock saved\. (\d+) items added to stock\.$/,'Na-save ang restock. $1 item ang naidagdag sa stock.'],
 [/^Demo store created\. Code (\S+), PIN (\d+)\.$/,'Handa na ang demo na tindahan. Code $1, PIN $2.'],
 [/^Demo store opened\. Code (\S+), PIN (\d+)\.$/,'Binuksan ang demo na tindahan. Code $1, PIN $2.'],
 [/^New PIN for (.+)$/,'Bagong PIN para sa $1'],
 [/^Give this PIN to (.+)\. The old PIN no longer works\.$/,'Ibigay ang PIN na ito kay $1. Hindi na gagana ang lumang PIN.'],
 [/^Sales for the last (\d+) days$/,'Benta sa nakaraang $1 araw'],
 [/^vs previous (\d+) days$/,'kumpara sa nakaraang $1 araw'],
 [/^Works out to about (₱[\d,.]+) a month\. That's around$/,'Mga $1 kada buwan. Iyan ay mga'],
 [/^(₱[\d,.]+) a day$/,'$1 kada araw'],
 [/^(.+) added at the top\.$/,'Naidagdag ang $1 sa itaas.'],
 [/^(.+) deleted\.$/,'Nabura ang $1.'],
 [/^(.+) is out of stock\. Restock it first\.$/,'Ubos na ang $1. Mag-restock muna.'],
 [/^Only (\d+) (\w+) of (.+) left\.$/,(m,a,u,n)=>`${a} ${TL_UNIT[u]||u} na lang ang natitirang ${n}.`],
 [/^(.+) is paused\.$/,'Naka-pause ang $1.'],[/^(.+) is back on\.$/,'Bukas na ulit ang $1.'],
 [/^(.+) extended to (.+)\.$/,'Na-extend ang $1 hanggang $2.'],
 [/^Payment received\. Your plan runs until (.+)\.$/,'Natanggap ang bayad. Tatagal ang plano mo hanggang $1.'],
 [/^Added (\d+) common items?\. Edit prices and stock to match your store\.$/,'Naidagdag ang $1 karaniwang paninda. Baguhin ang presyo at stock ayon sa tindahan mo.'],
 [/^Add all (\d+) low-stock items?$/,'Idagdag ang $1 paubos na paninda'],
 [/^(.+) is registered on the (.+) plan\.$/,(m,a,b)=>`Naka-rehistro ang ${a} sa ${({'free trial':'libreng trial','monthly':'buwanang','yearly':'taunang'})[b]||b} plano.`],
 [/^(.+) is on Kahera$/,'Nasa Kahera na ang $1'],
 [/^Send these to (.+) so they can sign in\.$/,'Ipadala ito kay $1 para makapag-sign in siya.'],
 [/^(.+) plan$/,(m,a)=>({'Free trial':'Libreng trial','Monthly':'Buwanang plano','Yearly':'Taunang plano'})[a]||m],
 [/^(.+) was paused by Kahera\. Contact support to turn it back on\. Your products and sales are kept safe\.$/,'Ipinause ng Kahera ang $1. Makipag-ugnayan sa support para mabuksan ulit. Ligtas ang paninda at benta mo.'],
 [/^(.+)'s (.+) plan ended on (.+)\. Renew to keep selling\. Your products and sales are kept safe\.$/,'Natapos ang plano ng $1 noong $3. Mag-renew para makapagbenta ulit. Ligtas ang paninda at benta mo.'],
 [/^Magandang (\w+), (.+)$/,'Magandang $1, $2'],
 [/^(\d+) taps$/,'$1 pindot'],[/^(\d+) days$/,'$1 araw'],
 [/^(\d+) min ago$/,'$1 min ang nakalipas'],[/^(\d+) hr ago$/,'$1 oras ang nakalipas'],[/^Just now$/,'Ngayon lang'],
 [/^(\d+) days? left$/,'$1 araw na lang']
];
function tlStr(t){if(t==null)return null;const k=t.replace(/\s+/g,' ').trim();if(!k)return null;
  if(Object.prototype.hasOwnProperty.call(TL,k))return t.replace(t.trim(),TL[k]);
  for(const [re,rep] of TLP){if(re.test(k)){const out=k.replace(re,rep);return out===k?null:t.replace(t.trim(),out)}}return null}
function tlEl(el){['placeholder','aria-label','title'].forEach(a=>{const v=el.getAttribute&&el.getAttribute(a);if(v){const r=tlStr(v);if(r!==null&&r!==v)el.setAttribute(a,r)}})}
function tlNode(root){if(S.lang!=='tl'||!root)return;
  if(root.nodeType===3){const r=tlStr(root.nodeValue);if(r!==null&&r!==root.nodeValue)root.nodeValue=r;return}
  if(root.nodeType!==1)return;if(root.closest&&root.closest('script,style,[data-notl]'))return;
  tlEl(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;const ts=[];
  while(n=w.nextNode()){if(n.nodeType===1){if(n.matches('script,style'))continue;tlEl(n)}else ts.push(n)}
  ts.forEach(n=>{const p=n.parentElement;if(!p||p.closest('script,style,[data-notl]'))return;const r=tlStr(n.nodeValue);if(r!==null&&r!==n.nodeValue)n.nodeValue=r})}

/* ================= Boot ================= */
addEventListener('pagehide',()=>{Object.keys(P.pending).forEach(k=>{clearTimeout(P.timers[k]);P.flush(k)})});
(async function boot(){const __t0=performance.now();try{
  await P.init();
  S.platform=(await P.get('platform'))||{stores:[],adminPin:null,createdAt:Date.now(),prunedOne:true};
  S.platform.stores=S.platform.stores||[];
  let sess=null;try{sess=JSON.parse(localStorage.getItem('suki:session')||'null')}catch(e){}
  if(!S.platform.prunedOne&&S.platform.stores.length>1){
    const byNew=S.platform.stores.slice().sort((a,b)=>b.createdAt-a.createdAt);const keep=(sess&&sess.storeId&&findStore(sess.storeId))||byNew.find(x=>x.demo||(x.name==='Tindahan ni Aling Nena'&&x.pin==='1234'))||byNew[0];
    S.platform.stores.filter(x=>x.id!==keep.id).forEach(x=>{P.save('s_'+x.id,{products:[],sales:[],restocks:[],daily:{}});P.save('av_'+x.id,{d:''})});
    S.platform.stores=[keep];S.platform.prunedOne=true;savePlatform();
    if(sess&&sess.storeId&&sess.storeId!==keep.id)sess=null;
  }
  document.documentElement.lang=S.lang==='tl'?'fil':'en';
  new MutationObserver(ms=>{if(S.lang!=='tl')return;for(const m of ms){if(m.type==='characterData')tlNode(m.target);else if(m.type==='attributes')tlEl(m.target);else m.addedNodes.forEach(tlNode)}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});
  if(sess&&sess.role==='store'&&findStore(sess.storeId)){await openStore(sess.storeId,sess.admin);return}
  if(sess&&sess.role==='admin'&&S.platform.adminPin){await openAdmin();return}
  render();
}finally{hidePre(__t0);portfolioDeepLink()}
})();
/* portfolio deep links: #landing[/en|tl] or #demo[/tab][/en|tl] (used by the portfolio previews) */
async function portfolioDeepLink(){
  const m=location.hash.match(/^#(demo|landing)(?:\/([a-z]+))?(?:\/(en|tl))?$/);if(!m)return;
  const [,mode,tab,lang]=m.length===4?m:[m[0],m[1],undefined,m[2]];
  try{
    const L=lang||((tab==='en'||tab==='tl')?tab:null);
    if(L&&S.lang!==L){S.lang=L;document.documentElement.lang=S.lang==='tl'?'fil':'en'}
    if(mode==='landing'){S.view='landing';render();return}
    await A.demo();
    if(tab&&TABS.some(t=>t[0]===tab))S.tab=tab;
    render();
    const t=document.getElementById('toast');if(t)t.classList.remove('show');
  }catch(e){}
}
})();
