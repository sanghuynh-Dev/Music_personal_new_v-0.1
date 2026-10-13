import { NavLink } from 'react-router-dom';
import { PageHeader } from '../../components/ui';
import styles from './Legal.module.scss';

function LegalShell({ title, updated, children }) {
    return (
        <div className={styles.legal}>
            <PageHeader title={title} subtitle={`Last updated: ${updated}`} crumbs={[{ label: 'Home', to: '/' }, { label: title }]} />
            <div className={styles.body}>{children}</div>
            <nav className={styles.siblingNav} aria-label="Legal documents">
                {[
                    { to: '/terms', label: 'Terms of Service' },
                    { to: '/privacy', label: 'Privacy Policy' },
                    { to: '/dmca', label: 'Copyright & Takedown' },
                ].filter((l) => l.label !== title).map((l) => (
                    <NavLink key={l.to} to={l.to} className={styles.siblingLink}>
                        Read the {l.label.toLowerCase()}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export function Terms() {
    return (
        <LegalShell title="Terms of Service" updated="2026-10-12">
            <p>By using Soundora you agree to upload only content you own or are licensed to share. You keep ownership of your uploads and grant Soundora a license to stream them to other users.</p>
            <p>Prohibited: copyright-infringing uploads, impersonation, spam, hateful or explicit content presented without warning, and any attempt to abuse play counts, likes or follows.</p>
            <p>Accounts that violate these terms may be warned, suspended or banned. If your content was removed by mistake, use the report flow on the song page or contact support.</p>
            <p>We may update these terms; material changes will be announced in-app.</p>
        </LegalShell>
    );
}

export function Privacy() {
    return (
        <LegalShell title="Privacy Policy" updated="2026-10-12">
            <p>We store your account data (username, email, hashed password), your uploads, playlists, likes, follows and listening history to operate the service.</p>
            <p>Passwords are hashed and never stored in plain text. Session cookies keep you signed in; deleting cookies signs you out on that device.</p>
            <p>Media files you upload are stored with our cloud provider and served publicly so others can stream them.</p>
            <p>You can delete your account at any time from Settings, which permanently removes your profile and content. Contact support for data export or correction requests.</p>
        </LegalShell>
    );
}

export function Dmca() {
    return (
        <LegalShell title="Copyright & Takedown" updated="2026-10-12">
            <p>If you believe content on Soundora infringes your copyright, submit a report with type "Copyright" from the relevant song, user or playlist, including: the work infringed, the infringing URL, your contact details, and a good-faith statement.</p>
            <p>Our moderators review reports in the Admin queue. Valid claims lead to removal; repeat infringers lose upload privileges or their accounts.</p>
            <p>Counter-notices: if your content was removed and you believe this was a mistake, contact support with the report reference and your ownership evidence.</p>
        </LegalShell>
    );
}

export default { Terms, Privacy, Dmca };
