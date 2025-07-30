const API_BASE = "http://127.0.0.1:8000";

let cy;
fetch(API_BASE + "/nodes-json/true")
  .then((d) => d.json())
  .then(loadGraph);


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
          "width": (node) => { return node.data('id').length * 7 },
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
          "font-size": 25
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
          "curve-style": "bezier"
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
    ],
    wheelSensitivity: 0.1,
    minZoom: 0.2,
    maxZoom: 1,
  });

  cy.on('tap', 'node', (e) => {
    const node = e.target;

    cy.elements().removeClass('highlighted tapped');
    node.addClass('tapped');

    // Highlight the node and all its dependencies
    const bfs = cy.elements().breadthFirstSearch({
      roots: node,
      directed: true,
      visit: (node, edge) => {
        node.addClass('highlighted');
        if (edge) edge.addClass('highlighted');
      }
    });
      
    const resultNodes = bfs.path.filter(ele => ele.isNode() && ele.id() !== node.id());
    console.log("To learn", node.id(), ", you need to first master:", resultNodes.map(n => n.id()));
  });
}

const clearHighlightsBtn = document.querySelector(".clear-highlights-btn");
clearHighlightsBtn.addEventListener("click", () => {
  cy.elements().removeClass('highlighted tapped');
});

const input = document.querySelector('.search');
let debounceTimeout;

input.addEventListener('input', () => {
  clearTimeout(debounceTimeout); // clear the previous timer

  debounceTimeout = setTimeout(() => {
    const term = input.value.trim().toLowerCase();

    // Clear previous highlights
    cy.elements().removeClass('highlighted tapped');

    if (term.length === 0) return;

    const matches = cy.nodes().filter(node =>
      node.data('id').toLowerCase().includes(term)
    );

    matches.addClass('highlighted');

    if (matches.length > 0) {
      cy.animate({
        fit: {
          eles: matches,
          padding: 50
        },
        duration: 500
      });
    }
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


const toggleBtns = document.querySelectorAll('.toggle-button');
const toggleLists = document.querySelectorAll('.toggle-list');

toggleBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    toggleLists[index].classList.toggle('active');
  });
});