// Realtime integration disabled — stubbed API to avoid breaking imports.
export async function ensureRealtime() {
    console.warn('Realtime disabled: ensureRealtime() is a noop');
    return null;
}

export async function onEvent(_event: string, _handler: (...args: any[]) => void) {
    return () => { };
}

export async function emitEvent(_event: string, _payload: any) {
    // noop
}

export default { ensureRealtime, onEvent, emitEvent };
