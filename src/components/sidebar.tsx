import { FC, MouseEvent, useContext, useState } from "react"
import styles from './sidebar.module.scss'
import { MapContext } from "@/model/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faCog, faEye, faEyeSlash, faFolder, faGripVertical, faPlus, faSave } from "@fortawesome/free-solid-svg-icons"
import { LayerModel, MapModel, getLayer } from "@/model/map"
import LayerForm from "./layerForm"
import DragDropList from "./dragDropList"
import MapForm from './mapForm'
import domtoimage from 'dom-to-image'

type PropType = {
    activeLayer: number,
    setActiveLayer: (newValue: number) => void,
}

const Sidebar: FC<PropType> = ({ activeLayer, setActiveLayer }) => {
    const {map, setMap} = useContext(MapContext)
    const [visible, setVisible] = useState(true)
    const [editing, setEditing] = useState<null | LayerModel>()
    const [creating, setCreating] = useState(false)
    const [mapSettings, setMapSettings] = useState(false)
    const [creatingMap, setCreatingMap] = useState(false)

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

    function onReorder(layers: LayerModel[]) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        mapClone.layers = layers
        setMap(mapClone)
    }

    function onLayerCreated(layer: LayerModel) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        mapClone.layers.push(layer)
        setMap(mapClone)
        setCreating(false)
    }

    function toggleSidebar() {
        const vis = visible
        setVisible(!vis)
        
        // On mobile, toggle full screen when sidebar is hidden
        if (!navigator || !document) return
        if (!/Android|iPhone/i.test(navigator.userAgent)) return

        if(vis) {
            const docEl = document.documentElement
            docEl.requestFullscreen({ navigationUI: 'hide' })
        } else {
            document.exitFullscreen()
        }
    }

    async function exportMap() {
        const mapElem = document.getElementById('map')
        if (!mapElem) return

        const imgString = await domtoimage.toPng(mapElem)

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgString;
        img.onload = () => {
          // create Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          // create a tag
          const a = document.createElement('a');
          a.download = 'download.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
        }; 
    }

    function updateMap(newValue: MapModel) {
        setMap(newValue)
        setCreatingMap(false)
        setMapSettings(false)
    }

    return (
        <div className={`${styles.sidebar} ${visible ? styles.visible : styles.hidden}`}>
            <button className={styles.collapse} onClick={toggleSidebar}>
                <FontAwesomeIcon icon={visible ? faChevronLeft : faChevronRight} />
            </button>

            <div className={styles.title}>World Canvas</div>

            <label>Map: {map.name}</label>
            <div className={styles.mapSettings}>
                <button onClick={() => setMapSettings(true)}>
                    <FontAwesomeIcon icon={faCog} />
                    <label>Settings</label>
                </button>
                <button onClick={exportMap}>
                    <FontAwesomeIcon icon={faSave} />
                    <label>Save</label>
                </button>
                <button onClick={() => {}}>
                    <FontAwesomeIcon icon={faFolder} />
                    <label>Open</label>
                </button>
                <button onClick={() => setCreatingMap(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    <label>New</label>
                </button>
            </div>

            <label>Layers</label>
            <div className={styles.layersContainer}>
                <div className={styles.layers}>
                    <DragDropList
                        items={map.layers}
                        onReorder={onReorder}
                        idGetter={layer => String(layer.id)}
                        itemRender={layer => (
                            <div 
                                className={`${styles.layerContainer} ${(activeLayer === layer.id) ? styles.active : ''}`} 
                                key={layer.id} 
                                style={{backgroundColor: layer.color}} 
                             >
                                <div className={styles.layer}>
                                    <div className={styles.dragHandle}>
                                        <FontAwesomeIcon icon={faGripVertical} />
                                    </div>
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
                        ) }
                    />
                </div>
                <button className={styles.addLayer} onClick={() => setCreating(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add Layer
                </button>
            </div>

            { !editing ? null : (
                <LayerForm onCancel={() => setEditing(null)} onSubmit={onLayerUpdated} onDelete={onLayerdeleted} initialValue={editing} />
            )}
            { !creating ? null : (
                <LayerForm onCancel={() => setCreating(false)} onSubmit={onLayerCreated} />
            )}
            { !mapSettings ? null :(
                <MapForm onCancel={() => setMapSettings(false)} onSubmit={updateMap} initialValue={map} />
            )}
            { !creatingMap ? null : (
                <MapForm onCancel={() => setCreatingMap(false)} onSubmit={updateMap} />
            )}
        </div>
    )
}

export default Sidebar