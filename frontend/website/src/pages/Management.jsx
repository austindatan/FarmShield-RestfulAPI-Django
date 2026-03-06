import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const TABS = ['Farms', 'Crops', 'Sensor Nodes']

// ─── Shared Table Shell ────────────────────────────────────────────────────────
function TableShell({ headers, children, empty }) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        {headers.map(h => (
                            <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {children}
                    {empty && (
                        <tr>
                            <td colSpan={headers.length} className="px-4 py-6 text-gray-400 text-center">
                                {empty}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

// ─── Farms Tab ────────────────────────────────────────────────────────────────
function FarmsTab() {
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ name: '', owner: '' })
    const [editing, setEditing] = useState(null)

    const load = () => apiFetch('/farms/').then(setFarms).catch(() => toast.error('Failed to load farms'))
    useEffect(() => { load() }, [])

    const openCreate = () => { setForm({ name: '', owner: '' }); setEditing(null); setOpen(true) }
    const openEdit = (f) => { setForm({ name: f.name, owner: String(f.owner) }); setEditing(f.id); setOpen(true) }

    const save = async () => {
        try {
            if (editing) {
                await apiFetch(`/farms/${editing}/`, { method: 'PUT', body: JSON.stringify(form) })
                toast.success('Farm updated')
            } else {
                await apiFetch('/farms/', { method: 'POST', body: JSON.stringify(form) })
                toast.success('Farm created')
            }
            setOpen(false); load()
        } catch { toast.error('Failed to save farm') }
    }

    const del = async (id) => {
        if (!confirm('Delete this farm?')) return
        try { await apiFetch(`/farms/${id}/`, { method: 'DELETE' }); toast.success('Farm deleted'); load() }
        catch { toast.error('Failed to delete') }
    }

    return (
        <>
            <div className="flex justify-end mb-3">
                <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Farm</Button>
            </div>
            <TableShell headers={['#', 'Farm Name', 'Owner ID', 'Actions']} empty={farms.length === 0 ? 'No farms yet.' : null}>
                {farms.map((f, i) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{f.name}</td>
                        <td className="px-4 py-2 text-gray-500">{f.owner}</td>
                        <td className="px-4 py-2 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(f)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => del(f.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                    </tr>
                ))}
            </TableShell>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? 'Edit Farm' : 'New Farm'}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div><Label>Name</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div><Label>Owner (User ID)</Label>
                            <Input type="number" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={save}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Crops Tab ────────────────────────────────────────────────────────────────
function CropsTab() {
    const [crops, setCrops] = useState([])
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ name: '', farm: '' })
    const [editing, setEditing] = useState(null)

    const load = () => {
        apiFetch('/crops/').then(setCrops).catch(() => toast.error('Failed to load crops'))
        apiFetch('/farms/').then(setFarms).catch(() => { })
    }
    useEffect(() => { load() }, [])

    const farmName = (id) => farms.find(f => f.id === id)?.name ?? `Farm #${id}`
    const openCreate = () => { setForm({ name: '', farm: '' }); setEditing(null); setOpen(true) }
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
            setOpen(false); load()
        } catch { toast.error('Failed to save crop') }
    }

    const del = async (id) => {
        if (!confirm('Delete this crop?')) return
        try { await apiFetch(`/crops/${id}/`, { method: 'DELETE' }); toast.success('Crop deleted'); load() }
        catch { toast.error('Failed to delete') }
    }

    return (
        <>
            <div className="flex justify-end mb-3">
                <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Crop</Button>
            </div>
            <TableShell headers={['#', 'Crop Type', 'Farm', 'Actions']} empty={crops.length === 0 ? 'No crops yet.' : null}>
                {crops.map((c, i) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{c.name}</td>
                        <td className="px-4 py-2 text-gray-500">{farmName(c.farm)}</td>
                        <td className="px-4 py-2 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => del(c.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                    </tr>
                ))}
            </TableShell>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? 'Edit Crop' : 'New Crop'}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div><Label>Crop Type</Label>
                            <Select value={form.name} onValueChange={v => setForm(p => ({ ...p, name: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select a crop type" /></SelectTrigger>
                                <SelectContent>
                                    {CROP_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label>Farm</Label>
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
        </>
    )
}

// ─── Sensor Nodes Tab ─────────────────────────────────────────────────────────
function SensorNodesTab() {
    const [nodes, setNodes] = useState([])
    const [farms, setFarms] = useState([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ label: '', farm: '' })
    const [editing, setEditing] = useState(null)

    const load = () => {
        apiFetch('/sensor-nodes/').then(setNodes).catch(() => toast.error('Failed to load nodes'))
        apiFetch('/farms/').then(setFarms).catch(() => { })
    }
    useEffect(() => { load() }, [])

    const farmName = (id) => farms.find(f => f.id === id)?.name ?? `Farm #${id}`
    const openCreate = () => { setForm({ label: '', farm: '' }); setEditing(null); setOpen(true) }
    const openEdit = (n) => { setForm({ label: n.label, farm: String(n.farm) }); setEditing(n.id); setOpen(true) }

    const save = async () => {
        try {
            if (editing) {
                await apiFetch(`/sensor-nodes/${editing}/`, { method: 'PUT', body: JSON.stringify(form) })
                toast.success('Node updated')
            } else {
                await apiFetch('/sensor-nodes/', { method: 'POST', body: JSON.stringify(form) })
                toast.success('Node created')
            }
            setOpen(false); load()
        } catch { toast.error('Failed to save node') }
    }

    const del = async (id) => {
        if (!confirm('Delete this node?')) return
        try { await apiFetch(`/sensor-nodes/${id}/`, { method: 'DELETE' }); toast.success('Node deleted'); load() }
        catch { toast.error('Failed to delete') }
    }

    return (
        <>
            <div className="flex justify-end mb-3">
                <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Node</Button>
            </div>
            <TableShell headers={['#', 'Label', 'Farm', 'Actions']} empty={nodes.length === 0 ? 'No sensor nodes yet.' : null}>
                {nodes.map((n, i) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{n.label}</td>
                        <td className="px-4 py-2 text-gray-500">{farmName(n.farm)}</td>
                        <td className="px-4 py-2 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(n)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => del(n.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                    </tr>
                ))}
            </TableShell>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? 'Edit Sensor Node' : 'New Sensor Node'}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div><Label>Label</Label>
                            <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
                        </div>
                        <div><Label>Farm</Label>
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
        </>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Management() {
    const [tab, setTab] = useState('Farms')

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">Farm Management</h1>

            {/* Tabs */}
            <div className="flex gap-1 border-b mb-5">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                            ${tab === t
                                ? 'border-green-700 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Farms' && <FarmsTab />}
            {tab === 'Crops' && <CropsTab />}
            {tab === 'Sensor Nodes' && <SensorNodesTab />}
        </div>
    )
}
