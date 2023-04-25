import { AreaModel, LayerModel } from "@/model/map"
import { FC, useState } from "react"
import styles from './areaForm.module.scss'
import ColorPicker from "./colorPicker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons"

type PropType = {
    onSubmit: (value: AreaModel) => void,
    initialValue?: AreaModel,
    onDelete?: () => void,
}

function defaultArea(): AreaModel {
    return {
        id: Date.now(),
        name: '',
        description: '',
        points: [],
    }
}

const AreaForm: FC<PropType> = (({ onSubmit, initialValue, onDelete }) => {
    const [area, setArea] = useState(initialValue || defaultArea())

    function update(callback: (areaClone: AreaModel) => void) {
        const areaClone: AreaModel = JSON.parse(JSON.stringify(area))
        callback(areaClone)
        setArea(areaClone)
    }

    function validate() {
        return area.name
    }

    function submit() {
        if (!validate()) return

        onSubmit(area)
    }

    return (
        <div className={styles.areaForm}>
            <input type="text" className={styles.name} value={area.name} onChange={e => update(a => { a.name = e.target.value })} placeholder="Area Name" />

            <label>Description</label>
            <textarea value={area.description} onChange={e => update(a => { a.description = e.target.value })} placeholder="This area is very..." />

            <label>Color</label>
            <ColorPicker value={area.color} onChange={c => update(a => { a.color = c })} />

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

export default AreaForm