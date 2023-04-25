import { PathModel } from "@/model/map"
import { FC, useState } from "react"
import styles from './pathForm.module.scss'
import ColorPicker from "./colorPicker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons"
import Slider from 'rc-slider'

type PropType = {
    onSubmit: (value: PathModel) => void,
    initialValue?: PathModel,
    onDelete?: () => void,
}

function defaultPath(): PathModel {
    return {
        id: Date.now(),
        name: '',
        description: '',
        strokeType: 'solid',
        strokeWidth: 5,
        points: [],
    }
}

const PathForm: FC<PropType> = (({ onSubmit, initialValue, onDelete }) => {
    const [path, setPath] = useState(initialValue || defaultPath())

    function update(callback: (pathClone: PathModel) => void) {
        const pathClone: PathModel = JSON.parse(JSON.stringify(path))
        callback(pathClone)
        setPath(pathClone)
    }

    function validate() {
        return !!path.name
    }

    function submit() {
        if (!validate()) return
        onSubmit(path)
    }

    return (
        <div className={styles.pathForm}>
            <input type="text" className={styles.name} value={path.name} onChange={e => update(p => { p.name = e.target.value })} placeholder="Path Name" />

            <label>Description</label>
            <textarea value={path.description} onChange={e => update(p => { p.description = e.target.value })} placeholder="This path links..." />

            <label>Path type</label>
            <div className={styles.strokeType}>
                <button onClick={() => update(p => { p.strokeType = "solid" })} className={path.strokeType === "solid" ? styles.active : undefined}>
                    ——
                </button>
                <button onClick={() => update(p => { p.strokeType = "dashed" })} className={path.strokeType === "dashed" ? styles.active : undefined}>
                    – – –
                </button>
                <button onClick={() => update(p => { p.strokeType = "dotted" })} className={path.strokeType === "dotted" ? styles.active : undefined}>
                    ● ● ● ●
                </button>
            </div>

            <label>Stroke Width</label>
            <div className={styles.strokeWidth}>
                <Slider
                    step={1} 
                    min={1} 
                    max={10} 
                    defaultValue={5}
                    value={path.strokeWidth}
                    onChange={(e) => update(p => { p.strokeWidth = e as number })}
                    marks={{1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10'}}
                    ariaLabelForHandle={String(path.strokeWidth)}
                />
            </div>

            <label>Color</label>
            <ColorPicker value={path.color} onChange={c => update(p => { p.color = c })} />

            <div className={styles.buttons}>
                <button 
                    onClick={submit}
                    disabled={!validate()}
                >
                    <FontAwesomeIcon icon={faCheck} />
                    OK
                </button>
                { !onDelete ? null : (
                    <button onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
})

export default PathForm