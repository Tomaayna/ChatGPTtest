(function () {
  "use strict";

  const submitEvents = ["app.record.create.submit", "app.record.edit.submit"];

  kintone.events.on(submitEvents, function (event) {
    const r = event.record;
    const startField = r.開始日;
    const endField   = r.終了日;

    if (!startField || !endField) {
      return event; // Avoid runtime errors if field codes are wrong
    }

    const start = startField.value;
    const end   = endField.value;

    if (start && end && new Date(start) > new Date(end)) {
 //     r.終了日.error = "終了日は開始日以降の日付を指定してください"; // 問題箇所にエラー表示(フィールド幅で改行される)
        event.error = "終了日は開始日以降の日付を指定してください"; //最上部にエラー表示
        
    }
    return event;
  });
})();
