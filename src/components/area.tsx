import { AreaModel, LayerModel } from "@/model/map"
import { FC, MouseEvent as ReactMouseEvent, useContext, useEffect, useRef, useState } from "react"
import styles from './area.module.scss'
import { PopinContext } from "@/model/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import AreaForm from "./areaForm"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useCalculatedProp } from "@/model/state"

type PropType = {
    layer: LayerModel,
    area: AreaModel,
    onUpdate: (newValue: AreaModel) => void,
    onDelete: () => void,
}

const Area:FC<PropType> = ({ layer, area, onUpdate, onDelete }) => {
    const {popin, setPopin} = useContext(PopinContext)
    const [points, setPoints] = useState(area.points)
    const [editing, setEditing] = useState(false)
    const [dragging, setDragging] = useState<number | null>(null)
    const [hovering, setHovering] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setPoints(area.points)
    }, [area])

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
            const areaClone: AreaModel = JSON.parse(JSON.stringify(area))
            const point = areaClone.points[pointIndex]
            point.x = x
            point.y = y
    
            onUpdate(areaClone)
    
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
        const areaClone: AreaModel = JSON.parse(JSON.stringify(area))
        const point = areaClone.points[dragging]
        point.x = x
        point.y = y

        onUpdate(areaClone)
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
                <div className={styles.areaMenu}>
                    <button onClick={() => addPoint(x, y)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Add Point
                    </button>
                    <button onClick={() => editArea(x, y)}>
                        <FontAwesomeIcon icon={faCog} />
                        Area Settings
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
                <div className={styles.areaMenu}>
                    <button onClick={() => deletePoint(pointIndex)} disabled={points.length <= 3}>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Point
                    </button>
                    <button onClick={() => editArea(x, y)}>
                        <FontAwesomeIcon icon={faCog} />
                        Area Settings
                    </button>
                </div>
            )
        })
    }
    
    function onNameHover(e: ReactMouseEvent) {
        if (editing) return
        if (popin) return
        
        const {x, y} = calculateMapCoords(e.clientX, e.clientY)
        setPopin({
            id: area.id,
            x: center.x,
            y: center.y,
            content: (
                <div className={styles.areaInfo}>
                    <h3>{area.name}</h3>
                    <div className={styles.description}>
                        <ReactMarkdown>
                            {area.description}
                        </ReactMarkdown>
                    </div>
                </div>
            ),
            yOffset: true,
        })
    }

    function onNameHoverEnd() {
        if (editing) return
        if (!popin) return
        if (popin.id !== area.id) return

        setPopin(null)
    }

    function onNameClick() {
        console.log("wat")
        setPopin({
            id: Date.now(),
            x: center.x,
            y: center.y,
            yOffset: true,
            content: (
                <AreaForm 
                    initialValue={area} 
                    onSubmit={(newValue) => { setPopin(null); onUpdate(newValue) }} 
                    onDelete={() => { setPopin(null); onDelete() }}
                />
            )
        })
    }

    function handleMouse(e: MouseEvent) {
        try {
            const {x, y} = calculateMapCoords(e.clientX, e.clientY)
    
            // Algorithm: 
            const isInside = (points.map((point, index) => [point, points[(index+1) % points.length]] as const) // get all segments
                .filter(([p1, p2]) => { // Draw a line from the mouse which goes to the right. Filter segments which intersect with this line
                    // If the mouse isn't vertically within the segment, return early
                    const yIntersects = (Math.min(p1.y, p2.y) <= y) && (Math.max(p1.y, p2.y) >= y)
                    if (!yIntersects) return false
    
                    // special case where x1 === x2, which would cause math errors in the formulas below
                    if (p1.x === p2.x) {
                        return (p1.x >= x)
                    }
    
                    // calculating the segment's formula: y = ax + b
                    const a = (p2.y - p1.y)/(p2.x - p1.x)
                    const b = p1.y - a * p1.x
    
                    // find the x projection of the mouse onto the segment
                    const intersectionX = (y - b)/a
    
                    // Only counts intersections to the right of the mouse
                    return intersectionX > x
                })
                .length %2) === 1 // If the number of intersections is odd, the point is inside the polygon. Otherwise, it's outside.
    
            if (isInside) return
            
            setHovering(false)
            window.removeEventListener('mousemove', handleMouse)
        } catch (e) {
            window.removeEventListener('mousemove', handleMouse)
        }
    }
    function onPolygonHover() {
        setHovering(true)


        window.addEventListener('mousemove', handleMouse)
    }

    function editArea(x: number, y: number) {
        setPopin({
            id: Date.now(),
            x, y,
            yOffset: true,
            content: (
                <AreaForm initialValue={area} onSubmit={onUpdate} onDelete={deleteArea} />
            )
        })
    }

    function deleteArea() {
        setPopin(null)
        window.removeEventListener('mousemove', handleMouse)
        onDelete()
    }

    function addPoint(x: number, y: number) {
        if (points.length < 2) return

        const insertIndex = points.map((point, index) => [point, points[(index + 1) % points.length]] as const) // All points except the last one
            .map(([p1, p2], index) => { // Find distance from each segment of the path
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
        onUpdate({...area, points: pointsClone})
    }

    function deletePoint(pointIndex: number) {
        if (points.length <= 3) return
        if (pointIndex < 0) return
        if (pointIndex >= points.length) return

        const areaClone: AreaModel = JSON.parse(JSON.stringify(area))
        areaClone.points.splice(pointIndex, 1)
        onUpdate(areaClone)
        setPopin(null)
    }

    const center = points.reduce((p1, p2) => ({
        x: p1.x + p2.x, 
        y: p1.y + p2.y,
    }))
    center.x /= points.length
    center.y /= points.length

    return (
        <div className={`${styles.area} ${editing ? styles.editing : ''} ${hovering ? styles.hovering : ''}`} ref={ref} onClick={onOverlayClick}>
            <svg viewBox={`0 0 ${scaleX*100} 100`}>
                    { (points.length < 3) ? null : (
                        <>
                            <polygon 
                                points={points.map(({x, y}) => toCoords(x, y)).join(',')} 
                                fill={area.color || layer.color}
                                onMouseEnter={onPolygonHover}
                            />
                            <path
                                d={[...points, points[0]].map(({x, y}, index) => `${index ? 'L' : 'M'}${toCoords(x, y)}`).join(' ')}
                                stroke={area.color || layer.color}
                                fill={'none'}
                                strokeWidth={0.2}
                                onClick={onPathClick}
                            />
                        </>
                    )}
            </svg>
            { !editing ? null : points.map((point, index) => (
                <div key={index} className={styles.handleContainer} style={{ left: `${point.x}%`, top: `${point.y}%`}}>
                        <div 
                            className={`${styles.handle} panDisabled`} 
                            style={{ backgroundColor: area.color || layer.color }}
                            onClick={(e) => onHandleClick(index, e)}
                            onMouseDown={(e) => onDragStart(index)}
                        />
                </div>
            ))}
            <div className={styles.areaName} style={{left: `${center.x}%`, top: `${center.y}%`}}>
                <div 
                    className={styles.name}
                    onMouseEnter={onNameHover}
                    onMouseLeave={onNameHoverEnd}
                    onMouseDown={onNameClick}
                >
                    {area.name}
                </div>
            </div>
        </div>
    )
}

export default Area