import { FC, useContext, useState } from 'react'
import { KeepScale } from "react-zoom-pan-pinch";
import { MarkerModel } from '@/model/map'
import styles from './marker.module.scss'
import MarkerMenu from './markerMenu';
import { PopinContext } from '@/model/context';
import DraggingMarker from './draggingMarker';

type PropType = {
    marker: MarkerModel,
    onMarkerUpdated: (newValue: MarkerModel) => void,
    onMarkerMoved: (clientX: number, clientY: number) => void,
    onMarkerDeleted: () => void,
}

const Marker: FC<PropType> = ({marker, onMarkerUpdated, onMarkerMoved, onMarkerDeleted}) => {
    const {popin, setPopin} = useContext(PopinContext)
    const [moving, setMoving] = useState(false)

    function moveMarker() {
        setMoving(true)
        setPopin(null)
    }

    function updateMarker() {
        setPopin({
            id: Date.now(),
            x: marker.x,
            y: marker.y,
            content: (
                <MarkerMenu
                    x={marker.x}
                    y={marker.y}
                    initialValue={marker}
                    onMarkerCreated={(newValue) => { onMarkerUpdated(newValue) }}
                    onMoveMarker={moveMarker}
                    onMarkerDeleted={onMarkerDeleted}
                />
            )
        })
    }

    function hoverStart() {
        if (popin) return

        setPopin({
            id: marker.id,
            x: marker.x,
            y: marker.y,
            content: (
                <div className={styles.markerInfo}>
                    <h3>{marker.name}</h3>
                    <div className={styles.description}>{marker.description}</div>
                </div>
            )
        })
    }

    function hoverEnd() {
        if (!popin) return
        if (popin.id !== marker.id) return

        setPopin(null)
    }

    if (moving) return <DraggingMarker
        iconUrl={'https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png'}
        onMove={(x, y) => {
            setMoving(false)
            onMarkerMoved(x, y)
            console.log('test vv')
        }}
    />

    return (
            <div key={marker.id} className={styles.marker} style={{ left: `${marker.x}%`, top: `${marker.y}%` }} >
                <KeepScale>
                    <div
                        onClick={updateMarker}
                        onMouseEnter={hoverStart}
                        onMouseLeave={hoverEnd}
                    >
                        <img
                            className={styles.icon}
                            draggable={false}
                            src="https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png"
                        />
                    </div>
                </KeepScale>
            </div>
    )
}

export default Marker