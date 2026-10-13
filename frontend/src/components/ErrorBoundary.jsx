import React from 'react';
import { ErrorState } from './ui';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        console.error('UI crash:', error, info);
    }
    render() {
        if (this.state.error) {
            return (
                <ErrorState
                    title="Something crashed"
                    text="The page ran into a problem. Your music keeps playing."
                    onRetry={() => this.setState({ error: null })}
                />
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
