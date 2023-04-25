import { FC, useContext, useRef, useState } from "react"
import { AreaModel, LayerModel, MapModel, MarkerModel, PathModel, getLayer, getMarker } from "@/model/map"

import styles from './map.module.scss'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ClickableImg from "./clickableImg";
import MarkerMenu from "./markerMenu";
import { MapContext, PopinContext, PopinDescription } from "@/model/context";
import Popin from "./popin";
import CreateMenu from "./createMenu";
import Layer from "./layer";
import PathForm from "./pathForm";
import AreaForm from "./areaForm";

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
    const [zoom, setZoom] = useState(100)
    const mapRef = useRef<HTMLDivElement>(null)

    function calculateMapCoords(clientX: number, clientY: number) {
        if (!mapRef.current) throw new Error('map not initialized yet')

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
                onNewPath={() => setPopin({id: Date.now(), x, y, content: (
                    <PathForm onSubmit={(path) => onPathCreated(path, x, y)} />
                )})}
                onNewArea={() => setPopin({id: Date.now(), x, y, content: (
                    <AreaForm onSubmit={(area) => onAreaCreated(area, x, y)} />
                )})}
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

    function onPathCreated(path: PathModel, x: number, y: number) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(newMap, activeLayer)
        if (!layer) return

        path.points.push(
            { x: x-1, y },
            { x: x+1, y },
        )

        layer.paths.push(path)
        setMap(map)
        setPopin(null)
    }

    function onAreaCreated(area: AreaModel, x: number, y: number) {
        const newMap: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(newMap, activeLayer)
        if (!layer) return

        area.points.push(
            { x: x-1,   y: y+1 },
            { x: x+1,   y: y+1 },
            { x: x+1,   y: y-1 },
            { x: x-1,   y: y-1 },
        )

        layer.areas.push(area)
        setMap(newMap)
        setPopin(null)
    }

    function onLayerUpdated(newValue: LayerModel) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layerIndex = mapClone.layers.findIndex(layer => (layer.id === newValue.id))
        if (layerIndex === -1) return

        mapClone.layers[layerIndex] = newValue

        setMap(mapClone)
    }

    function onZoom(scale: number) {
        const newZoom = Math.trunc(scale * 100)
        setZoom(newZoom)
    }

    return (
        <div className={styles.mapContainer}>
            <TransformWrapper centerOnInit={true} minScale={0.2} doubleClick={{disabled: true}} onZoomStop={(e) => onZoom(e.state.scale)}>
                <TransformComponent>
                    {!isImageUrl(map.imageUrl) ? (
                        <div className={styles.default}>Import a map</div>
                    ) : (
                        <div ref={mapRef}>
                            <ClickableImg src={map.imageUrl} onClick={onMapClick}>
                                <PopinContext.Provider value={{popin, setPopin, calculateMapCoords}}>
                                    { map.layers.map(layer => (
                                        <Layer key={layer.id} layer={layer} onUpdate={onLayerUpdated} currentZoom={zoom} />
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
                </TransformComponent>
            </TransformWrapper>

            <div className={styles.alert} key={zoom}>Zoom: {zoom}%</div>
        </div>
    )
}

export default Map