const NARROW_NO_BREAK_SPACE = ' ';

export function frenchPunctuation(text: string): string {
  return text
    .replace(/(\S)[   ]?([!?;:])(?=\s|$|[»")])/g, `$1${NARROW_NO_BREAK_SPACE}$2`)
    .replace(/«[   ]?/g, `«${NARROW_NO_BREAK_SPACE}`)
    .replace(/[   ]?»/g, `${NARROW_NO_BREAK_SPACE}»`);
}
