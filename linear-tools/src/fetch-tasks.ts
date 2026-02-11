import { LinearClient } from "@linear/sdk";
import * as fs from "node:fs";
import * as path from "node:path";

export interface Task {
  identifier: string;
  title: string;
  url: string;
  completedAt?: Date | null;
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

export function formatRecentlyDoneTasksToMarkdown(
  tasks: Task[],
  days = 7
): string {
  if (tasks.length === 0) {
    return `# Linear Recently Done Tasks (Last ${days} Days)\n\nNo tasks found.\n`;
  }

  let markdown = `# Linear Recently Done Tasks (Last ${days} Days)\n`;

  for (const task of tasks) {
    markdown += `\n## ${task.identifier}\n\n`;
    markdown += `- **Title**: ${task.title}\n`;
    markdown += `- **URL**: ${task.url}\n`;
    markdown += `- **Completed At**: ${formatDate(task.completedAt)}\n`;
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
        completedAt: normalizeCompletedAt(issue.completedAt),
      });
    }

    hasNextPage = issues.pageInfo.hasNextPage;
    cursor = issues.pageInfo.endCursor ?? undefined;
  }

  return tasks;
}

export function filterTasksCompletedWithinDays(
  tasks: Task[],
  days: number,
  now = new Date()
): Task[] {
  const nowMs = now.getTime();
  const windowMs = days * 24 * 60 * 60 * 1000;

  return tasks
    .filter((task) => {
      if (!task.completedAt) {
        return false;
      }

      const completedAtMs = task.completedAt.getTime();
      const diff = nowMs - completedAtMs;
      return diff >= 0 && diff <= windowMs;
    })
    .sort((a, b) => {
      const aTime = a.completedAt?.getTime() ?? 0;
      const bTime = b.completedAt?.getTime() ?? 0;
      return bTime - aTime;
    });
}

/**
 * Save tasks to a markdown file
 */
export function saveTasksToFile(tasks: Task[], outputDir: string): string {
  return saveMarkdownToFile(outputDir, "list", formatTasksToMarkdown(tasks));
}

export function saveRecentlyDoneTasksToFile(
  tasks: Task[],
  outputDir: string,
  days = 7
): string {
  return saveMarkdownToFile(
    outputDir,
    "recently-done",
    formatRecentlyDoneTasksToMarkdown(tasks, days)
  );
}

function saveMarkdownToFile(
  outputDir: string,
  filenamePrefix: string,
  content: string
): string {
  const date = new Date().toISOString().split("T")[0];
  const filename = `${filenamePrefix}-${date}.md`;
  const filepath = path.join(outputDir, filename);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, "utf-8");

  return filepath;
}

function normalizeCompletedAt(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date | null | undefined): string {
  if (!value) {
    return "Unknown";
  }
  return value.toISOString().split("T")[0];
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
