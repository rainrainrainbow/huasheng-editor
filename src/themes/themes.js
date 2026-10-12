// 小雨排版器主题定义
// 每套主题定义微信兼容的内联样式。微信只认部分 CSS，必须内联。
// 关键：所有样式都用 style="" 内联，不用 class（微信会剥掉 class）。

const THEMES = {
  // ========== 极简黑白 ==========
  minimal: {
    name: '极简黑白',
    desc: '干净克制，适合干货长文',
    accent: '#1a1a1a',
    accentColors: ['#1a1a1a', '#333333', '#666666', '#999999'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif',
      fontSize: '16px',
      lineHeight: '1.75',
      color: '#3f3f3f',
      headingColor: '#1a1a1a',
      linkColor: '#576b95',
      quoteBg: '#f7f7f7',
      quoteBorder: '#d0d0d0',
      codeBg: '#f6f8fa',
      codeColor: '#c7254e',
      hrColor: '#e0e0e0',
    },
  },

  // ========== 学术蓝 ==========
  academic: {
    name: '学术蓝',
    desc: '专业沉稳，适合技术/论文解读',
    accent: '#2c5aa0',
    accentColors: ['#2c5aa0', '#1e4272', '#4a7bc0', '#6b9bd1'],
    vars: {
      fontFamily: 'Georgia,"Times New Roman","Songti SC","SimSun",serif',
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#2c3e50',
      headingColor: '#1a3a5c',
      linkColor: '#2c5aa0',
      quoteBg: '#eef3f9',
      quoteBorder: '#2c5aa0',
      codeBg: '#f0f4f8',
      codeColor: '#2c5aa0',
      hrColor: '#b8cce4',
    },
  },

  // ========== 暖色阅读 ==========
  warm: {
    name: '暖色阅读',
    desc: '柔和温暖，适合随笔/故事',
    accent: '#c85a3c',
    accentColors: ['#c85a3c', '#a8442c', '#e07a5f', '#f2cc8f'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#4a4036',
      headingColor: '#8b3a1f',
      linkColor: '#c85a3c',
      quoteBg: '#faf3ee',
      quoteBorder: '#e8c4b0',
      codeBg: '#faf6f2',
      codeColor: '#a8442c',
      hrColor: '#e8d5c8',
    },
  },

  // ========== 清新绿 ==========
  fresh: {
    name: '清新绿',
    desc: '自然清爽，适合生活/科普',
    accent: '#2d8659',
    accentColors: ['#2d8659', '#1f6644', '#4da87a', '#7cc9a0'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.75',
      color: '#3a4a42',
      headingColor: '#1f6644',
      linkColor: '#2d8659',
      quoteBg: '#eef7f2',
      quoteBorder: '#a8d5c0',
      codeBg: '#f0f7f3',
      codeColor: '#2d8659',
      hrColor: '#c8e6d5',
    },
  },

  // ========== 暗夜紫 ==========
  midnight: {
    name: '暗夜紫',
    desc: '深邃神秘，适合科技/科幻',
    accent: '#7b5ea7',
    accentColors: ['#7b5ea7', '#5d4482', '#9b7fc4', '#c4aede'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.75',
      color: '#4a4458',
      headingColor: '#4a3566',
      linkColor: '#7b5ea7',
      quoteBg: '#f3effa',
      quoteBorder: '#c4aede',
      codeBg: '#f5f2fa',
      codeColor: '#7b5ea7',
      hrColor: '#d9cfea',
    },
  },

  // ========== 杂志橙 ==========
  magazine: {
    name: '杂志橙',
    desc: '活力张扬，适合营销/活动',
    accent: '#e8734a',
    accentColors: ['#e8734a', '#c85a35', '#f0936b', '#f5b895'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.75',
      color: '#4a3f38',
      headingColor: '#c85a35',
      linkColor: '#e8734a',
      quoteBg: '#fdf2ec',
      quoteBorder: '#f5b895',
      codeBg: '#fdf5f0',
      codeColor: '#c85a35',
      hrColor: '#f0d5c5',
    },
  },

  // ========== 商务灰 ==========
  business: {
    name: '商务灰',
    desc: '正式严谨，适合报告/公告',
    accent: '#4a5568',
    accentColors: ['#4a5568', '#2d3748', '#718096', '#a0aec0'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#2d3748',
      headingColor: '#1a202c',
      linkColor: '#4a5568',
      quoteBg: '#f0f2f5',
      quoteBorder: '#a0aec0',
      codeBg: '#f4f6f8',
      codeColor: '#4a5568',
      hrColor: '#cbd5e0',
    },
  },

  // ========== 樱粉 ==========
  sakura: {
    name: '樱粉',
    desc: '温柔浪漫，适合情感/生活',
    accent: '#d4738a',
    accentColors: ['#d4738a', '#b85570', '#e89aaa', '#f2c4d0'],
    vars: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#4a3f42',
      headingColor: '#a04458',
      linkColor: '#d4738a',
      quoteBg: '#fdf0f3',
      quoteBorder: '#f2c4d0',
      codeBg: '#fdf5f7',
      codeColor: '#b85570',
      hrColor: '#f0d0d8',
    },
  },
};

// 导出（兼容 module 和 script 两种加载方式）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES };
}
