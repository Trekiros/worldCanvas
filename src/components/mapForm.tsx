import { MapModel } from "@/model/map"
import { FC, useState } from "react"
import styles from './mapForm.module.scss'

type PropType = {
    onCancel: () => void,
    onSubmit: (newValue: MapModel) => void,
    initialValue?: MapModel,
}

function defaultMap(): MapModel {
    return {
        name: '',
        imageUrl: '',
        layers: [
            {
                id: Date.now(),
                name: 'Markers',
                color: '#fff3',
                iconUrl: '/icons/house.svg',
                markers: [],
                paths: [],
                areas: [],
            }
        ],
    }
}

const MapForm: FC<PropType> = ({ onCancel, onSubmit, initialValue }) => {
    const [map, setMap] = useState<MapModel>(initialValue || defaultMap())

    return (
        <div className={styles.modalOverlay} onMouseDown={onCancel}>
            <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
                Hello World!
            </div>
        </div>
    )
}

export default MapForm