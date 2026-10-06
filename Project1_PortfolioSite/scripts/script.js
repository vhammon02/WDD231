import projects from "./projects.js";

const createProjects = function() {
    const projectsContainer = document.getElementById("projects");
    const filterSelect = document.getElementById("projectsFilter");
    if (!projectsContainer || !filterSelect) return;

    const projectList = Object.values(projects);
    const filter = filterSelect.value;
    const filteredProjects = filter === "all"
        ? projectList
        : projectList.filter(project => project.tag === filter);

    projectsContainer.innerHTML = "";
    filteredProjects.forEach(project => {
        const projectCard = document.createElement("div");
        projectCard.classList.add("project-card");
        projectCard.classList.add(project.tag);

        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
        `;

        projectsContainer.appendChild(projectCard);
    });
};

const filterSelect = document.getElementById("projectsFilter");
filterSelect?.addEventListener("change", createProjects);

createProjects();


// Menu toggle functionality
const menuToggle = document.getElementById("menu-toggle");
const nav = document.querySelector("header nav");

menuToggle?.addEventListener("click", function() {
    if (!nav) return;

    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});