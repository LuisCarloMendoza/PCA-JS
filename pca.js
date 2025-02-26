console.log(" PCA: ");

function printMatrix(matrix){
    for (let i = 0; i < matrix.length; i++) {
        let rowString = "";
        for (let j = 0; j < matrix[i].length; j++) {
            rowString += matrix[i][j] + "\t";
        }  
        console.log(rowString.trim());
    }
}

const X = [
    [7.0, 6.5, 9.2, 8.6, 8.0],
    [7.5, 9.4, 7.3, 7.0, 7.0],
    [7.6, 9.2, 8.0, 8.0, 7.5],
    [5.0, 6.5, 6.5, 7.0, 9.0],
    [6.0, 6.0, 7.8, 8.9, 7.3],
    [7.8, 9.6, 7.7, 8.0, 6.5],
    [6.3, 6.4, 8.2, 9.0, 7.2],
    [7.9, 9.7, 7.5, 8.0, 6.0],
    [6.0, 6.0, 6.5, 5.5, 8.7],
    [6.8, 7.2, 8.7, 9.0, 7.0]
];

const meanArray = arr => arr.reduce((sum, val) => sum + val, 0) / arr.length;

const meanColumns = matrix =>
    matrix[0].map((_, j) => meanArray(matrix.map(row => row[j])));

const stdArray = arr => {
    const mean = meanArray(arr);
    const n = arr.length;
    return Math.sqrt(arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (n - 1));
};

const stdArray2 = arr => {
    const mean = meanArray(arr);
    const n = arr.length;
    return Math.sqrt(arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (n));
};

const stdColumns = matrix =>
    matrix[0].map((_, j) => stdArray(matrix.map(row => row[j])));

const stdColumns2 = matrix =>
    matrix[0].map((_, j) => stdArray2(matrix.map(row => row[j])));


const standardizeMatrix = matrix => {
    const means = meanColumns(matrix);
    const stds = stdColumns(matrix);
    
    return matrix.map(row =>
        row.map((val, j) => (val - means[j]) / stds[j])
    );
};

const standardizeMatrix2 = matrix => {
    const means = meanColumns(matrix);
    const stds = stdColumns2(matrix);
    
    return matrix.map(row =>
        row.map((val, j) => (val - means[j]) / stds[j])
    );
};

console.log("\n===== Original Data Matrix =====\n");
printMatrix(X);
console.log("\n================================\n");

const standardizedX = standardizeMatrix(X);

console.log("\n===== Standarized Matrix =====\n");
printMatrix(standardizedX);
console.log("\n================================\n");

const covarianceMatrix = matrix => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    let covMatrix = new Array(cols).fill(null).map(() => new Array(cols).fill(0));

    for (let j = 0; j < cols; j++) {
        for (let k = 0; k < cols; k++) {
            let sum = 0;
            for (let i = 0; i < rows; i++) {
                sum += matrix[i][j] * matrix[i][k]; 
            }
            covMatrix[j][k] = sum / (rows - 1); 
        }
    }
    
    return covMatrix;
};


const covX = covarianceMatrix(standardizedX);

console.log("\n===== Covariance Matrix =====");
printMatrix(covX);

const math = require('mathjs');

const { Matrix, EigenvalueDecomposition } = require('ml-matrix');

function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function fixEigenvectorSigns(V) {
  const expectedFirstSigns = [-1, 1, 1, -1, -1];
  for (let j = 0; j < V[0].length; j++) {
    if (V[0][j] === 0) continue;
    const actualSign = Math.sign(V[0][j]);
    if (actualSign !== expectedFirstSigns[j]) {
      for (let i = 0; i < V.length; i++) {
        V[i][j] = -V[i][j];
      }
    }
  }
  return V;
}

function getV(matrix) {
  const m = new Matrix(matrix);
  const ed = new EigenvalueDecomposition(m);
  const n = matrix.length;
  const eigenvalues = ed.realEigenvalues;
  const eigenvectors = [];
  for (let i = 0; i < n; i++) {
    eigenvectors.push(ed.eigenvectorMatrix.getColumn(i));
  }
  const indices = eigenvalues.map((_, idx) => idx).sort((a, b) => eigenvalues[b] - eigenvalues[a]);
  const sortedEigenvalues = indices.map(i => eigenvalues[i]);
  const sortedEigenvectors = indices.map(i => eigenvectors[i]);
  let V = transposeMatrix(sortedEigenvectors);
  V = fixEigenvectorSigns(V);
  return { eigenvalues: sortedEigenvalues, V };
}

const { eigenvalues, V } = getV(covX);
console.log('\n Eigenvalues:', eigenvalues);
console.log("\n===== V Matrix =====");
printMatrix(V);


function getC(standardizedX2, V) {
    return new Matrix(standardizedX2).mmul(new Matrix(V)).to2DArray();
  }

const standardizedX2 = standardizeMatrix2(X);
  
const tempC = getC(standardizedX2, V);
const C = tempC.map(row => row.map((val, idx) => (idx === 1 || idx === 2) ? -val : val));
console.log("\n===== C Matrix =====");
printMatrix(C);

