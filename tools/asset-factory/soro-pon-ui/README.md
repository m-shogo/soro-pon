# asset-factory (soro-pon UI)

画像生成系アセットの作業領域。正本は `docs/IMAGE-ASSET-WORKFLOW.md`。

```text
prompts/   生成指示と呼び出しスクリプト(git管理)
records/   候補ごとの生成記録metadata JSON(git管理)
raw-green/ グリーン背景の元画像(gitignore・ローカル保持)
processed/ 透過処理の中間出力(gitignore・ローカル保持)
```

recordsの必須フィールドと8工程はIMAGE-ASSET-WORKFLOW.mdを参照。
