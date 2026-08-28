// Textareas don't expose caret position via the DOM Selection API, so this
// mirrors the textarea's text (up to the caret) into an offscreen div with
// identical font metrics, then reads the resulting span's offset — the
// standard technique for positioning UI relative to a caret in a <textarea>.
const MIRRORED_PROPERTIES: (keyof CSSStyleDeclaration)[] = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textTransform', 'wordSpacing', 'tabSize',
];

export function getCaretCoordinates(el: HTMLTextAreaElement, position: number): { top: number; left: number } {
  const style = getComputedStyle(el);
  const mirror = document.createElement('div');
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';

  for (const prop of MIRRORED_PROPERTIES) {
    (mirror.style as unknown as Record<string, string>)[prop as string] = style[prop] as string;
  }

  mirror.textContent = el.value.slice(0, position);
  const marker = document.createElement('span');
  marker.textContent = el.value.slice(position) || '.';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const rect = el.getBoundingClientRect();
  const top = rect.top + marker.offsetTop - el.scrollTop;
  const left = rect.left + marker.offsetLeft - el.scrollLeft;
  document.body.removeChild(mirror);

  return { top, left };
}
