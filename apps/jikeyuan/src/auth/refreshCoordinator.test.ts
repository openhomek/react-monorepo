import { describe, expect, it, vi } from 'vitest'

import { createRefreshCoordinator } from './refreshCoordinator'

describe('Refresh Token 刷新协调', () => {
  it('让并发调用共享同一次刷新请求', async () => {
    let resolveRefresh: (token: string) => void = () => {
      throw new Error('刷新请求没有进入等待状态')
    }

    const refreshRequest = vi.fn(() => {
      return new Promise<string>((resolve) => {
        resolveRefresh = resolve
      })
    })

    const coordinator = createRefreshCoordinator(refreshRequest)

    const firstResult = coordinator.refresh()
    const secondResult = coordinator.refresh()

    expect(refreshRequest).toHaveBeenCalledTimes(1)

    resolveRefresh('new-access-token')

    await expect(firstResult).resolves.toBe('new-access-token')
    await expect(secondResult).resolves.toBe('new-access-token')
  })

  it('刷新失败后允许后续请求重新尝试', async () => {
    const refreshRequest = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce('recovered-access-token')

    const coordinator = createRefreshCoordinator(refreshRequest)

    await expect(coordinator.refresh()).rejects.toThrow(
      'temporary failure',
    )

    await expect(coordinator.refresh()).resolves.toBe(
      'recovered-access-token',
    )

    expect(refreshRequest).toHaveBeenCalledTimes(2)
  })
})
