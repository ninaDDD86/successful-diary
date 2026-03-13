function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function loadState() {
    const raw = localStorage.getItem('quest_data');
    const state = raw ? JSON.parse(raw) : { history: [] };
    if (!Array.isArray(state.history)) state.history = [];
    return state;
}

function indexHistoryByDate(history) {
    const map = new Map();
    history.forEach(item => {
        if (!item || !item.dateKey) return;
        // 同一天理论上只会有一条；如果有多条，保留最新一条
        const prev = map.get(item.dateKey);
        if (!prev || (item.ts || 0) > (prev.ts || 0)) map.set(item.dateKey, item);
    });
    return map;
}

function ymdToDate(ymd) {
    const [y, m, d] = ymd.split('-').map(n => parseInt(n, 10));
    return new Date(y, m - 1, d);
}

function formatMonthTitle(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    return `${y} 年 ${m} 月`;
}

function mondayFirstDayIndex(jsDay) {
    // JS: 0=Sun..6=Sat -> Monday-first: 0=Mon..6=Sun
    return (jsDay + 6) % 7;
}

let viewMonth = new Date();
viewMonth.setDate(1);

const els = {
    title: document.getElementById('cal-title'),
    grid: document.getElementById('cal-grid'),
    detail: document.getElementById('day-detail'),
    prev: document.getElementById('prev-month'),
    next: document.getElementById('next-month'),
};

const todayKey = getLocalDateKey();

function render() {
    const state = loadState();
    const byDate = indexHistoryByDate(state.history);

    els.title.innerText = formatMonthTitle(viewMonth);
    els.grid.innerHTML = '';

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth(); // 0-11
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = mondayFirstDayIndex(first.getDay());
    const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

    const selectedKey = els.grid.dataset.selectedKey || '';

    for (let i = 0; i < totalCells; i++) {
        const dayNum = i - leading + 1;
        const cell = document.createElement('div');
        cell.className = 'day';

        if (dayNum < 1 || dayNum > daysInMonth) {
            cell.classList.add('is-empty');
            els.grid.appendChild(cell);
            continue;
        }

        const date = new Date(year, month, dayNum);
        const key = getLocalDateKey(date);
        cell.dataset.dateKey = key;

        if (key === todayKey) cell.classList.add('is-today');
        if (byDate.has(key)) cell.classList.add('has-entry');
        if (key === selectedKey) cell.classList.add('is-selected');

        const badge = byDate.has(key) ? `<div class="day-badge">有记录</div>` : '';
        cell.innerHTML = `<div class="day-num">${dayNum}</div>${badge}`;

        cell.onclick = () => {
            els.grid.dataset.selectedKey = key;
            showDetail(key, byDate.get(key));
            render();
        };

        els.grid.appendChild(cell);
    }

    // 默认选中：本月的今天（如果在本月），否则选中本月最新一条记录
    if (!els.grid.dataset.selectedKey) {
        const isTodayInMonth = ymdToDate(todayKey).getFullYear() === year && ymdToDate(todayKey).getMonth() === month;
        if (isTodayInMonth) {
            els.grid.dataset.selectedKey = todayKey;
            showDetail(todayKey, byDate.get(todayKey));
        } else {
            const keys = [...byDate.keys()].filter(k => ymdToDate(k).getFullYear() === year && ymdToDate(k).getMonth() === month);
            keys.sort((a, b) => (a < b ? 1 : -1));
            if (keys[0]) {
                els.grid.dataset.selectedKey = keys[0];
                showDetail(keys[0], byDate.get(keys[0]));
            }
        }
    }
}

function showDetail(dateKey, item) {
    if (!item) {
        els.detail.classList.add('muted');
        els.detail.innerHTML = `这一天（${dateKey}）没有记录。`;
        return;
    }

    els.detail.classList.remove('muted');
    const lines = [
        `⚔️ ${item.main}`,
        `🍃 ${item.side}`,
        `🛡️ ${item.shield}`,
    ].join('\n');

    els.detail.innerHTML = `
        <div class="history-item">
            <div class="history-date">
                <span>${item.dateKey}</span>
                <span>+${item.goldEarned} 💰</span>
            </div>
            <div class="history-lines">${lines}</div>
        </div>
    `;
}

els.prev.onclick = () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    els.grid.dataset.selectedKey = '';
    render();
};

els.next.onclick = () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    els.grid.dataset.selectedKey = '';
    render();
};

render();
