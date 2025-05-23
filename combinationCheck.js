(function () {
  "use strict";

  /** ダブルクォートとバックスラッシュのエスケープ */
  const esc = s => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const EVENTS = ["app.record.create.submit", "app.record.edit.submit"];

  // フィールドコード → ラベル
  const LABELS = {
    customer: "取引先名",
    site:     "現場名",
    plant:    "処分場",
    item:     "品目"
  };

  kintone.events.on(EVENTS, async event => {
    const r = event.record;

    const conds = [];

    /* 1) 取引先名（必須） */
    if (!r.customer || !r.customer.value) return event;          // 念のため空チェック
    conds.push(`customer = "${esc(r.customer.value)}"`);

    /* 2) 現場名が入力されている場合のみ追加３条件 */
    const hasSite = r.site && r.site.value;
    if (hasSite) {
      if (!r.plant?.value || !r.item?.value) return event;      // いずれか未入力ならスキップ
      conds.push(`site   = "${esc(r.site.value)}"`);
      conds.push(`plant  in "${esc(r.plant.value)}"`);
      conds.push(`item   = "${esc(r.item.value)}"`);
    }

    /* 3) 編集時のみ自レコードを除外（$id は create.* には存在しない） */
    const myId = r.$id?.value ?? null;
    if (myId) conds.push(`$id != ${myId}`);

    /* 4) 重複チェック */
    const query = conds.join(" and ") + " limit 1";
    const resp  = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
      app: kintone.app.getId(),
      query
    });

    if (!resp.records.length) return event;

    /* 5) 重複フィールドをリストアップ */
    const hit  = resp.records[0];
    const dups = [];

    Object.keys(LABELS).forEach(code => {
      if (r[code]?.value && r[code].value === hit[code].value) {
        dups.push(`${LABELS[code]}「${r[code].value}」`);
      }
    });


    event.error =
      "以下の組み合わせが既に登録されています。\n" +
      dups.join("、") +
      `（レコードID: ${hit.$id.value}）`;
    return event;                                              // エラーがあれば保存キャンセル
  });

})();
