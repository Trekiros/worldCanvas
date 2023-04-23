import { FC, MouseEvent, useContext, useState } from "react"
import styles from './sidebar.module.scss'
import { MapContext } from "@/model/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { LayerModel, MapModel, getLayer } from "@/model/map"
import LayerForm from "./layerForm"

type PropType = {
    activeLayer: number,
    setActiveLayer: (newValue: number) => void,
}

const Sidebar: FC<PropType> = ({ activeLayer, setActiveLayer }) => {
    const {map, setMap} = useContext(MapContext)
    const [editing, setEditing] = useState<null | LayerModel>()
    const [creating, setCreating] = useState(false)

    function editLayer(e: MouseEvent, layer: LayerModel) {
        e.stopPropagation()
        setEditing(layer)
    }

    function toggleVisibility(layerId: number) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, layerId)
        if (!layer) return

        layer.visible = !layer.visible
        setMap(mapClone)
    }

    function onLayerUpdated(newValue: LayerModel) {
        if (!editing) return

        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, editing.id)

        if (!layer) return

        layer.name = newValue.name
        layer.imageUrl = newValue.imageUrl
        layer.color = newValue.color
        layer.iconUrl = newValue.iconUrl
        layer.minZoom = newValue.minZoom
        layer.maxZoom = newValue.maxZoom
        layer.visible = newValue.visible
        layer.playerPermissions = newValue.playerPermissions

        setMap(mapClone)
        setEditing(null)
    }

    function onLayerdeleted() {
        if (!editing) return
        const layerId = editing.id

        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        
        const layerIndex = mapClone.layers.findIndex(layer => (layer.id === layerId))
        if (layerIndex === -1) return

        mapClone.layers.splice(layerIndex, 1)

        setMap(mapClone)
        setEditing(null)
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>World Canvas</div>

            <div className={styles.layersContainer}>
                <div className={styles.layers}>
                    {map.layers.map(layer => (
                        <div className={styles.layerContainer} key={layer.id} style={{backgroundColor: layer.color}}>
                            <div className={styles.layer}>
                                <button onClick={() => setActiveLayer(layer.id)} className={styles.layerLabel}>
                                    {layer.name}
                                </button>
                                <button onClick={() => toggleVisibility(layer.id)} className={styles.toggleVisibility}>
                                    <FontAwesomeIcon icon={layer.visible ? faEye : faEyeSlash} />
                                </button>
                                <button className={styles.layerSettings} onClick={(e) => editLayer(e, layer)}>
                                    <FontAwesomeIcon icon={faCog} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className={styles.addLayer}>+</button>
            </div>

            { !editing ? null : (
                <LayerForm onCancel={() => setEditing(null)} onSubmit={onLayerUpdated} onDelete={onLayerdeleted} initialValue={editing} />
            )}
        </div>
    )
}

export default Sidebar