// Cliente realtime leve (usa socket.io-client se disponível). Import dinâmico para não quebrar builds quando lib não instalada.
let socket: any = null;

export async function ensureRealtime() {
    if (socket) return socket;
    try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const mod = await import('socket.io-client');
        const io = mod.io || (mod as any).default;
        socket = io(base, { autoConnect: true });
        return socket;
    } catch (err) {
        // socket.io-client não disponível — operação no modo degradado
        console.warn('Realtime client not available:', err);
        return null;
    }
}

export async function onEvent(event: string, handler: (...args: any[]) => void) {
    const s = await ensureRealtime();
    if (!s) return () => { };
    s.on(event, handler);
    return () => s.off(event, handler);
}

export async function emitEvent(event: string, payload: any) {
    const s = await ensureRealtime();
    if (!s) return;
    s.emit(event, payload);
}

export default { ensureRealtime, onEvent, emitEvent };
