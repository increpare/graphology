function toRowEchelonForm(matrix, returnMethod) {
        'use strict';
        var f, pivotRow, toReduceRow, scaledRow, len, pos, new_matrix;

        function sortRows(matrix) {
                var pivots, c;
                // map rows to arrays with the structure
                // [<column index>, <pivot coefficient>, <row index>]
                // which makes them easily sortable
                pivots = matrix.map(function (row, r) {
                        var len = row.length;

                        for (c = 0; c < len; c += 1) {
                                if (row[c]) {
                                        return [c, row[c], r]; // found a non-zero coefficient at matrix[r][c]
                                }
                        }

                        return [Infinity, null, r]; // row is all-zero
                });

                // sort the pivots array, and use it to (re)build
                // the matrix with the rows in the correct order
                return pivots.sort().map(function (pivot) {
                        return matrix[pivot[2]];
                });
        }

        function leadingPivotsToTop(matrix) {
                var r, c, len, has_pivot, irrelevant, positions, new_matrix, count;

                len = {
                        row: matrix.length,
                        col: matrix[0].length
                };
                positions  = [];
                has_pivot  = [];
                irrelevant = [];
                new_matrix = [];
                count      = 0;

                // Find pivot positions
                for (c = 0; c < len.col; c += 1) {
                        for (r = 0; r < len.row; r += 1) {
                                if (matrix[r][c] === 1 && has_pivot[r] !== r) {
                                        has_pivot[r] = r;
                                        positions[positions.length] = r;
                                        break;
                                }
                        }
                }

                // Find irrelevant vectors positions
                for (r = 0; r < len.row; r += 1) {
                        if (has_pivot[r] === undefined) {
                                irrelevant[irrelevant.length] = r;
                                count += 1;
                        }
                }

                count = 0;

                // Sort positions
                for (r = 0; r < len.row; r += 1) {
                        if (matrix[positions[r]] !== undefined) {
                                new_matrix[r] = matrix[positions[r]];
                        } else {
                                new_matrix[r] = matrix[irrelevant[count]];
                                count += 1;
                        }
                }

                return new_matrix;
        }

        new_matrix = matrix;
        pos = {
                pivot: 0,
                reserved: []
        };
        len = {
                row: matrix.length,
                col: matrix[0].length
        };
        f = {
                getPivotPosition: function (pivotRow) {
                        var c;

                        for (c = 0; c < len.col; c += 1) {
                                if (new_matrix[pivotRow][c] !== 0
                                && pos.reserved[c] === undefined) {
                                        pos.reserved[c] = 1;
                                        return c;
                                }
                        }

                        return null;
                },
                reducePivotRow: function (pivotRow) {
                        var c, pivot;

                        if (new_matrix[pivotRow][pos.pivot] !== 1) {
                                pivot = new_matrix[pivotRow][pos.pivot];
                                for (c = 0; c < len.col; c += 1) {
                                        new_matrix[pivotRow][c] /= pivot;
                                }
                        }
                },
                scaleRow: function (pivotRow, toReduceRow) {
                        var c, row;

                        row = [];

                        for (c = 0; c < len.col; c += 1) {
                                row[c]  = new_matrix[pivotRow][c];
                                row[c] *= new_matrix[toReduceRow][pos.pivot];
                        }

                        return row;
                },
                rowReduction: function (toReduceRow, scaledRow) {
                        var c;

                        for (c = 0; c < len.col; c += 1) {
                                new_matrix[toReduceRow][c] -= scaledRow[c];
                        }
                }
        };

        for (pivotRow = 0; pivotRow < len.row; pivotRow += 1) {

                pos.pivot = null;

                pos.pivot = f.getPivotPosition(pivotRow);

                if (pos.pivot !== null) {
                        f.reducePivotRow(pivotRow);

                        for (
                                toReduceRow = 0;
                                toReduceRow < len.row;
                                toReduceRow += 1
                        ) {
                                if (toReduceRow !== pivotRow
                                && new_matrix[toReduceRow][pos.pivot] !== 0) {
                                        scaledRow = f.scaleRow(
                                                pivotRow,
                                                toReduceRow
                                        );
                                        f.rowReduction(
                                                toReduceRow,
                                                scaledRow
                                        );
                                }
                        }
                }
        }

        if (returnMethod === "raw") {
                return new_matrix;
        } else if (returnMethod === "lead to top") {
                return leadingPivotsToTop(new_matrix);
        } else if (returnMethod === "lead to top and zeroes to bottom") {
                return sortRows(new_matrix);
        } else {
                return leadingPivotsToTop(new_matrix);
        }
}

function compereMatrices(matrixA, matrixB) {
        'use strict';
        var i, j, len;

        if (matrixA.length !== matrixB.length) {
                return false;
        }

        len = {};

        len.i = matrixA.length;

        for (i = 0; i < len.i; i += 1) {
                if (matrixA[i].length !== matrixB[i].length) {
                        return false;
                }

                len.j = matrixA[i].length;

                for (j = 0; j < len.j; j += 1) {
                        if (matrixA[i][j] !== matrixB[i][j]) {
                                return false;
                        }
                }
        }

        return true;
}


// Tests.
var m = [
        [5, -7, -8, -4],
        [2, 8, -22, -55],
        [-3, 0, -36, 12]
];
// answer: http://www.wolframalpha.com/input/?i=solve+row+echelon+form+{{5%2C+-7%2C+-8%2C+-4}%2C{2%2C+8%2C+-22%2C+-55}%2C+{-3%2C+0%2C+-36%2C+12}}
var mr = [
        [1, 0, 0, -6.785219399538105],
        [0, 1, 0, -4.54041570438799],
        [0, 0, 1, 0.23210161662817538]
];

console.log(" ");
console.log("toRowEcholonForm test:         " + compereMatrices(toRowEchelonForm(m), mr));

// answer: http://www.wolframalpha.com/input/?i=solve+row+echelon+form+{{5%2C+-23%2C+2%2C+4%2C+5%2C+11}%2C{4%2C+-3%2C+6%2C+4%2C+5%2C+2}%2C{3%2C+7%2C+-18%2C+7%2C+9%2C+-6}%2C{4%2C+87%2C+-12%2C+7%2C+12%2C+6}%2C{5%2C+4%2C+7%2C+11%2C+7%2C+-7}}
var m = [
        [5, -23, 2, 4, 5, 11],
        [4, -3, 6, 4, 5, 2],
        [3, 7, -18, 7, 9, -6],
        [4, 87, -12, 7, 12, 6],
        [5, 4, 7, 11, 7, -7]
];

var mr = [
        [1, 0, 0, 0, 0, 10.784116921993304],
        [0, 1, 0, 0, 0, 0.3085998347488045],
        [0, 0, 1, 0, 0, -1.0969699432456959],
        [0, 0, 0, 1, 0, -1.369593780053366],
        [0, 0, 0, 0, 1, -5.630094680807834]
];

console.log(" ");
console.log("toRowEcholonForm test:         " + compereMatrices(toRowEchelonForm(m), mr));

// answer: http://www.wolframalpha.com/input/?i=solve+row+echelon+form+{{1%2C+2%2C+2%2C+2}%2C{1%2C+3%2C+3%2C+3}%2C+{1%2C+4%2C+16%2C+5}}
m = [
        [1, 2, 2, 2],
        [1, 3, 3, 3],
        [1, 4, 16, 5]
];

mr = [
[0,0,0,0,0,1,0,2,0,0,1,2,0,1,1,0],
[1,0,0,0,0,1,0,1,0,0,0,1,1,2,1,0],
[2,0,0,1,0,2,0,1,0,0,0,0,1,1,0,0],
[1,0,0,0,0,0,0,1,0,0,1,1,1,1,2,0],
[0,0,0,2,0,0,0,2,0,0,0,0,2,2,0,0],
[1,0,0,2,0,1,0,2,0,0,0,0,1,1,0,0],
[0,0,0,1,0,2,0,1,1,0,1,0,0,1,1,0],
[0,0,0,0,0,2,0,1,0,0,2,1,0,1,1,0],
[0,0,0,0,0,2,0,1,0,0,2,1,0,1,1,0],
[2,0,0,0,1,0,0,0,0,0,3,0,0,1,1,0],
[0,0,0,0,0,2,1,1,0,1,2,0,0,1,0,0],
[3,0,0,0,0,3,0,0,0,0,0,0,1,1,0,0],
[0,0,0,0,0,2,0,1,0,0,2,1,0,1,1,0],
[0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,4],
[0,0,0,0,0,2,0,1,0,0,2,1,0,1,1,0],
[1,0,0,1,0,1,0,2,0,0,0,1,0,1,1,0],
[1,0,0,1,0,0,0,1,0,0,1,2,0,1,1,0],
[0,0,0,0,0,1,1,2,0,2,1,0,0,1,0,0],
[0,0,0,2,0,0,0,1,0,0,0,1,2,1,1,0],
[0,0,0,0,0,3,0,1,0,0,3,1,0,0,0,0],
[0,0,0,0,0,3,0,0,0,0,3,0,0,1,1,0],
[0,0,0,0,0,3,1,0,0,1,3,0,0,0,0,0],
[0,0,0,0,0,2,0,1,0,0,2,1,0,1,1,0],
[0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
[0,0,0,0,0,3,1,0,0,1,3,0,0,0,0,0],
[0,1,0,1,0,0,2,0,1,0,0,1,1,1,0,0],
];

console.log("BOOP");
console.log(toRowEchelonForm(mr))