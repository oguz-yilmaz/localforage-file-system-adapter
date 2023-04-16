// @ts-ignore
import localforage from 'localforage'
import * as fs from 'fs/promises'
import { fileSystemDriver } from '../src'
import * as path from 'path'

jest.mock('fs/promises')

describe('fileSystemDriver', () => {
    beforeEach(async () => {
        await localforage.defineDriver(fileSystemDriver)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('localforage.clear()', () => {
        it('Should clear the storage directory', async () => {
            const storageName = 'test'
            const fullPath = path.resolve(storageName)
            const fsRmMock = jest.spyOn(fs, 'rm').mockResolvedValue(undefined)

            localforage.config({
                driver: fileSystemDriver._driver,
                name: storageName,
                storeName: 'test-store'
            })

            await localforage.clear()

            expect(fsRmMock).toHaveBeenCalledWith(fullPath, { recursive: true, force: true })
        })

        it('Should handle errors when clearing the storage directory', async () => {
            const fsMock = fs as jest.Mocked<typeof fs>

            const fileForageInstance = localforage.createInstance({
                driver: fileSystemDriver._driver,
                name: 'myDatabase'
            })

            fsMock.rm.mockImplementation(() => {
                throw new Error('Test error')
            })

            try {
                await fileForageInstance.clear()
            } catch (error) {
                expect(error).toBeInstanceOf(Error)
                expect(error.message).toBe('Test error')
            }

            fsMock.rm.mockRestore()
        })
    })
})
