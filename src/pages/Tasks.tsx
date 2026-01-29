import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from "@/components/ui/checkbox"
import { Trash, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 4

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([])
    const [newTask, setNewTask] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchTasks()
    }, [page])

    async function fetchTasks() {
        setLoading(true)
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const { data, count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        setTasks(data || [])

        const total = count || 0
        const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE)
        setTotalPages(calculatedPages > 0 ? calculatedPages : 1)

        setLoading(false)
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        await supabase.from('tasks').insert([{ title: newTask }])
        setNewTask("")
        setPage(1)
        fetchTasks()
    }

    const toggleTask = async (id: string, currentStatus: boolean) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))
        await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', id)
    }

    const deleteTask = async (id: string) => {
        setTasks(tasks.filter(t => t.id !== id))
        await supabase.from('tasks').delete().eq('id', id)
        fetchTasks()
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <h1 className="text-2xl font-bold tracking-tight shrink-0">My Tasks</h1>

            <Card className="shrink-0">
                <CardContent className="pt-6">
                    <form onSubmit={addTask} className="flex gap-4">
                        <Input
                            placeholder="What needs to be done?"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="h-9"
                        />
                        <Button type="submit" size="sm">Add Task</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="space-y-2">
                    {loading ? <p>Loading...</p> : tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm transition-all ${task.is_completed ? "opacity-50 bg-slate-50" : ""
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={task.is_completed}
                                    onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                                />
                                <span className={`text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                                    {task.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {task.due_date || 'No Date'}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteTask(task.id)}>
                                    <Trash className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && !loading && <p className="text-center py-4 text-muted-foreground">No tasks.</p>}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-2 border-t mt-auto shrink-0">
                <span className="text-xs text-muted-foreground mr-4">Page {page} of {totalPages}</span>

                <Button
                    variant="outline" size="sm" className="h-8"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-3 w-3" />
                </Button>

                <Button
                    variant="outline" size="sm" className="h-8"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                >
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
