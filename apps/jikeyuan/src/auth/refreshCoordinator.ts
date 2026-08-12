type RefreshRequest = () => Promise<string>

export interface RefreshCoordinator {
  refresh: () => Promise<string>
}

export function createRefreshCoordinator(
  refreshRequest: RefreshRequest,
): RefreshCoordinator {
  let activeRefresh: Promise<string> | null = null

  async function refresh(): Promise<string> {
    if (activeRefresh !== null) {
      return await activeRefresh
    }

    const currentRefresh = refreshRequest()
    activeRefresh = currentRefresh

    try {
      return await currentRefresh
    } finally {
      activeRefresh = null
    }
  }

  return {
    refresh,
  }
}
