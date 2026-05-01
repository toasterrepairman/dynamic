(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://api.deadlock-api.com`,t=`https://assets.deadlock-api.com`,n=new Map,r=3600*1e3;async function i(e){let t=n.get(e);if(t&&Date.now()<t.expiry)return t.data;let i=await fetch(e);if(!i.ok)throw Error(`API error: ${i.status} ${i.statusText} — ${e}`);let a=await i.json();return n.set(e,{data:a,expiry:Date.now()+r}),a}function a(){return i(`${t}/v2/heroes`)}function o(){return i(`${t}/v2/items`)}function s(t,n){let r=new URLSearchParams;n!==void 0&&r.append(`hero_ids`,String(n));for(let e of t)r.append(`enemy_hero_ids`,String(e));return i(`${e}/v1/analytics/item-stats?${r}`)}function c(){return i(`${e}/v1/analytics/hero-counter-stats?same_lane_filter=true`)}function l(t,n,r=!0){let a=new URLSearchParams({hero_id:String(t),enemy_hero_id:String(n)});return r&&a.set(`same_lane_filter`,`true`),i(`${e}/v1/analytics/hero-counter-stats?${a}`)}function u(t,n){return i(`${e}/v1/analytics/hero-synergy-stats?${new URLSearchParams({hero_id1:String(t),hero_id2:String(n),same_lane_filter:`true`})}`)}function d(t){return i(`${e}/v1/analytics/ability-order-stats?hero_id=${t}`)}function f(t,n=2){return i(`${e}/v1/analytics/item-permutation-stats?${new URLSearchParams({hero_ids:String(t),comb_size:String(n),min_matches:`500`})}`)}function p(t){return i(`${e}/v1/analytics/player-performance-curve?${new URLSearchParams({hero_ids:String(t),resolution:`0`})}`)}var m=document.getElementById(`app`),h=null;function g(){return document.documentElement.dataset.theme??`solarized-dark`}function _(e){let t=g();return`
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
  `}function v(){let e=document.getElementById(`theme-select`);e&&e.addEventListener(`change`,()=>{let t=e.value;document.documentElement.dataset.theme=t,localStorage.setItem(`theme`,t)})}function y(){return`
    <footer class="app-footer">
      <span>Data from <a href="https://deadlock-api.com" target="_blank" rel="noopener">Deadlock API</a></span>
      <span class="footer-links">
        <a href="https://www.toast.cyou/" target="_blank" rel="noopener">toast.cyou</a>
        <a href="https://github.com/toasterrepairman" target="_blank" rel="noopener">GitHub</a>
      </span>
    </footer>
  `}function b(e){switch(e.view){case`hero-select`:S(e);break;case`lane-config`:T(e);break;case`results`:k(e);break}x(),v(),window.scrollTo({top:0,behavior:`smooth`})}function x(){let e=document.getElementById(`reset-btn`);e&&e.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`reset`))})}function S(e){let t=[...e.heroes].sort((e,t)=>e.name.localeCompare(t.name));m.innerHTML=`
    ${_(`Deadlock Counter-Build Guide`)}
    <section class="hero-select">
      <h2>Pick Your Hero</h2>
      <div class="hero-filters">
        <input type="search" id="hero-search" placeholder="Search heroes..." class="search-input" />
      </div>
      <div class="hero-grid" id="hero-grid">
        ${t.map(e=>C(e)).join(``)}
      </div>
    </section>
    ${y()}
  `,w(t)}function C(e){let[t,n,r]=e.colors.ui;return`
    <button class="hero-card" data-hero-id="${e.id}" style="--hero-color: rgb(${t},${n},${r})">
      <img src="${e.images.icon_hero_card_webp}" alt="${e.name}" loading="lazy" />
      <span class="hero-name">${e.name}</span>
    </button>
  `}function w(e){let t=document.getElementById(`hero-grid`),n=document.getElementById(`hero-search`);n.addEventListener(`input`,()=>{let r=n.value.toLowerCase();t.querySelectorAll(`.hero-card`).forEach(t=>{let n=e.find(e=>e.id===Number(t.dataset.heroId));if(!n)return;let i=n.name.toLowerCase().includes(r)||n.class_name.toLowerCase().includes(r);t.style.display=i?``:`none`})}),t.addEventListener(`click`,t=>{let n=t.target.closest(`.hero-card`);if(!n)return;let r=Number(n.dataset.heroId),i=e.find(e=>e.id===r);i&&window.dispatchEvent(new CustomEvent(`hero-selected`,{detail:i}))})}function T(e){let t=e.myHero,[n,r,i]=t.colors.ui,a=e.heroes.filter(e=>e.id!==t.id).sort((e,t)=>e.name.localeCompare(t.name)),o=e.allMatchups.filter(e=>e.hero_id===t.id).map(t=>({enemy:e.heroes.find(e=>e.id===t.enemy_hero_id),wr:t.wins/t.matches_played,games:t.matches_played})).filter(e=>e.enemy).sort((e,t)=>t.wr-e.wr);m.innerHTML=`
    ${_()}
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
              <span class="matchup-wr" style="color:${A(e.wr*100)}">${(e.wr*100).toFixed(1)}%</span>
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
            ${a.map(e=>E(e,`ally`)).join(``)}
          </div>
          <div class="selected-slot" id="ally-slot">
            ${e.teammate?D(e.teammate):`<span class="empty-slot">Select a teammate</span>`}
          </div>
        </div>

        <div class="picker-group enemy-group">
          <h3>Enemy Laners</h3>
          <div class="hero-mini-search">
            <input type="search" id="enemy-search" placeholder="Search..." class="search-input" />
          </div>
          <div class="hero-mini-grid" id="enemy-grid">
            ${a.map(e=>E(e,`enemy`)).join(``)}
          </div>
          <div class="enemy-slots">
            <div class="selected-slot" id="enemy-slot-0">
              ${e.enemies[0]?D(e.enemies[0]):`<span class="empty-slot">Enemy 1</span>`}
            </div>
            <div class="selected-slot" id="enemy-slot-1">
              ${e.enemies[1]?D(e.enemies[1]):`<span class="empty-slot">Enemy 2</span>`}
            </div>
          </div>
        </div>
      </div>

      <button class="analyze-btn" id="analyze-btn" disabled>
        Analyze Matchup
      </button>
    </section>
    ${y()}
  `,O(e,a)}function E(e,t){return`
    <button class="hero-mini" data-hero-id="${e.id}" data-role="${t}">
      <img src="${e.images.icon_image_small_webp}" alt="${e.name}" loading="lazy" />
      <span>${e.name}</span>
    </button>
  `}function D(e){return`
    <img src="${e.images.icon_image_small_webp}" alt="${e.name}" />
    <span>${e.name}</span>
    <button class="remove-btn" data-remove-hero="${e.id}">x</button>
  `}function O(e,t){let n=document.getElementById(`ally-grid`),r=document.getElementById(`enemy-grid`),i=document.getElementById(`ally-search`),a=document.getElementById(`enemy-search`),o=document.getElementById(`analyze-btn`);function s(e,t){e.addEventListener(`input`,()=>{let n=e.value.toLowerCase();t.querySelectorAll(`.hero-mini`).forEach(e=>{let t=e.querySelector(`span`).textContent.toLowerCase();e.style.display=t.includes(n)?``:`none`})})}s(i,n),s(a,r);function c(){let t=e.teammate!==null,n=e.enemies[0]!==null&&e.enemies[1]!==null;o.disabled=!(t&&n)}function l(){let t=document.getElementById(`ally-slot`);t.innerHTML=e.teammate?D(e.teammate):`<span class="empty-slot">Select a teammate</span>`;let n=document.getElementById(`enemy-slot-0`),r=document.getElementById(`enemy-slot-1`);n.innerHTML=e.enemies[0]?D(e.enemies[0]):`<span class="empty-slot">Enemy 1</span>`,r.innerHTML=e.enemies[1]?D(e.enemies[1]):`<span class="empty-slot">Enemy 2</span>`,u(),c()}function u(){let t=new Set;e.teammate&&t.add(e.teammate.id);for(let n of e.enemies)n&&t.add(n.id);e.myHero&&t.add(e.myHero.id),document.querySelectorAll(`.hero-mini`).forEach(e=>{let n=Number(e.dataset.heroId);e.classList.toggle(`picked`,t.has(n))})}n.addEventListener(`click`,n=>{let r=n.target.closest(`.hero-mini`);if(!r||r.classList.contains(`picked`))return;let i=t.find(e=>e.id===Number(r.dataset.heroId));i&&(e.teammate=i,l())}),r.addEventListener(`click`,n=>{let r=n.target.closest(`.hero-mini`);if(!r||r.classList.contains(`picked`))return;let i=t.find(e=>e.id===Number(r.dataset.heroId));i&&(e.enemies[0]?e.enemies[1]?(e.enemies[1]=e.enemies[0],e.enemies[0]=i):e.enemies[1]=i:e.enemies[0]=i,l())}),m.addEventListener(`click`,t=>{let n=t.target.closest(`.remove-btn`);if(!n)return;let r=Number(n.dataset.removeHero);e.teammate?.id===r&&(e.teammate=null),e.enemies[0]?.id===r&&(e.enemies[0]=null),e.enemies[1]?.id===r&&(e.enemies[1]=null),e.enemies[0]===null&&e.enemies[1]!==null&&(e.enemies[0]=e.enemies[1],e.enemies[1]=null),l()}),document.getElementById(`back-heroes`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`navigate`,{detail:`hero-select`}))}),o.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`analyze`))}),u(),c()}function k(e){if(e.loading){m.innerHTML=`
      ${_()}
      <div class="loading">
        <div class="spinner"></div>
        <p>Fetching matchup data...</p>
      </div>
      ${y()}
    `;return}if(e.error){m.innerHTML=`
      ${_()}
      <div class="error-box">
        <p>${e.error}</p>
        <button id="retry-btn" class="analyze-btn">Retry</button>
      </div>
      ${y()}
    `,document.getElementById(`retry-btn`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`analyze`))});return}let t=e.myHero,[n,r,i]=t.colors.ui,a=new Map;for(let t of e.counterItems){let e=t.item.item_tier??0;a.has(e)||a.set(e,[]),a.get(e).push(t)}let o=[...a.entries()].sort(([e],[t])=>e-t).map(([,e])=>e.sort((e,t)=>t.winRate-e.winRate));m.innerHTML=`
    ${_()}
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
            ${e.counterTab===`tier`?j(o,{1:`Tier 1`,2:`Tier 2`,3:`Tier 3`,4:`Tier 4`,5:`Tier 5`}):M(e.counterItems)}
          </section>
        </div>

        <div class="results-sidebar">
          ${F(e)}
          ${L(e)}
          ${I(e)}
        </div>
      </div>
    </section>
    ${y()}
  `,document.getElementById(`back-config`).addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`navigate`,{detail:`lane-config`}))}),document.querySelectorAll(`.counter-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;window.dispatchEvent(new CustomEvent(`counter-tab`,{detail:t}))})});let s=0;function c(e){e?.scrollIntoView({behavior:`smooth`,block:`start`})}function l(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLSelectElement))if(e.counterTab===`tier`){let e=parseInt(t.key);e>=1&&e<=5&&(t.preventDefault(),c(document.getElementById(`tier-${e}`)))}else{let e=document.querySelectorAll(`[data-phase-idx]`);if(e.length===0)return;t.key===`1`?(t.preventDefault(),s=Math.max(0,s-1),c(e[s])):t.key===`3`&&(t.preventDefault(),s=Math.min(e.length-1,s+1),c(e[s]))}}h&&document.removeEventListener(`keydown`,h),h=l,document.addEventListener(`keydown`,l)}function A(e){let t=Math.max(0,Math.min(1,(e-40)/20));return`rgb(${Math.round(255*(1-t))},${Math.round(255*t)},0)`}function j(e,t){return e.map(e=>{let n=e[0]?.item.item_tier??0;return`
        <h3 class="item-tier-heading" id="tier-${n}">${t[n]??`Tier ${n}`}</h3>
        <div class="tier-item-grid">
          ${e.map(e=>P(e)).join(``)}
        </div>
      `}).join(``)}function M(e){if(e.length===0)return`<p class="build-empty">No item data</p>`;let t=Math.max(...e.map(e=>e.stat.avg_buy_time_s)),n=Math.ceil(t/120),r=[];for(let t=0;t<=n;t++){let n=t*120,i=(t+1)*120,a=e.filter(e=>e.stat.avg_buy_time_s>=n&&e.stat.avg_buy_time_s<i).sort((e,t)=>t.adjustedWinRate-e.adjustedWinRate);a.length>0&&r.push({min:n,max:i,items:a})}let i=new Set;return r.forEach(e=>{let t=new Map;for(let n of e.items){let e=n.item.item_slot_type??`unknown`;t.has(e)||t.set(e,n)}for(let e of t.values())i.add(e.item.id)}),r.map((e,t)=>`
        <div class="build-phase" data-phase-idx="${t}">
          <div class="build-phase-marker">
            <div class="build-phase-dot"></div>
            <div class="build-phase-line"></div>
          </div>
          <div class="build-phase-content">
            <span class="build-phase-label">${Math.floor(e.min/60)}–${Math.floor(e.max/60)} min</span>
            <div class="build-phase-items">
              ${e.items.map(e=>N(e,i.has(e.item.id))).join(``)}
            </div>
          </div>
        </div>
      `).join(``)}function N(e,t){let n=(e.winRate*100).toFixed(1),r=e.winRate*100,i=Math.round(e.stat.avg_buy_time_s/60),a=e.item.item_slot_type??``,o=e.item.cost??0,s=o>0?`${(o/1e3).toFixed(+(o>=1e3))}k`:``;return`
    <div class="build-item${t?` top-pick`:``}" data-item-id="${e.item.id}" data-slot="${a}">
      ${t?`<span class="top-pick-badge" title="Best pick for this slot & phase"></span>`:``}
      <img src="${e.item.image_webp}" alt="${e.item.name}" loading="lazy" />
      <div class="build-item-info">
        <span class="build-item-name">${e.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${A(r)}">${n}%</span>
          <span class="meta-tag">${a}</span>
          ${s?`<span class="meta-tag">${s}</span>`:``}
        </span>
        <span class="tier-item-meta">
          <span class="meta-dim">~${i}min</span>
          <span class="meta-dim">${e.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `}function P(e){let t=(e.winRate*100).toFixed(1),n=e.winRate*100,r=Math.round(e.stat.avg_buy_time_s/60),i=e.item.item_slot_type??``,a=e.item.cost??0,o=a>0?`${(a/1e3).toFixed(+(a>=1e3))}k`:``;return`
    <div class="tier-item" data-item-id="${e.item.id}" data-slot="${i}">
      <img src="${e.item.image_webp}" alt="${e.item.name}" loading="lazy" />
      <div class="tier-item-info">
        <span class="tier-item-name">${e.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${A(n)}">${t}%</span>
          <span class="meta-tag">${i}</span>
          ${o?`<span class="meta-tag">${o}</span>`:``}
        </span>
        <span class="tier-item-meta">
          <span class="meta-dim">~${r}min</span>
          <span class="meta-dim">${e.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `}function F(e){if(!e.synergy)return``;let t=e.synergy,n=t.wins/t.matches_played*100,r=n.toFixed(1),i=t.matches_played||1,a=e.myHero?.name??`You`,o=e.teammate?.name??`Ally`;function s(e){return(e/i).toFixed(1)}function c(e){let t=e/i;return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(Math.round(t))}return`
    <section class="synergy-section">
      <h2>Lane Synergy</h2>
      <p class="synergy-with">with ${o}</p>
      <div class="synergy-stats">
        <div><span class="wr" style="color:${A(n)}">${r}%</span> WR</div>
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
  `}function I(e){if(e.itemCombos.length===0)return``;let t=new Map(e.items.map(e=>[e.id,e]));return`
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
  `}function L(e){let t=e.performanceCurve;if(!t||t.length<2)return``;let n=t[t.length-1].game_time,r=Math.max(...t.map(e=>e.net_worth_avg)),i=Math.max(...t.map(e=>e.kills_avg));function a(e){return 36+e/n*216}function o(e){return 116-e/r*104}function s(e){return 116-e/(i>0?i:1)*104}function c(e){return`${Math.round(e/60)}m`}function l(e){return e>=1e3?`${(e/1e3).toFixed(0)}k`:String(Math.round(e))}let u=t.map(e=>`${a(e.game_time)},${o(e.net_worth_avg)}`).join(` `),d=t.map(e=>`${a(e.game_time)},${s(e.kills_avg)}`).join(` `),f=t.filter((e,n)=>n%Math.ceil(t.length/5)===0||n===t.length-1),p=Array.from({length:5},(e,t)=>{let n=r/4*t,i=o(n);return`<line x1="36" y1="${i}" x2="252" y2="${i}" stroke="var(--border)" stroke-width="0.5" /><text x="32" y="${i+3}" text-anchor="end" fill="var(--text-dim)" font-size="8">${l(n)}</text>`}).join(``),m=Array.from({length:5},(e,t)=>{let n=i/4*t;return`<text x="256" y="${s(n)+3}" text-anchor="start" fill="var(--color-weapon)" font-size="8" opacity="0.8">${n.toFixed(1)}</text>`}).join(``),h=f.map(e=>`<text x="${a(e.game_time)}" y="136" text-anchor="middle" fill="var(--text-dim)" font-size="8">${c(e.game_time)}</text>`).join(``),g=t[t.reduce((e,n,r)=>n.net_worth_avg>t[e].net_worth_avg?r:e,0)];return`
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
  `}document.documentElement.dataset.theme=localStorage.getItem(`theme`)??`solarized-dark`;var R={view:`hero-select`,counterTab:`tier`,myHero:null,teammate:null,enemies:[null,null],heroes:[],items:[],allMatchups:[],counterItems:[],matchups:[],synergy:null,abilityOrders:[],itemCombos:[],performanceCurve:[],loading:!1,error:null};async function z(){b({...R,loading:!0});try{let[e,t,n]=await Promise.all([a(),o(),c()]);R.heroes=e.filter(e=>e.player_selectable&&!e.disabled&&!e.in_development),R.items=t.filter(e=>e.type===`upgrade`&&e.shopable),R.allMatchups=n,b(R)}catch(e){R.error=`Failed to load hero/item data: ${e instanceof Error?e.message:String(e)}`,R.view=`hero-select`,b(R)}}window.addEventListener(`hero-selected`,e=>{R.myHero=e.detail,R.teammate=null,R.enemies=[null,null],R.view=`lane-config`,b(R)}),window.addEventListener(`navigate`,e=>{R.view=e.detail,R.error=null,R.counterTab=`tier`,b(R)}),window.addEventListener(`reset`,()=>{R.view=`hero-select`,R.counterTab=`tier`,R.myHero=null,R.teammate=null,R.enemies=[null,null],R.counterItems=[],R.matchups=[],R.synergy=null,R.abilityOrders=[],R.itemCombos=[],R.performanceCurve=[],R.loading=!1,R.error=null,b(R)}),window.addEventListener(`analyze`,async()=>{if(!(!R.myHero||!R.teammate||!R.enemies[0]||!R.enemies[1])){R.view=`results`,R.loading=!0,R.error=null,R.counterItems=[],R.matchups=[],R.synergy=null,R.abilityOrders=[],R.itemCombos=[],R.performanceCurve=[],b(R);try{let[e,t,n,r,i,a,o]=await Promise.all([s([R.enemies[0].id,R.enemies[1].id],R.myHero.id),l(R.myHero.id,R.enemies[0].id),l(R.myHero.id,R.enemies[1].id),u(R.myHero.id,R.teammate.id),d(R.myHero.id),f(R.myHero.id,2),p(R.myHero.id)]),c=new Set(R.items.map(e=>e.id));R.counterItems=B(e.filter(e=>c.has(e.item_id)&&e.matches>=500),R.items),R.matchups=[...t,...n],R.synergy=r.find(e=>e.hero_id1===R.myHero.id&&e.hero_id2===R.teammate.id||e.hero_id1===R.teammate.id&&e.hero_id2===R.myHero.id)??null,R.abilityOrders=V(i),R.itemCombos=a.filter(e=>e.matches>=100).sort((e,t)=>(t.wins+25)/(t.matches+50)-(e.wins+25)/(e.matches+50)).slice(0,5),R.performanceCurve=o}catch(e){R.error=`Failed to fetch analytics: ${e instanceof Error?e.message:String(e)}`}finally{R.loading=!1,b(R)}}});function B(e,t){let n=new Map(t.map(e=>[e.id,e]));return e.map(e=>{let t=n.get(e.item_id);if(!t)return null;let r=e.wins/e.matches,i=(e.wins+25)/(e.matches+50),a;return a=i>=.54?`S`:i>=.51?`A`:i>=.48?`B`:i>=.45?`C`:`D`,{item:t,stat:e,winRate:r,adjustedWinRate:i,tier:a}}).filter(e=>e!==null).sort((e,t)=>t.adjustedWinRate-e.adjustedWinRate)}function V(e){return e.sort((e,t)=>{let n=e.wins/Math.max(e.wins+e.losses,1);return t.wins/Math.max(t.wins+t.losses,1)-n}).slice(0,3)}window.addEventListener(`counter-tab`,e=>{R.counterTab=e.detail,b(R)}),z();