import { MapModel } from "@/model/map"
import { FC, useState } from "react"
import styles from './mapForm.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"

type PropType = {
    onSubmit: (newValue: MapModel) => void,
    initialValue?: MapModel,
}

function defaultMap(): MapModel {
    return {
        id: Date.now(),
        name: '',
        imageUrl: '',
        layers: [
            {
                id: Date.now(),
                name: 'Markers',
                color: '#ffffff',
                iconUrl: '/icons/house.svg',
                markers: [],
                paths: [],
                areas: [],
                visible: true,
            }
        ],
    }
}

const MapForm: FC<PropType> = ({ onSubmit, initialValue }) => {
    const [map, setMap] = useState<MapModel>(initialValue || defaultMap())

    function update(callback: (mapClone: MapModel) => void) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        callback(mapClone)
        setMap(mapClone)
    }

    function validate() {
        return (!!map.name) && (!!map.imageUrl)
    }

    function submit() {
        if (!validate()) return

        onSubmit(map)
    }

    return (
        <div className={styles.mapForm}>
            <input 
                type='text' 
                className={styles.name} 
                value={map.name} 
                onChange={e => update(m => { m.name = e.target.value })} 
                placeholder="Map Name" 
            />
            
            <label htmlFor='mapUrl'>Image URL</label>
            <input
                id='imageURL'
                type='text'
                className={styles.imageUrl}
                value={map.imageUrl}
                onChange={e => update(m => { m.imageUrl = e.target.value })}
            />
            <img className={styles.preview} src={map.imageUrl} />

            <div className={styles.buttons}>
                <button onClick={submit} disabled={!validate()}>
                    <FontAwesomeIcon icon={faCheck} />
                    OK
                </button>
            </div>
        </div>
    )
}

export default MapForm