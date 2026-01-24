# linear-pick-one

Linear のカスタムビューからタスク一覧を取得し、ランダムに1つを選ぶツールです。

## セットアップ

```bash
cd linear-pick-one
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

### 2. ランダムに1つ選ぶ

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

## 開発

### テスト

```bash
pnpm test
```

### ビルド

```bash
pnpm build
```
