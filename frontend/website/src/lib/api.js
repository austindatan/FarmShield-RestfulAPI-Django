const BASE = 'http://localhost:8000/api/v1/post'

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    if (res.status === 204) return null
    return res.json()
}
