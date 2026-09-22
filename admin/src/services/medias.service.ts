import adminApi from '@/lib/axios'

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    id: string
    nomFichier: string
    typeMime: string
    tailleOctets: number
    url: string
    altText: string | null
    dossier: string
    uploadePar: string
    createdAt: string
  }
}

export const uploadMedia = (file: File, dossier?: string) => {
  const formData = new FormData()
  formData.append('fichier', file)
  if (dossier) formData.append('dossier', dossier)

  return adminApi.post<UploadResponse>('/admin/medias/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((r) => r.data)
}
