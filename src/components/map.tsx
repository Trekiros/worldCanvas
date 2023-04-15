import { FC } from "react"
import { MapModel } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type PropType = {
    map: MapModel,
    visibleLayers: number[],
}

function isImageUrl(url: string) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const Map: FC<PropType> = ({ map, visibleLayers }) => {
    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2}>
                <TransformComponent>
                    <div className={styles.map}>
                        {!isImageUrl(map.imageUrl) ? null : (
                            <img src={map.imageUrl} />
                        )}
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}

export default Map