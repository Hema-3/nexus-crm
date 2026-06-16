import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from "@/components/ui/checkbox"
import { Trash, Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { fetchWithAuth } from '@/lib/api'

const ITEMS_PER_PAGE = 5

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([])
    const [newTask, setNewTask] = useState("")
    const [newPriority, setNewPriority] = useState("Medium")
    const [newDueDate, setNewDueDate] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchTasks()
    }, [page])

    async function fetchTasks() {
        setLoading(true)
        try {
            const url = new URL(window.location.origin + '/api/tasks')
            url.searchParams.append('page', page.toString())
            url.searchParams.append('size', ITEMS_PER_PAGE.toString())
            
            const res = await fetchWithAuth(url.toString())
            if (!res.ok) throw new Error('Failed to fetch tasks')
            
            const responseData = await res.json()
            setTasks(responseData.data || [])
            const total = responseData.count || 0
            const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE)
            setTotalPages(calculatedPages > 0 ? calculatedPages : 1)
        } catch (error: any) {
            toast.error("Failed to load tasks")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) {
            toast.error("Task title cannot be empty")
            return
        }

        try {
            const res = await fetchWithAuth('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ 
                    title: newTask,
                    priority: newPriority,
                    dueDate: newDueDate || null
                })
            })
            if (!res.ok) throw new Error("Failed to create task")
            
            setNewTask("")
            setNewPriority("Medium")
            setNewDueDate("")
            setPage(1)
            toast.success("Task added successfully")
            fetchTasks()
        } catch (error: any) {
            toast.error(error.message)
            console.error(error)
        }
    }

    const toggleTask = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !currentStatus, is_completed: !currentStatus } : t))
        try {
            const res = await fetchWithAuth(`/api/tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    isCompleted: !currentStatus
                })
            })
            if (!res.ok) throw new Error("Failed to update task")
            if (!currentStatus) toast.success("Task completed!")
        } catch (error: any) {
            toast.error("Could not update task status")
            // Revert on error
            setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: currentStatus, is_completed: currentStatus } : t))
        }
    }

    const deleteTask = async (id: string) => {
        try {
            const res = await fetchWithAuth(`/api/tasks/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Failed to delete task")
            setTasks(tasks.filter(t => t.id !== id))
            toast.success("Task deleted")
            if (tasks.length === 1 && page > 1) {
                setPage(page - 1)
            } else {
                fetchTasks()
            }
        } catch (error: any) {
            toast.error("Could not delete task")
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return <Badge variant="destructive">High</Badge>
            case 'low': return <Badge variant="secondary">Low</Badge>
            default: return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Medium</Badge>
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Tasks</h1>
            </div>

            <Card className="shrink-0 shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Create New Task</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addTask} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-gray-500">Task Title</label>
                            <Input
                                placeholder="What needs to be done?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="w-full sm:w-32 space-y-1">
                            <label className="text-xs font-medium text-gray-500">Priority</label>
                            <Select value={newPriority} onValueChange={setNewPriority}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-40 space-y-1">
                            <label className="text-xs font-medium text-gray-500">Due Date</label>
                            <Input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="h-10 text-gray-600"
                            />
                        </div>
                        <Button type="submit" className="h-10 w-full sm:w-auto">Add Task</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="space-y-3 overflow-y-auto pr-2 pb-4">
                    {loading ? (
                        <div className="flex justify-center p-8"><span className="animate-pulse text-gray-400">Loading tasks...</span></div>
                    ) : tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 ${task.isCompleted || task.is_completed ? "bg-gray-50/80 border-gray-100 shadow-none" : ""
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="pt-1">
                                    <Checkbox
                                        checked={task.isCompleted || task.is_completed}
                                        onCheckedChange={() => toggleTask(task.id, task.isCompleted || task.is_completed)}
                                        className={`h-5 w-5 rounded-full transition-all duration-300 ${task.isCompleted || task.is_completed ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" : ""}`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className={`text-base font-semibold transition-all duration-300 ${task.isCompleted || task.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                                        {task.title}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                                        {task.dueDate && (
                                            <div className="flex items-center">
                                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                {task.dueDate}
                                            </div>
                                        )}
                                        {!task.dueDate && (
                                            <div className="flex items-center text-gray-400">
                                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                No deadline
                                            </div>
                                        )}
                                        <div className={`transition-opacity duration-300 ${task.isCompleted || task.is_completed ? "opacity-50 grayscale" : ""}`}>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-4 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" 
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    
                    {tasks.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
                            <p className="text-sm text-gray-500 max-w-sm">There are no tasks on your plate right now. Take a break or add a new task above.</p>
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t mt-auto shrink-0">
                    <span className="text-sm font-medium text-gray-500">
                        Showing page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
