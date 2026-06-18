// Assets/js/nav.js - Sistema de Navegación Global con Namespace Aislado (W3C)
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    let b = "./";

    // Detectar si estamos dentro de una de las carpetas de proyectos raíz
    if (path.includes("/PrimerLanding/") || path.includes("/SegundoLanding/") || path.includes("/CreacionModManus/")) {
        b = "../";
    }

    const menuItems = [
        { name: "Inicio Portafolio", url: `${b}index.html`, id: "root" },
        { name: "Landing V1 (Legacy)", url: `${b}PrimerLanding/index.html`, id: "v1" },
        { name: "Landing V2 (Actual - 3D)", url: `${b}SegundoLanding/index.html`, id: "v2" },
        { name: "Modificación Nórdica", url: `${b}CreacionModManus/index.html`, id: "mod" }
    ];

    // Usamos selectores totalmente únicos (repo-sys-*) para evitar colisiones CSS
    const navHeader = document.createElement("header");
    navHeader.setAttribute("role", "banner");
    navHeader.className = "repo-sys-header";

    const navElement = document.createElement("nav");
    navElement.setAttribute("aria-label", "Navegación de control del repositorio");
    navElement.className = "repo-sys-nav";

    const navList = document.createElement("ul");
    navList.className = "repo-sys-list";

    menuItems.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.url;
        a.textContent = item.name;
        a.className = "repo-sys-link";
        
        if (
            (item.id === "root" && (path.endsWith("/") || path.endsWith("index.html") && !path.includes("Landing") && !path.includes("Mod"))) ||
            (item.id === "v1" && path.includes("PrimerLanding")) ||
            (item.id === "v2" && path.includes("SegundoLanding")) ||
            (item.id === "mod" && path.includes("CreacionModManus"))
        ) {
            a.setAttribute("aria-current", "page");
            a.classList.add("repo-sys-active");
        }

        li.appendChild(a);
        navList.appendChild(li);
    });

    navElement.appendChild(navList);
    navHeader.appendChild(navElement);

    // Se inyecta al principio de la página de forma limpia
    document.body.insertBefore(navHeader, document.body.firstChild);
});