import { FC, useState } from "react"
import { MapModel, Point } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent, KeepScale } from "react-zoom-pan-pinch";
import ClickableImg from "./clickableImg";
import PinCreator from "./pinCreator";

type PropType = {
    map: MapModel,
    onMapUpdate: (newValue: MapModel) => void,
}

function isImageUrl(url: string) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const Map: FC<PropType> = ({ map, onMapUpdate }) => {
    const [pinForm, setPinForm] = useState<[number, number] | null>(null) // Coordinates of the pin to be created, or null if not currently creating a pin 

    function onMapClick(x: number, y: number) {
        setPinForm(pinForm ? null : [x, y])
    }

    function onPinCreated(pin: Point) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        newMap.points.push(pin)
        onMapUpdate(newMap)
    }

    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2} doubleClick={{disabled: true}}>
                <TransformComponent>
                    {!isImageUrl(map.imageUrl) ? (
                        <div className={styles.default}>Import a map</div>
                    ) : (
                        <ClickableImg src={map.imageUrl} onClick={onMapClick}>
                            { !pinForm ? null : (
                                <PinCreator x={pinForm[0]} y={pinForm[1]} onPinCreated={onPinCreated} />
                            )}

                            { map.points.map(point => (
                                <div key={point.id} className={styles.pin} style={{ left: `${point.x}%`, top: `${point.y}%` }} >
                                    <KeepScale>
                                        <img
                                            src="https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png" 
                                        />
                                    </KeepScale>
                                </div>
                            )) }
                        </ClickableImg>
                    )}
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}

export default Map