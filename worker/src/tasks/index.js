const fs = require("fs");
const path = require("path");

function loadTasks(logger) {
  const tasks = [];
  const tasksDir = path.join(__dirname, "tasks");

  if (!fs.existsSync(tasksDir)) {
    logger.warn(`Tasks directory not found: ${tasksDir}`);
    return tasks;
  }

  const files = fs.readdirSync(tasksDir).filter(
    (f) => f.endsWith(".js") && f !== "index.js"
  );

  for (const file of files) {
    try {
      const task = require(path.join(tasksDir, file));
      if (task.name && typeof task.run === "function") {
        tasks.push(task);
        logger.info(`  → Loaded: ${task.name}${task.dependsOn ? ` (depends on: ${task.dependsOn.join(", ")})` : ""}`);
      }
    } catch (err) {
      logger.error(`Failed to load task ${file}: ${err.message}`);
    }
  }

  return tasks;
}

module.exports = { loadTasks };
