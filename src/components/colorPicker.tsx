import { FC } from "react"
import styles from './colorPicker.module.scss'
import { SliderPicker } from "react-color"

type PropType = {
    value: string | undefined,
    onChange: (newValue: string | undefined) => void,
}

const ColorPicker: FC<PropType> = ({ value, onChange }) => {
    return (
        <div className={styles.colorPicker}>
            <div className={styles.header}>
                <button 
                    className={(value === undefined) ? styles.activeBtn : ''} 
                    onClick={() => { onChange(undefined) }}>
                        Use the Layer Color
                </button>
                <button 
                    className={(value !== undefined) ? styles.activeBtn : ''} 
                    onClick={() => onChange('#ffffff')}
                >
                    Pick Color
                </button>
            </div>
            { (value === undefined) ? null : (
                <div className={styles.content}>
                    <SliderPicker 
                        color={value} 
                        onChange={color => onChange(color.hex)}
                    />
                </div>
            )}
        </div>
    )
}

export default ColorPicker