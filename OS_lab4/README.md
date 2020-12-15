# OS_lab4

This lab work is an implementation of Hungarian algorithm in Node.js.

## Algorithm in theory

Imagine we have a corporative event, 5 coworkers and 5 tasks to organise this event. Each coworker shows himself best in different tasks. So, what is the most efficient combination of worker-task? This is the problem our current algorithm tries to solve.

First of all we should understand, that this whole problem can be described using a bipartite graph. This graph then can be described as a matrix of connections.
The algorithm is recursive(or repeatative) and contains following steps:

1. Matrix reduction by rows.
2. Matrix reduction by columns.
3. Check unique zeros. If true--the task is solved.
4. Stabilize zeros.
5. Go to 1.

More details about steps.
**Reduction** is a process of getting the smallest value from row or column and extracting it from all cells of row or column. So after step 2 we always have at least one Zero in each row and in each column.
**Check unique zeros** is the process of finding a unique zero in row AND column. We got column by column and check zeros. If zero has no previous zeros in a row, then we mark it as UNIQUE. Otherwise we skip this column. Finally, if we have unique zeros in each column, the the task is solved and we can use this matrix as a template for marking most efficient combinations of worker-tasks.
**Stabilize zeros**. This step is the hardest to understand. If we did not succeed in previous step, then we should cross out all rows and columns, which contain zeros. In the remaining matrix we find the smallest value, extract in from all values in the matrix. Then we add this value to all crosses of crossed out rows and columns. After that we start with first step again.
You can learn more about this algorithm from [here](https://habr.com/ru/post/422009/), [here](https://en.wikipedia.org/wiki/Hungarian_algorithm) and [here](https://www.youtube.com/watch?v=99TIAzj6OvY&feature=youtu.be).

## Algoritm in code

The matrix to work with is dynamically generated. The size is set to 5 rows by 5 columns.
All of the parts of code are similar to the algorithm on paper except stabilizing zeros. In this step the best way to cross out rows and columns is to cross out all found columns first and then cross out all rows from remaining matrix, which contain zeros.

## How to run this

Simply run command `node index.js`. No npm is required, 0 dependencies are required, except Node.js.
