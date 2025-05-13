import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { PlusCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import ColumnItem from './ColumnItem'
import TaskItem from './TaskItem'

export interface TaskProps {
	id: number
	title: string
	column_id: number
}

export interface ColumnProps {
	id: number
	title: string
}

export default function KanbanBoard() {
	const [columns, setColumns] = useState<ColumnProps[]>([])
	const [activeColumn, setActiveColumn] = useState<ColumnProps | null>(null)
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

	const [tasks, setTasks] = useState<TaskProps[]>([])
	const [activeTask, setActiveTask] = useState<TaskProps | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	)

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === 'Column') {
			setActiveColumn(event.active.data.current.column)
			return
		}

		if (event.active.data.current?.type === 'Task') {
			setActiveTask(event.active.data.current.task)
			return
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null)
		setActiveTask(null)

		const { active, over } = event

		if (!over) {
			return
		}

		const activeId = active.id
		const overId = over.id

		if (activeId === overId) {
			return
		}

		const isActiveAColumn = active.data.current?.type === 'Column'
		if (!isActiveAColumn) {
			return
		}

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex((col) => col.id === activeId)
			const overColumnIndex = columns.findIndex((col) => col.id === overId)

			return arrayMove(columns, activeColumnIndex, overColumnIndex)
		})
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event

		if (!over) {
			return
		}

		const activeId = active.id
		const overId = Number(over.id)

		if (activeId === overId) {
			return
		}

		const isActiveATask = active.data.current?.type === 'Task'
		const isOverATask = over.data.current?.type === 'Task'

		if (!isActiveATask) {
			return
		}

		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((task) => task.id === activeId)
				const overIndex = tasks.findIndex((task) => task.id === overId)

				if (tasks[activeIndex].column_id !== tasks[overIndex].column_id) {
					tasks[activeIndex].column_id = tasks[overIndex].column_id
					return arrayMove(tasks, activeIndex, overIndex - 1)
				}

				return arrayMove(tasks, activeIndex, overIndex)
			})
		}

		const isOverAColumn = over.data.current?.type === 'Column'
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId)

				tasks[activeIndex].column_id = overId

				return arrayMove(tasks, activeIndex, activeIndex)
			})
		}
	}

	function createColumn() {
		const newColumn: ColumnProps = {
			id: Date.now(),
			title: `Coluna ${columns.length + 1}`,
		}

		setColumns([...columns, newColumn])
	}

	function updateColumn(columnId: number, title: string) {
		const newColumns = columns.map((col) => {
			if (col.id !== columnId) {
				return col
			}
			return { ...col, title }
		})

		setColumns(newColumns)
	}

	function deleteColumn(columnId: number) {
		setColumns(columns.filter((col) => col.id !== columnId))

		setTasks(tasks.filter((task) => task.column_id !== columnId))
	}

	function createTask(columnId: number) {
		setTasks([
			...tasks,
			{
				id: Date.now(),
				title: `Tarefa ${tasks.length + 1}`,
				column_id: columnId,
			},
		])
	}

	function updateTask(taskId: number, title: string) {
		const newTasks = tasks.map((task) => {
			if (task.id !== taskId) {
				return task
			}
			return {
				...task,
				title,
			}
		})

		setTasks(newTasks)
	}

	function deleteTask(taskId: number) {
		const newTasks = tasks.filter((task) => task.id !== taskId)
		setTasks(newTasks)
	}

	return (
		<div className="flex flex-col h-screen p-10 overflow-y-hidden">
			<h2 className="text-xl font-bold">✨ React Kanban ✨</h2>
			<DndContext
				sensors={sensors}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
			>
				<div className="flex items-center gap-2 h-full">
					<div className="flex gap-2 h-[75vh]">
						<SortableContext items={columnsId}>
							{columns.map((column) => (
								<ColumnItem
									key={column.id}
									column={column}
									updateColumn={updateColumn}
									deleteColumn={deleteColumn}
									columnTasks={tasks.filter(
										(task) => task.column_id === column.id,
									)}
									createTask={createTask}
									updateTask={updateTask}
									deleteTask={deleteTask}
								/>
							))}
						</SortableContext>
					</div>
					<button
						onClick={createColumn}
						type="button"
						className="flex items-center justify-center gap-2 h-12 min-w-64 rounded-lg bg-zinc-800 border-2 border-zinc-700 outline-none cursor-pointer"
					>
						<PlusCircleIcon />
						Adicionar Coluna
					</button>
				</div>
				{createPortal(
					<DragOverlay>
						{activeColumn && (
							<ColumnItem
								column={activeColumn}
								updateColumn={updateColumn}
								deleteColumn={deleteColumn}
								columnTasks={tasks.filter(
									(task) => task.column_id === activeColumn.id,
								)}
								createTask={createTask}
								updateTask={updateTask}
								deleteTask={deleteTask}
							/>
						)}
						{activeTask && (
							<TaskItem
								task={activeTask}
								updateTask={updateTask}
								deleteTask={deleteTask}
							/>
						)}
					</DragOverlay>,
					document.body,
				)}
			</DndContext>
		</div>
	)
}
