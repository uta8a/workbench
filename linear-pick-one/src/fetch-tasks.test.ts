import { describe, it, expect } from "vitest";
import { parseViewUrl, formatTasksToMarkdown, type Task } from "./fetch-tasks";

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
      },
      {
        identifier: "ABC-456",
        title: "Add feature",
        url: "https://linear.app/team/issue/ABC-456",
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

  it("should escape special characters in title", () => {
    const tasks: Task[] = [
      {
        identifier: "ABC-123",
        title: "Fix `code` and *bold* issue",
        url: "https://linear.app/team/issue/ABC-123",
      },
    ];

    const result = formatTasksToMarkdown(tasks);
    expect(result).toContain("Fix `code` and *bold* issue");
  });
});
