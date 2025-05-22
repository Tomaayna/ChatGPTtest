(function () {
  "use strict";

  const submitEvents = ["app.record.create.submit", "app.record.edit.submit"];

  kintone.events.on(submitEvents, function (event) {
    const r = event.record;
    const start = r.開始日.value;
    const end   = r.終了日.value;

    if (start && end && new Date(start) > new Date(end)) {
 //     r.終了日.error = "終了日は開始日以降の日付を指定してください"; // 問題箇所にエラー表示(フィールド幅で改行される)
        event.error = "終了日は開始日以降の日付を指定してください"; //最上部にエラー表示
        
    }
    return event;
  });
})();
