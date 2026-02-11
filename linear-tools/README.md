# linear-tools

Linear のカスタムビューからタスク一覧を取得するためのツール群です。  
`Recently Done` ビューの直近1週間タスク一覧出力と、タスクのランダム選択に対応しています。

## セットアップ

```bash
cd linear-tools
pnpm install
```

## 環境変数

Linear API キーを設定してください。

```bash
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

API キーは [Linear Settings > API](https://linear.app/settings/api) から取得できます。

## 使い方

### 1. タスク一覧の取得

Linear のビュー URL を引数に渡して実行します。

```bash
pnpm fetch "https://linear.app/your-team/view/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

タスク一覧が `linear/list-YYYY-MM-DD.md` に保存されます。

### 2. Recently Done の直近タスク一覧を取得

`Recently Done` ビュー URL を指定し、完了日が直近7日以内のタスクを出力します。

```bash
pnpm fetch:recently-done "https://linear.app/your-team/view/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

任意で日数を指定できます（例: 14日）。

```bash
pnpm fetch:recently-done "https://linear.app/your-team/view/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 14
```

出力は `linear/recently-done-YYYY-MM-DD.md` です。

### 3. ランダムに1つ選ぶ

```bash
pnpm pick
```

最新の `list-*.md` ファイルからランダムに1つのタスクを選んで表示します。

## 出力ファイル形式

`linear/list-YYYY-MM-DD.md` の形式:

```markdown
# Linear Tasks

## ABC-123

- **Title**: タスクのタイトル
- **URL**: https://linear.app/team/issue/ABC-123

## ABC-456

- **Title**: 別のタスク
- **URL**: https://linear.app/team/issue/ABC-456
```

`linear/recently-done-YYYY-MM-DD.md` の形式:

```markdown
# Linear Recently Done Tasks (Last 7 Days)

## ABC-123

- **Title**: タスクのタイトル
- **URL**: https://linear.app/team/issue/ABC-123
- **Completed At**: 2026-02-10
```

## 開発

### テスト

```bash
pnpm test
```

### ビルド

```bash
pnpm build
```
