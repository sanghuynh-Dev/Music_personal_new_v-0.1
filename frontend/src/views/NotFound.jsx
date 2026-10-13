import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState, Button } from '../components/ui';

function NotFound() {
    return (
        <EmptyState
            icon={Compass}
            title="Page not found"
            text="The page you are looking for does not exist or was moved."
            action={<Link to="/"><Button size="sm">Back to Home</Button></Link>}
        />
    );
}

export default NotFound;
