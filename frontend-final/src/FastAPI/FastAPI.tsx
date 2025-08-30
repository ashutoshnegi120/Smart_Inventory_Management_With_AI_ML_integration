// FastAPI/FastAPI.ts
export async function getCat(): Promise<string[]> {
    try {
        const res = await fetch("http://localhost:8000/getAll");
        const data = await res.json();
        return data.keys;

    } catch (err) {
        console.error("API error:", err);
        return [];
    }
}


