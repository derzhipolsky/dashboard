import { openDB, IDBPDatabase } from 'idb';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB('music-db', 2, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('tracks')) {
                    db.createObjectStore('tracks');
                }
                if (!db.objectStoreNames.contains('covers')) {
                    db.createObjectStore('covers');
                }
            },
        });
    }
    return dbPromise;
}

export async function saveTrackFile(id: string, file: Blob) {
    const db = await getDB();
    await db.put('tracks', file, id);
}

export async function loadTrackFile(id: string): Promise<Blob | undefined> {
    const db = await getDB();
    return await db.get('tracks', id);
}

export async function deleteTrackFile(id: string) {
    const db = await getDB();
    await db.delete('tracks', id);
}

export async function saveCoverFile(id: string, file: Blob) {
    const db = await getDB();
    await db.put('covers', file, id);
}

export async function loadCoverFile(id: string): Promise<Blob | undefined> {
    const db = await getDB();
    return await db.get('covers', id);
}

export async function deleteCoverFile(id: string) {
    const db = await getDB();
    await db.delete('covers', id);
}
