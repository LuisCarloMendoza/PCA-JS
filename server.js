const express = require("express");
const app = express();
const port = 3000;
const pca = require("./pca.js");

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>PCA Visualizations</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
      #charts {
        display: flex;
        justify-content: space-around;
      }
      .chart {
        width: 45%;
      }
    </style>
  </head>
  <body>
    <div id="charts">
      <div id="principalPlaneChart" class="chart"></div>
      <div id="correlationCircleChart" class="chart"></div>
    </div>
    <script>
      const C = ${JSON.stringify(pca.C)};
      const names = ${JSON.stringify(pca.names)};
      const T = ${JSON.stringify(pca.T)};
      const variableNames = ${JSON.stringify(pca.variableNames)};

      function createPCACharts(projectedData, names, variableCoordinates, variableNames) {
        const individualTrace = {
          x: projectedData.map(d => d[0]),
          y: projectedData.map(d => d[1]),
          mode: 'markers+text',
          text: names,
          textposition: 'top center',
          type: 'scatter',
          marker: { size: 8 }
        };
        const principalLayout = {
          title: 'Principal Plane (Individuals Projection)',
          xaxis: { title: 'Principal Component 1' },
          yaxis: { title: 'Principal Component 2' }
        };
        Plotly.newPlot("principalPlaneChart", [individualTrace], principalLayout);
        
        // Create a modified copy of variableCoordinates flipping only the y component for specific variables
        const modifiedVariableCoordinates = variableCoordinates.map((coord, i) => {
          if (["Historia", "Espanol", "Matematicas", "Ciencias"].includes(variableNames[i])) {
            return [coord[0], -coord[1]];
          }
          return coord;
        });
        
        const variableTrace = {
          x: modifiedVariableCoordinates.map(d => d[0]),
          y: modifiedVariableCoordinates.map(d => d[1]),
          mode: 'markers+text',
          text: variableNames,
          textposition: 'top center',
          type: 'scatter',
          marker: { size: 8 }
        };
        const circleX = [];
        const circleY = [];
        for (let angle = 0; angle <= 2 * Math.PI; angle += 0.1) {
          circleX.push(Math.cos(angle));
          circleY.push(Math.sin(angle));
        }
        const circleTrace = {
          x: circleX,
          y: circleY,
          mode: 'lines',
          type: 'scatter',
          line: { dash: 'dot', color: 'gray' }
        };
        const correlationLayout = {
          title: 'Correlation Circle',
          xaxis: { title: 'Principal Component 1', range: [-1.5, 1.5] },
          yaxis: { title: 'Principal Component 2', range: [-1.5, 1.5] }
        };
        Plotly.newPlot("correlationCircleChart", [variableTrace, circleTrace], correlationLayout);
      }

      createPCACharts(C, names, T, variableNames);
    </script>
  </body>
</html>`);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
