import { FC, useEffect, useState } from "react"
import styles from './iconPicker.module.scss'

type PropType = {
    value: string | undefined,
    onChange: (newValue: string | undefined) => void,
    nullable?: boolean,
}

// ls /public/icons
const iconNames = [
    'anchor',     'carrot',   'crosshair',    'eye',    'insect',    'scroll',  'sign',    'tent',     'tree',      
    'beer',       'castle',   'd20',          'fire',   'justice',   'sea',     'skull',   'theater',  'university',
    'biohazard',  'cave',     'dragon',       'flag',   'monument',  'shield',  'snow',    'tools',    'utensils',  
    'bone',       'church',   'dungeon',      'horse',  'mountain',  'ship',    'spider',  'tornado',  'volcano',   
    'bridge',     'clothes',  'electricity',  'house',  'question',  'shop',    'temple',  'tower',    'water',     
].sort()

const IconPicker:FC<PropType> = ({ value, onChange, nullable }) => {
    const [iconType, setIconType] = useState<'url' | 'icon' | 'default'>('icon')

    useEffect(() => {
        if (value === undefined) { setIconType('default'); return }
        if (value.startsWith('/icons/')) { setIconType('icon'); return }
        setIconType('url')
    }, [value])

    return (
        <div className={styles.iconPicker}>
            <div className={styles.header}>
                { nullable ? 
                    <button 
                        className={(value === undefined) ? styles.activeBtn : ''} 
                        onClick={() => { onChange(undefined); setIconType('default') }}>
                            Use layer icon
                        </button>
                : null }
                <button onClick={() => setIconType('icon')}>Icon List</button>
                <button onClick={() => setIconType('url')}>Image by URL</button>
            </div>
            <div className={`${styles.content} pinchDisabled wheelDisabled`}>
                { (iconType === 'url') ? (
                    <div className={styles.urlSelector}>
                        <img src={value} />
                        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
                    </div>
                ) : null }
                { (iconType === 'icon') ? (
                    iconNames.map(iconName => (
                        <button
                            key={iconName} 
                            className={`${styles.icon} ${`/icons/${iconName}.svg` === value ? styles.activeBtn : ''}`} 
                            onClick={() => onChange(`/icons/${iconName}.svg`)}
                        >
                            <img src={`/icons/${iconName}.svg`} />
                            {iconName}
                        </button>
                    ))
                ) : null }
            </div>
        </div>
    )
}

export default IconPicker