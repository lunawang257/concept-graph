const API_BASE = "http://127.0.0.1:8000";

let cy;
fetch(API_BASE + "/nodes-json/true")
  .then((d) => d.json())
  .then(loadGraph);

function animateToFit(eles, padding = 80, duration = 300) {
  cy.animate({
    fit: {
      eles: eles,
      padding: padding,
    },
    duration: duration, // milliseconds
  });
}

function handleClick(node) {
  cy.elements().removeClass("highlighted tapped");
  node.addClass("tapped");

  if (node.hasClass("parent")) {
    animateToFit(node);
    return;
  }

  // Highlight the node and all its dependencies
  cy.elements().breadthFirstSearch({
    roots: node,
    directed: true,
    visit: (node, edge) => {
      node.addClass("highlighted");
      if (edge) edge.addClass("highlighted");
    },
  });

  const node_parent = node.parent();
  animateToFit(node_parent);
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
          "border-width": 3,
          "text-valign": "center",
          "text-halign": "center",
          color: "black",
          "font-size": 16,
          width: (node) => {
            return node.data("id").length * 9;
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
          width: 3,
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

  cy.ready(() => {
    cy.getElementById("ATOMS").select();
    cy.fit(cy.$(":selected"), 80);
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

  cy.on(
    "mouseover",
    "node, edge",
    () => (cy.container().style.cursor = "pointer")
  );

  cy.on(
    "mouseout",
    "node, edge",
    () => (cy.container().style.cursor = "default")
  );
}

const clearHighlightsBtn = document.querySelector(".clear-highlights-btn");
clearHighlightsBtn.addEventListener("click", () => {
  cy.elements().removeClass("highlighted tapped");
});

const fitBtn = document.querySelector(".fit-btn");
fitBtn.addEventListener("click", () => animateToFit(cy.elements()));

const searchInput = document.querySelector(".search");
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();

  // Clear previous highlights
  cy.elements().removeClass("highlighted tapped");

  // Clear dropdown if no input
  const dropdown = document.querySelector(".dropdown");
  if (term.length === 0 && dropdown) {
    dropdown.remove();
    return;
  }

  const matches = cy
    .nodes()
    .filter((node) => node.data("id").toLowerCase().includes(term));

  if (matches.length > 0) {
    createDropdown(matches, term);
  } else {
    if (dropdown) dropdown.remove();
  }
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

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  const dropdown = document.querySelector(".dropdown");
  const container = document.querySelector(".search-container");

  if (dropdown && !container.contains(event.target)) {
    dropdown.remove();
  }
});
