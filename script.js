const API_BASE = "http://127.0.0.1:8000";

let cy = cytoscape({
  container: document.getElementById("cy"),
  elements: {
    nodes: [
      { data: { id: "child", parent: "first_par" } },
      { data: { id: "first_par", parent: "sec_par" } },
      { data: { id: "CHILD", parent: "sec_par" } },
      { data: { id: "sec_par" } },
    ],
    edges: [{ data: { source: "child", target: "CHILD" } }],
  },
  layout: {
    name: "cose",
    animate: false,
  },
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
        "font-size": "14px",
        "font-weight": "bold",
        width: 80,
        height: 40,
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ],
});

cy.on("tap", "node", (event) => {
  console.log(event.target.id());
});

function loadGraph(elements) {
  if (cy) cy.destroy;

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    layout: {
      name: "breadthfirst",

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
      spacingFactor: 1.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      roots: undefined, // the roots of the trees
      depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled,
      animateFilter: function (node, i) {
        return true;
      }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position) {
        return position;
      }, // transform a given node position. Useful for changing flow direction in discrete layouts
    },
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
          "font-size": "14px",
          "font-weight": "bold",
          width: 100,
          height: 40,
          "text-wrap": "wrap"
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
    ],
  });
}

const loadBtn = document.querySelector(".load");
loadBtn.addEventListener("click", async () => {
  const res = await fetch(API_BASE + "/nodes-json");
  const contents = await res.json();
  loadGraph(contents);
});
