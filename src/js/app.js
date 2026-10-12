// 小雨排版器 · 主逻辑

(function () {
  'use strict';

  // ---------- DOM ----------
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const themeSelect = document.getElementById('themeSelect');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fontSize = document.getElementById('fontSize');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const accentColors = document.getElementById('accentColors');
  const charCount = document.getElementById('charCount');
  const toast = document.getElementById('toast');

  // ---------- 状态 ----------
  let currentTheme = 'minimal';
  let currentAccent = null;
  let currentFontSize = 16;

  const STORAGE_KEY = 'huasheng-editor-state';

  // ---------- 初始化 ----------
  function init() {
    loadState();
    populateThemes();
    bindEvents();
    updatePreview();
  }

  // ---------- 主题下拉 ----------
  function populateThemes() {
    themeSelect.innerHTML = '';
    Object.keys(THEMES).forEach(function (key) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = THEMES[key].name + ' — ' + THEMES[key].desc;
      if (key === currentTheme) opt.selected = true;
      themeSelect.appendChild(opt);
    });
    populateAccentColors();
  }

  // ---------- 主题色 ----------
  function populateAccentColors() {
    const theme = THEMES[currentTheme];
    accentColors.innerHTML = '';
    (theme.accentColors || []).forEach(function (color) {
      const dot = document.createElement('span');
      dot.className = 'accent-dot';
      dot.style.background = color;
      dot.title = color;
      if (color === (currentAccent || theme.accent)) dot.classList.add('active');
      dot.addEventListener('click', function () {
        currentAccent = color;
        accentColors.querySelectorAll('.accent-dot').forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
        updatePreview();
        saveState();
      });
      accentColors.appendChild(dot);
    });
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    editor.addEventListener('input', function () {
      updatePreview();
      saveState();
    });

    themeSelect.addEventListener('change', function () {
      currentTheme = this.value;
      currentAccent = null;
      populateAccentColors();
      updatePreview();
      saveState();
    });

    fontSize.addEventListener('input', function () {
      currentFontSize = parseInt(this.value);
      fontSizeVal.textContent = currentFontSize + 'px';
      updatePreview();
      saveState();
    });

    copyBtn.addEventListener('click', copyToWechat);
    clearBtn.addEventListener('click', function () {
      if (confirm('确定清空全部内容？')) {
        editor.value = '';
        updatePreview();
        saveState();
      }
    });

    // 工具条插入组件
    document.querySelectorAll('.tool-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        insertSnippet(this.getAttribute('data-insert'));
      });
    });

    // 移动端标签切换
    document.querySelectorAll('.mobile-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const pane = this.getAttribute('data-pane');
        document.querySelectorAll('.mobile-tab').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        document.querySelector('.editor-pane').classList.toggle('active', pane === 'editor');
        document.querySelector('.preview-pane').classList.toggle('active', pane === 'preview');
      });
    });

    // 快捷键
    editor.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        copyToWechat();
      }
    });
  }

  // ---------- 插入组件片段 ----------
  function insertSnippet(type) {
    const snippets = {
      tip: '\n> 💡 **提示**\n> 这里是提示内容。\n',
      quote: '\n> 这里是引用内容。\n> —— 作者\n',
      divider: '\n---\n',
      image: '\n![图片描述](https://via.placeholder.com/680x300)\n',
      code: '\n```javascript\nconsole.log("hello");\n```\n',
    };
    const snippet = snippets[type];
    if (!snippet) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.slice(0, start) + snippet + editor.value.slice(end);
    editor.focus();
    editor.selectionStart = editor.selectionEnd = start + snippet.length;
    updatePreview();
    saveState();
  }

  // ---------- 预览更新 ----------
  function updatePreview() {
    const input = editor.value;
    charCount.textContent = input.length + ' 字';
    if (!input.trim()) {
      preview.innerHTML = '<p style="color:#999;text-align:center;padding:40px 0;">在左侧输入 Markdown，这里实时预览</p>';
      return;
    }
    try {
      const html = HuashengConverter.convert(input, THEMES[currentTheme], {
        fontSize: currentFontSize,
        accentColor: currentAccent,
      });
      preview.innerHTML = html;
    } catch (e) {
      console.error(e);
      preview.innerHTML = '<p style="color:#c00;">转换出错：' + e.message + '</p>';
    }
  }

  // ---------- 复制到公众号 ----------
  function copyToWechat() {
    const input = editor.value;
    if (!input.trim()) {
      showToast('请先输入内容');
      return;
    }
    const html = HuashengConverter.convert(input, THEMES[currentTheme], {
      fontSize: currentFontSize,
      accentColor: currentAccent,
    });

    // 用 Clipboard API 写富文本
    function fallbackCopy() {
      const blob = new Blob([html], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([input], { type: 'text/plain' }) });
      navigator.clipboard.write([item]).then(function () {
        showToast('✅ 已复制，去公众号粘贴吧');
      }).catch(function () {
        legacyCopy(html);
      });
    }

    function legacyCopy(html) {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.innerHTML = html;
      div.style.position = 'fixed';
      div.style.left = '-9999px';
      document.body.appendChild(div);
      const range = document.createRange();
      range.selectNodeContents(div);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      document.body.removeChild(div);
      showToast('✅ 已复制，去公众号粘贴吧');
    }

    if (navigator.clipboard && window.ClipboardItem) {
      fallbackCopy();
    } else {
      legacyCopy(html);
    }
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  // ---------- 状态持久化 ----------
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        content: editor.value,
        theme: currentTheme,
        accent: currentAccent,
        fontSize: currentFontSize,
      }));
    } catch (e) { /* 存储满则忽略 */ }
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (s.content) editor.value = s.content;
      if (s.theme) currentTheme = s.theme;
      if (s.accent) currentAccent = s.accent;
      if (s.fontSize) {
        currentFontSize = s.fontSize;
        fontSize.value = s.fontSize;
        fontSizeVal.textContent = s.fontSize + 'px';
      }
    } catch (e) { /* ignore */ }
  }

  // ---------- 启动 ----------
  init();
})();
