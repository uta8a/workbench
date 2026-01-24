import { LinearClient } from "@linear/sdk";
import * as fs from "node:fs";
import * as path from "node:path";

export interface Task {
  identifier: string;
  title: string;
  url: string;
}

export interface ParsedViewUrl {
  viewId: string;
}

/**
 * Parse a Linear view URL and extract the view ID
 */
export function parseViewUrl(url: string): ParsedViewUrl {
  // Allow percent-encoded characters (e.g., Japanese characters like %E3%82%BF)
  const viewUrlPattern = /^https:\/\/linear\.app\/[^\/]+\/view\/([a-zA-Z0-9%_-]+)\/?$/;
  const match = url.match(viewUrlPattern);
  
  if (!match) {
    throw new Error("Invalid Linear view URL");
  }

  return {
    viewId: match[1],
  };
}

/**
 * Format tasks to Markdown
 */
export function formatTasksToMarkdown(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "# Linear Tasks\n\nNo tasks found.\n";
  }

  let markdown = "# Linear Tasks\n";
  
  for (const task of tasks) {
    markdown += `\n## ${task.identifier}\n\n`;
    markdown += `- **Title**: ${task.title}\n`;
    markdown += `- **URL**: ${task.url}\n`;
  }
  
  return markdown;
}

/**
 * Fetch all tasks from a Linear view (handles pagination)
 */
export async function fetchTasksFromView(
  client: LinearClient,
  viewId: string
): Promise<Task[]> {
  const customView = await client.customView(viewId);
  
  if (!customView) {
    throw new Error(`View not found: ${viewId}`);
  }

  const tasks: Task[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const issues = await customView.issues({ first: 100, after: cursor });
    
    for (const issue of issues.nodes) {
      tasks.push({
        identifier: issue.identifier,
        title: issue.title,
        url: issue.url,
      });
    }

    hasNextPage = issues.pageInfo.hasNextPage;
    cursor = issues.pageInfo.endCursor ?? undefined;
  }

  return tasks;
}

/**
 * Save tasks to a markdown file
 */
export function saveTasksToFile(tasks: Task[], outputDir: string): string {
  const date = new Date().toISOString().split("T")[0];
  const filename = `list-${date}.md`;
  const filepath = path.join(outputDir, filename);
  
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const content = formatTasksToMarkdown(tasks);
  fs.writeFileSync(filepath, content, "utf-8");
  
  return filepath;
}

async function main() {
  const viewUrl = process.argv[2];
  
  if (!viewUrl) {
    console.error("Usage: pnpm fetch <linear-view-url>");
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
    
    console.log(`Fetching tasks from view: ${viewId}`);
    const tasks = await fetchTasksFromView(client, viewId);
    
    const outputDir = path.join(process.cwd(), "linear");
    const filepath = saveTasksToFile(tasks, outputDir);
    
    console.log(`Saved ${tasks.length} tasks to: ${filepath}`);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run main only when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
