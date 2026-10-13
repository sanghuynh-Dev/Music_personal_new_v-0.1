function AdminPageHead({ title, blurb, count, countLabel, actions }) {
    return (
        <div className="admin-page-head">
            <div className="admin-page-titles">
                <h2 className="admin-page-title">
                    {title}
                    {typeof count === 'number' && (
                        <span className="admin-page-count">
                            <strong>{count.toLocaleString()}</strong> {countLabel || 'total'}
                        </span>
                    )}
                </h2>
                {blurb && <p className="admin-page-blurb">{blurb}</p>}
            </div>
            {actions && <div className="admin-page-side">{actions}</div>}
        </div>
    );
}

export default AdminPageHead;
