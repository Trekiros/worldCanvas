import { FC, useContext, useRef, useState } from "react"
import { MapModel, MarkerModel, getLayer, getMarker } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ClickableImg from "./clickableImg";
import MarkerMenu from "./markerMenu";
import Marker from "./marker";
import { MapContext, PopinContext, PopinDescription } from "@/model/context";
import Popin from "./popin";
import CreateMenu from "./createMenu";

type PropType = {
    visibleLayers: number[],
    activeLayer: number,
}

function isImageUrl(url: string) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const Map: FC<PropType> = ({ visibleLayers, activeLayer }) => {
    const {map, setMap} = useContext(MapContext)
    const [popin, setPopin] = useState<PopinDescription>(null)
    const [alertMessage, setAlert] = useState('')
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
        const layer = getLayer(newMap, activeLayer)
        if (!layer) return

        layer.markers.push(marker)
        setMap(newMap)
        setPopin(null)
    }

    function onMarkerUpdated(layerId: number, newValue: MarkerModel) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        const marker = getMarker(newMap, layerId, newValue.id)
        if (!marker) return

        marker.name = newValue.name
        marker.description = newValue.description
        marker.iconUrl = newValue.iconUrl
        marker.x = newValue.x
        marker.y = newValue.y

        setMap(newMap)
        setPopin(null)
    }

    function onMarkerMoved(layerId: number, markerId: number, clientX: number, clientY: number) {
        const {x, y} = calculateMapCoords(clientX, clientY)
        if (!x || !y) return

        const newMap: MapModel = JSON.parse(JSON.stringify(map))        
        const marker = getMarker(newMap, layerId, markerId)
        if (!marker) return

        marker.x = x
        marker.y = y

        setMap(newMap)
    }

    function deleteMarker(layerId: number, markerId: number) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(newMap, layerId)
        if (!layer) return

        const markerIndex = layer.markers.findIndex(marker => (marker.id === markerId))
        if (markerIndex === -1) return

        layer.markers.splice(markerIndex, 1)

        setMap(newMap)
        setPopin(null)
    }

    function onZoom(scale: number) {
        const zoom = Math.trunc(scale * 100)
        setAlert(`Zoom: ${zoom}%`)
    }

    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2} doubleClick={{disabled: true}} onZoomStop={(e) => onZoom(e.state.scale)}>
                <TransformComponent>
                    <PopinContext.Provider value={{popin, setPopin}}>
                        {!isImageUrl(map.imageUrl) ? (
                            <div className={styles.default}>Import a map</div>
                        ) : (
                            <div ref={mapRef}>
                                <ClickableImg src={map.imageUrl} onClick={onMapClick}>
                                    <PopinContext.Provider value={{popin, setPopin}}>
                                        { map.layers.map(layer => (
                                            <div key={layer.id} className={styles.layer}>
                                                { /* MARKERS */}
                                                { layer.markers.map((marker, index) => (
                                                    <Marker
                                                        key={marker.id} 
                                                        marker={marker}
                                                        onMarkerUpdated={(newValue) => onMarkerUpdated(layer.id, newValue)}
                                                        onMarkerMoved={(x, y) => onMarkerMoved(layer.id, marker.id, x, y)}
                                                        onMarkerDeleted={() => deleteMarker(layer.id, marker.id)}
                                                    />
                                                )) }                                            
                                            </div>
                                        )) }

                                        { !popin ? null : (
                                            <Popin x={popin.x} y={popin.y} key={popin.id} yOffset={popin.yOffset}>
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

            { !alertMessage ? null : <div className={styles.alert} key={alertMessage}>{alertMessage}</div> }
        </div>
    )
}

export default Map