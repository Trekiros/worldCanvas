import { MapModel } from "@/model/map"
import { FC, useState } from "react"
import domtoimage from 'dom-to-image'
import { CircleLoader } from "react-spinners"
import styles from './saveMapMenu.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile, faImage } from "@fortawesome/free-solid-svg-icons"

type PropType = {
    map: MapModel,
}

const SaveMapMenu:FC<PropType> = ({ map }) => {
    const [spinner, setSpinner] = useState(false)

    // TODO: fixme. Since the refactor of the map overlay, this has stopped working. This is not a very useful feature so I'm okay leaving it broken for now.
    async function exportImage() {
        const mapElem = document.getElementById('mapImage')
        const overlayElem = document.getElementById('mapOverlay')
        if (!mapElem || !overlayElem) return
        
        setSpinner(true)
        const hitbox = mapElem.getBoundingClientRect()
        const mapPng = await domtoimage.toPng(mapElem, {height: hitbox.height, width: hitbox.width})
        const overlayPng = await domtoimage.toPng(overlayElem, {height: hitbox.height, width: hitbox.width})

        const mapImg = new Image()
        mapImg.crossOrigin = 'anonymous'
        mapImg.src = mapPng
        
        const overlayImg = new Image()
        overlayImg.crossOrigin = 'anonymous'
        overlayImg.src = overlayPng

        const promises = [
            new Promise(resolve => { mapImg.onload = resolve }),
            new Promise(resolve => { overlayImg.onload = resolve }),
        ]

        await Promise.all(promises)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = mapImg.width
        canvas.height = mapImg.height
        ctx.drawImage(mapImg, 0, 0)
        ctx.drawImage(overlayImg, 0, 0)

        // create a tag
        const a = document.createElement('a')
        a.download = `${map.name}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
        setSpinner(false)
    }

    function save() {
        const file = new Blob([JSON.stringify(map)], {type: 'json'})
        const a = document.createElement("a")
        const url = URL.createObjectURL(file)
        a.href = url
        a.download = `${map.name}.json`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)  
        }, 0)
    }

    return (
        <div className={styles.saveMapMenu}>
            <button onClick={exportImage}>
                <FontAwesomeIcon icon={faImage} />
                Export Map as Image
            </button>
            <button onClick={save}>
                <FontAwesomeIcon icon={faFile} />
                Save Map File
            </button>
            { !spinner ? null : (
                <div className={styles.spinner}>
                    <CircleLoader 
                            color='#fff'
                            loading={spinner}
                            size={100}
                    />
                </div>
            )}
        </div>
    )
}

export default SaveMapMenu