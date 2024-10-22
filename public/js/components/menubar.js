// menubar.js
export function createMenubar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.error("Sidebar element not found.");
        return;
    }

    const menuList = sidebar.querySelector('.menu');
    if (!menuList) {
        console.error("Menu list element not found inside the sidebar.");
        return;
    }

    // Menu configuration
    const menuItems = [
        { title: "Admin Menu", icon: "fa-solid fa-bars", id: "menu-icon", isToggle: true },
        { title: "Home", icon: "fas fa-home", href: "dashboard.html" },
        { title: "Add Property", icon: "fas fa-plus", href: "add_property.html" },
        { title: "Edit Property", icon: "fas fa-edit", href: "edit_property.html" },
        { title: "Rented Property", icon: "fas fa-house-user", href: "rented_property.html" }
    ];

    // Clear existing menu items
    menuList.innerHTML = '';

    // Create menu items dynamically
    menuItems.forEach(item => {
        const li = document.createElement('li');

        if (item.isToggle) {
            li.id = item.id;
            li.innerHTML = `<i class="${item.icon}"></i> <span class="menu-text">${item.title}</span>`;
        } else {
            const a = document.createElement('a');
            a.href = item.href;
            a.innerHTML = `<i class="${item.icon}"></i> <span class="menu-text">${item.title}</span>`;
            li.appendChild(a);
        }

        menuList.appendChild(li);
    });

    // Handle the toggle of the menu collapse
    const menuToggle = document.getElementById('menu-icon');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    } else {
        console.error("Menu toggle element not found.");
    }
}
