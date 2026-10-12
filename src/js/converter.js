// 花生排版器 · 核心转换引擎
// 把 Markdown 转成微信兼容的内联样式 HTML。
//
// 微信的坑：
// 1. 公众号编辑器屏蔽外链 CSS，必须每个标签带 style="" 内联
// 2. 微信会剥掉 class、id、script、link
// 3. 只认部分 CSS 属性
// 4. 代码高亮要把 highlight.js 的 class 样式转成内联 color

const HuashengConverter = (function () {
  'use strict';

  // ---------- Markdown-it 初始化 ----------
  let md = null;

  function getMd() {
    if (md) return md;
    md = window.markdownit({
      html: false,        // 微信会剥 script，禁掉原始 HTML 防注入
      breaks: true,       // 单换行也换行（中文习惯）
      linkify: true,      // 自动识别 URL
      typographer: true,  // 智能引号
      highlight: function (str, lang) {
        return highlightCode(str, lang);
      },
    });
    // 让标题带锚点 id（可选，微信里 id 会被剥，但复制流程保留）
    return md;
  }

  // ---------- 代码高亮（转内联 color） ----------
  function highlightCode(code, lang) {
    let highlighted;
    if (lang && window.hljs && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        highlighted = escapeHtml(code);
      }
    } else if (window.hljs) {
      // 自动检测语言
      try {
        highlighted = hljs.highlightAuto(code).value;
      } catch (e) {
        highlighted = escapeHtml(code);
      }
    } else {
      highlighted = escapeHtml(code);
    }
    // 返回带标记的容器，后续统一转内联
    return '<pre class="hljs-pre"><code class="hljs">' + highlighted + '</code></pre>';
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------- 主转换入口 ----------
  // input: Markdown 字符串
  // theme: 主题对象（含 vars）
  // options: { fontSize, accentColor }
  function convert(input, theme, options) {
    options = options || {};
    const v = Object.assign({}, theme.vars);
    if (options.fontSize) v.fontSize = options.fontSize + 'px';
    if (options.accentColor) v.linkColor = options.accentColor;

    // 1. Markdown -> 基础 HTML
    let html = getMd().render(input);

    // 2. 用 DOMParser 处理，转内联样式
    const doc = new DOMParser().parseFromString('<div id="root">' + html + '</div>', 'text/html');
    const root = doc.getElementById('root');

    // 3. 逐个节点应用内联样式
    inlineStyles(root, v);

    // 4. 处理代码高亮 span -> 内联 color
    inlineCodeColors(root);

    // 5. 清理微信不认的属性
    cleanup(root);

    // 6. 包一层 section（微信要求外层有 section 或 div）
    return '<section style="' + sectionStyle(v) + '">' + root.innerHTML + '</section>';
  }

  // ---------- 各节点内联样式 ----------
  function inlineStyles(root, v) {
    // 容器内所有元素
    const all = root.querySelectorAll('*');

    all.forEach(function (el) {
      const tag = el.tagName.toLowerCase();
      switch (tag) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6': {
          const level = parseInt(tag[1]);
          el.setAttribute('style', headingStyle(level, v));
          break;
        }
        case 'p':
          el.setAttribute('style', pStyle(v));
          break;
        case 'a':
          el.setAttribute('style', linkStyle(v));
          // 微信外链要保留，但加 target
          el.setAttribute('target', '_blank');
          break;
        case 'strong':
        case 'b':
          el.setAttribute('style', 'font-weight:bold;color:' + v.headingColor + ';');
          break;
        case 'em':
        case 'i':
          el.setAttribute('style', 'font-style:italic;');
          break;
        case 'blockquote':
          el.setAttribute('style', quoteStyle(v));
          break;
        case 'ul':
        case 'ol':
          el.setAttribute('style', listStyle(v));
          break;
        case 'li':
          el.setAttribute('style', liStyle(v));
          break;
        case 'code': {
          // 行内 code（非 pre 内）
          if (el.parentElement && el.parentElement.tagName.toLowerCase() !== 'pre') {
            el.setAttribute('style', inlineCodeStyle(v));
          }
          break;
        }
        case 'pre':
          el.setAttribute('style', preStyle(v));
          break;
        case 'img':
          el.setAttribute('style', imgStyle());
          el.setAttribute('data-src', el.getAttribute('src') || '');
          break;
        case 'hr':
          el.setAttribute('style', hrStyle(v));
          break;
        case 'table':
          el.setAttribute('style', tableStyle(v));
          break;
        case 'th':
          el.setAttribute('style', thStyle(v));
          break;
        case 'td':
          el.setAttribute('style', tdStyle(v));
          break;
      }
    });

    // 表格里的 p 不额外加段距
    root.querySelectorAll('td p, th p').forEach(function (p) {
      p.setAttribute('style', 'margin:0;');
    });
  }

  // ---------- 各节点样式定义 ----------
  function sectionStyle(v) {
    return [
      'font-family:' + v.fontFamily,
      'font-size:' + v.fontSize,
      'line-height:' + v.lineHeight,
      'color:' + v.color,
      'text-align:left',
      'word-break:break-word',
      'padding:0',
      'margin:0',
    ].join(';');
  }

  function headingStyle(level, v) {
    const sizes = { 1: '22px', 2: '20px', 3: '18px', 4: '16px', 5: '16px', 6: '16px' };
    const margins = { 1: '24px 0 16px', 2: '22px 0 14px', 3: '18px 0 12px', 4: '16px 0 10px', 5: '14px 0 8px', 6: '14px 0 8px' };
    return [
      'font-size:' + sizes[level],
      'font-weight:bold',
      'color:' + v.headingColor,
      'margin:' + margins[level],
      'line-height:1.4',
      'text-align:left',
    ].join(';');
  }

  function pStyle(v) {
    return [
      'margin:0 0 16px',
      'font-size:' + v.fontSize,
      'line-height:' + v.lineHeight,
      'color:' + v.color,
      'letter-spacing:0.5px',
      'text-align:justify',
    ].join(';');
  }

  function linkStyle(v) {
    return 'color:' + v.linkColor + ';text-decoration:none;border-bottom:1px solid ' + v.linkColor + ';word-break:break-all;';
  }

  function quoteStyle(v) {
    return [
      'margin:16px 0',
      'padding:12px 16px',
      'background:' + v.quoteBg,
      'border-left:4px solid ' + v.quoteBorder,
      'color:' + v.color,
      'font-size:15px',
      'line-height:1.7',
      'border-radius:0 4px 4px 0',
    ].join(';');
  }

  function listStyle(v) {
    return 'margin:0 0 16px;padding-left:24px;color:' + v.color + ';font-size:' + v.fontSize + ';line-height:' + v.lineHeight + ';';
  }

  function liStyle(v) {
    return 'margin:6px 0;line-height:' + v.lineHeight + ';';
  }

  function inlineCodeStyle(v) {
    return [
      'font-family:Menlo,Monaco,Consolas,"Courier New",monospace',
      'font-size:14px',
      'background:' + v.codeBg,
      'color:' + v.codeColor,
      'padding:2px 6px',
      'border-radius:3px',
      'margin:0 2px',
    ].join(';');
  }

  function preStyle(v) {
    return [
      'margin:16px 0',
      'padding:16px',
      'background:' + v.codeBg,
      'border-radius:6px',
      'overflow-x:auto',
      'font-size:13px',
      'line-height:1.6',
    ].join(';');
  }

  function imgStyle() {
    return 'max-width:100%;height:auto;display:block;margin:16px auto;border-radius:4px;';
  }

  function hrStyle(v) {
    return 'border:none;border-top:1px solid ' + v.hrColor + ';margin:24px 0;';
  }

  function tableStyle(v) {
    return 'width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;';
  }

  function thStyle(v) {
    return 'border:1px solid ' + v.hrColor + ';padding:8px 12px;background:' + v.quoteBg + ';font-weight:bold;text-align:left;color:' + v.headingColor + ';';
  }

  function tdStyle(v) {
    return 'border:1px solid ' + v.hrColor + ';padding:8px 12px;color:' + v.color + ';';
  }

  // ---------- 代码高亮 span -> 内联 color ----------
  function inlineCodeColors(root) {
    // hljs 的 class -> color 映射（常用语言通用色）
    const colorMap = {
      'hljs-keyword': '#d73a49',
      'hljs-string': '#032f62',
      'hljs-comment': '#6a737d',
      'hljs-number': '#005cc5',
      'hljs-function': '#6f42c1',
      'hljs-title': '#6f42c1',
      'hljs-params': '#24292e',
      'hljs-built_in': '#005cc5',
      'hljs-literal': '#005cc5',
      'hljs-attr': '#005cc5',
      'hljs-variable': '#e36209',
      'hljs-tag': '#22863a',
      'hljs-name': '#22863a',
      'hljs-type': '#d73a49',
      'hljs-symbol': '#005cc5',
      'hljs-meta': '#6a737d',
      'hljs-selector-tag': '#d73a49',
      'hljs-selector-class': '#6f42c1',
      'hljs-selector-id': '#6f42c1',
      'hljs-attribute': '#005cc5',
      'hljs-property': '#005cc5',
    };

    root.querySelectorAll('pre code span').forEach(function (span) {
      const classes = span.className.split(/\s+/);
      let color = null;
      for (const cls of classes) {
        if (colorMap[cls]) { color = colorMap[cls]; break; }
      }
      if (color) {
        span.setAttribute('style', 'color:' + color + ';');
      } else {
        span.removeAttribute('class');
      }
      span.removeAttribute('class');
    });
  }

  // ---------- 清理微信不认的属性 ----------
  function cleanup(root) {
    root.querySelectorAll('*').forEach(function (el) {
      // 去掉微信会剥的属性，避免冗余
      el.removeAttribute('class');
      el.removeAttribute('id');
      el.removeAttribute('name');
      // 保留 style、href、src、alt、target
    });
  }

  return { convert };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HuashengConverter;
}
