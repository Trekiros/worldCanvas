import { FC, useState } from "react"
import { LayerModel } from "@/model/map"
import styles from './layerForm.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import Slider from 'rc-slider'
import { SliderPicker } from "react-color";
import IconPicker from "./iconPicker";

type PropType = {
    onSubmit: (newValue: LayerModel) => void,
    onDelete?: () => void,
    initialValue?: LayerModel,
}

const defaultValue: LayerModel = {
    id: Date.now(),
    name: '',
    color: '#fff3',
    iconUrl: '/icons/house.svg',
    markers: [],
    paths: [],
    areas: [],
    visible: true,
}

const LayerForm: FC<PropType> = ({ onSubmit, onDelete, initialValue}) => {
    const [layer, setLayer] = useState<LayerModel>(initialValue || {...defaultValue, id: Date.now()})

    function validate() {
        return layer.name && layer.iconUrl && layer.color
    }

    function submit() {
        if (!validate()) return

        onSubmit(layer)
    }

    function update(callback: (layerClone: LayerModel) => void) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        callback(layerClone)
        setLayer(layerClone)
    }

    function onVisibilityRangeUpdated(newValue: [number, number]) {
        const [minZoom, maxZoom] = newValue
        setLayer({
            ...layer,
            minZoom,
            maxZoom,
        })
    }

    function removeAlpha(hex: string) {
        // #rrggbbaa format
        if (hex.length === 9) return hex.slice(0, -2)
        
        // #rgba format
        if (hex.length === 5) return hex.slice(0, -1)

        return hex
    }

    /*
        layer.name = newValue.name
        layer.fogOfWar = newValue.fogOfWar
        layer.imageUrl = newValue.imageUrl
        layer.color = newValue.color
        layer.iconUrl = newValue.iconUrl
        layer.minZoom = newValue.minZoom
        layer.maxZoom = newValue.maxZoom
        layer.visible = newValue.visible
        layer.playerPermissions = newValue.playerPermissions
    */

    return (
        <div className={styles.layerForm}>
            <input 
                className={styles.layerName}
                type='text' 
                placeholder="Layer name" 
                value={layer.name} 
                onChange={(e) => update((p) => { p.name = e.target.value })} 
                onSubmit={submit}
            />

            <div className={styles.visibilityRange}>
                <label>Zoom: visible from {layer.minZoom || 20}% to {layer.maxZoom || 800}%</label>
                <Slider 
                    range 
                    allowCross={false} 
                    step={20} 
                    min={20} 
                    max={800} 
                    defaultValue={[20, 800]}
                    value={(layer.minZoom && layer.maxZoom) ? [layer.minZoom, layer.maxZoom] : undefined}
                    draggableTrack 
                    onChange={onVisibilityRangeUpdated as any}
                    marks={{100: '100%', 200: '200%', 300: '300%', 400: '400%', 500: '500%', 600: '600%', 700: '700%', 800: '800%'}}
                    ariaLabelForHandle={(layer.minZoom && layer.maxZoom) ? [`${layer.minZoom}%`, `${layer.maxZoom}%`] : undefined}
                />
            </div>

            <div className={styles.iconPicker}>
                <label>Default icon label</label>
                <IconPicker value={layer.iconUrl} onChange={(newValue) => update(layerClone => { layerClone.iconUrl = newValue || '' })} />
            </div>

            <div className={styles.colorPicker}>
                <label>Default path/area color: <span className={styles.color} style={{backgroundColor: removeAlpha(layer.color) }} /></label>
                <SliderPicker color={layer.color} onChange={(newValue) => update(clone => { clone.color = `${newValue.hex}33` })} />
            </div>

            <div className={styles.buttons}>
                <button onClick={submit} disabled={!validate()}>
                    <FontAwesomeIcon icon={faCheck} />
                    OK
                </button>
                { onDelete ? <button onClick={onDelete}>
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                </button> : null }
            </div>
        </div>
    )
}

export default LayerForm