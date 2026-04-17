import { useState } from 'react'
import toast from 'react-hot-toast'
import { createApp } from '../api'

const emptyVersion = () => ({ version: '', published_at: new Date().toISOString().slice(0, 10), file: '' })

export function SubmitModal({ open, token, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [github, setGithub] = useState('')
  const [description, setDescription] = useState('')
  const [cover, setCover] = useState('')
  const [versions, setVersions] = useState([emptyVersion()])
  const [saving, setSaving] = useState(false)

  function reset() {
    setName(''); setGithub(''); setDescription(''); setCover(''); setVersions([emptyVersion()])
  }

  function handleClose() { reset(); onClose() }

  function updateVersion(i, field, value) {
    setVersions((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const app = await createApp(
        { name, github, description, cover, versions: versions.filter((v) => v.version && v.file) },
        token
      )
      toast.success(`"${app.name}" submitted!`)
      onCreated(app)
      handleClose()
    } catch (err) {
      toast.error(err.message ?? 'Failed to submit')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <dialog className="modal modal-open" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box max-w-lg w-full">
        <h3 className="font-bold text-lg mb-4">Submit an App</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label"><span className="label-text">App Name *</span></div>
            <input className="input input-bordered" required value={name} onChange={(e) => setName(e.target.value)} placeholder="My Cool App" />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text">GitHub URL *</span></div>
            <input className="input input-bordered" required type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/you/your-app" />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text">Description *</span></div>
            <textarea className="textarea textarea-bordered" required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your app do?" />
          </label>

          <label className="form-control">
            <div className="label"><span className="label-text">Cover Image URL *</span></div>
            <input className="input input-bordered" required type="url" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://github.com/you/app/raw/main/cover.png" />
          </label>

          <div>
            <div className="label"><span className="label-text font-semibold">Device Builds</span></div>
            <div className="flex flex-col gap-2">
              {versions.map((v, i) => (
                <div key={i} className="border border-base-300 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="form-control flex-1">
                      <div className="label py-0"><span className="label-text text-xs">Device / Variant</span></div>
                      <input className="input input-bordered input-sm" value={v.version} onChange={(e) => updateVersion(i, 'version', e.target.value)} placeholder="CYD" />
                    </label>
                    <label className="form-control w-36">
                      <div className="label py-0"><span className="label-text text-xs">Published</span></div>
                      <input className="input input-bordered input-sm" type="date" value={v.published_at} onChange={(e) => updateVersion(i, 'published_at', e.target.value)} />
                    </label>
                    {versions.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-xs btn-circle self-end mb-1 text-error" onClick={() => setVersions((p) => p.filter((_, idx) => idx !== i))}>✕</button>
                    )}
                  </div>
                  <label className="form-control">
                    <div className="label py-0"><span className="label-text text-xs">Download URL (.bin)</span></div>
                    <input className="input input-bordered input-sm" type="url" value={v.file} onChange={(e) => updateVersion(i, 'file', e.target.value)} placeholder="https://github.com/you/app/releases/download/v1.0/app.bin" />
                  </label>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-xs self-start" onClick={() => setVersions((p) => [...p, emptyVersion()])}>+ Add device build</button>
            </div>
          </div>

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
