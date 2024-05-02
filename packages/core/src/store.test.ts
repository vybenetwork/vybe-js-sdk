import { loadAuthData, storeAuthData } from './store'
import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
jest.mock('./constants', () => ({ STORAGE_KEY: 'vybe-data' }))

const authData = { pk: 'somePk', sig: 'someSig', key: 'someKey' }
const encodedAuthData = 'eyJwayI6InNvbWVQayIsInNpZyI6InNvbWVTaWciLCJrZXkiOiJzb21lS2V5In0='

describe('Store', () => {
  test('storeAuthData stores value in localStorage', async () => {
    jest.spyOn(window.localStorage.__proto__, 'setItem')
    storeAuthData(authData)
    expect(window.localStorage.setItem).toHaveBeenCalledWith('vybe-data', encodedAuthData)
  })

  test('loadAuthData returns value from localStorage', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(encodedAuthData)
    const data = await loadAuthData()
    expect(data).toEqual(authData)
  })
})
