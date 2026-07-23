# Extended Soak Runbook(Batch 9)

長時間memory/runtime安定性soakの実行手順と、CIへの組み込み判断の記録。
設計の正本(シナリオ・計測・合否しきい値)は
[docs/qa/BATCH-9-EXTENDED-SOAK-MATRIX.md](../qa/BATCH-9-EXTENDED-SOAK-MATRIX.md)。

## CI組み込み判断

**extended soakはCIに含めない(手動/任意の定期実行とする)。**

理由:

```text
- 本走は60分/約60-130 cycle。現行CI(typecheck/test/skin:validate/build、
  ubuntu-latestで約1分)に対して桁違いに長く、PR毎の実行は非現実的
- 13-cycleのsmoke(1回転)でも実測11.7分 + Playwrightブラウザinstallが必要
  で、PRフィードバックループを大幅に悪化させる
- soakの合否は「持続トレンド」でのみ判定する設計(single-spike rule)のため、
  短縮版をCIに入れてもトレンド判定に必要なサンプル数を満たせず、
  誤PASS/誤FAILのnoiseだけが増える
- 既存のleak回帰防御はunit(cleanup/効果解除)とGate 6 performance QA
  (skin switch x10 / rematch x3のheap測定)が既にCI外で担っており、
  soakは「リリース前・大型変更後の手動ゲート」と位置づけるのが適切
```

再実行が必要になるタイミング:

```text
- リリース候補確定前(RC readiness更新時)
- match engine / 画面遷移 / modal / skin切替 / storage層への大きな変更後
- Reactメジャーupgrade、Vite/依存の大型upgrade後
```

## 実行手順

前提: dev serverが5199で起動していること(`pnpm dev --port 5199 --strictPort`)。

```bash
# 本走(Chromium、memory計測が正、60分または200 cycleの早い方)
node scripts/qa/run-batch9-soak.mjs --browser=chromium --max-minutes=60 --max-cycles=200 --label=chromium-primary
```

```bash
# 補助走(Firefox / WebKit、安定性のみ。memory数値は取得しない)
node scripts/qa/run-batch9-soak.mjs --browser=firefox --max-cycles=20 --max-minutes=45 --label=firefox-aux
```

```bash
node scripts/qa/run-batch9-soak.mjs --browser=webkit --max-cycles=20 --max-minutes=45 --label=webkit-aux
```

出力は `docs/qa/evidence/batch-9/` に生成される:

```text
soak-<label>.jsonl         1 cycle = 1行の生データ(逐次flush)
soak-<label>-summary.json  warm-up除外トレンド込みの集計
shots/<label>-*.png        境界時刻/失敗時/最終のみ(cycle毎には撮らない)
```

## 合否判定

summary.jsonの `trends` をmatrixのしきい値表と突き合わせる。要点:

```text
heap(post-GC)     last-10中央値がfirst-10中央値の+20%以内でPASS
DOM nodes          +10%以内でPASS
listeners/timers   cycle毎の一貫した増加傾向があればFAIL候補
localStorage       有界であること(records系はby designで上限100件/20鍵)
match cycle perf   p95が+25%以内でPASS
単発スパイク       それ自体ではFAILにしない(持続トレンドのみ)
```

判定に迷う場合(INVESTIGATE帯)はJSONLを直接見て、増加が特定シナリオに
紐づくか・plateauするかを確認し、製品欠陥/harness欠陥/環境限界に分類して
から結論を出す。分類基準はmatrixのP0-P3節を参照。
