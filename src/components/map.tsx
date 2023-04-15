import { FC, MouseEvent, useRef } from "react"
import { MapModel } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent, KeepScale } from "react-zoom-pan-pinch";

type PropType = {
    map: MapModel,
    onMapUpdate: (newValue: MapModel) => void,
}

function isImageUrl(url: string) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const Map: FC<PropType> = ({ map, onMapUpdate }) => {
    const mapRef = useRef<HTMLButtonElement>(null)

    function onMapClick(e: MouseEvent) {
        if (!mapRef.current) return

        // Calculate x and y as percentages
        const hitBox = mapRef.current.getBoundingClientRect()
        const x = 100 * (e.clientX - hitBox.left) / hitBox.width
        const y = 100 * (e.clientY - hitBox.top) / hitBox.height

        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        newMap.points.push({
            x, y,
            id: Date.now(),
            name: 'Waterdeep',
            description: 'The city of splendor!',
            layerIds: [0],
        })
        newMap.name = "ludwig idk"

        onMapUpdate(newMap)
    }

    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2} doubleClick={{disabled: true}}>
                <TransformComponent>
                    {!isImageUrl(map.imageUrl) ? (
                        <div className={styles.default}>Import a map</div>
                    ) : (
                        <button className={styles.map} onClick={onMapClick} ref={mapRef}>
                                {/* Map image */}
                                <img src={map.imageUrl} className={styles.mapImage} />
                            
                            {/* Pins */}
                            <div className={styles.overlay}>
                                { map.points.map(point => (
                                    <div key={point.id} className={styles.pin} style={{ left: `${point.x}%`, top: `${point.y}%` }} >
                                        <KeepScale>
                                            <img
                                                src="https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png" 
                                            />
                                        </KeepScale>
                                    </div>
                                )) }
                            </div>
                        </button>
                    )}
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}

export default Map