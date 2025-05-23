(function () {
  'use strict';
  const FIELD = 'pwd_value';
  const SPACE = 'pwdBtn';

  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], event => {
    const spaceEl = kintone.app.record.getSpaceElement(SPACE);
    const inputEl = kintone.app.record.getFieldElement(FIELD)?.querySelector('input');
    if (!spaceEl || !inputEl) return event;

    // 二重生成防止
    if (spaceEl.querySelector('.btn-toggle-visibility')) return event;

    const btn = document.createElement('button');
    btn.textContent = '表示';
    btn.className   = 'btn-toggle-visibility';
    btn.onclick = () => {
      const hidden = inputEl.type === 'password';
      inputEl.type = hidden ? 'text' : 'password';
      btn.textContent = hidden ? '非表示' : '表示';
    };
    // 初期状態
    inputEl.type = 'password';
    spaceEl.appendChild(btn);
    return event;
  });
})();
