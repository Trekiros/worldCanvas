import { FC, useState } from "react";
import { MarkerModel } from "@/model/map";
import styles from './markerMenu.module.scss'
import { faTrash, faCheck, faUpDownLeftRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconPicker from "./iconPicker";

type PropType = {
    x: number,
    y: number,
    onMarkerCreated: (newMarker: MarkerModel) => void,
    initialValue?: MarkerModel,
    onMoveMarker?: () => void,
    onMarkerDeleted?: () => void,
}

function defaultMarker(x: number, y: number): MarkerModel {
    return {
        id: Date.now(),
        x, y,
        name: '',
        description: '',
    }
}

const MarkerMenu: FC<PropType> = ({x, y, onMarkerCreated, initialValue, onMoveMarker, onMarkerDeleted}) => {
    const [marker, setMarker] = useState<MarkerModel>(initialValue || defaultMarker(x, y))

    function update(mutate: (clone: MarkerModel) => void) {
        const clone: MarkerModel = JSON.parse(JSON.stringify(marker))
        mutate(clone)
        setMarker(clone)
    }

    function validate() {
        return (!!marker.name)
            && (!!marker.description)
    }

    function submit() {
        if (!validate()) return

        onMarkerCreated(marker)
    }

    return (
        <div className={styles.markerMenu}>
            <input 
                type='text' 
                placeholder="Marker name" 
                value={marker.name} 
                onChange={(e) => update((p) => { p.name = e.target.value })} 
                onSubmit={submit}
            />
            <textarea 
                placeholder="Description" 
                value={marker.description} 
                onChange={(e) => update((p) => { p.description = e.target.value })} 
            />
            <IconPicker value={marker.iconUrl} onChange={(newValue) => update(p => { p.iconUrl = newValue})} nullable={true} />
            <div className={styles.buttons}>
                <button onClick={submit} disabled={!validate()}>
                    <FontAwesomeIcon icon={faCheck} />
                    OK
                </button>
                { onMarkerDeleted ? <button onClick={onMarkerDeleted}>
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                </button> : null }
                { onMoveMarker ? <button onClick={onMoveMarker}>
                    <FontAwesomeIcon icon={faUpDownLeftRight} />
                    Move
                </button> : null }
            </div>
        </div>
    )
}

export default MarkerMenu