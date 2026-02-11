import { describe, it, expect } from "vitest";
import {
  parseViewUrl,
  formatTasksToMarkdown,
  formatRecentlyDoneTasksToMarkdown,
  filterTasksCompletedWithinDays,
  type Task,
} from "./fetch-tasks";

describe("parseViewUrl", () => {
  it("should extract viewId from Linear view URL", () => {
    const url = "https://linear.app/my-team/view/12345678-abcd-efgh-ijkl-mnopqrstuvwx";
    const result = parseViewUrl(url);
    expect(result).toEqual({
      viewId: "12345678-abcd-efgh-ijkl-mnopqrstuvwx",
    });
  });

  it("should extract viewId from URL with trailing slash", () => {
    const url = "https://linear.app/my-team/view/12345678-abcd-efgh-ijkl-mnopqrstuvwx/";
    const result = parseViewUrl(url);
    expect(result).toEqual({
      viewId: "12345678-abcd-efgh-ijkl-mnopqrstuvwx",
    });
  });

  it("should extract viewId from URL with percent-encoded characters", () => {
    const url = "https://linear.app/my-team/view/%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB-abcdef123";
    const result = parseViewUrl(url);
    expect(result).toEqual({
      viewId: "%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB-abcdef123",
    });
  });

  it("should throw error for invalid URL", () => {
    const url = "https://linear.app/my-team/issue/ABC-123";
    expect(() => parseViewUrl(url)).toThrow("Invalid Linear view URL");
  });

  it("should throw error for non-Linear URL", () => {
    const url = "https://example.com/view/123";
    expect(() => parseViewUrl(url)).toThrow("Invalid Linear view URL");
  });
});

describe("formatTasksToMarkdown", () => {
  it("should format tasks to markdown list", () => {
    const tasks: Task[] = [
      {
        identifier: "ABC-123",
        title: "Fix bug",
        url: "https://linear.app/team/issue/ABC-123",
        completedAt: null,
      },
      {
        identifier: "ABC-456",
        title: "Add feature",
        url: "https://linear.app/team/issue/ABC-456",
        completedAt: null,
      },
    ];

    const result = formatTasksToMarkdown(tasks);
    const expected = `# Linear Tasks

## ABC-123

- **Title**: Fix bug
- **URL**: https://linear.app/team/issue/ABC-123

## ABC-456

- **Title**: Add feature
- **URL**: https://linear.app/team/issue/ABC-456
`;
    expect(result).toBe(expected);
  });

  it("should handle empty task list", () => {
    const tasks: Task[] = [];
    const result = formatTasksToMarkdown(tasks);
    expect(result).toBe("# Linear Tasks\n\nNo tasks found.\n");
  });
});

describe("filterTasksCompletedWithinDays", () => {
  it("should keep only tasks completed in the last 7 days", () => {
    const now = new Date("2026-02-11T00:00:00.000Z");
    const tasks: Task[] = [
      {
        identifier: "ABC-001",
        title: "Recent task",
        url: "https://linear.app/team/issue/ABC-001",
        completedAt: new Date("2026-02-10T12:00:00.000Z"),
      },
      {
        identifier: "ABC-002",
        title: "Old task",
        url: "https://linear.app/team/issue/ABC-002",
        completedAt: new Date("2026-02-01T12:00:00.000Z"),
      },
      {
        identifier: "ABC-003",
        title: "No completion date",
        url: "https://linear.app/team/issue/ABC-003",
        completedAt: null,
      },
      {
        identifier: "ABC-004",
        title: "Boundary task",
        url: "https://linear.app/team/issue/ABC-004",
        completedAt: new Date("2026-02-04T00:00:00.000Z"),
      },
    ];

    const result = filterTasksCompletedWithinDays(tasks, 7, now);
    expect(result.map((task) => task.identifier)).toEqual(["ABC-001", "ABC-004"]);
  });
});

describe("formatRecentlyDoneTasksToMarkdown", () => {
  it("should format recently done tasks to markdown list", () => {
    const tasks: Task[] = [
      {
        identifier: "ABC-123",
        title: "Fix bug",
        url: "https://linear.app/team/issue/ABC-123",
        completedAt: new Date("2026-02-10T12:00:00.000Z"),
      },
    ];

    const result = formatRecentlyDoneTasksToMarkdown(tasks, 7);
    const expected = `# Linear Recently Done Tasks (Last 7 Days)

## ABC-123

- **Title**: Fix bug
- **URL**: https://linear.app/team/issue/ABC-123
- **Completed At**: 2026-02-10
`;
    expect(result).toBe(expected);
  });
});
