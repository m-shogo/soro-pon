# .codex

Codex用の補助ディレクトリ。仕様をここへ重複管理しない。

作業開始時の正本:

```text
CODEX.md
AGENTS.md
README.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

UI、CSS、component、asset、motion、responsive、skin loadingを扱う場合は、プロンプトに書かれていなくても必ず読む:

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
```

現在はGameplay MVP Phase 1-14実装済み。multi-skin runtime baselineは存在し、次は `SKIN-FOUNDATION-HARDENING.md` のH1から順に実装する。

過去の `docs/34-mvp-implementation-prompt.md` や番号付きtest docsを入口にしない。

全P0完了前は画像生成を実行しない。Codexはtyped token contract、validator、shared renderer、fallback、Gallery/selector、asset request、将来のslot別生成promptを整備する。

後の明示的なasset-production phaseでのみ、生成物をcandidateへ置き、人間レビュー後にfinalへ昇格する。

Vamp-pon資料を扱う場合はrootの指示に従い、Vamp-pon側は読み取り専用とする。
