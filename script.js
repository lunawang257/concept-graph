const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: {
    nodes: [
      { data: { id: "protons" } },
      { data: { id: "nucleus" } },
      { data: { id: "electrons" } },
    ],
    edges: [
      { data: { source: "nucleus", target: "electrons" } },
      { data: { source: "nucleus", target: "protons" } },
    ],
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
