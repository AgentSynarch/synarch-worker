// Task: File Watcher
// Snapshots a directory tree and diffs against the previous run.
// Detects added, modified, and deleted files.

const fs = require("fs");
const path = require("path");

module.exports = {
  name: "file-watcher",

  async run(logger, client, ctx) {
    const watchDir = process.env.WATCH_DIR || ".";
    const maxDepth = parseInt(process.env.WATCH_DEPTH || "2");

    const snapshot = {};
    let totalSize = 0;

    const scanDir = (dir, depth = 0) => {
      if (depth > maxDepth) return;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
          if (entry.isFile()) {
            const stat = fs.statSync(fullPath);
            snapshot[fullPath] = { size: stat.size, modified: stat.mtimeMs };
            totalSize += stat.size;
          } else if (entry.isDirectory()) {
            scanDir(fullPath, depth + 1);
          }
        }
      } catch { /* permission denied, etc */ }
    };

    scanDir(watchDir);

    const fileCount = Object.keys(snapshot).length;
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

    // Compare with previous snapshot
    const prev = ctx.previousResults?.get("file-watcher")?.data?.snapshot;
    const changes = { added: [], modified: [], deleted: [] };

    if (prev) {
      for (const [file, info] of Object.entries(snapshot)) {
        if (!prev[file]) changes.added.push(file);
        else if (prev[file].modified !== info.modified) changes.modified.push(file);
      }
      for (const file of Object.keys(prev)) {
        if (!snapshot[file]) changes.deleted.push(file);
      }

      const totalChanges = changes.added.length + changes.modified.length + changes.deleted.length;
      if (totalChanges > 0) {
        logger.info(`${totalChanges} change(s) detected`, {
          added: changes.added.length,
          modified: changes.modified.length,
          deleted: changes.deleted.length,
        });
        for (const f of changes.added) logger.info(`  + ${f}`);
        for (const f of changes.modified) logger.info(`  ~ ${f}`);
        for (const f of changes.deleted) logger.info(`  - ${f}`);
      } else {
        logger.info(`No changes`, { files: fileCount, size: `${sizeMB}MB` });
      }
    } else {
      logger.info(`Initial snapshot`, { files: fileCount, size: `${sizeMB}MB` });
    }

    return { snapshot, fileCount, totalSize, changes };
  },
};
