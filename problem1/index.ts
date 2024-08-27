
// using for loop to count from 0 to n
function sumLoop(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// sum of n numbers using recursion
function sumRecursion(n: number): number {
    if (n === 1) {
        return 1;
    }
    return n + sumRecursion(n - 1);
}

// sum of n numbers using formula
function sumFormula(n: number): number {
    return (n * (n + 1)) / 2;
}