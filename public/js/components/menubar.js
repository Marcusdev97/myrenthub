// menubar.js - 用于动态生成菜单栏
export function createMenubar() {
    const sidebar = document.getElementById('sidebar');
    const menuList = sidebar.querySelector('.menu');

    // 菜单项配置
    const menuItems = [
        { title: "Home", icon: "fas fa-home", href: "index.html" },
        { title: "Add Property", icon: "fas fa-plus", href: "add_property.html" },
        { title: "Edit Property", icon: "fas fa-edit", href: "edit_property.html" },
        { title: "Rented Property", icon: "fas fa-house-user", href: "rented_property.html" }
    ];

    // 清空现有菜单项
    menuList.innerHTML = '';

    // 动态创建菜单项
    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.innerHTML = `<i class="${item.icon}"></i> <span class="menu-text">${item.title}</span>`;
        li.appendChild(a);
        menuList.appendChild(li);
    });

    // 处理菜单的展开和收起
    document.getElementById('menu-icon').addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}
