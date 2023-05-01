import { LayerModel, PathModel } from "@/model/map"
import { FC, MouseEvent as ReactMouseEvent, useContext, useEffect, useRef, useState } from "react"
import styles from './path.module.scss'
import { PopinContext } from "@/model/context"
import PathForm from "./pathForm"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useCalculatedProp } from "@/model/state"

type PropType = {
    layer: LayerModel,
    path: PathModel,
    onUpdate: (newValue: PathModel) => void,
    onDelete: () => void,
}

const Path:FC<PropType> = ({ layer, path, onUpdate, onDelete }) => {
    const {popin, setPopin} = useContext(PopinContext)
    const [points, setPoints] = useState(path.points)
    const [editing, setEditing] = useState(false)
    const [dragging, setDragging] = useState<number | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setPoints(path.points)
    }, [path])

    // This is to account for the map's aspect ratio
    const scaleX = useCalculatedProp([ref, ref.current], () => {
        if (!ref.current) return 1
        return ref.current.clientWidth / ref.current.clientHeight
    })
    const toCoords = (x: number, y: number) => {
        return `${x * scaleX} ${y}`
    }

    function calculateMapCoords(clientX: number, clientY: number) {
        if (!ref.current) throw new Error('map not initialized yet')

        // Calculate x and y as percentages
        const hitBox = ref.current.getBoundingClientRect()
        const x = 100 * (clientX - hitBox.left) / hitBox.width
        const y = 100 * (clientY - hitBox.top) / hitBox.height

        return {x, y}
    }

    function onDragStart(pointIndex: number) {
        setPopin(null)

        if (!navigator || !document) return
        if (/Android|iPhone/i.test(navigator.userAgent)) {
            onDragStartMobile(pointIndex)
        } else {
            onDragStartDesktop(pointIndex)
        }
    }
    function onDragStartMobile(pointIndex: number) {
        setDragging(pointIndex)            
    }
    function onDragStartDesktop(pointIndex: number) {
        function onMouseMove(e: MouseEvent) {
            const {x, y} = calculateMapCoords(e.clientX, e.clientY)

            const pointsClone: {x: number, y: number}[] = JSON.parse(JSON.stringify(points))
            const point = pointsClone[pointIndex]
            point.x = x
            point.y = y

            setPoints(pointsClone)
        }

        function onMouseUp(e: MouseEvent) {
            const {x, y} = calculateMapCoords(e.clientX, e.clientY)
            const pathClone: PathModel = JSON.parse(JSON.stringify(path))
            const point = pathClone.points[pointIndex]
            point.x = x
            point.y = y
    
            onUpdate(pathClone)
    
            // setDragging(null)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }

    function onOverlayClick(e: ReactMouseEvent) {
        if (dragging === null) {
            setEditing(false)
            return
        }

        const {x, y} = calculateMapCoords(e.clientX, e.clientY)
        const pathClone: PathModel = JSON.parse(JSON.stringify(path))
        const point = pathClone.points[dragging]
        point.x = x
        point.y = y

        onUpdate(pathClone)
        setDragging(null)
    }

    function onPathClick(e: ReactMouseEvent) {
        e.stopPropagation()

        const {x, y} = calculateMapCoords(e.clientX, e.clientY)
        setEditing(true)
        setPopin({
            id: Date.now(),
            x, y,
            yOffset: true,
            content: (
                <div className={styles.pathMenu}>
                    <button onClick={() => addPoint(x, y)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Add Point
                    </button>
                    <button onClick={() => editPath(x, y)}>
                        <FontAwesomeIcon icon={faCog} />
                        Path Settings
                    </button>
                </div>
            )
        })
    }
    
    function onHandleClick(pointIndex: number, e: ReactMouseEvent) {
        e.stopPropagation()
        
        const {x, y} = calculateMapCoords(e.clientX, e.clientY)
        setPopin({
            id: Date.now(),
            x, y,
            yOffset: true,
            content: (
                <div className={styles.pathMenu}>
                    <button onClick={() => deletePoint(pointIndex)} disabled={points.length <= 2}>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Point
                    </button>
                    <button onClick={() => editPath(x, y)}>
                        <FontAwesomeIcon icon={faCog} />
                        Path Settings
                    </button>
                </div>
            )
        })
    }
    
    function onPathHover(e: ReactMouseEvent) {
        if (editing) return
        if (popin) return

        
        const {x, y} = calculateMapCoords(e.clientX, e.clientY)
        setPopin({
            id: path.id,
            x, y,
            content: (
                <div className={styles.pathInfo}>
                    <h3>{path.name}</h3>
                    <div className={styles.description}>{path.description}</div>
                </div>
            ),
            yOffset: true,
        })
    }

    function onPathHoverEnd() {
        if (editing) return
        if (!popin) return
        if (popin.id !== path.id) return

        setPopin(null)
    }

    function editPath(x: number, y: number) {
        setEditing(false)

        setPopin({
            id: Date.now(),
            x, y,
            yOffset: true,
            content: (
                <PathForm initialValue={path} onSubmit={onPathUpdated} onDelete={onPathDeleted} />
            )
        })
    }

    function onPathUpdated(newValue: PathModel) {
        setPopin(null)
        setEditing(false)
        onUpdate(newValue)
    }

    function onPathDeleted() {
        setPopin(null)
        onDelete()
    }

    function addPoint(x: number, y: number) {
        if (points.length < 2) return

        const insertIndex = points.slice(0, -1) // All points except the last one
            .map((p1, index) => { // Find distance from each segment of the path
                const p2 = points[index + 1]
                const segmentLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
                const distanceP1 = Math.sqrt(Math.pow(x - p1.x, 2) + Math.pow(y - p1.y, 2))
                const distanceP2 = Math.sqrt(Math.pow(x - p2.x, 2) + Math.pow(y - p2.y, 2))
                const distanceLine = Math.abs((p2.x - p1.x) * (p1.y - y) - (p1.x - x) * (p2.y - p1.y))
                  / Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
          
                const distance = (distanceP1 > segmentLength) ? distanceP2
                  : (distanceP2 > segmentLength) ? distanceP1
                  : distanceLine

                return {index, distance}
            })
            .reduce((o1, o2) => (o1.distance < o2.distance ? o1 : o2)) // Get segment with lowest distance
            .index + 1 // Get that segment's index
        
        // Insert the point at that location
        const pointsClone = [...points]
        pointsClone.splice(insertIndex, 0, {x, y})
        onUpdate({...path, points: pointsClone})
    }

    function deletePoint(pointIndex: number) {
        if (points.length <= 2) return
        if (pointIndex < 0) return
        if (pointIndex >= points.length) return

        const pathClone: PathModel = JSON.parse(JSON.stringify(path))
        pathClone.points.splice(pointIndex, 1)
        onUpdate(pathClone)
        setPopin(null)
    }

    return (
        <div className={`${styles.path} ${editing ? styles.editing : ''}`} ref={ref} onClick={onOverlayClick} onMouseDown={(e) => {e.preventDefault(); e.stopPropagation()}}>
            <svg viewBox={`0 0 ${scaleX*100} 100`}>
                { (points.length < 2) ? null : (
                    <path
                        d={points.map(({x, y}, index) => `${index ? 'L' : 'M'}${toCoords(x, y)}`).join(' ')}
                        stroke={path.color || layer.color}
                        strokeWidth={path.strokeWidth / 10}
                        fill="none" 
                        strokeDasharray={
                            (path.strokeType === 'dashed') ? "2 1" 
                            : (path.strokeType === 'dotted') ? `${path.strokeWidth/10} ${path.strokeWidth/10}`
                            : undefined
                        }
                        onClick={onPathClick}
                        onMouseEnter={onPathHover}
                        onMouseLeave={onPathHoverEnd}
                    />
                )}
            </svg>
            { !editing ? null : points.map((point, index) => (
                <div key={index} className={styles.handleContainer} style={{ left: `${point.x}%`, top: `${point.y}%`}}>
                        <div 
                            className={`${styles.handle} panDisabled`} 
                            style={{ backgroundColor: path.color || layer.color }}
                            onClick={(e) => onHandleClick(index, e)}
                            onMouseDown={(e) => onDragStart(index)}
                        />
                </div>
            ))}
        </div>
    )
}

export default Path