/**
 * Calculates a new fractional position for a task dropped in a column.
 * 
 * @param {Array} sortedTasks - Current list of tasks in the target column, sorted by position ASC
 * @param {number} targetIndex - Index where the task is being inserted
 * @returns {number} The calculated new position
 */
export const calculateNewPosition = (sortedTasks, targetIndex) => {
  const count = sortedTasks.length;

  // Case 1: Target column is empty
  if (count === 0) {
    return 1000;
  }

  // Case 2: Dropped at the very beginning
  if (targetIndex <= 0) {
    const firstTaskPos = sortedTasks[0].position;
    return firstTaskPos > 0 ? firstTaskPos / 2 : firstTaskPos - 1000;
  }

  // Case 3: Dropped at the very end
  if (targetIndex >= count) {
    const lastTaskPos = sortedTasks[count - 1].position;
    return lastTaskPos + 1000;
  }

  // Case 4: Dropped between two existing tasks
  const prevTaskPos = sortedTasks[targetIndex - 1].position;
  const nextTaskPos = sortedTasks[targetIndex].position;
  return (prevTaskPos + nextTaskPos) / 2;
};
