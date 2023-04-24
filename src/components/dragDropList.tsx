import { FC, ReactNode } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type PropType<T> = {
    items: T[],
    onReorder: (items: T[]) => void,
    itemRender: (item: T) => ReactNode,
    idGetter: (item: T) => string,
}

function DragDropList<T>({ items, onReorder, itemRender, idGetter }: PropType<T>) {
    function handleDrop(droppedItem: any) {
        // Ignore drop outside droppable container
        if (!droppedItem.destination) return;
        const itemsClone = [...items];
        // Remove dragged item
        const [reorderedItem] = itemsClone.splice(droppedItem.source.index, 1);
        // Add dropped item
        itemsClone.splice(droppedItem.destination.index, 0, reorderedItem);
        // Update State
        onReorder(itemsClone);
    }

    return (
        <DragDropContext onDragEnd={handleDrop}>
            <Droppable droppableId="list-container">
                {(provided) => (
                    <div
                        className="list-container"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {items.map((item, index) => (
                            <Draggable key={idGetter(item)} draggableId={idGetter(item)} index={index}>
                                {(provided) => (
                                    <div
                                        className="item-container"
                                        ref={provided.innerRef}
                                        {...provided.dragHandleProps}
                                        {...provided.draggableProps}
                                    >
                                        {itemRender(item)}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default DragDropList