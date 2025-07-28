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
          shape: "rectangle",
          "background-color": "#6FB1FC",
          "border-color": "#4A90E2",
          "border-width": 2,
          "text-valign": "center",
          "text-halign": "center",
          color: "#333",
          "font-size": 14,
          "font-weight": "bold",
          width: 100,
          height: 50,
          "text-wrap": "wrap",
          "text-max-width": 80,
        },
      },
      {
        selector: ".parent",
        style: {
          "background-color": "rgb(236, 236, 236)",
          "border-color": "rgb(158, 158, 158)",
          "border-width": 2,
          "text-valign": "top",

        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
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
          "border-color": "red",
          "background-color": "yellow",
        },
      },
      {
        selector: "edge.highlighted",
        style: {
          "line-color": "red",
          "target-arrow-color": "red",
        },
      },
      {
        selector: "edge.out",
        style: {
          "line-color": "#E5E5E5",
          "line-style": "dashed",
        },
      },
      {
        selector: "edge.highlighted.out",
        style: {
          "line-color": "red",
          "target-arrow-color": "red",
        },
      },

    ],
  });

  cy.on('tap', 'node', (e) => {
    const node = e.target;
    
    cy.elements().removeClass('highlighted');
    
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
  cy.elements().removeClass('highlighted');
});

const input = document.querySelector('.search');
let debounceTimeout;

input.addEventListener('input', () => {
  clearTimeout(debounceTimeout); // clear the previous timer

  debounceTimeout = setTimeout(() => {
    const term = input.value.trim().toLowerCase();

    // Clear previous highlights
    cy.elements().removeClass('highlighted');

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
