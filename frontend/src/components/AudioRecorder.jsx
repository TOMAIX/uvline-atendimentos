// AudioRecorder.jsx
import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Send } from 'lucide-react'

function AudioRecorder({ selectedStore }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [volume, setVolume] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    analyserRef.current = audioContextRef.current.createAnalyser()
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const updateVolumeMeter = (audioStream) => {
    const audioContext = audioContextRef.current
    const analyser = analyserRef.current
    const source = audioContext.createMediaStreamSource(audioStream)
    source.connect(analyser)
    
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      setVolume(average)
      animationFrameRef.current = requestAnimationFrame(checkVolume)
    }

    checkVolume()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      updateVolumeMeter(stream)
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
      }

      mediaRecorderRef.current.start(200)
      setIsRecording(true)
      setError(null)
      setSuccessMessage(null)
    } catch (err) {
      setError('Erro ao acessar o microfone. Verifique as permissões.')
      console.error('Erro ao iniciar gravação:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setVolume(0)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('store', selectedStore)

      const response = await fetch('https://uvline-atendimentos-backend.onrender.com/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setAudioBlob(null)
        setError(null)
        setSuccessMessage('Áudio enviado com sucesso!')
      } else {
        throw new Error(data.error || 'Erro ao enviar áudio')
      }
    } catch (err) {
      setError('Erro ao enviar o áudio. Tente novamente.')
      console.error('Erro ao enviar áudio:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Clique no botão para iniciar a gravação
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {isRecording && (
        <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-red-600 h-2.5 rounded-full transition-all duration-200"
            style={{ width: `${Math.min(100, volume)}%` }}
          />
        </div>
      )}

      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <Mic size={24} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="p-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <Square size={24} />
          </button>
        )}
        
        {audioBlob && (
          <button
            onClick={handleSubmit}
            className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Send size={24} />
          </button>
        )}
      </div>

      <div className="text-center mt-4">
        {isRecording ? (
          <p className="text-red-500 font-medium animate-pulse">
            Gravando...
          </p>
        ) : audioBlob ? (
          <p className="text-green-500 font-medium">
            Áudio pronto para envio
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default AudioRecorder