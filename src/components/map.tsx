import { FC, ReactNode, createContext, useContext, useRef, useState } from "react"
import { MapModel, MarkerModel } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ClickableImg from "./clickableImg";
import MarkerMenu from "./markerMenu";
import Marker from "./marker";
import { MapContext, PopinContext, PopinDescription } from "@/model/context";
import Popin from "./popin";
import CreateMenu from "./createMenu";

type PropType = {}

function isImageUrl(url: string) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const Map: FC<PropType> = ({}) => {
    const {map, setMap} = useContext(MapContext)
    const [popin, setPopin] = useState<PopinDescription>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    function calculateMapCoords(clientX: number, clientY: number) {
        if (!mapRef.current) return {}
        // Calculate x and y as percentages
        const hitBox = mapRef.current.getBoundingClientRect()
        const x = 100 * (clientX - hitBox.left) / hitBox.width
        const y = 100 * (clientY - hitBox.top) / hitBox.height

        return {x, y}
    }

    function onMapClick(clientX: number, clientY: number) {
        const {x, y} = calculateMapCoords(clientX, clientY)

        if (!x || !y) return

        setPopin(popin ? null : { x, y, id: Date.now(), content: (
            <CreateMenu 
                onNewMarker={() => setPopin({id: Date.now(), x, y, content: (
                    <MarkerMenu x={x} y={y} onMarkerCreated={onMarkerCreated} />
                )})}
                onNewArea={() => {}}
                onNewPath={() => {}}
            />
        )})
    }

    function onMarkerCreated(marker: MarkerModel) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        newMap.points.push(marker)
        setMap(newMap)
        setPopin(null)
    }

    function onMarkerUpdated(index: number, marker: MarkerModel) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        newMap.points[index] = marker
        setMap(newMap)
        setPopin(null)
    }

    function onMarkerMoved(index: number, clientX: number, clientY: number) {
        const {x, y} = calculateMapCoords(clientX, clientY)
        if (!x || !y) return
        
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        const marker = newMap.points[index]
        marker.x = x
        marker.y = y
        setMap(newMap)
    }

    function deleteMarker(index: number) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        newMap.points.splice(index, 1)
        setMap(newMap)
        setPopin(null)
    }

    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2} doubleClick={{disabled: true}}>
                <TransformComponent>
                    <PopinContext.Provider value={{popin, setPopin}}>
                        {!isImageUrl(map.imageUrl) ? (
                            <div className={styles.default}>Import a map</div>
                        ) : (
                            <div ref={mapRef}>
                                <ClickableImg src={map.imageUrl} onClick={onMapClick}>
                                    <PopinContext.Provider value={{popin, setPopin}}>
                                        { /* MARKERS */}
                                        { map.points.map((marker, index) => (
                                            <Marker
                                                key={marker.id} 
                                                marker={marker}
                                                onMarkerUpdated={(newValue) => onMarkerUpdated(index, newValue)}
                                                onMarkerMoved={(x, y) => onMarkerMoved(index, x, y)}
                                                onMarkerDeleted={() => deleteMarker(index)}
                                            />
                                        )) }

                                        { !popin ? null : (
                                            <Popin x={popin.x} y={popin.y} key={popin.id}>
                                                {popin.content}
                                            </Popin>
                                        )}
                                    </PopinContext.Provider>
                                </ClickableImg>
                            </div>
                        )}
                    </PopinContext.Provider>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}

export default Map