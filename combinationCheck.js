(function () {
  "use strict";

  const EVENTS = ["app.record.create.submit", "app.record.edit.submit"];

  // フィールドコード → 表示ラベル
  const LABELS = {
    取引先名: "取引先名",
    現場名:   "現場名",
    処分場:   "処分場",
    品目:     "品目"
  };

  kintone.events.on(EVENTS, async (event) => {
    const rec = event.record;
    const esc = kintone.utils.escapeQuotes;          // " のエスケープ
    const conds = [];

    /* ▼ ① 取引先名は必須なので必ず条件に含める */
    conds.push(`取引先名 = "${esc(rec.取引先名.value)}"`);

    /* ▼ ② 現場名が入力されている場合 → 3 項目を追加 */
    const hasSite = rec.現場名.value;
    if (hasSite) {
      /* 処分場・品目のいずれかが未入力ならチェックをスキップ（or エラーにする等、運用に応じて変更可） */
      if (!rec.処分場.value || !rec.品目.value) return event;

      conds.push(`現場名 = "${esc(rec.現場名.value)}"`);
      conds.push(`処分場 = "${esc(rec.処分場.value)}"`);
      conds.push(`品目 = "${esc(rec.品目.value)}"`);
    }

    /* ▼ ③ 編集時は自分自身を除外 */
    const myId = rec.$id.value;
    if (myId) conds.push(`$id != ${myId}`);

    /* ▼ ④ REST API で 1 件だけ検索 */
    const query = conds.join(" and ") + " limit 1";
    const resp  = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
      app: kintone.app.getId(),
      query
    });
    if (resp.records.length === 0) return event;     // 重複なし

    /* ▼ ⑤ 重複している項目を抽出しメッセージ化 */
    const hit = resp.records[0];
    const dups = [];

    Object.keys(LABELS).forEach(code => {
      const now  = rec[code].value;
      const prev = hit[code].value;
      if (now && now === prev) dups.push(`${LABELS[code]}「${now}」`);
    });

    event.error =
      `以下の組み合わせが既に登録されています。\n` +
      dups.join("、") +
      `（レコードID: ${hit.$id.value}）`;

    return event;                                     // error があれば保存は自動キャンセル
  });
})();
