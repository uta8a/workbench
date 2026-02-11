import { LinearClient } from "@linear/sdk";
import * as path from "node:path";
import {
  fetchTasksFromView,
  filterTasksCompletedWithinDays,
  parseViewUrl,
  saveRecentlyDoneTasksToFile,
} from "./fetch-tasks";

async function main() {
  const viewUrl = process.argv[2];
  const daysArg = process.argv[3];

  if (!viewUrl) {
    console.error("Usage: pnpm fetch:recently-done <linear-view-url> [days]");
    process.exit(1);
  }

  const days = daysArg ? Number.parseInt(daysArg, 10) : 7;
  if (!Number.isInteger(days) || days <= 0) {
    console.error("Error: days must be a positive integer");
    process.exit(1);
  }

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error("Error: LINEAR_API_KEY environment variable is not set");
    process.exit(1);
  }

  try {
    const { viewId } = parseViewUrl(viewUrl);
    const client = new LinearClient({ apiKey });

    console.log(`Fetching recently done tasks from view: ${viewId}`);
    const tasks = await fetchTasksFromView(client, viewId);
    const recentTasks = filterTasksCompletedWithinDays(tasks, days);

    const outputDir = path.join(process.cwd(), "linear");
    const filepath = saveRecentlyDoneTasksToFile(recentTasks, outputDir, days);

    console.log(
      `Saved ${recentTasks.length} tasks completed in last ${days} days to: ${filepath}`
    );
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
