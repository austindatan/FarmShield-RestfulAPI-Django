import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus } from 'lucide-react'

const EMPTY = { label: '', farm: '' }

export default function SensorNodes() {
    const [nodes, setNodes] = useState([])
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)

    const load = () => {
        apiFetch('/sensor-nodes/').then(setNodes).catch(() => toast.error('Failed to load sensor nodes'))
        apiFetch('/farms/').then(setFarms).catch(() => { })
    }

    useEffect(() => { load() }, [])

    const openCreate = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
    const openEdit = (n) => { setForm({ label: n.label, farm: String(n.farm) }); setEditing(n.id); setOpen(true) }

    const save = async () => {
        try {
            if (editing) {
                await apiFetch(`/sensor-nodes/${editing}/`, { method: 'PUT', body: JSON.stringify(form) })
                toast.success('Sensor node updated')
            } else {
                await apiFetch('/sensor-nodes/', { method: 'POST', body: JSON.stringify(form) })
                toast.success('Sensor node created')
            }
            setOpen(false)
            load()
        } catch {
            toast.error('Failed to save sensor node')
        }
    }

    const del = async (id) => {
        if (!confirm('Delete this sensor node?')) return
        try {
            await apiFetch(`/sensor-nodes/${id}/`, { method: 'DELETE' })
            toast.success('Sensor node deleted')
            load()
        } catch {
            toast.error('Failed to delete sensor node')
        }
    }

    const farmName = (id) => farms.find(f => f.id === id)?.name ?? `Farm #${id}`

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Sensor Nodes</h1>
                <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Node</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.map(n => (
                    <Card key={n.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{n.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500 space-y-1">
                            <p>Farm: {farmName(n.farm)}</p>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(n)}>
                                    <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => del(n.id)}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {nodes.length === 0 && <p className="text-gray-400 col-span-3">No sensor nodes yet.</p>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Sensor Node' : 'New Sensor Node'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Label</Label>
                            <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Farm</Label>
                            <Select value={form.farm} onValueChange={v => setForm(p => ({ ...p, farm: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a farm" /></SelectTrigger>
                                <SelectContent>
                                    {farms.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
