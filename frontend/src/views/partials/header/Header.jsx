import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo.jsx'
import SideBar from './SideBar.jsx'
import SideBarPlayList from './SideBarPlayList.jsx'
import useUiStore from '../../../stores/uiStore.js';
import styles from './Header.module.scss'

function Header() {
    const sidebarCollapsed = useUiStore(s => s.sidebarCollapsed);
    const sidebarOpen = useUiStore(s => s.sidebarOpen);
    const toggleSidebar = useUiStore(s => s.toggleSidebar);
    const setSidebarOpen = useUiStore(s => s.setSidebarOpen);

    return (
        <>
            <div
                className={clsx(styles.scrim, sidebarOpen && styles.scrimVisible)}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />
            <aside className={clsx(
                styles.sidebar,
                sidebarCollapsed && styles.rail,
                sidebarOpen && styles.drawerOpen
            )}>
                <div className={styles.sidebarTop}>
                    <Logo styles={styles} />
                    <div className={styles.sidebarTopActions}>
                        <button
                            className={styles.collapseBtn}
                            onClick={toggleSidebar}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            aria-expanded={!sidebarCollapsed}
                        >
                            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                        <button
                            className={styles.drawerCloseBtn}
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <SideBar styles={styles} />
                <SideBarPlayList styles={styles} />
            </aside>
        </>
    )
}

export default Header
