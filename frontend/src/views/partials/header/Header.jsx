
import Logo from './Logo.jsx'
import SideBar from './SideBar.jsx'
import SideBarPlayList from './SideBarPlayList.jsx'
import TopNav from './TopNav.jsx'
import styles from './Header.module.scss'

function Header() {

    return (
        <aside className={styles.sidebar}>
            <Logo styles={styles}/>
            <SideBar  styles={styles}/>
            <SideBarPlayList  styles={styles}/>      
        </aside>
    )
}

export default Header