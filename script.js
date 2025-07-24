const API_BASE = "http://127.0.0.1:8000";

let cy;
fetch(API_BASE + "/nodes-json/true")
  .then((d) => d.json())
  .then(loadGraph);

// let cy = cytoscape({
//   container: document.getElementById("cy"),
//   elements: {
//     nodes: [
//       { data: { id: "child", parent: "first_par" } },
//       { data: { id: "first_par", parent: "sec_par" } },
//       { data: { id: "CHILD", parent: "sec_par" } },
//       { data: { id: "sec_par" } },
//     ],
//     edges: [{ data: { source: "child", target: "CHILD" } }],
//   },
//   layout: {
//     name: "cose",
//     animate: "end",
//   },
//   style: `
//     node {
//       label: data(id);
//       shape: rectangle;
//       background-color: #6FB1FC;
//       border-color: #4A90E2;
//       border-width: 2;
//       text-valign: center;
//       text-halign: center;
//       color: #333;
//       font-size: 14px;
//       font-weight: bold;
//       width: 80;
//       height: 40;
//     }

//     .par {
//       background-color: #808080;
//       border-color: #666666;
//     }

//     edge {
//       width: 3;
//       line-color: #ccc;
//       target-arrow-color: #ccc;
//       target-arrow-shape: triangle;
//       curve-style: bezier;
//     }
//   `,
// });

// cy.on("tap", "node", (event) => {
//   console.log(event.target.id());
// });

function loadGraph(elements) {
  if (cy) cy.destroy();

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    layout: { name: "preset" },
    style: `
      node {
        label: data(id);
        shape: rectangle;
        background-color: #6FB1FC;
        border-color: #4A90E2;
        border-width: 2;
        text-valign: center;
        text-halign: center;
        color: #333;
        font-size: 14px;
        font-weight: bold;
        width: 100;
        height: 50;
        text-wrap: wrap;
        text-max-width: 80;
      }
      
      .parent {
        background-color:rgb(236, 236, 236);
        border-color: rgb(158, 158, 158);
        border-width: 2;
        text-valign: top;
      }
      
      edge {
        width: 3;
        line-color: #ccc;
        target-arrow-color: #ccc;
        target-arrow-shape: triangle;
        curve-style: bezier;
      }
    `,
  });
}

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
