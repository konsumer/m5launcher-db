#!/usr/bin/env node
import { getPlatformProxy } from 'wrangler'
import { syncBurner } from '../worker/jobs/sync-burner.js'

const { env, dispose } = await getPlatformProxy()
await syncBurner(env.APPS_KV)
await dispose()
