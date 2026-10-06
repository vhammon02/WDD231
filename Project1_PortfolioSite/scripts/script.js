const projects = [
    {
        title: "Project 1",
        description: "This is a description of Project 1.",
        image: "images/project1.jpg",
        tag: "ui"
    },
    {
        title: "Project 2",
        description: "This is a description of Project 2.",
        image: "images/project2.jpg",
        tag: "wdd"
    },
    {
        title: "Project 3",
        description: "This is a description of Project 3.",
        image: "images/project3.jpg",
        tag: "gd"
    }   
]
const projectsContainer = document.getElementById("projects");

const createProjects = function() {
    
    filter = document.getElementById("projectsFilter").value; // Get the selected filter value

    function filterProjects(filter) {
        const filteredProjects = projects.filter(project => project.tag === filter);
        return filteredProjects;
    }

    let filteredProjects = [];

    if (filter === "all") {
        filteredProjects = projects;
    }
    else {
       filteredProjects = filterProjects(filter);
    }

    document.getElementById("projects").innerHTML = ""; //reset the projects container

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
filterSelect.addEventListener("change", createProjects); // Event listener to create projectts when the change happens in the select element

createProjects(); // Call the function to create projects on page load


// Menu toggle functionality
document.getElementById("menu-toggle").addEventListener("click", function() {
    const nav = document.querySelector("nav");
    nav.classList.toggle("open");
});