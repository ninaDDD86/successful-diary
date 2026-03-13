// 数据初始化
let state = JSON.parse(localStorage.getItem('quest_data')) || {
    gold: 0,
    rewards: [
        { name: "大餐一顿", cost: 500 },
        { name: "新电子设备", cost: 2000 }
    ],
    daily: {
        lastSubmittedDateKey: null
    },
    history: []
};

// 音效（请在同目录放入这几个 mp3 文件）
const sClick = new Audio('click.mp3');      // 按钮点击
const sSuccess = new Audio('success.mp3');  // 完成任务 / 抽到奖励
const sError = new Audio('error.mp3');      // 填写不完整 / 金币不足

const blindBoxRewards = [
    "喝一杯喜欢的饮料",
    "吃一块巧克力",
    "看5分钟短视频",
    "听一首喜欢的歌",
    "发呆3分钟",
    "伸个懒腰",
    "吃一小块水果",
    "在窗边站2分钟",
    "刷5分钟社交媒体",
    "看一页小说",
    "看一页漫画",
    "做一次深呼吸练习",
    "给朋友发一条消息",
    "记录一句今天的想法",
    "吃一颗糖",
    "闭眼休息2分钟",
    "在纸上乱画",
    "整理一下桌面",
    "看一张搞笑图片",
    "听一段轻音乐",
    "喝一杯热茶",
    "看一个搞笑视频",
    "走动3分钟",
    "听一段播客",
    "写一句鼓励自己的话",
    "打开窗户呼吸空气",
    "吃一点坚果",
    "玩一局小游戏",
    "打开音乐摇头30秒",
    "拉伸肩膀",
    "看一张风景图片",
    "刷一条新闻",
    "写一句待办完成记录",
    "给自己点个赞",
    "站起来走两步",
    "看一个表情包",
    "吃一块饼干",
    "洗一下手",
    "轻轻活动脖子",
    "听一段白噪音",
    "看一个有趣的知识点",
    "打开地图随便看一个城市",
    "听一段自然声音",
    "做一次深呼吸",
    "写一句随笔",
    "看一张猫咪图片",
    "看一张狗狗图片",
    "喝一口水",
    "看一条有趣评论",
    "看一个段子",
    "想一件开心的小事",
    "站起来伸展手臂",
    "做3次深呼吸",
    "看一个冷知识",
    "想一下今天完成的事情",
    "看一段动画",
    "听一段节奏音乐",
    "轻轻转动肩膀",
    "看一个笑话",
    "吃一点小零食",
    "看一张漂亮照片",
    "在笔记本上画个小图案",
    "轻轻活动手腕",
    "看一条励志短句",
    "听一段环境音",
    "打开窗帘看看外面",
    "喝一口咖啡",
    "在椅子上放松1分钟",
    "看一个趣味问题",
    "想一个未来的小计划",
    "写一句今天学到的东西",
    "看一个历史小故事",
    "看一个科普小知识",
    "听一小段音乐循环",
    "做一个小微笑",
    "轻轻拍拍脸放松",
    "看一张治愈图片",
    "打开灯看看房间",
    "轻轻晃晃身体",
    "看一个小游戏推荐",
    "吃一颗坚果",
    "写一个新想法",
    "看一个表情包合集",
    "听一个短音效",
    "轻轻揉揉手",
    "做一次伸展",
    "看一段风景视频",
    "想象一次旅行",
    "给未来的自己一句话",
    "记录一个灵感",
    "看一个设计图片",
    "打开相册看看旧照片",
    "写一句感谢的话",
    "看一个有趣的数字",
    "想一个小目标",
    "做3次深呼吸放松",
    "看一条正能量句子",
    "想一个喜欢的食物",
    "轻轻闭眼1分钟",
    "对自己说一句“完成了，做得不错”"
];

function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function normalizeState() {
    if (!state.daily) state.daily = { lastSubmittedDateKey: null };
    if (!('lastSubmittedDateKey' in state.daily)) state.daily.lastSubmittedDateKey = null;
    if (!Array.isArray(state.history)) state.history = [];
}

function setDailyLocked(locked, hintText = '') {
    const inputs = [
        document.getElementById('q-main'),
        document.getElementById('q-side'),
        document.getElementById('q-shield'),
    ];
    const btn = document.getElementById('submit-quest');
    inputs.forEach(i => i.disabled = locked);
    btn.disabled = locked;
    btn.style.opacity = locked ? '0.6' : '1';
    btn.style.cursor = locked ? 'not-allowed' : 'pointer';

    const hint = document.getElementById('daily-lock-hint');
    if (!hint) return;
    hint.innerText = hintText;
    hint.classList.toggle('hidden', !hintText);
}

function save() {
    localStorage.setItem('quest_data', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    normalizeState();
    document.getElementById('gold-count').innerText = state.gold;
    const rewardContainer = document.getElementById('fixed-rewards');
    rewardContainer.innerHTML = '';

    state.rewards.forEach((r, idx) => {
        const progress = Math.min((state.gold / r.cost) * 100, 100);
        rewardContainer.innerHTML += `
            <div class="reward-item" data-reward-index="${idx}">
                <div style="display:flex; justify-content:space-between; font-size:12px">
                    <span>${r.name}</span>
                    <span>${state.gold}/${r.cost} 💰</span>
                </div>
                <div class="progress-bg"><div class="progress-fill" style="width:${progress}%"></div></div>
            </div>
        `;
    });

    const todayKey = getLocalDateKey();
    const locked = state.daily.lastSubmittedDateKey === todayKey;
    if (locked) {
        setDailyLocked(true, `今日副本已交付（${todayKey}）。明天再来一次吧！`);
    } else {
        setDailyLocked(false, '');
    }

    // 绑定大奖点击 -> 进入编辑模式
    const items = rewardContainer.querySelectorAll('.reward-item');
    const nameInput = document.getElementById('reward-name');
    const costInput = document.getElementById('reward-cost');
    items.forEach(el => {
        el.onclick = () => {
            const idx = parseInt(el.dataset.rewardIndex, 10);
            const r = state.rewards[idx];
            if (!r) return;

            const all = rewardContainer.querySelectorAll('.reward-item');
            all.forEach(i => i.classList.remove('selected'));
            el.classList.add('selected');

            if (nameInput) nameInput.value = r.name;
            if (costInput) costInput.value = r.cost;
        };
    });
}

// 交付任务
document.getElementById('submit-quest').onclick = () => {
    normalizeState();
    const q1 = document.getElementById('q-main').value;
    const q2 = document.getElementById('q-side').value;
    const q3 = document.getElementById('q-shield').value;

    // 点击音效
    sClick.currentTime = 0;
    sClick.play();

    const todayKey = getLocalDateKey();
    if (state.daily.lastSubmittedDateKey === todayKey) {
        sError.currentTime = 0;
        sError.play();
        return alert(`今天（${todayKey}）已经交付过一次了，明天再来吧！`);
    }

    if (!q1 || !q2 || !q3) {
        sError.currentTime = 0;
        sError.play();
        return alert("勇士，任务槽还未填满！");
    }

    // 视觉反馈
    document.getElementById('game-container').classList.add('shake');
    const stamp = document.getElementById('stamp-overlay');
    stamp.classList.remove('hidden', 'animate-stamp');
    void stamp.offsetWidth;
    stamp.classList.add('animate-stamp');

    setTimeout(() => {
        const earned = 100;
        state.gold += earned;
        state.daily.lastSubmittedDateKey = todayKey;
        state.history.push({
            dateKey: todayKey,
            main: q1,
            side: q2,
            shield: q3,
            goldEarned: earned,
            ts: Date.now()
        });
        document.getElementById('q-main').value = '';
        document.getElementById('q-side').value = '';
        document.getElementById('q-shield').value = '';
        document.getElementById('game-container').classList.remove('shake');

        sSuccess.currentTime = 0;
        sSuccess.play();
        save();
    }, 500);
};

// 开启盲盒
document.getElementById('open-box').onclick = () => {
    // 点击音效
    sClick.currentTime = 0;
    sClick.play();

    if (state.gold < 50) {
        sError.currentTime = 0;
        sError.play();
        return alert("金币不足！快去刷本！");
    }
    
    state.gold -= 50;
    const result = blindBoxRewards[Math.floor(Math.random() * blindBoxRewards.length)];
    const boxDisplay = document.getElementById('box-result');
    
    boxDisplay.innerText = `🎁 获得奖励：${result}`;
    boxDisplay.classList.remove('hidden');

    sSuccess.currentTime = 0;
    sSuccess.play();
    save();
};

normalizeState();
updateUI();

// 添加 / 更新 大奖
const addRewardBtn = document.getElementById('add-reward');
const deleteRewardBtn = document.getElementById('delete-reward');
if (addRewardBtn) {
    addRewardBtn.onclick = () => {
        sClick.currentTime = 0;
        sClick.play();

        const nameInput = document.getElementById('reward-name');
        const costInput = document.getElementById('reward-cost');
        const name = (nameInput.value || '').trim();
        const cost = parseInt(costInput.value, 10);

        if (!name) {
            sError.currentTime = 0;
            sError.play();
            return alert('请先填好“大奖名称”。');
        }
        if (!cost || cost <= 0) {
            sError.currentTime = 0;
            sError.play();
            return alert('请填写一个大于 0 的金币数。');
        }

        normalizeState();
        if (!Array.isArray(state.rewards)) state.rewards = [];

        const idx = state.rewards.findIndex(r => r.name === name);
        if (idx >= 0) {
            state.rewards[idx].cost = cost;
        } else {
            state.rewards.push({ name, cost });
        }

        sSuccess.currentTime = 0;
        sSuccess.play();
        save();
    };
}

if (deleteRewardBtn) {
    deleteRewardBtn.onclick = () => {
        sClick.currentTime = 0;
        sClick.play();

        const nameInput = document.getElementById('reward-name');
        const name = (nameInput.value || '').trim();
        if (!name) {
            sError.currentTime = 0;
            sError.play();
            return alert('请先在上方选择或输入要删除的大奖名称。');
        }

        normalizeState();
        if (!Array.isArray(state.rewards)) state.rewards = [];

        const before = state.rewards.length;
        state.rewards = state.rewards.filter(r => r.name !== name);
        if (state.rewards.length === before) {
            sError.currentTime = 0;
            sError.play();
            return alert('没有找到同名的大奖可以删除。');
        }

        nameInput.value = '';
        const costInput = document.getElementById('reward-cost');
        if (costInput) costInput.value = '';

        sSuccess.currentTime = 0;
        sSuccess.play();
        save();
    };
}
