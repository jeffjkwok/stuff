import CardGrid from '../../components/CardGrid';
import styles from './HomePage.module.scss'

export default function HomePage() {
    return (
        <div>
            <header className={styles.header}>
                <h1>PokeProject</h1>
            </header>
            <CardGrid />
        </div>
    )
}