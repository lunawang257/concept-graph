const API_BASE = "http://127.0.0.1:8000";

let cy;
fetch(API_BASE + "/nodes-json/true")
  .then((d) => d.json())
  .then(loadGraph);

fetch(API_BASE + "/load-toggle")
  .then((d) => d.json())
  .then(loadToggle);

function animateToFit(eles, duration = 300) {
  cy.animate({
    fit: {
      eles: eles,
      padding: 30,
    },
<<<<<<< HEAD
    duration: duration, // milliseconds
  });
}

function handleClick(node) {
=======
    duration: duration, //milliseconds
  });
}

function clicked(node) {
>>>>>>> 50c110a (fixed typos)
  cy.elements().removeClass("highlighted tapped");
  node.addClass("tapped");

  if (node.hasClass("parent")) {
<<<<<<< HEAD
    animateToFit(node, 500);
=======
    animate(node, 500);
>>>>>>> 50c110a (fixed typos)
    return;
  }

  // Highlight the node and all its dependencies
  const bfs = cy.elements().breadthFirstSearch({
    roots: node,
    directed: true,
    visit: (node, edge) => {
      node.addClass("highlighted");
      if (edge) edge.addClass("highlighted");
    },
  });

  const resultNodes = bfs.path.filter((ele) => ele.isNode());
<<<<<<< HEAD
  animateToFit(resultNodes);
=======
  animate(resultNodes);
>>>>>>> 50c110a (fixed typos)

  // List out all the topics user needs to learn in console
  // const resultNodes = bfs.path.filter(ele => ele.isNode() && ele.id() !== node.id());
  // console.log("To learn", node.id(), ", you need to first master:", resultNodes.map(n => n.id()));
}

function loadToggle(data) {
  const menuContainer = document.querySelector(".menu");

<<<<<<< HEAD
  const sortedItems = Object.entries(data).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  for (const [parent, children] of sortedItems) {
=======
  const sortedParents = Object.entries(data).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  for (const [parent, children] of sortedParents) {
>>>>>>> 50c110a (fixed typos)
    const details = document.createElement("details");
    details.setAttribute("name", "content");

    const summary = document.createElement("summary");
    summary.textContent = parent;
    summary.addEventListener("click", () => {
      const node = cy.getElementById(parent);
      handleClick(node);
    });

    const ul = document.createElement("ul");
    const sortedChildren = children.slice().sort((a, b) => a.localeCompare(b));
    for (const child of sortedChildren) {
      const li = document.createElement("li");
      li.textContent = child;
      li.addEventListener("click", () => {
<<<<<<< HEAD
        const clickedItem = document.querySelector("li.clicked");
        if (clickedItem) clickedItem.classList.remove("clicked");

        const node = cy.getElementById(child);
        handleClick(node);

=======
        const lists = document.querySelectorAll("li");
        for (const list of lists) list.classList.remove("clicked");

        const node = cy.getElementById(child);
        clicked(node);

>>>>>>> 50c110a (fixed typos)
        li.classList.add("clicked");
      });
      ul.appendChild(li);
    }

    details.appendChild(summary);
    details.appendChild(ul);
    menuContainer.appendChild(details);
  }
}

function loadGraph(elements) {
  if (cy) cy.destroy();

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    layout: { name: "preset" },
    style: [
      {
        selector: "node",
        style: {
          label: "data(id)",
          shape: "roundrectangle",
          "background-color": "#F4F4F4",
          "border-color": "#F4F4F4",
          "border-width": 2,
          "text-valign": "center",
          "text-halign": "center",
          color: "black",
          "font-size": 14,
          width: (node) => {
            return node.data("id").length * 7;
          },
          padding: 10,
        },
      },
      {
        selector: ".parent",
        style: {
          "background-color": "white",
          "border-color": "#D9D9D9",
          "border-width": 2,
          "text-valign": "top",
          "font-size": 25,
        },
      },
      {
        selector: "edge",
        style: {
          width: 2.5,
          "line-color": "#000",
          "target-arrow-color": "#000",
          "target-arrow-shape": "triangle",
          "arrow-scale": 2,
          "curve-style": "bezier",
        },
      },
      {
        selector: "node.highlighted",
        style: {
          "border-color": "#497DFF",
          "background-color": "#98B5FF",
        },
      },
      {
        selector: ".parent.highlighted",
        style: {
          "border-color": "#497DFF",
          "background-color": "white",
          color: "#497DFF",
        },
      },
      {
        selector: "edge.highlighted",
        style: {
          "line-color": "#497DFF",
          "target-arrow-color": "#497DFF",
        },
      },
      {
        selector: "edge.out",
        style: {
          "line-color": "#E5E5E5",
          "line-style": "dashed",
          width: 1,
        },
      },
      {
        selector: "edge.highlighted.out",
        style: {
          "line-color": "#497DFF",
          "target-arrow-color": "#497DFF",
        },
      },
      {
        selector: "node.tapped",
        style: {
          "background-color": "#497DFF",
          color: "white",
        },
      },
      {
        selector: ".parent.tapped",
        style: {
          "border-color": "#497DFF",
          "background-color": "white",
          color: "#497DFF",
        },
      },
    ],
    wheelSensitivity: 0.1,
    minZoom: 0.05,
    maxZoom: 1,
  });

  cy.on("tap", "node", (e) => {
    const node = e.target;
    handleClick(node);
  });

  cy.on("mouseup", () => {
    const bbox = cy.elements().boundingBox();
    const viewportExtent = cy.extent();

    const isOutOfView =
      bbox.x2 < viewportExtent.x1 ||
      bbox.x1 > viewportExtent.x2 ||
      bbox.y2 < viewportExtent.y1 ||
      bbox.y1 > viewportExtent.y2;

    if (isOutOfView) animateToFit(cy.elements());
  });
}

const clearHighlightsBtn = document.querySelector(".clear-highlights-btn");
clearHighlightsBtn.addEventListener("click", () => {
  cy.elements().removeClass("highlighted tapped");
});

const fitBtn = document.querySelector(".fit-btn");
fitBtn.addEventListener("click", () => animateToFit(cy.elements()));

const input = document.querySelector(".search");
let debounceTimeout;

input.addEventListener("input", () => {
  clearTimeout(debounceTimeout); // clear the previous timer

  debounceTimeout = setTimeout(() => {
    const term = input.value.trim().toLowerCase();

    // Clear previous highlights
    cy.elements().removeClass("highlighted tapped");

    if (term.length === 0) return;

    const matches = cy
      .nodes()
      .filter((node) => node.data("id").toLowerCase().includes(term));

    matches.addClass("highlighted");

<<<<<<< HEAD
    if (matches.length > 0) animateToFit(matches);
=======
    if (matches.length > 0) animate(matches);
>>>>>>> 50c110a (fixed typos)
  }, 300); // 300ms pause before triggering
});

const loadBtn = document.querySelector(".load");
loadBtn.addEventListener("click", async () => {
  const res = await fetch(API_BASE + "/nodes-json/true");
  const contents = await res.json();
  loadGraph(contents);
});

const posBtn = document.querySelector(".position-btn");
posBtn.addEventListener("click", () => {
  const positions = {};

  cy.nodes().forEach((node) => {
    const pos = node.position(); // { x: ..., y: ... }
    positions[node.id()] = { x: pos.x, y: pos.y };
  });

  fetch(API_BASE + "/save-positions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(positions),
  });
});
