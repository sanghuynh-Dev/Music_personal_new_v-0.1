import { useEffect } from 'react';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import styles from './UI.module.css';

/* ---------- Buttons ---------- */
export function Button({ variant = 'primary', size = 'md', className, children, ...rest }) {
    const variantClass =
        variant === 'ghost' ? styles.btnGhost
        : variant === 'danger' ? styles.btnDanger
        : variant === 'danger-solid' ? styles.btnDangerSolid
        : styles.btnPrimary;
    const sizeClass = size === 'sm' ? styles.btnSm : size === 'lg' ? styles.btnLg : styles.btnMd;
    return <button className={clsx(styles.btn, variantClass, sizeClass, className)} {...rest}>{children}</button>;
}

export function IconButton({ active, label, className, children, ...rest }) {
    return (
        <button aria-label={label} title={label} className={clsx(styles.iconBtn, active && styles.active, className)} {...rest}>
            {children}
        </button>
    );
}

/* ---------- Inputs ---------- */
export function Input({ label, error, id, className, ...rest }) {
    const inputId = id || rest.name || undefined;
    return (
        <div className={className}>
            {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
            <input id={inputId} className={clsx(styles.input, error && styles.inputError)} aria-invalid={!!error} {...rest} />
            {error && <p className={styles.fieldError} role="alert">{error}</p>}
        </div>
    );
}

export function Textarea({ label, error, id, className, ...rest }) {
    const inputId = id || rest.name || undefined;
    return (
        <div className={className}>
            {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
            <textarea id={inputId} className={clsx(styles.textarea, error && styles.inputError)} aria-invalid={!!error} {...rest} />
            {error && <p className={styles.fieldError} role="alert">{error}</p>}
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = 'Search...', onClear, className, ...rest }) {
    return (
        <div className={clsx(styles.searchWrap, className)}>
            <span className={styles.searchIcon}><Search size={16} /></span>
            <input
                type="search"
                role="searchbox"
                aria-label={placeholder}
                className={clsx(styles.input, styles.searchInput)}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...rest}
            />
            {!!value && (
                <button
                    type="button"
                    aria-label="Clear search"
                    className={styles.searchClear}
                    onClick={() => { onClear ? onClear() : onChange({ target: { value: '' } }); }}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

export function Dropdown({ label, error, id, className, children, ...rest }) {
    const inputId = id || rest.name || undefined;
    return (
        <div className={className}>
            {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
            <select id={inputId} className={clsx(styles.select, error && styles.inputError)} {...rest}>{children}</select>
            {error && <p className={styles.fieldError} role="alert">{error}</p>}
        </div>
    );
}

/* ---------- Tabs / Pagination / Tooltip / Modal ---------- */
export function Tabs({ tabs, active, onChange }) {
    return (
        <div className={styles.tabs} role="tablist">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    role="tab"
                    aria-selected={active === t.key}
                    className={clsx(styles.tab, active === t.key && styles.tabActive)}
                    onClick={() => onChange(t.key)}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

export function Pagination({ hasPrev, hasNext, onPrev, onNext, info }) {
    return (
        <div className={styles.pagination}>
            <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={onPrev}>Previous</Button>
            {info && <span aria-live="polite">{info}</span>}
            <Button variant="ghost" size="sm" disabled={!hasNext} onClick={onNext}>Next</Button>
        </div>
    );
}

export function Tooltip({ tip, children, className }) {
    return <span className={clsx(styles.tooltip, className)} data-tip={tip}>{children}</span>;
}

export function Modal({ title, onClose, children, footer }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className={styles.modalOverlay} onClick={onClose} role="presentation">
            <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <IconButton label="Close dialog" onClick={onClose}><X size={20} /></IconButton>
                </div>
                <div className={styles.modalBody}>{children}</div>
                {footer && <div className={styles.modalFooter}>{footer}</div>}
            </div>
        </div>
    );
}

/* NOTE: toast helper lives in ./toast.js (react-refresh: one concern per file). */
