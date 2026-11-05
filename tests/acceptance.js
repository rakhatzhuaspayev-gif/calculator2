// Acceptance cases from prd.md, section 11, plus edge cases from sections 6.1–6.4.
// Run it in the browser console on an open index.html. It clears the tape.
(() => {
  const keyMap = { '×': '*', '÷': '/', '−': '-' };
  const main = () => document.getElementById('display-main').textContent;
  const expr = () => document.getElementById('display-expr').textContent;
  const click = (selector) => document.querySelector(selector).click();

  function press(token) {
    if (/^\d$/.test(token)) return click(`[data-action="digit"][data-value="${token}"]`);
    if (token === ',') return click('[data-action="decimal"]');
    if (token === '%') return click('[data-action="percent"]');
    if (token === '±') return click('[data-action="sign"]');
    if (token === '=') return click('[data-action="equals"]');
    if (token === 'C') return click('[data-action="clear"]');
    if (token === '⌫') return click('[data-action="backspace"]');
    return click(`[data-action="op"][data-value="${keyMap[token] || token}"]`);
  }

  function enter(sequence) {
    press('C');
    for (const token of sequence) press(token);
    return main();
  }

  const cases = [
    // Section 11
    ['2+3×4=', '14'],
    ['0,1+0,2=', '0,3'],
    ['200+10%=', '220'],
    ['200×10%=', '20'],
    ['5÷0=', 'На ноль делить нельзя'],
    ['9±+4=', '−5'],
    ['5+×2=', '10'],
    ['12=+3=', '15'],
    ['12=7', '7'],
    ['1234567', '1 234 567'],
    // Section 6
    ['200−10%=', '180'],
    ['50%=', '0,5'],
    ['15000+18%=', '17 700'],
    ['100+50+10%=', '165'],
    ['100×2+10%=', '220'],
    ['5+=', '5'],
    ['123⌫', '12'],
    ['5+⌫', '5'],
    ['5÷0=7', '7'],
    ['5÷0=+2=', '2'],
    ['1234567890123456789', '123 456 789 012 345'],
    ['1,5⌫⌫', '1'],
    ['1,,5', '1,5'],
    ['000', '0'],
    ['1÷3=', '0,333333333333'],
    ['999999999999999×999999999999999×999999=', '9,99999e+35'],
    ['0,1×0,1=', '0,01']
  ];

  const failures = [];
  for (const [sequence, expected] of cases) {
    const actual = enter(sequence);
    if (actual !== expected) failures.push({ sequence, expected, actual });
  }

  // Keyboard
  const type = (key) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  press('C');
  ['1', '5', 'х', '2', '%', 'Enter'].forEach(type);
  if (main() !== '0,3') failures.push({ sequence: 'keyboard 15 х 2 % Enter', expected: '0,3', actual: main() });
  type('Escape');
  if (main() !== '0') failures.push({ sequence: 'keyboard Esc', expected: '0', actual: main() });

  // D-4: the pending operation stays highlighted
  enter('5+');
  const active = document.querySelectorAll('.key--op.is-active');
  if (active.length !== 1 || active[0].dataset.value !== '+') {
    failures.push({ sequence: 'D-4 active op', expected: '+', actual: active.length });
  }

  // Tape
  press('C');
  document.getElementById('clear-tape').click();
  if (!document.querySelector('.hint')) failures.push({ sequence: 'H-7 empty hint', expected: 'hint', actual: 'none' });
  enter('2+3×4=');
  enter('7+1=');
  press('C');
  document.querySelector('.row[data-index="0"]').click();
  if (main() !== '14' || expr() !== '2 + 3 × 4 =') {
    failures.push({ sequence: 'H-3 recall', expected: '14', actual: main() + ' / ' + expr() });
  }
  for (let i = 0; i < 105; i++) enter('1+1=');
  const stored = JSON.parse(localStorage.getItem('tape-calc-history'));
  if (stored.length !== 100) failures.push({ sequence: 'H-5 limit', expected: 100, actual: stored.length });
  press('C');
  document.getElementById('clear-tape').click();

  return { total: cases.length + 6, failures };
})();
