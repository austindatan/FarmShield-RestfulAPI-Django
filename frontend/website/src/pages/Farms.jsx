import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus } from 'lucide-react'

const EMPTY = { name: '', owner: '' }

export default function Farms() {
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)

    const load = () => apiFetch('/farms/').then(setFarms).catch(() => toast.error('Failed to load farms'))

    useEffect(() => { load() }, [])

    const openCreate = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
    const openEdit = (f) => { setForm({ name: f.name, owner: f.owner }); setEditing(f.id); setOpen(true) }

    const save = async () => {
        try {
            if (editing) {
                await apiFetch(`/farms/${editing}/`, { method: 'PUT', body: JSON.stringify(form) })
                toast.success('Farm updated')
            } else {
                await apiFetch('/farms/', { method: 'POST', body: JSON.stringify(form) })
                toast.success('Farm created')
            }
            setOpen(false)
            load()
        } catch {
            toast.error('Failed to save farm')
        }
    }

    const del = async (id) => {
        if (!confirm('Delete this farm?')) return
        try {
            await apiFetch(`/farms/${id}/`, { method: 'DELETE' })
            toast.success('Farm deleted')
            load()
        } catch {
            toast.error('Failed to delete farm')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Farms</h1>
                <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Farm</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {farms.map(f => (
                    <Card key={f.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{f.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500 space-y-1">
                            <p>Owner ID: {f.owner}</p>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(f)}>
                                    <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => del(f.id)}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {farms.length === 0 && <p className="text-gray-400 col-span-3">No farms yet.</p>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Farm' : 'New Farm'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Name</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Owner (User ID)</Label>
                            <Input type="number" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={save}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
