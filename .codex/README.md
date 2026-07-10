# .codex

Codex用の補助ディレクトリ。

仕様をここへ重複管理しない。

作業開始時の正本:

```text
CODEX.md
AGENTS.md
README.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
```

UI、CSS、component、asset、motion、responsiveを扱う場合は、プロンプトに書かれていなくても必ず読む:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

現在はGameplay MVP Phase 1-14実装済みで、次はmulti-skin design-system foundation。

過去の `docs/34-mvp-implementation-prompt.md` や番号付きtest docsを入口にしない。

現在のfoundation phaseでは画像生成を実行しない。Codexはskin contract、shared renderer、fallback、asset request、将来のslot別生成promptを整備する。

後の明示的なasset-production phaseでのみ、生成物をcandidateへ置き、人間レビュー後にfinalへ昇格する。

Vamp-pon資料を扱う場合はrootの指示に従い、Vamp-pon側は読み取り専用とする。