// 全局变量
let currentLanguage = 'zh';

// 语言内容对象
const translations = {
    zh: {
        // 导航栏
        '徐建涛': '徐建涛',
        '首页': '首页',
        '关于我': '关于我',
        '工作经历': '工作经历',
        '教育经历': '教育经历',
        '技能证书': '技能证书',
        '发表论文': '发表论文',

        // 首页
        '你好，我是': '你好，我是',
        '博士研究生 | 机器学习 | 联邦学习': '博士研究生 | 机器学习 | 联邦学习',
        '目前在日本会津大学攻读计算机信息系统博士学位，专注于联邦学习和机器学习研究。': '目前在日本会津大学攻读计算机信息系统博士学位，专注于联邦学习和机器学习研究。',
        '了解更多': '了解更多',
        '联系我': '联系我',
        '博士研究生': '博士研究生',
        '日本福岛': '日本福岛',

        // 关于我页面
        '我目前在日本会津大学攻读计算机信息系统博士学位。我的研究兴趣包括联邦学习和机器学习。': '我目前在日本会津大学攻读计算机信息系统博士学位。我的研究兴趣包括联邦学习和机器学习。',
        '研究兴趣': '研究兴趣',
        '联邦学习': '联邦学习',
        '机器学习': '机器学习',
        '数据分析': '数据分析',

        // 工作经历
        '兼职': '兼职',
        '网页开发': '网页开发',
        '前后端开发': '前后端开发',
        '数据库开发': '数据库开发',
        '上海某保险公司数据中心': '上海某保险公司数据中心',

        // 教育经历
        '博士：计算机信息系统': '博士：计算机信息系统',
        '会津大学，日本': '会津大学，日本',
        '硕士：计算机信息系统': '硕士：计算机信息系统',
        '学士：计算机信息管理': '学士：计算机信息管理',
        '郑州大学，中国': '郑州大学，中国',

        // 技能证书
        '专业技能与证书': '专业技能与证书',
        '专业技能': '专业技能',
        '研究方向': '研究方向',
        '编程语言': '编程语言',
        '数据库': '数据库',
        '系统': '系统',
        'Linux服务器': 'Linux服务器',
        '所获证书': '所获证书',
        '大学英语四级证书': '大学英语四级证书',
        '中国驾照': '中国驾照',

        // 页脚
        '徐建涛。保留所有权利。': '徐建涛。保留所有权利。'
    },
    en: {
        // 导航栏
        '徐建涛': 'Jiantao Xu',
        '首页': 'Home',
        '关于我': 'About',
        '工作经历': 'Experience',
        '教育经历': 'Education',
        '技能证书': 'Skills',
        '发表论文': 'Publications',

        // 首页
        '你好，我是': 'Hello, I\'m',
        '博士研究生 | 机器学习 | 联邦学习': 'PhD Student | Machine Learning | Federated Learning',
        '目前在日本会津大学攻读计算机信息系统博士学位，专注于联邦学习和机器学习研究。': 'Currently pursuing a PhD in Computer Information Systems at the University of Aizu, Japan, focusing on federated learning and machine learning research.',
        '了解更多': 'Learn More',
        '联系我': 'Contact Me',
        '博士研究生': 'PhD Student',
        '日本福岛': 'Fukushima, Japan',

        // 关于我页面
        '我目前在日本会津大学攻读计算机信息系统博士学位。我的研究兴趣包括联邦学习和机器学习。': 'I am currently pursuing a PhD in Computer Information Systems at the University of Aizu, Japan. My research interests include federated learning and machine learning.',
        '研究兴趣': 'Research Interests',
        '联邦学习': 'Federated Learning',
        '机器学习': 'Machine Learning',
        '数据分析': 'Data Analysis',

        // 工作经历
        '兼职': 'Part-time',
        '网页开发': 'Web Development',
        '前后端开发': 'Frontend & Backend Development',
        '数据库开发': 'Database Development',
        '上海某保险公司数据中心': 'Data Center of Shanghai Insurance Company',

        // 教育经历
        '博士：计算机信息系统': 'PhD: Computer Information Systems',
        '会津大学，日本': 'University of Aizu, Japan',
        '硕士：计算机信息系统': 'Master: Computer Information Systems',
        '学士：计算机信息管理': 'Bachelor: Computer Information Management',
        '郑州大学，中国': 'Zhengzhou University, China',

        // 技能证书
        '专业技能与证书': 'Skills & Certificates',
        '专业技能': 'Professional Skills',
        '研究方向': 'Research Areas',
        '编程语言': 'Programming Languages',
        '数据库': 'Database',
        '系统': 'Systems',
        'Linux服务器': 'Linux Server',
        '所获证书': 'Certificates',
        '大学英语四级证书': 'College English Test Band 4',
        '中国驾照': 'Chinese Driver\'s License',

        // 页脚
        '徐建涛。保留所有权利。': 'Jiantao Xu. All rights reserved.'
    }
};

// DOM 元素
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const langToggle = document.getElementById('langToggle');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showPage('home');
    updateLanguage();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 移动端菜单切换
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // 导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');

            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 显示对应页面
            showPage(targetPage);

            // 关闭移动端菜单
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // 语言切换按钮
    langToggle.addEventListener('click', function() {
        toggleLanguage();
    });

    // 首页按钮点击事件
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-page]')) {
            const targetPage = e.target.closest('[data-page]').getAttribute('data-page');
            const targetLink = document.querySelector(`[data-page="${targetPage}"].nav-link`);

            if (targetLink) {
                // 更新导航状态
                navLinks.forEach(l => l.classList.remove('active'));
                targetLink.classList.add('active');

                // 显示页面
                showPage(targetPage);
            }
        }
    });

    // 平滑滚动到顶部
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// 显示指定页面
function showPage(pageId) {
    // 隐藏所有页面
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');

        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 添加页面加载动画
        setTimeout(() => {
            targetPage.style.opacity = '0';
            targetPage.style.transform = 'translateY(30px)';

            requestAnimationFrame(() => {
                targetPage.style.transition = 'all 0.6s ease-out';
                targetPage.style.opacity = '1';
                targetPage.style.transform = 'translateY(0)';
            });
        }, 50);
    }
}

// 切换语言
function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    updateLanguage();
    updateLanguageButton();
}

// 更新语言内容
function updateLanguage() {
    const elements = document.querySelectorAll('[data-zh][data-en]');

    elements.forEach(element => {
        const zhText = element.getAttribute('data-zh');
        const enText = element.getAttribute('data-en');

        if (currentLanguage === 'zh') {
            element.textContent = zhText;
        } else {
            element.textContent = enText;
        }
    });

    // 更新HTML语言属性
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';

    // 更新页面标题
    document.title = currentLanguage === 'zh' ? '徐建涛 - 个人网站' : 'Jiantao Xu - Personal Website';
}

// 更新语言按钮
function updateLanguageButton() {
    const langSpan = langToggle.querySelector('span');
    langSpan.textContent = currentLanguage === 'zh' ? 'EN' : '中文';

    // 添加切换动画
    langToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        langToggle.style.transform = 'scale(1)';
    }, 150);
}

// 添加页面加载动画
function addLoadingAnimation() {
    const elements = document.querySelectorAll('.hero-content > *, .about-content, .timeline-item, .education-card, .skill-category, .publication-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        observer.observe(element);
    });
}

// 添加鼠标跟踪效果
function addMouseTrackingEffect() {
    const cards = document.querySelectorAll('.profile-card, .interest-card, .education-card, .timeline-content, .publication-item');

    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// 添加技能标签悬停效果
function addSkillTagEffects() {
    const skillTags = document.querySelectorAll('.skill-tag');

    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.6)';
        });

        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// 添加社交链接动画
function addSocialLinkEffects() {
    const socialLinks = document.querySelectorAll('.social-link');

    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) rotate(360deg)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
        });
    });
}

// 添加按钮波纹效果
function addButtonRippleEffect() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加波纹动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 页面完全加载后初始化特效
window.addEventListener('load', function() {
    addLoadingAnimation();
    addMouseTrackingEffect();
    addSkillTagEffects();
    addSocialLinkEffects();
    addButtonRippleEffect();
});

// 键盘导航支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// 平滑滚动增强
function smoothScrollTo(target) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 70;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 窗口调整大小处理
window.addEventListener('resize', debounce(function() {
    // 检查窗口宽度是否大于移动设备断点（768px，与CSS中的设置相匹配）。
    // 如果是，则移除 'active' 类，以确保在从移动视图调整到桌面视图时，
    // 汉堡菜单和导航链接列表会被正确隐藏。
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
}, 250)); // 设置250毫秒的延迟以避免在调整大小时过于频繁地触发。

document.addEventListener('DOMContentLoaded', () => {
    const wechatTrigger = document.getElementById('wechatTrigger');
    const modal = document.getElementById('wechatModal');
    const closeBtn = document.getElementById('closeWechatModal');

    wechatTrigger.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// script.js
const blogFiles = [
    { title: "Blog1", file: "blogs/blog1.md" },
    { title: "Blog2", file: "blogs/blog2.md" }
];

document.addEventListener("DOMContentLoaded", () => {
    const blogList = document.getElementById("blog-list");
    const blogContent = document.getElementById("blog-content");

    // 显示博客标题列表
    blogFiles.forEach((blog, index) => {
        const btn = document.createElement("button");
        btn.textContent = blog.title;
        btn.className = "btn";
        btn.addEventListener("click", () => loadBlog(blog.file));
        blogList.appendChild(btn);
    });

    // 加载并显示博客内容
    function loadBlog(file) {
        fetch(file)
            .then(res => res.text())
            .then(md => {
                blogContent.innerHTML = marked.parse(md);
                blogContent.style.display = "block";
                blogList.style.display = "none";
            });
    }
});

