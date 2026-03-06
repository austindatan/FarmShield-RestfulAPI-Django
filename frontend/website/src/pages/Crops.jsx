import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
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

const CROP_OPTIONS = [
    'Rice', 'Corn', 'Wheat', 'Soybean', 'Cotton',
    'Sugarcane', 'Potato', 'Tomato', 'Cassava', 'Mango',
    'Banana', 'Coffee', 'Onion', 'Garlic', 'Eggplant',
    'Cabbage', 'Carrot', 'Pineapple', 'Watermelon', 'Peanut',
]

const EMPTY = { name: '', farm: '' }

export default function Crops() {
    const [crops, setCrops] = useState([])
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)

    const load = () => {
        apiFetch('/crops/').then(setCrops).catch(() => toast.error('Failed to load crops'))
        apiFetch('/farms/').then(setFarms).catch(() => { })
    }

    useEffect(() => { load() }, [])

    const openCreate = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
    const openEdit = (c) => { setForm({ name: c.name, farm: String(c.farm) }); setEditing(c.id); setOpen(true) }

    const save = async () => {
        try {
            if (editing) {
                await apiFetch(`/crops/${editing}/`, { method: 'PUT', body: JSON.stringify(form) })
                toast.success('Crop updated')
            } else {
                await apiFetch('/crops/', { method: 'POST', body: JSON.stringify(form) })
                toast.success('Crop created')
            }
            setOpen(false)
            load()
        } catch {
            toast.error('Failed to save crop')
        }
    }

    const del = async (id) => {
        if (!confirm('Delete this crop?')) return
        try {
            await apiFetch(`/crops/${id}/`, { method: 'DELETE' })
            toast.success('Crop deleted')
            load()
        } catch {
            toast.error('Failed to delete crop')
        }
    }

    const farmName = (id) => farms.find(f => f.id === id)?.name ?? `Farm #${id}`

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Crops</h1>
                <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Crop</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map(c => (
                    <Card key={c.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{c.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500 space-y-1">
                            <p>Farm: {farmName(c.farm)}</p>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                                    <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => del(c.id)}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {crops.length === 0 && <p className="text-gray-400 col-span-3">No crops yet.</p>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Crop' : 'New Crop'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Crop Type</Label>
                            <Select value={form.name} onValueChange={v => setForm(p => ({ ...p, name: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a crop type" /></SelectTrigger>
                                <SelectContent>
                                    {CROP_OPTIONS.map(crop => (
                                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
