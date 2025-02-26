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

const stdColumns = matrix =>
    matrix[0].map((_, j) => stdArray(matrix.map(row => row[j])));


const standardizeMatrix = matrix => {
    const means = meanColumns(matrix);
    const stds = stdColumns(matrix);
    
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

const math = require('mathjs');

const eigDecomposition = matrix => {
    try {
        const result = math.eigs(matrix); 
        console.log("\n🛠 DEBUG: Raw Eigen Decomposition Output:", result); 

        if (!result.eigenvectors || !result.values) {
            throw new Error("Error: Eigenvalues or Eigenvectors not computed!");
        }

        return { eigenvalues: result.values, eigenvectors: result.eigenvectors };
    } catch (error) {
        console.error("\nError: Failed to compute eigendecomposition.");
        console.error(error.message);
        process.exit(1); 
    }
};

const { eigenvalues, eigenvectors } = eigDecomposition(covX);

if (!eigenvectors || eigenvectors.length === 0) {
    console.error("\nError: Eigenvectors array is empty! Check math.eigs().");
    process.exit(1);
}

console.log("\n===== Eigenvectors (V) =====");
console.log("Raw Eigenvectors Data:", eigenvectors); 
printMatrix(eigenvectors); 

const sortEigen = (eigenvalues, eigenvectors) => {
    if (!eigenvalues || !eigenvectors) {
        console.error("\nError: Cannot sort undefined eigenvalues/eigenvectors.");
        process.exit(1);
    }

    const sortedIndices = eigenvalues
        .map((val, i) => [val, i])
        .sort((a, b) => b[0] - a[0]) 
        .map(pair => pair[1]);

    return {
        sortedEigenvalues: sortedIndices.map(i => eigenvalues[i]),
        sortedEigenvectors: sortedIndices.map(i => eigenvectors.map(row => row[i])) 
    };
};

const { sortedEigenvalues, sortedEigenvectors } = sortEigen(eigenvalues, eigenvectors);

console.log("\n===== Sorted Eigenvalues =====");
console.log(sortedEigenvalues.map(val => val.toFixed(4)).join("\t"));

console.log("\n===== Sorted Eigenvectors (V) =====");
printMatrix(sortedEigenvectors);

console.log("\n===== Covariance Matrix =====");
printMatrix(covX);

console.log("\n===== Eigenvalues =====");
console.log(eigenvalues.map(val => val.toFixed(4)).join("\t"));

console.log("\n===== Eigenvectors (V) =====");
printMatrix(eigenvectors);

