import React from 'react'

type State = {
    hasError: boolean
    error?: Error | null
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    constructor(props: React.PropsWithChildren) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to console for now; can be replaced with a remote logger
        // eslint-disable-next-line no-console
        console.error('Uncaught render error:', error, info)
    }

    render() {
        if (!this.state.hasError) return this.props.children as React.ReactElement

        const err = this.state.error
        return (
            <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
                <h1 style={{ color: '#c53030' }}>Ocorreu um erro na aplicação</h1>
                <p>Para ajudar a diagnosticar, veja os detalhes abaixo. Copie-os e cole na conversa comigo.</p>
                <div style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12, borderRadius: 6, marginTop: 12 }}>
                    <strong>Mensagem:</strong>
                    <div>{err?.message ?? '—'}</div>
                    <hr />
                    <strong>Stack:</strong>
                    <div style={{ fontSize: 12, color: '#333' }}>{err?.stack ?? '—'}</div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <button onClick={() => window.location.assign('/')} style={{ marginRight: 8 }}>Voltar à Home</button>
                    <button onClick={() => window.location.reload()}>Recarregar</button>
                </div>
            </div>
        )
    }
}
