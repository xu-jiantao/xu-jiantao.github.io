// main.js

// 等待文档加载完成
document.addEventListener("DOMContentLoaded", function () {
    // 创建并注入CSS样式
    const style = document.createElement("style");
    style.textContent = `
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 20px;
            padding-bottom: 60px;
        }
        header {
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            text-align: center;
        }

        nav {
            background-color: #333;
            overflow: hidden;
            text-align: center;
            width: 100%;
            z-index: 1000;
        }
        nav a {
            display: inline-block;
            color: white;
            text-align: center;
            padding: 14px 20px;
            text-decoration: none;
            font-size: 18px;
            transition: background-color 0.3s, color 0.3s;
        }
        nav a:hover {
            background-color: #ddd;
            color: black;
        }

        .content-section {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .content-section h2 {
            color: #4CAF50;
        }
        .skills ul {
            list-style-type: none;
            padding: 0;
        }
        .skills ul li {
            background-color: #e7f4e4;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
        }
        footer {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 10px 0;
            position: relative;
            width: 100%;
            bottom: 0;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            nav a {
                padding: 10px 5px;
                font-size: 16px;
            }
        }

        @media (max-width: 480px) {
            nav a {
                padding: 8px 3px;
                font-size: 14px;
            }

            .content-section {
                padding: 15px;
                margin: 10px 0;
            }
        }

        /* sticky 类，当导航栏固定时 */
        .sticky {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
        }

        /* 返回顶部按钮 */
        #backToTopBtn {
            display: none; /* 初始隐藏 */
            position: fixed;
            bottom: 40px;
            right: 40px;
            z-index: 1001;
            font-size: 18px;
            border: none;
            outline: none;
            background-color: #4CAF50;
            color: white;
            cursor: pointer;
            padding: 15px;
            border-radius: 50%;
            transition: background-color 0.3s;
        }
        #backToTopBtn:hover {
            background-color: #555;
        }

        /* 平滑滚动 */
        html {
            scroll-behavior: smooth;
        }
    `;
    document.head.appendChild(style);

    // 创建页面结构
    const body = document.body;

    // Header
    const header = document.createElement("header");
    const h1 = document.createElement("h1");
    h1.textContent = "徐建涛的主页";
    header.appendChild(h1);
    body.appendChild(header);

    // Navigation
    const nav = document.createElement("nav");
    nav.id = "navbar";
    const navLinks = [
        { href: "#education", text: "教育背景" },
        { href: "#experience", text: "工作经历" },
        { href: "#skills", text: "技能" },
        { href: "#research", text: "研究领域" },
        { href: "#honors", text: "证书" },
        { href: "#contact", text: "联系方式" },
        { href: "en.html", text: "English" },
    ];

    navLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        nav.appendChild(a);
    });
    body.appendChild(nav);

    // Container
    const container = document.createElement("div");
    container.className = "container";

    // 教育背景 Section
    const educationSection = document.createElement("div");
    educationSection.className = "content-section";
    educationSection.id = "education";
    const eduH2 = document.createElement("h2");
    eduH2.textContent = "教育背景";
    educationSection.appendChild(eduH2);
    const eduContent = `
        <p><strong>郑州大学</strong> (2017 - 2021)<br> 计算机科学与技术|学士学位</p>
        <p><strong>会津大学</strong> (2021.10 - 2023.10)<br> 计算机信息系统｜硕士学位</p>
        <p><strong>会津大学</strong> (2023.10 ~ )<br> 计算机信息系统｜在读博士</p>
    `;
    educationSection.innerHTML += eduContent;
    container.appendChild(educationSection);

    // 工作经历 Section
    const experienceSection = document.createElement("div");
    experienceSection.className = "content-section";
    experienceSection.id = "experience";
    const expH2 = document.createElement("h2");
    expH2.textContent = "工作经历";
    experienceSection.appendChild(expH2);
    const expContent = `
        <p><strong>上海太平洋保险数据中心</strong> (2021.04 - 2022.08)<br>职位: 运维工程师</p>
        <ul>
            <li>公司服务器在线故障排除</li>
            <li>数据传输系统安装维护</li>
            <li>定期对公司系统软件进行升级更新</li>
            <li>协助处理其他公司故障</li>
        </ul>
        <p><strong>EyesJapan</strong> (2023.10 ~ )<br>职位: 兼职</p>
        <ul>
            <li>网页开发</li>
            <li>前端开发</li>
            <li>数据库设计</li>
            <li>其他任务</li>
        </ul>
    `;
    experienceSection.innerHTML += expContent;
    container.appendChild(experienceSection);

    // 技能 Section
    const skillsSection = document.createElement("div");
    skillsSection.className = "content-section skills";
    skillsSection.id = "skills";
    const skillsH2 = document.createElement("h2");
    skillsH2.textContent = "技能";
    skillsSection.appendChild(skillsH2);
    const skillsContent = `
        <ul>
            <li>计算机网络</li>
            <li>网络安全，物联网</li>
            <li>HTML、Java、Python</li>
            <li>MySQL数据库和Linux服务器</li>
        </ul>
    `;
    skillsSection.innerHTML += skillsContent;
    container.appendChild(skillsSection);

    // 研究领域 Section
    const researchSection = document.createElement("div");
    researchSection.className = "content-section";
    researchSection.id = "research";
    const researchH2 = document.createElement("h2");
    researchH2.textContent = "研究领域";
    researchSection.appendChild(researchH2);
    const researchContent = `<p>位置隐私保护，群智感知</p>`;
    researchSection.innerHTML += researchContent;
    container.appendChild(researchSection);

    // 证书 Section
    const honorsSection = document.createElement("div");
    honorsSection.className = "content-section";
    honorsSection.id = "honors";
    const honorsH2 = document.createElement("h2");
    honorsH2.textContent = "证书";
    honorsSection.appendChild(honorsH2);
    const honorsContent = `
        <ul>
            <li>英语四级证书</li>
            <li>中国驾驶执照</li>
            <li>日本驾照即将取得</li>
        </ul>
    `;
    honorsSection.innerHTML += honorsContent;
    container.appendChild(honorsSection);

    // 联系方式 Section
    const contactSection = document.createElement("div");
    contactSection.className = "content-section";
    contactSection.id = "contact";
    const contactH2 = document.createElement("h2");
    contactH2.textContent = "联系方式";
    contactSection.appendChild(contactH2);
    const contactContent = `
        <p><strong>姓名:</strong> 徐建涛</p>
        <p><strong>邮箱:</strong> <a href="mailto:xujiantao9510@gmail.com">xujiantao9510@gmail.com</a></p>
        <p><strong>个人网站:</strong> <a href="https://xujiantao9510.github.io/" target="_blank">https://xujiantao.github.io/</a></p>
    `;
    contactSection.innerHTML += contactContent;
    container.appendChild(contactSection);

    body.appendChild(container);

    // Footer
    const footer = document.createElement("footer");
    const footerP = document.createElement("p");
    footerP.textContent = "© 2024 徐建涛. All Rights Reserved.";
    footer.appendChild(footerP);
    body.appendChild(footer);

    // 返回顶部按钮
    const backToTopBtn = document.createElement("button");
    backToTopBtn.id = "backToTopBtn";
    backToTopBtn.title = "返回顶部";
    backToTopBtn.innerHTML = "↑";
    body.appendChild(backToTopBtn);

    // JavaScript 功能实现

    // 导航栏滚动固定
    window.onscroll = function () { fixNavbar(); scrollFunction(); };

    const navbarElement = document.getElementById("navbar");
    const sticky = navbarElement.offsetTop;

    function fixNavbar() {
        if (window.pageYOffset >= sticky) {
            navbarElement.classList.add("sticky");
        } else {
            navbarElement.classList.remove("sticky");
        }
    }

    // 显示/隐藏返回顶部按钮
    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    }

    // 返回顶部按钮点击事件
    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 平滑滚动处理（兼容旧浏览器）
    const smoothScrollLinks = document.querySelectorAll('nav a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - navbarElement.offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 动态高亮当前导航链接
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('nav a[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarElement.offsetHeight - 10;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 添加.active样式
    const activeStyle = document.createElement("style");
    activeStyle.textContent = `
        nav a.active {
            background-color: #4CAF50;
            color: white;
        }
    `;
    document.head.appendChild(activeStyle);
});
