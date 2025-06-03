// script.js

// 首先尝试从 localStorage 获取内容，如果不存在则使用默认内容
// 针对中文页面的默认内容
const contents_cn = {
    about: localStorage.getItem('aboutContent_cn') || `# 关于我

我目前在日本会津大学攻读计算机信息系统博士学位。我的研究兴趣包括联邦学习和机器学习。

## 研究方向
- 🤖 联邦学习
- 🧠 机器学习
- 📊 数据分析

## 专业技能
- 💻 编程语言：HTML、Java、Python
- 🗄️ 数据库：MySQL
- 🖥️ 系统：Linux服务器`,

    education: localStorage.getItem('educationContent_cn') || `# 教育经历

## 博士：计算机信息系统
- 🏫 会津大学，日本
- 📅 2023年10月至今

## 硕士：计算机信息系统
- 🏫 会津大学，日本
- 📅 2021年10月-2023年10月

## 学士：计算机信息管理
- 🏫 郑州大学，中国
- 📅 2017年-2021年`,

    experience: localStorage.getItem('experienceContent_cn') || `# 工作经历

## EyesJapan（兼职）
*2023年10月至今*
- 💻 网页开发
- 🔧 前后端开发
- 📊 数据库开发

## 上海某保险公司数据中心
*2021年4月-2022年8月*

## 所获证书
- 📜 大学英语四级证书
- 🚗 中国驾照`,

    contact: localStorage.getItem('contactContent_cn') || `# 联系方式

- 📧 邮箱：xujiantao9510@gmail.com
- 🌐 个人网站：https://xu-jiantao.github.io
- 💬 Wechat：dylanethan9510`
};

// 针对英文页面的默认内容
const contents_en = {
    about: localStorage.getItem('aboutContent_en') || `# About Me

I am currently pursuing a Ph.D. degree in Computer Information Systems at the University of Aizu, Japan. My research interests include Federated Learning and Machine Learning.

## Research Interests
- 🤖 Federated Learning
- 🧠 Machine Learning
- 📊 Data Analysis

## Technical Skills
- 💻 Programming Languages: HTML, Java, Python
- 🗄️ Database: MySQL
- 🖥️ System: Linux Server`,

    education: localStorage.getItem('educationContent_en') || `# Education

## Ph.D. in Computer Information Systems
- 🏫 University of Aizu, Japan
- 📅 October 2023 - Present

## Master's in Computer Information Systems
- 🏫 University of Aizu, Japan
- 📅 October 2021 - October 2023

## Bachelor's in Computer Information Management
- 🏫 Zhengzhou University, China
- 📅 2017 - 2021`,

    experience: localStorage.getItem('experienceContent_en') || `# Professional Experience

## EyesJapan (Part-time)
*October 2023 - Present*
- 💻 Web development
- 🔧 Frontend and Backend development
- 📊 Database development

## A company of Insurance Data Center, Shanghai
*April 2021 - August 2022*

## Certifications
- 📜 CET-4 (College English Test Band 4)
- 🚗 Chinese Driver's License`,

    contact: localStorage.getItem('contactContent_en') || `# Contact Information

- 📧 Email: xujiantao9510@gmail.com
- 🌐 Personal Website: https://xu-jiantao.github.io
- 💬 Wechat：dylanethan9510`
};

// 根据当前HTML文件名或者lang属性来决定使用哪个内容对象
// 一个简单的判断方法是检查html标签的lang属性
const currentLang = document.documentElement.lang;
const contents = (currentLang === 'zh') ? contents_cn : contents_en;
const अनुपलब्धपाठ = (currentLang === 'zh') ? '内容不可用' : 'Content not available';


function showContent(page) {
    const contentDiv = document.getElementById('content');
    if (contentDiv && marked) { // 确保元素和marked库都存在
        contentDiv.innerHTML = marked.parse(contents[page] || अनुपलब्धपाठ);
    }

    // 更新活动链接样式
    document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.remove('active');
        if (a.dataset.section === page) {
            a.classList.add('active');
        }
    });
}

// 页面加载时显示 about 内容
window.onload = () => {
    // 确保marked库加载完成后再执行
    if (typeof marked === 'undefined') {
        console.error('Marked.js library is not loaded.');
        // 可以尝试延迟加载或提示用户
        const contentDiv = document.getElementById('content');
        if(contentDiv) contentDiv.innerHTML = "Error loading content parser.";
        return;
    }
    showContent('about');
};

// 添加导航链接点击事件
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.section) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showContent(link.dataset.section);
        });
    }
});