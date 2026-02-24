import { Layout } from '@/components/Layout'
import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

// تعريف نوع البيانات حسب الـ API الجديد
interface PredictionResponse2D {
  success: boolean
  prediction_id: string
  segmentation: {
    prediction: string
    class_id: number
  }
  classification: {
    prediction: string
    confidence: number
    probabilities: Record<string, number>
  } | null
  final_decision: string
  images: {
    original: string
    blended: string
    mask: string
  }
  createdAt: string
}

function Predict() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResponse2D | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // معالجة رفع الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  // معالجة Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('الرجاء اختيار صورة أولاً')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await apiClient.predict(selectedFile)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  // دالة لتحويل اسم الفئة إلى نص عربي (اختياري للعرض)
  const translateClassName = (name: string) => {
    const map: Record<string, string> = {
      glioma: 'ورم دبقي',
      meningioma: 'ورم سحائي',
      pituitary: 'ورم الغدة النخامية',
      'no tumor': 'لا يوجد ورم',
    }
    return map[name.toLowerCase()] || name
  }

  // تحديد لون الفئة (لـ legend)
  const getLegendColor = (className: string) => {
    const colors: Record<string, string> = {
      glioma: 'bg-green-500',
      meningioma: 'bg-red-500',
      pituitary: 'bg-blue-500',
    }
    return colors[className.toLowerCase()] || 'bg-gray-400'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 text-white font-['Outfit'] relative overflow-x-hidden">
        {/* Background Blob */}
        <div className="fixed top-[-10%] left-[-10%] w-1/2 h-1/2 bg-gradient-to-r from-indigo-500/20 to-transparent blur-[80px] rounded-full -z-10" />
        <div className="fixed bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent blur-[80px] rounded-full -z-10" />

        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {/* Header */}
          <header className="text-center mb-12 animate-fadeInDown">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🧠</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                NeuroSeg<span className="text-indigo-500">.ai</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg">Advanced 2D Brain Tumor Segmentation</p>
          </header>

          <main>
            {/* Upload Section */}
            <section className="max-w-2xl mx-auto animate-fadeIn">
              <form onSubmit={handleSubmit}>
                <div
                  className={`relative bg-white/5 backdrop-blur-lg border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/5 translate-y-[-4px] shadow-2xl'
                      : 'border-white/10 hover:border-indigo-500 hover:bg-indigo-500/5 hover:translate-y-[-4px] hover:shadow-2xl'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="upload-content">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Upload Brain MRI</h3>
                    <p className="text-slate-300">
                      Drag & drop or <span className="text-indigo-500 font-semibold underline cursor-pointer">browse</span>
                    </p>
                    <span className="block mt-4 text-sm text-slate-500">Supports: JPG, PNG, BMP</span>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-6 flex justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-40 rounded-xl border border-white/10" />
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-red-500 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {loading ? 'Processing...' : 'Analyze Image'}
                </button>
              </form>
            </section>

            {/* Result Section */}
            {result && (
              <section className="mt-12 animate-scaleIn">
                <div className="flex justify-between items-center mb-8">
                  <div
                    className={`px-6 py-2 rounded-full font-semibold text-lg shadow-lg ${
                      result.final_decision === 'Tumor Detected'
                        ? 'bg-red-600 shadow-red-600/30'
                        : 'bg-green-600 shadow-green-600/30'
                    }`}
                  >
                    {result.final_decision}
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                  >
                    New Analysis
                  </button>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Original */}
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Original MRI
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-black/50">
                      <img
                        src={result.images.original}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Blended (primary) */}
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 md:scale-105">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Segmentation Overlay
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-black/50">
                      <img
                        src={result.images.blended}
                        alt="Blended"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Mask */}
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      Mask Only
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-black/50">
                      <img
                        src={result.images.mask}
                        alt="Mask"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 bg-white/5 backdrop-blur py-4 px-8 rounded-full w-fit mx-auto border border-white/10">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Glioma
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Meningioma
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Pituitary
                  </div>
                </div>

                {/* إضافة معلومات إضافية (اختياري) */}
                {result.classification && (
                  <div className="mt-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Classification Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Prediction</p>
                        <p className="text-xl font-bold">{translateClassName(result.classification.prediction)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Confidence</p>
                        <p className="text-xl font-bold">{(result.classification.confidence ).toFixed(1)}%</p>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${result.classification.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">Probabilities</p>
                      {Object.entries(result.classification.probabilities).map(([cls, prob]) => (
                        <div key={cls} className="mb-2">
                          <div className="flex justify-between text-sm">
                            <span>{translateClassName(cls)}</span>
                            <span>{(prob ).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 h-1.5 rounded-full">
                            <div
                              className={`${getLegendColor(cls)} h-1.5 rounded-full`}
                              style={{ width: `${prob }%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prediction ID and Date */}
                <div className="mt-6 text-sm text-slate-500 flex justify-between border-t border-white/10 pt-4">
                  <span>Prediction ID: {result.prediction_id.slice(0, 8)}...</span>
                  <span>{new Date(result.createdAt).toLocaleString()}</span>
                </div>
              </section>
            )}
          </main>

          <footer className="mt-16 text-center text-slate-500 text-sm">
            <p>Powered by Equivariant SE(2) CNNs & FastAPI</p>
          </footer>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-white border-b-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Processing Neural Networks...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Predict