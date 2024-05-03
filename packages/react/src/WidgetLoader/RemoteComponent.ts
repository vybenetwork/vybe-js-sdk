import React, { ComponentType } from 'react'
import { resolver } from '@vybenetwork/core'

import { VybeWidget } from '../types'

const ENDPOINT = 'http://localhost:3003'
const cache: { [key: string]: RemoteComponent } = {}

export async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  let result = new Uint8Array(0)
  const reader = stream.getReader()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done || value === undefined) {
      break
    }

    const newResult = new Uint8Array(result.length + value.length)
    newResult.set(result)
    newResult.set(value, result.length)
    result = newResult
  }
  return result
}

class RemoteComponent {
  dataUrl: string = ''
  Component?: ComponentType

  private _url: string

  constructor(url: string) {
    this._url = url
  }

  async load() {
    const [error, response] = await resolver<Response>(fetch(this._url))

    if (error || response === undefined || response.body == null) {
      throw error || new Error('Response was emtpy')
    }

    const data = await streamToArrayBuffer(response.body)
    const b64 = window.btoa(String.fromCharCode.apply(null, data as unknown as number[]))
    this.dataUrl = `data:text/javascript;base64,${b64}`
    const mod = await import(/* webpackIgnore: true */ this.dataUrl)
    const component = await mod.default(React)
    this.Component = component.default
  }
}

export function loadComponent(name: VybeWidget): RemoteComponent {
  if (cache[name] !== undefined) {
    return cache[name]
  }

  const primitive = new RemoteComponent(`${ENDPOINT}/${name}.js`)
  primitive.load()
  cache[name] = primitive

  return primitive
}

export default RemoteComponent
