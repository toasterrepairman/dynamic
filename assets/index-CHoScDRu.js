(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://api.deadlock-api.com`,t=`https://assets.deadlock-api.com`,n=new Map,r=3600*1e3;async function i(e){let t=n.get(e);if(t&&Date.now()<t.expiry)return t.data;let i=await fetch(e);if(!i.ok)throw Error(`API error: ${i.status} ${i.statusText} — ${e}`);let a=await i.json();return n.set(e,{data:a,expiry:Date.now()+r}),a}function a(){return i(`${t}/v2/heroes`)}function o(){return i(`${t}/v2/items`)}function s(t,n){let r=new URLSearchParams;n!==void 0&&r.append(`hero_ids`,String(n));for(let e of t)r.append(`enemy_hero_ids`,String(e));return i(`${e}/v1/analytics/item-stats?${r}`)}function c(t,n){let r=new URLSearchParams;n!==void 0&&r.append(`hero_ids`,String(n));for(let e of t)r.append(`enemy_hero_ids`,String(e));return r.append(`bucket`,`game_time_min`),r.append(`min_matches`,`10`),i(`${e}/v1/analytics/item-stats?${r}`)}function l(){return i(`${e}/v1/analytics/hero-counter-stats?same_lane_filter=true`)}function u(t,n,r=!0){let a=new URLSearchParams({hero_id:String(t),enemy_hero_id:String(n)});return r&&a.set(`same_lane_filter`,`true`),i(`${e}/v1/analytics/hero-counter-stats?${a}`)}function d(t,n){return i(`${e}/v1/analytics/hero-synergy-stats?${new URLSearchParams({hero_id1:String(t),hero_id2:String(n),same_lane_filter:`true`})}`)}function f(t){return i(`${e}/v1/analytics/ability-order-stats?hero_id=${t}`)}function p(t,n=2){return i(`${e}/v1/analytics/item-permutation-stats?${new URLSearchParams({hero_ids:String(t),comb_size:String(n),min_matches:`500`})}`)}function m(t){return i(`${e}/v1/analytics/player-performance-curve?${new URLSearchParams({hero_ids:String(t),resolution:`0`})}`)}var h=document.getElementById(`app`),g=null;function _(){return document.documentElement.dataset.theme??`solarized-dark`}function v(e){let t=_();return`
    <header class="app-header">
      <a class="app-title" id="reset-btn">Dynamic</a>
      ${e?`<p class="subtitle">${e}</p>`:``}
      <div class="theme-picker">
        <select id="theme-select">
          <option value="solarized-dark"${t===`solarized-dark`?` selected`:``}>Solarized Dark</option>
          <option value="solarized-light"${t===`solarized-light`?` selected`:``}>Solarized Light</option>
          <option value="dracula"${t===`dracula`?` selected`:``}>Dracula</option>
          <option value="nord"${t===`nord`?` selected`:``}>Nord</option>
        </select>
      </div>
    </header>
  `}function y(){let e=document.getElementById(`theme-select`);e&&e.addEventListener(`change`,()=>{let t=e.value;document.documentElement.dataset.theme=t,localStorage.setItem(`theme`,t)})}function b(){return`
    <footer class="app-footer">
      <span>Data from <a href="https://deadlock-api.com" target="_blank" rel="noopener">Deadlock API</a></span>
      <span class="footer-links">
        <a href="https://www.toast.cyou/" target="_blank" rel="noopener">toast.cyou</a>
        <a href="https://github.com/toasterrepairman" target="_blank" rel="noopener">GitHub</a>
      </span>
    </footer>
  `}function x(e){switch(e.view){case`hero-select`:C(e);break;case`lane-config`:E(e);break;case`results`:A(e);break}S(),y(),window.scrollTo({top:0,behavior:`smooth`})}function S(){let e=document.getElementById(`reset-btn`);e&&e.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`reset`))})}function C(e){let t=[...e.heroes].sort((e,t)=>e.name.localeCompare(t.name));h.innerHTML=`
    ${v(`Deadlock Counter-Build Guide`)}
    <section class="hero-select">
      <h2>Pick Your Hero</h2>
      <div class="hero-filters">
        <input type="search" id="hero-search" placeholder="Search heroes..." class="search-input" />
      </div>
      <div class="hero-grid" id="hero-grid">
        ${t.map(e=>w(e)).join(``)}
      </div>
    </section>
    ${b()}
  `,T(t)}function w(e){let[t,n,r]=e.colors.ui;return`
    <button class="hero-card" data-hero-id="${e.id}" style="--hero-color: rgb(${t},${n},${r})">
      <img src="${e.images.icon_hero_card_webp}" alt="${e.name}" loading="lazy" />
      <span class="hero-name">${e.name}</span>
    </button>
  `}function T(e){let t=document.getElementById(`hero-grid`),n=document.getElementById(`hero-search`);n.addEventListener(`input`,()=>{let r=n.value.toLowerCase();t.querySelectorAll(`.hero-card`).forEach(t=>{let n=e.find(e=>e.id===Number(t.dataset.heroId));if(!n)return;let i=n.name.toLowerCase().includes(r)||n.class_name.toLowerCase().includes(r);t.style.display=i?``:`none`})}),t.addEventListener(`click`,t=>{let n=t.target.closest(`.hero-card`);if(!n)return;let r=Number(n.dataset.heroId),i=e.find(e=>e.id===r);i&&window.dispatchEvent(new CustomEvent(`hero-selected`,{detail:i}))})}function E(e){let t=e.myHero,[n,r,i]=t.colors.ui,a=e.heroes.filter(e=>e.id!==t.id).sort((e,t)=>e.name.localeCompare(t.name)),o=e.allMatchups.filter(e=>e.hero_id===t.id).map(t=>({enemy:e.heroes.find(e=>e.id===t.enemy_hero_id),wr:t.wins/t.matches_played,games:t.matches_played})).filter(e=>e.enemy).sort((e,t)=>t.wr-e.wr);h.innerHTML=`
    ${v()}
    <section class="lane-config">
      <div class="selected-hero-banner" style="--hero-color: rgb(${n},${r},${i})">
        <img src="${t.images.icon_hero_card_webp}" alt="${t.name}" />
        <h2>${t.name}</h2>
        <div class="matchup-strip-wrapper">
          <span class="matchup-strip-label">Win rate vs opponents</span>
          <div class="matchup-strip">
          ${o.map(e=>`
            <div class="matchup-chip" data-hero-id="${e.enemy.id}">
              <img src="${e.enemy.images.icon_image_small_webp}" alt="${e.enemy.name}" loading="lazy" />
              <span class="matchup-wr" style="color:${j(e.wr*100)}">${(e.wr*100).toFixed(1)}%</span>
            </div>
          `).join(``)}
          </div>
        </div>
        <button class="back-btn" id="back-heroes">Change Hero</button>
      </div>

      <h2>Configure Your Lane</h2>
      <div class="lane-pickers">
        <div class="picker-group ally-group">
          <h3>Your Lane Partner</h3>
          <div class="hero-mini-search">
            <input type="search" id="ally-search" placeholder="Search..." class="search-input" />
          </div>
          <div class="hero-mini-grid" id="ally-grid">
            ${a.map(e=>D(e,`ally`)).join(``)}
          </div>
          <div class="selected-slot" id="ally-slot">
            ${e.teammate?O(e.teammate):`<span class="empty-slot">Select a teammate</span>`}
          </div>
        </div>

        <div class="picker-group enemy-group">
          <h3>Enemy Laners</h3>
          <div class="hero-mini-search">
            <input type="search" id="enemy-search" placeholder="Search..." class="search-input" />
          </div>
          <div class="hero-mini-grid" id="enemy-grid">
            ${a.map(e=>D(e,`enemy`)).join(``)}
          </div>
          <div class="enemy-slots">
            <div class="selected-slot" id="enemy-slot-0">
              ${e.enemies[0]?O(e.enemies[0]):`<span class="empty-slot">Enemy 1</span>`}
            </div>
            <div class="selected-slot" id="enemy-slot-1">
              ${e.enemies[1]?O(e.enemies[1]):`<span class="empty-slot">Enemy 2</span>`}
            </div>
          </div>
        </div>
      </div>

      <button class="analyze-btn" id="analyze-btn" disabled>
        Analyze Matchup
      </button>
    </section>
    ${b()}
  `,k(e,a)}function D(e,t){return`
    <button class="hero-mini" data-hero-id="${e.id}" data-role="${t}">
      <img src="${e.images.icon_image_small_webp}" alt="${e.name}" loading="lazy" />
      <span>${e.name}</span>
    </button>
  `}function O(e){return`
    <img src="${e.images.icon_image_small_webp}" alt="${e.name}" />
    <span>${e.name}</span>
    <button class="remove-btn" data-remove-hero="${e.id}">x</button>
  `}function k(e,t){let n=document.getElementById(`ally-grid`),r=document.getElementById(`enemy-grid`),i=document.getElementById(`ally-search`),a=document.getElementById(`enemy-search`),o=document.getElementById(`analyze-btn`);function s(e,t){e.addEventListener(`input`,()=>{let n=e.value.toLowerCase();t.querySelectorAll(`.hero-mini`).forEach(e=>{let t=e.querySelector(`span`).textContent.toLowerCase();e.style.display=t.includes(n)?``:`none`})})}s(i,n),s(a,r);function c(){let t=e.teammate!==null,n=e.enemies[0]!==null&&e.enemies[1]!==null;o.disabled=!(t&&n)}function l(){let t=document.getElementById(`ally-slot`);t.innerHTML=e.teammate?O(e.teammate):`<span class="empty-slot">Select a teammate</span>`;let n=document.getElementById(`enemy-slot-0`),r=document.getElementById(`enemy-slot-1`);n.innerHTML=e.enemies[0]?O(e.enemies[0]):`<span class="empty-slot">Enemy 1</span>`,r.innerHTML=e.enemies[1]?O(e.enemies[1]):`<span class="empty-slot">Enemy 2</span>`,u(),c()}function u(){let t=new Set;e.teammate&&t.add(e.teammate.id);for(let n of e.enemies)n&&t.add(n.id);e.myHero&&t.add(e.myHero.id),document.querySelectorAll(`.hero-mini`).forEach(e=>{let n=Number(e.dataset.heroId);e.classList.toggle(`picked`,t.has(n))})}n.addEventListener(`click`,n=>{let r=n.target.closest(`.hero-mini`);if(!r||r.classList.contains(`picked`))return;let i=t.find(e=>e.id===Number(r.dataset.heroId));i&&(e.teammate=i,l())}),r.addEventListener(`click`,n=>{let r=n.target.closest(`.hero-mini`);if(!r||r.classList.contains(`picked`))return;let i=t.find(e=>e.id===Number(r.dataset.heroId));i&&(e.enemies[0]?e.enemies[1]?(e.enemies[1]=e.enemies[0],e.enemies[0]=i):e.enemies[1]=i:e.enemies[0]=i,l())}),h.addEventListener(`click`,t=>{let n=t.target.closest(`.remove-btn`);if(!n)return;let r=Number(n.dataset.removeHero);e.teammate?.id===r&&(e.teammate=null),e.enemies[0]?.id===r&&(e.enemies[0]=null),e.enemies[1]?.id===r&&(e.enemies[1]=null),e.enemies[0]===null&&e.enemies[1]!==null&&(e.enemies[0]=e.enemies[1],e.enemies[1]=null),l()}),document.getElementById(`back-heroes`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`navigate`,{detail:`hero-select`}))}),o.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`analyze`))}),u(),c()}function A(e){if(e.loading){h.innerHTML=`
      ${v()}
      <div class="loading">
        <div class="spinner"></div>
        <p>Fetching matchup data...</p>
      </div>
      ${b()}
    `;return}if(e.error){h.innerHTML=`
      ${v()}
      <div class="error-box">
        <p>${e.error}</p>
        <button id="retry-btn" class="analyze-btn">Retry</button>
      </div>
      ${b()}
    `,document.getElementById(`retry-btn`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`analyze`))});return}let t=e.myHero,[n,r,i]=t.colors.ui,a=new Map;for(let t of e.counterItems){let e=t.item.item_tier??0;a.has(e)||a.set(e,[]),a.get(e).push(t)}let o=[...a.entries()].sort(([e],[t])=>e-t).map(([,e])=>e.sort((e,t)=>t.winRate-e.winRate));h.innerHTML=`
    ${v()}
    <section class="results">
      <div class="results-header" style="--hero-color: rgb(${n},${r},${i})">
        <div class="results-header-info">
          <img src="${t.images.icon_hero_card_webp}" alt="${t.name}" />
          <div>
            <h2>${t.name}</h2>
            <p class="lane-summary">
              with ${e.teammate?.name??`?`} vs ${e.enemies[0]?.name??`?`} & ${e.enemies[1]?.name??`?`}
            </p>
          </div>
        </div>
        <button class="back-btn" id="back-config">Edit Lane</button>
      </div>

      <div class="results-grid">
        <div class="results-main">
          <section class="tier-section">
            <div class="counter-tabs">
              <button class="counter-tab${e.counterTab===`tier`?` active`:``}" data-tab="tier">Counter Items</button>
              <button class="counter-tab${e.counterTab===`build`?` active`:``}" data-tab="build">Build Prio</button>
              <span class="section-sub">vs ${e.enemies.map(e=>e?.name??`?`).join(` & `)}</span>
            </div>
            ${e.counterTab===`tier`?P(o,{1:`Tier 1`,2:`Tier 2`,3:`Tier 3`,4:`Tier 4`,5:`Tier 5`}):I(e.counterItems)}
          </section>
        </div>

        <div class="results-sidebar">
          ${z(e)}
          ${V(e)}
          ${B(e)}
        </div>
      </div>
    </section>
    ${b()}
  `,document.getElementById(`back-config`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`navigate`,{detail:`lane-config`}))}),document.querySelectorAll(`.counter-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;window.dispatchEvent(new CustomEvent(`counter-tab`,{detail:t}))})});let s=0;function c(e){e?.scrollIntoView({behavior:`smooth`,block:`start`})}function l(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLSelectElement)){if(t.key==="`"){t.preventDefault();let n=e.counterTab===`tier`?`build`:`tier`;window.dispatchEvent(new CustomEvent(`counter-tab`,{detail:n}));return}if(e.counterTab===`tier`){let e=parseInt(t.key);e>=1&&e<=5&&(t.preventDefault(),c(document.getElementById(`tier-${e}`)))}else{let e=document.querySelectorAll(`[data-phase-idx]`);if(e.length===0)return;t.key===`1`?(t.preventDefault(),s=Math.max(0,s-1),c(e[s])):t.key===`3`&&(t.preventDefault(),s=Math.min(e.length-1,s+1),c(e[s]))}}}g&&document.removeEventListener(`keydown`,g),g=l,document.addEventListener(`keydown`,l)}function j(e){let t=Math.max(0,Math.min(1,(e-40)/20));return`rgb(${Math.round(255*(1-t))},${Math.round(255*t)},0)`}var M=[`0-5m`,`5-10m`,`10-15m`,`15-20m`,`20-25m`,`25m+`];function N(e){return e.every(e=>e.matches===0)?``:`<div class="time-chart" title="Buy timing: ${e.map((e,t)=>{let n=`${M[t]}: ${e.matches.toLocaleString()}`;return e.isPeak?`${n} (peak)`:n}).join(` | `)}">${e.map(e=>`<div class="time-bar${e.isPeak?` peak`:``}" style="height:${e.pct}%"></div>`).join(``)}</div>`}function P(e,t){return e.map(e=>{let n=e[0]?.item.item_tier??0;return`
        <h3 class="item-tier-heading" id="tier-${n}">${t[n]??`Tier ${n}`}</h3>
        <div class="tier-item-grid">
          ${e.map(e=>R(e)).join(``)}
        </div>
      `}).join(``)}var F=[{label:`Laning Phase`,sub:`0 – 7 min`,lo:0,hi:7},{label:`Mid Game`,sub:`7 – 15 min`,lo:7,hi:15},{label:`Late Game`,sub:`15 – 25 min`,lo:15,hi:25},{label:`Endgame`,sub:`25+ min`,lo:25,hi:999}];function I(e){if(e.length===0)return`<p class="build-empty">No item data</p>`;let t=F.map(t=>{let n=e.filter(e=>e.peakMinute>=t.lo&&e.peakMinute<t.hi).sort((e,t)=>t.adjustedWinRate-e.adjustedWinRate);return{...t,items:n}}).filter(e=>e.items.length>0),n=new Set;return t.forEach(e=>{let t=new Map;for(let n of e.items){let e=n.item.item_slot_type??`unknown`;t.has(e)||t.set(e,n)}for(let e of t.values())n.add(e.item.id)}),t.map((e,t)=>`
        <div class="build-phase" data-phase-idx="${t}">
          <div class="build-phase-marker">
            <div class="build-phase-dot"></div>
            <div class="build-phase-line"></div>
          </div>
          <div class="build-phase-content">
            <span class="build-phase-label">${e.label}</span>
            <span class="build-phase-sub">${e.sub}</span>
            <div class="build-phase-items">
              ${e.items.map(e=>L(e,n.has(e.item.id))).join(``)}
            </div>
          </div>
        </div>
      `).join(``)}function L(e,t){let n=(e.winRate*100).toFixed(1),r=e.winRate*100,i=e.item.item_slot_type??``,a=e.item.cost??0,o=a>0?`${(a/1e3).toFixed(+(a>=1e3))}k`:``,s=N(e.timeDistribution);return`
    <div class="build-item${t?` top-pick`:``}" data-item-id="${e.item.id}" data-slot="${i}">
      ${t?`<span class="top-pick-badge" title="Best pick for this slot & phase"></span>`:``}
      <img src="${e.item.image_webp}" alt="${e.item.name}" loading="lazy" />
      <div class="build-item-info">
        <span class="build-item-name">${e.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${j(r)}">${n}%</span>
          <span class="meta-tag">${i}</span>
          ${o?`<span class="meta-tag">${o}</span>`:``}
        </span>
        <span class="tier-item-meta">
          ${s||`<span class="meta-dim">~${Math.round(e.stat.avg_buy_time_s/60)}min</span>`}
          <span class="meta-dim">${e.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `}function R(e){let t=(e.winRate*100).toFixed(1),n=e.winRate*100,r=e.item.item_slot_type??``,i=e.item.cost??0,a=i>0?`${(i/1e3).toFixed(+(i>=1e3))}k`:``,o=N(e.timeDistribution);return`
    <div class="tier-item" data-item-id="${e.item.id}" data-slot="${r}">
      <img src="${e.item.image_webp}" alt="${e.item.name}" loading="lazy" />
      <div class="tier-item-info">
        <span class="tier-item-name">${e.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${j(n)}">${t}%</span>
          <span class="meta-tag">${r}</span>
          ${a?`<span class="meta-tag">${a}</span>`:``}
        </span>
        <span class="tier-item-meta">
          ${o||`<span class="meta-dim">~${Math.round(e.stat.avg_buy_time_s/60)}min</span>`}
          <span class="meta-dim">${e.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `}function z(e){if(!e.synergy)return``;let t=e.synergy,n=t.wins/t.matches_played*100,r=n.toFixed(1),i=t.matches_played||1,a=e.myHero?.name??`You`,o=e.teammate?.name??`Ally`;function s(e){return(e/i).toFixed(1)}function c(e){let t=e/i;return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(Math.round(t))}return`
    <section class="synergy-section">
      <h2>Lane Synergy</h2>
      <p class="synergy-with">with ${o}</p>
      <div class="synergy-stats">
        <div><span class="wr" style="color:${j(n)}">${r}%</span> WR</div>
        <div><span>${t.matches_played.toLocaleString()}</span> games</div>
      </div>
      <div class="synergy-detail">
        <div class="synergy-detail-header">
          <span></span>
          <span>${a}</span>
          <span>${o}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">K/D/A</span>
          <span>${s(t.kills1)}/${s(t.deaths1)}/${s(t.assists1)}</span>
          <span>${s(t.kills2)}/${s(t.deaths2)}/${s(t.assists2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Net Worth</span>
          <span>${c(t.networth1)}</span>
          <span>${c(t.networth2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Last Hits</span>
          <span>${s(t.last_hits1)}</span>
          <span>${s(t.last_hits2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Denies</span>
          <span>${s(t.denies1)}</span>
          <span>${s(t.denies2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Obj Damage</span>
          <span>${s(t.obj_damage1)}</span>
          <span>${s(t.obj_damage2)}</span>
        </div>
      </div>
    </section>
  `}function B(e){if(e.itemCombos.length===0)return``;let t=new Map(e.items.map(e=>[e.id,e]));return`
    <section class="combo-section">
      <h2>Item Combos</h2>
      <div class="combo-list">${e.itemCombos.slice(0,5).map(e=>{let n=(e.wins/e.matches*100).toFixed(1);return`
      <div class="combo-row">
        <span class="combo-names">${e.item_ids.map(e=>t.get(e)?.name??`Item ${e}`).join(` + `)}</span>
        <span class="combo-meta">
          <span class="wr">${n}%</span>
          <span class="meta-dim">${e.matches.toLocaleString()}</span>
        </span>
      </div>
    `}).join(``)}</div>
    </section>
  `}function V(e){let t=e.performanceCurve;if(!t||t.length<2)return``;let n=t[t.length-1].game_time,r=Math.max(...t.map(e=>e.net_worth_avg)),i=Math.max(...t.map(e=>e.kills_avg));function a(e){return 36+e/n*216}function o(e){return 116-e/r*104}function s(e){return 116-e/(i>0?i:1)*104}function c(e){return`${Math.round(e/60)}m`}function l(e){return e>=1e3?`${(e/1e3).toFixed(0)}k`:String(Math.round(e))}let u=t.map(e=>`${a(e.game_time)},${o(e.net_worth_avg)}`).join(` `),d=t.map(e=>`${a(e.game_time)},${s(e.kills_avg)}`).join(` `),f=t.filter((e,n)=>n%Math.ceil(t.length/5)===0||n===t.length-1),p=Array.from({length:5},(e,t)=>{let n=r/4*t,i=o(n);return`<line x1="36" y1="${i}" x2="252" y2="${i}" stroke="var(--border)" stroke-width="0.5" /><text x="32" y="${i+3}" text-anchor="end" fill="var(--text-dim)" font-size="8">${l(n)}</text>`}).join(``),m=Array.from({length:5},(e,t)=>{let n=i/4*t;return`<text x="256" y="${s(n)+3}" text-anchor="start" fill="var(--color-weapon)" font-size="8" opacity="0.8">${n.toFixed(1)}</text>`}).join(``),h=f.map(e=>`<text x="${a(e.game_time)}" y="136" text-anchor="middle" fill="var(--text-dim)" font-size="8">${c(e.game_time)}</text>`).join(``),g=t[t.reduce((e,n,r)=>n.net_worth_avg>t[e].net_worth_avg?r:e,0)];return`
    <section class="curve-section">
      <h2>Power Curve</h2>
      <p class="curve-peak-label">Peak net worth at <strong>${c(g.game_time)}</strong></p>
      <svg class="curve-svg" viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
        ${p}
        ${m}
        ${h}
        <polyline points="${u}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round" />
        <polyline points="${d}" fill="none" stroke="var(--color-weapon)" stroke-width="1" stroke-dasharray="3,2" stroke-linejoin="round" opacity="0.7" />
        <circle cx="${a(g.game_time)}" cy="${o(g.net_worth_avg)}" r="3" fill="var(--accent)" />
      </svg>
      <div class="curve-legend">
        <span class="curve-legend-item"><span class="curve-legend-dot" style="background:var(--accent)"></span> Net Worth</span>
        <span class="curve-legend-item"><span class="curve-legend-dot" style="background:var(--color-weapon)"></span> Kills</span>
      </div>
    </section>
  `}document.documentElement.dataset.theme=localStorage.getItem(`theme`)??`solarized-dark`;var H={view:`hero-select`,counterTab:`tier`,myHero:null,teammate:null,enemies:[null,null],heroes:[],items:[],allMatchups:[],counterItems:[],itemTimeBuckets:[],matchups:[],synergy:null,abilityOrders:[],itemCombos:[],performanceCurve:[],loading:!1,error:null};async function U(){x({...H,loading:!0});try{let[e,t,n]=await Promise.all([a(),o(),l()]);H.heroes=e.filter(e=>e.player_selectable&&!e.disabled&&!e.in_development),H.items=t.filter(e=>e.type===`upgrade`&&e.shopable),H.allMatchups=n,x(H)}catch(e){H.error=`Failed to load hero/item data: ${e instanceof Error?e.message:String(e)}`,H.view=`hero-select`,x(H)}}window.addEventListener(`hero-selected`,e=>{H.myHero=e.detail,H.teammate=null,H.enemies=[null,null],H.view=`lane-config`,x(H)}),window.addEventListener(`navigate`,e=>{H.view=e.detail,H.error=null,H.counterTab=`tier`,x(H)}),window.addEventListener(`reset`,()=>{H.view=`hero-select`,H.counterTab=`tier`,H.myHero=null,H.teammate=null,H.enemies=[null,null],H.counterItems=[],H.itemTimeBuckets=[],H.matchups=[],H.synergy=null,H.abilityOrders=[],H.itemCombos=[],H.performanceCurve=[],H.loading=!1,H.error=null,x(H)}),window.addEventListener(`analyze`,async()=>{if(!(!H.myHero||!H.teammate||!H.enemies[0]||!H.enemies[1])){H.view=`results`,H.loading=!0,H.error=null,H.counterItems=[],H.itemTimeBuckets=[],H.matchups=[],H.synergy=null,H.abilityOrders=[],H.itemCombos=[],H.performanceCurve=[],x(H);try{let[e,t,n,r,i,a,o,l]=await Promise.all([s([H.enemies[0].id,H.enemies[1].id],H.myHero.id),c([H.enemies[0].id,H.enemies[1].id],H.myHero.id),u(H.myHero.id,H.enemies[0].id),u(H.myHero.id,H.enemies[1].id),d(H.myHero.id,H.teammate.id),f(H.myHero.id),p(H.myHero.id,2),m(H.myHero.id)]),h=new Set(H.items.map(e=>e.id));H.counterItems=G(e.filter(e=>h.has(e.item_id)&&e.matches>=500),H.items,t),H.itemTimeBuckets=t,H.matchups=[...n,...r],H.synergy=i.find(e=>e.hero_id1===H.myHero.id&&e.hero_id2===H.teammate.id||e.hero_id1===H.teammate.id&&e.hero_id2===H.myHero.id)??null,H.abilityOrders=K(a),H.itemCombos=o.filter(e=>e.matches>=100).sort((e,t)=>(t.wins+25)/(t.matches+50)-(e.wins+25)/(e.matches+50)).slice(0,5),H.performanceCurve=l}catch(e){H.error=`Failed to fetch analytics: ${e instanceof Error?e.message:String(e)}`}finally{H.loading=!1,x(H)}}});var W=[{lo:0,hi:5},{lo:5,hi:10},{lo:10,hi:15},{lo:15,hi:20},{lo:20,hi:25},{lo:25,hi:999}];function G(e,t,n){let r=new Map(t.map(e=>[e.id,e])),i=new Map;for(let e of n)i.has(e.item_id)||i.set(e.item_id,[]),i.get(e.item_id).push(e);return e.map(e=>{let t=r.get(e.item_id);if(!t)return null;let n=e.wins/e.matches,a=(e.wins+25)/(e.matches+50),o=i.get(e.item_id)??[],s=Math.round(e.avg_buy_time_s/60);o.length>0&&(s=o.reduce((e,t)=>t.matches>e.matches?t:e).bucket);let c=W.map(e=>({pct:0,matches:o.filter(t=>t.bucket>=e.lo&&t.bucket<e.hi).reduce((e,t)=>e+t.matches,0),isPeak:!1})),l=Math.max(...c.map(e=>e.matches),1),u=c.reduce((e,t,n)=>t.matches>c[e].matches?n:e,0);for(let e=0;e<c.length;e++)c[e].pct=c[e].matches>0?Math.max(Math.round(c[e].matches/l*100),8):0,c[e].isPeak=e===u&&c[e].matches>0;let d;return d=a>=.54?`S`:a>=.51?`A`:a>=.48?`B`:a>=.45?`C`:`D`,{item:t,stat:e,winRate:n,adjustedWinRate:a,tier:d,peakMinute:s,timeDistribution:c}}).filter(e=>e!==null).sort((e,t)=>t.adjustedWinRate-e.adjustedWinRate)}function K(e){return e.sort((e,t)=>{let n=e.wins/Math.max(e.wins+e.losses,1);return t.wins/Math.max(t.wins+t.losses,1)-n}).slice(0,3)}window.addEventListener(`counter-tab`,e=>{H.counterTab=e.detail,x(H)}),U();