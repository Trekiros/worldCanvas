import { FC } from "react"
import styles from './sidebar.module.scss'

type PropType = {
    // TODO
}

const Sidebar: FC<PropType> = (props) => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>World Canvas</div>
        </div>
    )
}

export default Sidebar