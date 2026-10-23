(() => {
  'use strict';
  const STORE = 'pamyat-doma-mvp-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const assets = './assets/';
  const categories = ['Бытовая техника', 'Мебель', 'Электроника', 'Сантехника', 'Климатическая техника', 'Другое'];
  const rooms = ['Кухня', 'Гостиная', 'Спальня', 'Ванная', 'Кладовка', 'Другое'];
  const statusNames = {ok:'В порядке', attention:'Требует внимания', soon:'Сервис скоро', overdue:'Просрочено'};
  const iconCodes = { 'Бытовая техника':'⚙', 'Мебель':'▤','Электроника':'▣','Сантехника':'♧','Климатическая техника':'☷','Другое':'⬡' };
  const initialItems = [
    ['Холодильник LG FKLM2134','Бытовая техника','Кухня','LG','FKLM2134','2020-03-13','2020-03-13','2027-03-13','239BXHS8851262','LG FKLM2134 — двухкамерный холодильник Side by Side с инверторным компрессором и общим объёмом 703 л. Чёрный корпус с двумя дверями разделён на холодильное и морозильное отделения.','Тихо работает. Отлично сохраняет продукты. Легко регулируется температура в морозилке.','attention','fridge.jpg','Следующее ТО','2026-11-01'],
    ['Кофемашина Philips','Бытовая техника','Кухня','Philips','Series 3200','2022-06-02','','2027-01-01','','Автоматическая кофемашина.','Нужно провести очистку от накипи.','soon','coffee.jpg','Следующее ТО','2026-11-04'],
    ['Стиральная машина LG','Бытовая техника','Ванная','LG','F2J3NS0W','2021-04-15','','2027-01-01','','Стиральная машина LG.','','ok','washer.jpg','Следующее ТО','2026-11-30'],
    ['Диван','Мебель','Гостиная','','','2024-11-11','','','','Угловой диван для гостиной.','','attention','sofa.jpg','Профессиональная чистка','2026-12-05'],
    ['Обеденный стол','Мебель','Кухня','','','2023-08-01','','','','Обеденный стол на кухне.','','ok','table.jpg','Осмотр креплений','2027-01-04'],
    ['Смеситель на кухне','Сантехника','Кухня','','','2024-01-10','','','','Смеситель кухонной мойки.','','ok','faucet.jpg','Проверка герметичности','2026-12-10'],
    ['Кондиционер LG','Климатическая техника','Гостиная','LG','123','2023-06-12','','','','Кондиционер в гостиной.','','ok','ac.jpg','Следующее ТО','2027-04-13']
  ];
  const hiddenExamples = [
    ['Пылесос Samsung','Бытовая техника','Кладовка'],['Микроволновая печь','Бытовая техника','Кухня'],['Духовой шкаф','Бытовая техника','Кухня'],['Посудомоечная машина','Бытовая техника','Кухня'],['Электрический чайник','Бытовая техника','Кухня'],
    ['Кровать','Мебель','Спальня'],['Шкаф для одежды','Мебель','Спальня'],['Прикроватная тумба','Мебель','Спальня'],
    ['Телевизор','Электроника','Гостиная'],['Ноутбук','Электроника','Спальня'],['Wi-Fi роутер','Электроника','Гостиная'],['Умная колонка','Электроника','Гостиная'],
    ['Душевая лейка','Сантехника','Ванная'],['Ванна','Сантехника','Ванная'],['Фильтр для воды','Сантехника','Кухня'],['Раковина','Сантехника','Ванная'],
    ['Очиститель воздуха','Климатическая техника','Спальня'],
    ['Краска для стен','Другое','Гостиная'],['Комплект ключей','Другое','Кладовка'],['Лампочки','Другое','Кладовка'],['Напольное покрытие','Другое','Гостиная']
  ];
  function seed() {
    const items = initialItems.map((arr, index) => ({
      id:`demo-${index+1}`, title:arr[0], category:arr[1], room:arr[2], brand:arr[3], model:arr[4],
      purchaseDate:arr[5], installDate:arr[6], warranty:arr[7], serial:arr[8], description:arr[9], notes:arr[10],
      status:arr[11], image:assets+arr[12], eventTitle:arr[13], eventDate:arr[14],
      photos:index===0?[assets+'fridge.jpg',assets+'fridge-inside.jpg',assets+'fridge-door.jpg',assets+'fridge-diagram.jpg']:[assets+arr[12]],
      docs:index===0?[{id:'demo-doc-1',title:'Чек о покупке',label:'PDF ~ 2,7 МБ • 13 марта 2020',content:null},{id:'demo-doc-2',title:'Гарантийный талон',label:'PDF ~ 1,9 МБ • 13 марта 2020',content:null},{id:'demo-doc-3',title:'Инструкция пользователя',label:'PDF ~ 5,4 МБ • LG',content:null}]:[],
      events:index===0?[{id:'ev1',date:'2024-01-22',title:'Замена компрессора',description:'Заменили компрессор на новый. Предыдущий перестал работать.',by:'Сервисный центр «ДомашнийМастер»'},{id:'ev2',date:'2022-04-07',title:'Замена ручки холодильника',description:'Заменили ручку холодильника на новую. Предыдущую поцарапали.',by:'Самостоятельно'},{id:'ev3',date:'2020-03-13',title:'Покупка',description:'Купили в ДНС. Начало гарантии.',by:'ДНС'}]:[],
      createdAt:new Date(Date.UTC(2026,9,20-index)).toISOString(), demo:true
    }));
    items[0].cardTitle='Холодильник LG';
    for (let i=0;i<hiddenExamples.length;i++) {
      const [title,category,room]=hiddenExamples[i];
      items.push({id:`demo-${i+8}`,title,category,room,brand:'',model:'',purchaseDate:'2023-01-01',installDate:'',warranty:'',serial:'',description:'',notes:'',status:'ok',image:'',photos:[], docs:[],events:[],createdAt:new Date(Date.UTC(2026,8,28-i)).toISOString(),demo:true});
    }
    return {items,theme:'light'};
  }
  // Данные и интерфейс разделены по ответственности: storage.js / app.js.
  const storage = window.PamyatStorage;
  if (!storage) throw new Error('Не загружен storage.js: проверьте подключение файлов в index.html');
  const loaded = storage.read(STORE);
  let state = (loaded.ok && loaded.value && Array.isArray(loaded.value.items)) ? loaded.value : seed();
  const storageAvailable = loaded.ok;
  function persist() {
    if (storageAvailable && storage.write(STORE, state)) return true;
    notify('Не удалось сохранить: хранилище браузера заполнено или отключено.', true);
    return false;
  }
  if (storageAvailable && loaded.value === null) persist();

  const ui = {query:'',room:'Все',category:'Все',status:'Все',sort:'new',view:'grid',showAll:false,tab:'История',editId:null,pendingPhoto:null,pendingDocs:[],modalItem:null};
  const safe = (input) => String(input ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const niceDate = (iso) => {
    if(!iso) return '—';
    const date = new Date(iso+'T12:00:00');
    return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(date);
  };
  const icon = (id,cls='icon')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
  const uniqueId=()=>`item-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const currentItems=()=>state.items;
  const findItem=(id)=>state.items.find(it=>it.id===id);
  const counts=(cat)=>state.items.filter(it=>it.category===cat).length;
  const statusBadge=(status)=>`<span class="status-badge status-${safe(status)}">● &nbsp;${safe(statusNames[status]||statusNames.ok)}</span>`;
  const photo=(it)=>it?.photos?.[0] || it?.image || '';
  const secondaryNames={reminders:'Напоминания',documents:'Документы',useful:'Полезное',family:'Семья',settings:'Настройки'};
  let toastTimer;
  function notify(message,error=false) {
    const el=$('#toast'); el.textContent=message;el.classList.toggle('error',error);el.hidden=false;
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},4200);
  }
  function route(path) {location.hash='#/'+path; if(location.hash==='#/'+path) render();}
  function getPath() {return decodeURIComponent(location.hash.replace(/^#\/?/,'')||'home').split('/');}
  function setActive(which) {
    $$('[data-nav]').forEach(a=>{
      let on=a.dataset.nav===which;
      a.classList.toggle('active',on);
      if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  }
  function updateDashboard(){
    const values=[state.items.length,3,13,4];
    $$('.stat-card strong').forEach((el,i)=>{el.textContent=values[i]});
    const categoryCards=$$('.category-card');
    for(let i=0;i<categories.length;i++) if(categoryCards[i]) categoryCards[i].querySelector('p').textContent=counts(categories[i]);
  }
  function show(page){
    $$('.page-view').forEach(el=>{el.hidden=el.id!=='page-'+page});
    const top=$('.workspace > main'); if(top) top.scrollTop=0;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function render() {
    document.documentElement.dataset.theme=state.theme||'light';
    const [part,id]=getPath();
    if(part==='home'){ updateDashboard();setActive('home');show('home');document.title='Главная — Память дома'; }
    else if(part==='items'){setActive('items');renderItems();show('items');document.title='Мои вещи — Память дома';}
    else if(part==='item'&&findItem(id)){setActive('items');renderDetail(id);show('detail');document.title='Карточка вещи — Память дома';}
    else if(part==='add'||part==='edit'&&findItem(id)){setActive('items');renderForm(part==='edit'?id:null);show('form');document.title='Добавить вещь — Память дома';}
    else if(secondaryNames[part]){setActive(part);renderSecondary(part);show('secondary');document.title=secondaryNames[part]+' — Память дома';}
    else {location.hash='#/home';}
  }
  function filterButtons(group, entries){
    return entries.map(value=>`<button type="button" class="filter-chip ${(ui[group]===value?'chosen':'')}" data-group="${group}" data-value="${safe(value)}" aria-pressed="${ui[group]===value}">${safe(value)}</button>`).join('');
  }
  function renderItems(){
    const x=$('#page-items');
    const selected=currentItems().filter(it=>{
      return (ui.room==='Все'||it.room===ui.room) && (ui.category==='Все'||it.category===ui.category) && (ui.status==='Все'||statusNames[it.status]===ui.status) && (!ui.query||[it.title,it.brand,it.model,it.room,it.category,it.description].join(' ').toLowerCase().includes(ui.query.toLowerCase()));
    });
    selected.sort((a,b)=>ui.sort==='alpha'?a.title.localeCompare(b.title,'ru'):b.createdAt.localeCompare(a.createdAt));
    const shown=ui.showAll ? selected:selected.slice(0,7);
    x.innerHTML=`<header class="items-head"><section><h1>Мои вещи</h1><p>Всего ${state.items.length} вещей дома</p></section><section class="view-toggle" aria-label="Вид каталога"><button type="button" class="${ui.view==='grid'?'selected':''}" data-view="grid" aria-pressed="${ui.view==='grid'}">▦ Сетка</button><button type="button" class="${ui.view==='list'?'selected':''}" data-view="list" aria-pressed="${ui.view==='list'}">☰ Список</button></section></header>
      <section class="filter-panel" aria-label="Фильтры каталога">
        <section class="filter-row"><h2>Комнаты</h2><section class="filter-options">${filterButtons('room',['Все','Кухня','Гостиная','Спальня','Ванная','Кладовка','Другое'])}</section></section>
        <section class="filter-row"><h2>Категории</h2><section class="filter-options">${filterButtons('category',['Все','Бытовая техника','Сантехника','Климатическая техника'])}<select class="filter-chip filter-category-other" id="other-category" aria-label="Другие категории"><option value="" disabled ${!['Другое','Мебель','Электроника'].includes(ui.category)?'selected':''}>Другое ⌄</option><option value="Другое" ${ui.category==='Другое'?'selected':''}>Другое</option><option value="Мебель" ${ui.category==='Мебель'?'selected':''}>Мебель</option><option value="Электроника" ${ui.category==='Электроника'?'selected':''}>Электроника</option></select></section></section>
        <section class="filter-row last"><h2>Статус</h2><section class="filter-options">${filterButtons('status',['Все','В порядке','Требует внимания','Сервис скоро','Просрочено'])}</section><label class="sort-field">Сортировка<select id="item-sort" aria-label="Сортировка"><option value="new" ${ui.sort==='new'?'selected':''}>Сначала новые</option><option value="alpha" ${ui.sort==='alpha'?'selected':''}>По названию</option></select></label></section>
      </section>
      ${ui.query?`<p class="search-summary">Поиск: «${safe(ui.query)}» <button type="button" data-action="clear-search">Сбросить</button></p>`:''}
      <section class="thing-grid ${ui.view==='list'?'as-list':''}" aria-label="Каталог вещей">${shown.map(it=>thingCard(it)).join('')}
        <a href="#/add" class="thing-add-tile"><span aria-hidden="true">+</span><strong>Добавить вещь</strong><p>Сфотографируй, укажите комнату и категорию — и мы поможем не забыть о важном.</p></a>
      </section>
      ${!selected.length?`<section class="empty-state"><h2>Ничего не найдено</h2><p>Измени фильтры или добавь новую вещь.</p><button type="button" class="primary-button" data-action="clear-filters">Сбросить фильтры</button></section>`:''}
      ${selected.length>shown.length?`<button type="button" class="show-more" data-action="show-more">Показать ещё ${selected.length-shown.length} вещей</button>`:''}
    `;
  }
  function thingCard(it){
    const image=photo(it);
    return `<article class="thing-card"><a class="thing-photo" href="#/item/${encodeURIComponent(it.id)}" aria-label="Открыть ${safe(it.title)}">${image?`<img src="${safe(image)}" alt="${safe(it.title)}" loading="lazy">`:`<span class="placeholder-art">${safe(iconCodes[it.category]||'⌂')}</span>`}${statusBadge(it.status)}</a><section class="thing-info"><h3><a href="#/item/${encodeURIComponent(it.id)}">${safe(it.cardTitle||it.title)}</a></h3><p><span class="small-symbol">⌂</span>${safe(it.room)}</p><p><span class="small-symbol">▤</span>${safe(it.category)}</p><p class="thing-event"><span class="small-symbol">◷</span><span>${safe(it.eventTitle||'Сведения об объекте')}<small>${niceDate(it.eventDate||it.purchaseDate)}</small></span></p></section></article>`;
  }
  function crumbs(part,title='',category='') {
    return `<nav class="breadcrumbs" aria-label="Навигационная цепочка"><a href="#/items">Мои вещи</a><span>›</span>${category?`<a href="#/items" data-category-link="${safe(category)}">${safe(category)}</a><span>›</span>`:''}<span aria-current="page">${safe(title||part)}</span></nav>`;
  }
  function renderDetail(id){
    const it=findItem(id), p=photo(it),x=$('#page-detail');
    const photos=it.photos?.length?it.photos:(p?[p]:[]);
    if(!['Обзор','История','Документы','Заметки','Похожие советы'].includes(ui.tab)) ui.tab='История';
    x.innerHTML=`${crumbs('item',it.title,it.category)}
      <section class="detail-top">
        <section class="detail-gallery" aria-label="Фотографии"><figure class="detail-main-photo">${p?`<img src="${safe(p)}" alt="${safe(it.title)}" id="gallery-main">`:`<span class="placeholder-art">${safe(iconCodes[it.category]||'⌂')}</span>`}</figure><section class="detail-thumbs">${photos.slice(0,3).map((pic,i)=>`<button type="button" data-thumb="${i}" aria-label="Показать фото ${i+1}"><img src="${safe(pic)}" alt=""></button>`).join('')}<button type="button" class="more-pics" data-action="photo-count" aria-label="Количество фотографий">${photos.length>3?'+'+(photos.length-3):'+'}</button></section></section>
        <section class="detail-facts"><header class="detail-title"><h1>${safe(it.title)}</h1><button type="button" title="Редактировать вещь" class="edit-link" data-action="edit-item" data-id="${safe(it.id)}" aria-label="Редактировать вещь">✎</button></header><p class="detail-tags"><span class="good-tag">● Активна</span><span>⌂ ${safe(it.room)}</span><span>▤ ${safe(it.category)}</span></p>
          <dl>${[['Бренд',it.brand],['Модель',it.model],['Серийный номер',it.serial],['Дата покупки',niceDate(it.purchaseDate)],['Где находится',`Квартира, ${it.room}`],['Заметки',it.notes]].map(([k,v])=>`<dt>${safe(k)}</dt><dd>${safe(v||'—')}</dd>`).join('')}</dl>
        </section>
        <aside class="detail-aside"><section class="warranty"><h2>♢ Гарантия</h2><p>${it.warranty?'Действует до '+niceDate(it.warranty):'Не указана'}</p></section><header class="side-docs-head"><h2>▤ Документы (${it.docs?.length||0})</h2><button type="button" data-tab="Документы">Все ➜</button></header><ul class="side-doc-list">${(it.docs||[]).slice(0,3).map(d=>`<li><button type="button" data-download="${safe(d.id)}"><span>▤</span><strong>${safe(d.title)}<small>${safe(d.label||'Файл')}</small></strong></button></li>`).join('')||'<li>Пока нет документов</li>'}</ul><button type="button" class="primary-button side-button" data-action="add-event">+ Добавить событие</button><button type="button" class="secondary-button side-button" data-action="add-document">+ Добавить документ</button></aside>
      </section>
      <nav class="detail-tabs" aria-label="Разделы карточки">${['Обзор','История','Документы','Заметки','Похожие советы'].map(t=>`<button type="button" data-tab="${t}" class="${ui.tab===t?'active':''}" aria-current="${ui.tab===t?'page':'false'}">${t}</button>`).join('')}</nav>
      <section class="detail-tab-content">${tabContent(it)}</section>`;
  }
  function tabContent(it) {
    if(ui.tab==='История')return `<header class="tab-head"><h2>История изменений</h2><button type="button" class="filter-chip" data-action="add-event">+ Событие</button></header>${it.events?.length?`<ol class="timeline">${[...it.events].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<li><time datetime="${safe(e.date)}">${niceDate(e.date)}</time><article><h3>${safe(e.title)}</h3><p>${safe(e.description)}</p></article><span>${safe(e.by)}</span></li>`).join('')}</ol>`:`<section class="empty-state"><h3>История пока пуста</h3><p>Добавь первое событие, чтобы отслеживать обслуживание.</p></section>`}`;
    if(ui.tab==='Документы')return `<header class="tab-head"><h2>Документы (${it.docs?.length||0})</h2><button type="button" class="filter-chip" data-action="add-document">+ Добавить документ</button></header><ul class="doc-list">${(it.docs||[]).map(d=>`<li><button type="button" data-download="${safe(d.id)}">▤ ${safe(d.title)} <small>${safe(d.label||'')}</small></button></li>`).join('')||'<li>Документы пока не добавлены.</li>'}</ul>`;
    if(ui.tab==='Заметки')return `<section class="detail-note"><h2>Заметки</h2><p>${safe(it.notes||'Заметки пока не добавлены.')}</p><button type="button" class="secondary-button" data-action="edit-item" data-id="${safe(it.id)}">Редактировать заметки</button></section>`;
    if(ui.tab==='Похожие советы')return `<section class="detail-note"><h2>Полезный совет</h2><p>Сохраняй документы и сроки обслуживания техники в одном месте — так их проще найти при необходимости.</p></section>`;
    return `<section class="detail-note"><h2>Об объекте</h2><p>${safe(it.description||'Описание пока не добавлено.')}</p>${it.warranty?`<p>Гарантия до ${niceDate(it.warranty)}.</p>`:''}</section>`;
  }
  function renderForm(id){
    const it=id?findItem(id):null;
    ui.editId=id;
    ui.pendingPhoto=null;
    ui.pendingDocs=[];
    const input=(key,label,opts={})=>`<label class="form-field ${opts.className||''}" for="f-${key}"><span>${label}${opts.required?'<b aria-hidden="true">*</b>':''}</span><input id="f-${key}" name="${key}" ${opts.required?'required':''} type="${opts.type||'text'}" value="${safe(it?.[key]||'')}" ${opts.placeholder?`placeholder="${safe(opts.placeholder)}"`:''}></label>`;
    const select=(key,label,list,required)=>`<label class="form-field" for="f-${key}"><span>${label}${required?'<b aria-hidden="true">*</b>':''}</span><select id="f-${key}" name="${key}" ${required?'required':''}><option value="">Выберите ${label.toLowerCase()}</option>${list.map(e=>`<option value="${safe(e)}" ${(it?.[key]===e?'selected':'')}>${safe(e)}</option>`).join('')}</select></label>`;
    const p=photo(it)||assets+'fridge.jpg';
    $('#page-form').innerHTML=`${crumbs('form',id?'Редактировать вещь':'Добавить вещь')}
      <form class="add-form" id="item-form" novalidate>
        <section class="form-media"><section class="upload-main"><figure class="form-photo"><img id="form-preview" src="${safe(p)}" alt="Фото предмета"></figure><label class="upload-tile" for="photo-upload"><strong class="plus-plate">+</strong><b>Добавить фото</b><span>или перетащите файл сюда</span><small>PNG, JPG до 5 МБ</small></label><input id="photo-upload" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only"></section>
          <section class="form-thumbs"><img src="${assets}fridge-inside.jpg" alt="Пример фотографии 1"><img src="${assets}fridge-door.jpg" alt="Пример фотографии 2"><img src="${assets}fridge-diagram.jpg" alt="Пример фотографии 3"><span>+4</span></section>
          <section class="form-docs"><h2>▤ &nbsp; Документы</h2><ul id="form-doc-list" class="form-doc-list">${(it?.docs||[]).map(d=>`<li>▤ &nbsp;<span>${safe(d.title)}<small>${safe(d.label||'')}</small></span></li>`).join('')}</ul><label class="doc-upload" for="form-doc-upload">+ Добавить документ</label><input type="file" id="form-doc-upload" class="sr-only" accept=".pdf,.jpg,.jpeg,.png,.txt" multiple></section>
        </section>
        <section class="form-fields"><h1>Основная информация</h1><p id="form-error" class="form-error" role="alert" hidden></p>
          ${input('title','Название объекта',{required:true,placeholder:'Например, холодильник LG FKLM2134'})}
          <section class="form-two">${select('category','Категория',categories,true)}${select('room','Комната',rooms,false)}</section>
          <section class="form-two">${input('brand','Бренд',{placeholder:'LG'})}${input('model','Модель',{placeholder:'FKLM2134'})}</section>
          <section class="form-three">${input('purchaseDate','Дата покупки',{required:true,type:'date'})}${input('installDate','Дата установки',{type:'date'})}${input('warranty','Гарантия до',{type:'date'})}</section>
          ${input('serial','Серийный номер',{placeholder:'239BXHS8851262'})}
          <label class="form-field" for="f-description"><span>Описание</span><textarea id="f-description" name="description" rows="3" maxlength="1000">${safe(it?.description||'')}</textarea><small class="word-count" id="count-description">0/1000</small></label>
          <label class="form-field" for="f-notes"><span>Заметки</span><textarea id="f-notes" name="notes" rows="4" maxlength="500">${safe(it?.notes||'')}</textarea><small class="word-count" id="count-notes">0/500</small></label>
          <footer class="form-actions"><button class="secondary-button" type="button" data-action="cancel-form">Отмена</button><button class="primary-button" type="submit">Сохранить объект</button></footer>
        </section>
      </form>`;
    updateCounts();
  }
  function updateCounts(){
    ['description','notes'].forEach(key=>{const e=$('#f-'+key);if(e) $('#count-'+key).textContent=`${e.value.length}/${e.maxLength}`;});
  }
  function renderSecondary(part){
    const name=secondaryNames[part];
    const extra=part==='reminders'?'В первой версии напоминания отображаются на главной странице, а история обслуживания — в карточках вещей.':part==='documents'?'Прикрепить документ можно в карточке вещи. Отдельный общий каталог файлов запланирован на следующий этап.':part==='settings'?'Пока можно переключать светлую и тёмную тему кнопкой в верхней панели.':'Полноценный раздел будет добавлен после проверки основного сценария MVP.';
    $('#page-secondary').innerHTML=`<section class="secondary-page"><h1>${name}</h1><p>${extra}</p><a href="#/items" class="primary-button">Перейти к моим вещам</a></section>`;
  }
  function validateForm(form){
    const error=$('#form-error');
    const needed=[form.elements.title,form.elements.category,form.elements.purchaseDate];
    needed.forEach(el=>{el.classList.remove('invalid');el.removeAttribute('aria-invalid')});
    const invalid=needed.filter(el=>!el.value.trim());
    if(invalid.length){
      invalid.forEach(el=>{el.classList.add('invalid');el.setAttribute('aria-invalid','true')});
      error.textContent='Ошибка! Отсутствуют обязательные для заполнения данные';error.hidden=false;
      invalid[0].focus();return false;
    }
    const dateValue=form.elements.purchaseDate.value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)){
      error.textContent='Проверь дату покупки';error.hidden=false;return false;
    }
    error.hidden=true;return true;
  }
  function saveItem(form){
    if(!validateForm(form))return;
    const keys=['title','category','room','brand','model','purchaseDate','installDate','warranty','serial','description','notes'];
    const values={};keys.forEach(key=>{values[key]=form.elements[key].value.trim();});
    const original=ui.editId?findItem(ui.editId):null;
    const photos=original?.photos?.slice()||[];
    if(ui.pendingPhoto){photos.unshift(ui.pendingPhoto);}
    const docs=[...(original?.docs||[]),...ui.pendingDocs];
    const record={...original,...values, id:original?.id||uniqueId(),status:original?.status||'ok',
      image:photos[0]||'',photos,docs,events:original?.events||[],createdAt:original?.createdAt||new Date().toISOString(),demo:false};
    if(original){const index=state.items.indexOf(original);state.items[index]=record;}
    else state.items.unshift(record);
    if(!persist()){
      if(original)state.items[state.items.indexOf(record)]=original;else state.items.shift();return;
    }
    ui.showAll=false;ui.query='';ui.room='Все';ui.category='Все';ui.status='Все';ui.sort='new';ui.tab='Обзор';
    notify(original?'Изменения успешно сохранены.':'Вещь успешно добавлена и сохранена.');
    route('item/'+encodeURIComponent(record.id));
  }
  function asDataUrl(file,maxWidth=940,quality=.78){
    return new Promise((resolve,reject)=>{
      if(!file.type.startsWith('image/')) return reject(Error('Нужен файл изображения.'));
      if(file.size>5*1024*1024) return reject(Error('Изображение должно быть не больше 5 МБ.'));
      const reader=new FileReader(); reader.onerror=()=>reject(Error('Ошибка чтения файла.'));
      reader.onload=()=>{
        const img=new Image();img.onerror=()=>reject(Error('Не удалось открыть изображение.'));
        img.onload=()=>{
          const ratio=Math.min(1,maxWidth/Math.max(img.width,img.height));
          const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);
          const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',quality));
        };
        img.src=reader.result;
      };reader.readAsDataURL(file);
    });
  }
  function fileAsDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(Error('Не удалось прочитать документ'));r.readAsDataURL(file);});}
  async function handleDocFiles(files,immediate=false){
    for(const file of files){
      if(file.size>750000){notify('Документ слишком большой для локальной версии (до 750 КБ).',true);continue;}
      if(!/^(application\/pdf|image\/png|image\/jpeg|text\/plain)$/.test(file.type)){notify('Поддерживаются PDF, JPG, PNG и TXT.',true);continue;}
      try {
        const content=await fileAsDataURL(file);
        const doc={id:uniqueId(),title:file.name,label:`${file.type.split('/')[1].toUpperCase()} • ${(file.size/1024).toFixed(0)} КБ`,content};
        if(immediate){const item=findItem(ui.modalItem);if(!item)continue;item.docs.push(doc);if(!persist()){item.docs.pop();continue;}ui.tab='Документы';renderDetail(item.id);notify('Документ добавлен.');}
        else {ui.pendingDocs.push(doc);const list=$('#form-doc-list');list.insertAdjacentHTML('beforeend',`<li>▤ &nbsp; <span>${safe(doc.title)}<small>${safe(doc.label)}</small></span></li>`);}
      } catch(e){notify(e.message,true);}
    }
  }
  function showEventDialog(){
    const dialog=$('#app-dialog');
    dialog.innerHTML=`<form id="event-form" class="modal-form" novalidate><h2>Добавить событие</h2><label>Название события*<input name="title" required placeholder="Например, чистка фильтров"></label><label>Дата*<input name="date" type="date" required value="${new Date().toISOString().slice(0,10)}"></label><label>Описание<textarea name="description" rows="3"></textarea></label><label>Кто выполнил<input name="by" placeholder="Самостоятельно"></label><p class="form-error" id="event-error" hidden>Заполни название и дату события.</p><footer><button type="button" class="secondary-button" data-action="close-modal">Отмена</button><button class="primary-button" type="submit">Сохранить событие</button></footer></form>`;
    dialog.showModal();
  }
  function downloadDoc(docId){
    const currentId=getPath()[1],item=findItem(currentId),doc=item?.docs?.find(d=>d.id===docId);
    if(!doc)return;
    if(!doc.content){notify('Это пример документа. Загрузи собственный файл, чтобы его можно было скачать.');return;}
    const link=document.createElement('a');link.href=doc.content;link.download=doc.title;document.body.append(link);link.click();link.remove();
  }
  // Routing and delegated UI actions
  window.addEventListener('hashchange',render);
  $('#top-add').addEventListener('click',()=>route('add'));
  $('#global-search-form').addEventListener('submit',event=>{
    event.preventDefault();ui.query=$('#search-query').value.trim();ui.showAll=true;ui.room='Все';ui.category='Все';ui.status='Все';route('items');
  });
  document.addEventListener('click',event=>{
    const btn=event.target.closest('button,[data-category-link]');
    if(!btn)return;
    if(btn.dataset.group){ui[btn.dataset.group]=btn.dataset.value;ui.showAll=true;renderItems();return;}
    if(btn.dataset.view){ui.view=btn.dataset.view;renderItems();return;}
    if(btn.dataset.tab){ui.tab=btn.dataset.tab;const id=getPath()[1];if(id)renderDetail(id);return;}
    if(btn.dataset.thumb!==undefined){
      const item=findItem(getPath()[1]),selected=item?.photos?.[Number(btn.dataset.thumb)];
      if(selected){const img=$('#gallery-main');if(img)img.src=selected;}return;
    }
    if(btn.dataset.categoryLink){ui.category=btn.dataset.categoryLink;ui.showAll=true;return;}
    if(btn.dataset.download){downloadDoc(btn.dataset.download);return;}
    const act=btn.dataset.action;
    if(!act)return;
    if(act==='clear-search'){ui.query='';$('#search-query').value='';renderItems();}
    else if(act==='clear-filters'){ui.query='';ui.category='Все';ui.room='Все';ui.status='Все';renderItems();}
    else if(act==='show-more'){ui.showAll=true;renderItems();}
    else if(act==='edit-item'){route('edit/'+btn.dataset.id);}
    else if(act==='cancel-form'){route(ui.editId?'item/'+ui.editId:'items');}
    else if(act==='add-event'){ui.modalItem=getPath()[1];showEventDialog();}
    else if(act==='add-document'){ui.modalItem=getPath()[1];$('#detail-doc-upload').click();}
    else if(act==='close-modal'){$('#app-dialog').close();}
    else if(act==='theme'){state.theme=state.theme==='light'?'dark':'light';persist();render();notify(state.theme==='dark'?'Тёмная тема включена.':'Светлая тема включена.');}
    else if(act==='notifications'){route('reminders');}
    else if(act==='tip'){notify('Советы для ухода за домом появятся в следующих версиях.');}
    else if(act==='profile'){notify('Учётные записи появятся в следующих версиях MVP.');}
    else if(act==='photo-count'){notify('Все добавленные фотографии доступны при редактировании вещи.');}
  });
  document.addEventListener('change',async e=>{
    const t=e.target;
    if(t.id==='item-sort'){ui.sort=t.value;renderItems();}
    if(t.id==='other-category'){ui.category=t.value;ui.showAll=true;renderItems();}
    if(t.id==='photo-upload'&&t.files?.length){
      try{ui.pendingPhoto=await asDataUrl(t.files[0]);$('#form-preview').src=ui.pendingPhoto;notify('Фото подготовлено. Нажми «Сохранить объект».');}catch(error){notify(error.message,true);}
      t.value='';
    }
    if(t.id==='form-doc-upload'&&t.files?.length){await handleDocFiles(t.files);t.value='';}
    if(t.id==='detail-doc-upload'&&t.files?.length){await handleDocFiles(t.files,true);t.value='';}
  });
  document.addEventListener('input',e=>{
    if(e.target.closest('#item-form')){
      if(e.target.classList.contains('invalid')&&e.target.value.trim()){e.target.classList.remove('invalid');e.target.removeAttribute('aria-invalid');}
      updateCounts();
    }
  });
  document.addEventListener('submit',e=>{
    if(e.target.id==='item-form'){e.preventDefault();saveItem(e.target);}
    if(e.target.id==='event-form'){
      e.preventDefault();const f=e.target;
      if(!f.elements.title.value.trim()||!f.elements.date.value){$('#event-error').hidden=false;return;}
      const it=findItem(ui.modalItem);if(!it)return;
      it.events.unshift({id:uniqueId(),title:f.elements.title.value.trim(),date:f.elements.date.value,description:f.elements.description.value.trim(),by:f.elements.by.value.trim()||'Самостоятельно'});
      if(!persist()){it.events.shift();return;}
      $('#app-dialog').close();ui.tab='История';renderDetail(it.id);notify('Событие сохранено.');
    }
  });
  const detailUploader=document.createElement('input');detailUploader.type='file';detailUploader.id='detail-doc-upload';detailUploader.accept='.pdf,.jpg,.jpeg,.png,.txt';detailUploader.hidden=true;document.body.append(detailUploader);
  // Persisted demo data is deliberately kept explicit; existing user's saved items aren't overwritten.
  render();
})();
