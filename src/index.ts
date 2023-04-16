import localforage from 'localforage'
import * as fs from 'fs/promises'
import * as path from 'path'

const forage = localforage

// @ts-ignore
type options = localforage.LocalForageOptions

// @ts-ignore
export const fileSystemDriver: forage.LocalForageDriver = {
    _driver: 'fileSystemDriver',
    _support: true,
    _basePath: '',

    async _initStorage(options: options): Promise<void> {
        const basePath = options.name || 'localforage'
        const fullPath = path.resolve(basePath)

        try {
            await fs.mkdir(fullPath, { recursive: true })
            this._basePath = fullPath
        } catch (error) {
            console.error('Failed to create storage directory:', error)
        }
    },

    async clear(callback?: (err: any) => void): Promise<void> {
        try {
            await fs.rm(this._basePath, { recursive: true, force: true })
            await fs.mkdir(this._basePath, { recursive: true })

            if (callback) {
                callback(null)
            }
        } catch (error) {
            if (callback) {
                callback(error)
            }

            throw error
        }
    },

    async getItem<T>(
        key: string,
        callback?: (err: any, value: T | null) => void
    ): Promise<T | null> {
        const filePath = path.join(this._basePath, key)
        try {
            const data = await fs.readFile(filePath, 'utf-8')
            const value = JSON.parse(data) as T

            if (callback) {
                callback(null, value)
            }

            return value
        } catch (error) {
            if (callback) {
                callback(error, null)
            }

            return null
        }
    },

    async iterate<T, U>(
        iteratee: (value: T, key: string, iterationNumber: number) => U,
        callback?: (err: any, result: U) => void
    ): Promise<U> {
        try {
            const keys = await fs.readdir(this._basePath)
            let iterationNumber = 1
            let result: U

            for (const key of keys) {
                // @ts-ignore
                const value = await (this as forage.LocalForageDriver).getItem<T>(key)
                result = iteratee(value, key, iterationNumber++)
                if (result) break
            }

            if (callback) callback(null, result)
            return result
        } catch (error) {
            if (callback) callback(error, null)
            throw error
        }
    },

    async key(
        keyIndex: number,
        callback?: (err: any, key: string | null) => void
    ): Promise<string | null> {
        try {
            const keys = await fs.readdir(this._basePath)
            const key = keys[keyIndex] || null

            if (callback) {
                callback(null, key)
            }

            return key
        } catch (error) {
            if (callback) {
                callback(error, null)
            }

            throw error
        }
    },

    async keys(callback?: (err: any, keys: string[]) => void): Promise<string[]> {
        try {
            const keys = await fs.readdir(this._basePath)

            if (callback) {
                callback(null, keys)
            }

            return keys
        } catch (error) {
            if (callback) {
                callback(error, [])
            }

            throw error
        }
    },

    async length(callback?: (err: any, numberOfKeys: number) => void): Promise<number> {
        try {
            const keys = await fs.readdir(this._basePath)
            const numberOfKeys = keys.length

            if (callback) {
                callback(null, numberOfKeys)
            }

            return numberOfKeys
        } catch (error) {
            if (callback) callback(error, 0)

            throw error
        }
    },

    async removeItem(key: string, callback?: (err: any) => void): Promise<void> {
        const filePath = path.join(this._basePath, key)
        try {
            await fs.unlink(filePath)

            if (callback) {
                callback(null)
            }
        } catch (error) {
            if (callback) {
                callback(error)
            }

            throw error
        }
    },

    async setItem<T>(key: string, value: T, callback?: (err: any, value: T) => void): Promise<T> {
        const filePath = path.join(this._basePath, key)
        try {
            const data = JSON.stringify(value)
            await fs.writeFile(filePath, data, 'utf-8')

            if (callback) {
                callback(null, value)
            }

            return value
        } catch (error) {
            if (callback) {
                callback(error, null)
            }

            throw error
        }
    }
}

forage.defineDriver(fileSystemDriver)

export default forage.createInstance({
    driver: fileSystemDriver._driver,
    name: 'myDatabase'
})
