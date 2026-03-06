import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { RefreshCw, Zap, Trash2 } from 'lucide-react'

const RISK = ['Low', 'Medium', 'High']
const DISEASES = ['Leaf Blight', 'Root Rot', 'Powdery Mildew', 'Fusarium Wilt', 'Bacterial Spot', 'Rust', 'Anthracnose']
const SEVERITY = ['Info', 'Warning', 'Critical']
const ALERT_MSGS = [
    'Soil moisture critically low', 'High disease risk detected',
    'Irrigation threshold exceeded', 'Unusual temperature spike',
    'Sensor node offline', 'Yield forecast below average',
]

const rand = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec))
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const RISK_COLOR = { Low: 'bg-green-100 text-green-800', Medium: 'bg-yellow-100 text-yellow-800', High: 'bg-red-100 text-red-800' }
const SEVERITY_COLOR = { Info: 'bg-blue-100 text-blue-800', Warning: 'bg-yellow-100 text-yellow-800', Critical: 'bg-red-100 text-red-800' }

function Section({ title, children }) {
    return (
        <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-700 mb-3 border-b pb-1">{title}</h2>
            {children}
        </div>
    )
}

export default function Simulated() {
    const [sensorData, setSensorData] = useState([])
    const [diseases, setDiseases] = useState([])
    const [irrigation, setIrrigation] = useState([])
    const [yields, setYields] = useState([])
    const [alerts, setAlerts] = useState([])
    const [simulating, setSimulating] = useState(false)

    // Lookup maps — keyed by ID
    const [farmMap, setFarmMap] = useState({})
    const [cropMap, setCropMap] = useState({})
    const [nodeMap, setNodeMap] = useState({})
    // sensor data map: sensorDataId → { nodeLabel, farmName, crops on that farm }
    const [sdMap, setSdMap] = useState({})

    const loadAll = async () => {
        const [farms, crops, nodes] = await Promise.all([
            apiFetch('/farms/').catch(() => []),
            apiFetch('/crops/').catch(() => []),
            apiFetch('/sensor-nodes/').catch(() => []),
        ])

        const fm = Object.fromEntries(farms.map(f => [f.id, f.name]))
        const cm = Object.fromEntries(crops.map(c => [c.id, { name: c.name, farm: c.farm }]))
        const nm = Object.fromEntries(nodes.map(n => [n.id, { label: n.label, farm: n.farm }]))

        setFarmMap(fm)
        setCropMap(cm)
        setNodeMap(nm)

        // Build sensor data lookup after nodes are loaded
        const sd = await apiFetch('/sensor-data/').catch(() => [])
        setSensorData(sd)

        // For each sensor reading, store resolved names
        const sdm = {}
        for (const d of sd) {
            const node = nm[d.sensor_node] ?? {}
            const farmName = fm[node.farm] ?? `Farm #${node.farm}`
            // crops on the same farm as this node
            const farmCrops = crops.filter(c => c.farm === node.farm).map(c => c.name).join(', ')
            sdm[d.id] = { nodeLabel: node.label ?? `Node #${d.sensor_node}`, farmName, farmCrops }
        }
        setSdMap(sdm)

        apiFetch('/disease-predictions/').then(setDiseases).catch(() => { })
        apiFetch('/irrigation-recommendations/').then(setIrrigation).catch(() => { })
        apiFetch('/yield-forecasts/').then(setYields).catch(() => { })
        apiFetch('/alerts/').then(setAlerts).catch(() => { })
    }

    const deleteAll = async () => {
        if (!confirm('Delete ALL simulated data? This cannot be undone.')) return
        try {
            const eps = ['/sensor-data/', '/disease-predictions/', '/irrigation-recommendations/', '/yield-forecasts/', '/alerts/']
            for (const ep of eps) {
                const items = await apiFetch(ep)
                await Promise.all(items.map(item => apiFetch(`${ep}${item.id}/`, { method: 'DELETE' })))
            }
            toast.success('All simulated data deleted')
            loadAll()
        } catch { toast.error('Failed to delete all data') }
    }

    useEffect(() => { loadAll() }, [])

    const simulate = async () => {
        setSimulating(true)
        try {
            const [nodes, farms, crops] = await Promise.all([
                apiFetch('/sensor-nodes/'), apiFetch('/farms/'), apiFetch('/crops/'),
            ])
            if (!nodes.length) { toast.error('Add at least one Sensor Node first!'); setSimulating(false); return }
            if (!farms.length) { toast.error('Add at least one Farm first!'); setSimulating(false); return }
            if (!crops.length) { toast.error('Add at least one Crop first!'); setSimulating(false); return }

            const newSd = []
            for (const node of nodes) {
                for (let i = 0; i < 2; i++) {
                    const entry = await apiFetch('/sensor-data/', {
                        method: 'POST',
                        body: JSON.stringify({
                            sensor_node: node.id,
                            soil_moisture: rand(20, 80), soil_temperature: rand(18, 35),
                            soil_pH: rand(5.5, 7.5), air_temperature: rand(22, 38),
                            air_humidity: rand(40, 95), leaf_wetness: rand(0, 1),
                        })
                    })
                    newSd.push(entry)
                }
            }

            for (const sd of newSd) {
                await apiFetch('/disease-predictions/', {
                    method: 'POST',
                    body: JSON.stringify({
                        sensor_data: sd.id, disease_name: pick(DISEASES),
                        risk_level: pick(RISK), confidence: rand(0.55, 0.99, 2),
                    })
                })
                const irr = sd.soil_moisture < 40
                await apiFetch('/irrigation-recommendations/', {
                    method: 'POST',
                    body: JSON.stringify({
                        sensor_data: sd.id, should_irrigate: irr,
                        recommended_duration_minutes: irr ? rand(20, 60, 0) : rand(0, 15, 0),
                        reason: irr ? `Soil moisture at ${sd.soil_moisture}% — below threshold`
                            : `Soil moisture sufficient at ${sd.soil_moisture}%`,
                    })
                })
            }

            const today = new Date()
            for (const crop of crops) {
                const fd = new Date(today)
                fd.setDate(today.getDate() + rand(30, 120, 0))
                await apiFetch('/yield-forecasts/', {
                    method: 'POST',
                    body: JSON.stringify({
                        farm: crop.farm, crop: crop.id,
                        forecasted_yield_kg: rand(500, 5000, 1),
                        forecast_date: fd.toISOString().split('T')[0],
                        notes: `Simulated forecast for ${crop.name}`,
                    })
                })
            }

            for (const farm of farms) {
                const count = Math.random() > 0.5 ? 2 : 1
                for (let i = 0; i < count; i++) {
                    await apiFetch('/alerts/', {
                        method: 'POST',
                        body: JSON.stringify({
                            farm: farm.id, severity: pick(SEVERITY),
                            message: pick(ALERT_MSGS), is_resolved: Math.random() > 0.7,
                        })
                    })
                }
            }

            toast.success('Simulation complete!')
            loadAll()
        } catch (e) {
            console.error(e)
            toast.error('Simulation failed — check the console')
        }
        setSimulating(false)
    }

    // Helper resolvers
    const nodeLabel = (nodeId) => nodeMap[nodeId]?.label ?? `Node #${nodeId}`
    const farmOfNode = (nodeId) => farmMap[nodeMap[nodeId]?.farm] ?? `Farm #${nodeMap[nodeId]?.farm}`
    const farmName = (farmId) => farmMap[farmId] ?? `Farm #${farmId}`
    const cropName = (cropId) => cropMap[cropId]?.name ?? `Crop #${cropId}`
    const sdInfo = (sdId) => sdMap[sdId] ?? { nodeLabel: `Node #${sdId}`, farmName: '—', farmCrops: '—' }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Simulated Data</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadAll}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteAll}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete All
                    </Button>
                    <Button size="sm" onClick={simulate} disabled={simulating}
                        className="bg-green-700 hover:bg-green-800 text-white">
                        <Zap className="w-4 h-4 mr-1" />
                        {simulating ? 'Simulating...' : 'Simulate Data'}
                    </Button>
                </div>
            </div>

            {/* Sensor Readings */}
            <Section title="Sensor Readings">
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {['Node', 'Farm', 'Crops on Farm', 'Soil Moisture', 'Soil Temp', 'Soil pH', 'Air Temp', 'Air Humidity', 'Leaf Wetness', 'Timestamp'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sensorData.map(d => {
                                const info = sdInfo(d.id)
                                return (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{nodeLabel(d.sensor_node)}</td>
                                        <td className="px-3 py-2 text-gray-600">{farmOfNode(d.sensor_node)}</td>
                                        <td className="px-3 py-2 text-gray-500">{info.farmCrops || '—'}</td>
                                        <td className="px-3 py-2">{d.soil_moisture}%</td>
                                        <td className="px-3 py-2">{d.soil_temperature}°C</td>
                                        <td className="px-3 py-2">{d.soil_pH}</td>
                                        <td className="px-3 py-2">{d.air_temperature}°C</td>
                                        <td className="px-3 py-2">{d.air_humidity}%</td>
                                        <td className="px-3 py-2">{d.leaf_wetness}</td>
                                        <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{new Date(d.timestamp).toLocaleString()}</td>
                                    </tr>
                                )
                            })}
                            {sensorData.length === 0 && (
                                <tr><td colSpan={10} className="px-3 py-6 text-gray-400 text-center">No data yet — click Simulate Data</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Disease Predictions */}
            <Section title="Disease Predictions">
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {['Disease', 'Risk', 'Confidence', 'Node', 'Farm', 'Timestamp'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {diseases.map(d => {
                                const info = sdInfo(d.sensor_data)
                                return (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{d.disease_name}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_COLOR[d.risk_level]}`}>
                                                {d.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{(d.confidence * 100).toFixed(1)}%</td>
                                        <td className="px-3 py-2 text-gray-600">{info.nodeLabel}</td>
                                        <td className="px-3 py-2 text-gray-500">{info.farmName}</td>
                                        <td className="px-3 py-2 text-xs text-gray-400">{new Date(d.predicted_at).toLocaleString()}</td>
                                    </tr>
                                )
                            })}
                            {diseases.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-gray-400 text-center">No predictions yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Irrigation */}
            <Section title="Irrigation Recommendations">
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {['Node', 'Farm', 'Irrigate?', 'Duration (min)', 'Reason', 'Created'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {irrigation.map(r => {
                                const info = sdInfo(r.sensor_data)
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium">{info.nodeLabel}</td>
                                        <td className="px-3 py-2 text-gray-500">{info.farmName}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.should_irrigate ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {r.should_irrigate ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{r.recommended_duration_minutes}</td>
                                        <td className="px-3 py-2 text-gray-500">{r.reason || '—'}</td>
                                        <td className="px-3 py-2 text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                                    </tr>
                                )
                            })}
                            {irrigation.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-gray-400 text-center">No recommendations yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Yield Forecasts */}
            <Section title="Yield Forecasts">
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {['Crop', 'Farm', 'Forecast (kg)', 'Date', 'Notes'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {yields.map(y => (
                                <tr key={y.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-medium">{cropName(y.crop)}</td>
                                    <td className="px-3 py-2 text-gray-500">{farmName(y.farm)}</td>
                                    <td className="px-3 py-2 font-semibold text-green-700">{y.forecasted_yield_kg} kg</td>
                                    <td className="px-3 py-2 text-gray-400">{y.forecast_date}</td>
                                    <td className="px-3 py-2 text-gray-400 text-xs">{y.notes || '—'}</td>
                                </tr>
                            ))}
                            {yields.length === 0 && (
                                <tr><td colSpan={5} className="px-3 py-6 text-gray-400 text-center">No forecasts yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Alerts */}
            <Section title="Alerts">
                <div className="space-y-2">
                    {alerts.map(a => (
                        <div key={a.id} className={`flex items-start gap-3 p-3 rounded-md border ${a.is_resolved ? 'opacity-40' : ''}`}>
                            <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium shrink-0 ${SEVERITY_COLOR[a.severity]}`}>
                                {a.severity}
                            </span>
                            <div className="text-sm">
                                <p>{a.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {farmName(a.farm)} · {new Date(a.created_at).toLocaleString()}
                                    {a.is_resolved && ' · Resolved'}
                                </p>
                            </div>
                        </div>
                    ))}
                    {alerts.length === 0 && <p className="text-gray-400">No alerts.</p>}
                </div>
            </Section>
        </div>
    )
}
