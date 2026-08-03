'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/utils/auth'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string
  label?: string
}

export const ImageUpload = ({ onUpload, currentUrl, label = 'Upload Profile Picture' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in to upload')
        setUploading(false)
        return
      }

      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${user.id}/${timestamp}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`

      const { error: uploadError, data } = await supabase.storage
        .from('profile_pictures')
        .upload(filename, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile_pictures').getPublicUrl(filename)

      onUpload(publicUrl)
      toast.success('Profile picture uploaded!')
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* Avatar Preview */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          border: '3px solid var(--surface)',
          boxShadow: '0 0 0 1px var(--border)',
          background: preview ? `url(${preview}) center / cover` : 'linear-gradient(135deg,#D9C3A0,#A8763F)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Upload Input */}
      <label
        style={{
          display: 'block',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <span
          style={{
            fontSize: '12px',
            color: 'var(--accent)',
            fontWeight: '600',
            textDecoration: 'underline',
          }}
        >
          {uploading ? 'Uploading...' : label}
        </span>
      </label>
    </div>
  )
}
