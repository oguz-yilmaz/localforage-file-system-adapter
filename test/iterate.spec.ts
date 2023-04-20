import * as fs from 'fs/promises'
import fileSystemLocalForage from '../src'

jest.mock('fs/promises')

describe('fileSystemDriver', () => {
    describe('iterate', () => {
        afterEach(() => {
            jest.restoreAllMocks()
        })

        it('should iterate over stored items', async () => {
            const forage = await fileSystemLocalForage({
                name: 'test'
            })

            const files = ['file1', 'file2', 'file3']

            jest.spyOn(fs, 'readdir').mockResolvedValue(files as any)

            jest.spyOn(fs, 'readFile').mockImplementation((filePath: string) => {
                const key = filePath.split('/').pop()?.split('.')[0] ?? ''

                return Promise.resolve(Buffer.from(`value-${key}`))
            })

            const iteratee = jest.fn((value, key, number) => {
                if (key === 'file2') {
                    // break
                    return false
                }
            })

            await forage.iterate(iteratee)

            expect(iteratee).toHaveBeenCalledTimes(2)
            expect(iteratee).toHaveBeenNthCalledWith(1, 'value-file1', 'file1', 1)
            expect(iteratee).toHaveBeenNthCalledWith(2, 'value-file2', 'file2', 2)
        })

        it('Should handle no files if no item saved', async () => {
            const forage = await fileSystemLocalForage({
                name: 'test'
            })

            jest.spyOn(fs, 'readdir').mockResolvedValue([])

            const callback = jest.fn()

            const result = await forage.iterate(callback)

            expect(callback).toHaveBeenCalledTimes(0)

            expect(result).toBeUndefined()
        })

        it('Should iterate over all stored items when the callback does not return false', async () => {
            const forage = await fileSystemLocalForage({
                name: 'test'
            })

            const files = ['key1.json', 'key2.json', 'key3.json']
            jest.spyOn(fs, 'readdir').mockResolvedValue(files as any)

            const callback = jest.fn()

            const result = await forage.iterate(callback)

            expect(callback).toHaveBeenCalledTimes(3)

            expect(result).toBeUndefined()
        })
    })
})
