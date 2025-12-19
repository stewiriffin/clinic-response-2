'use client'

import { Mic, MicOff, RotateCcw } from 'lucide-react'
import { useVoiceDictation } from '@/hooks/useVoiceDictation'
import { useEffect } from 'react'

interface VoiceDictationProps {
  onTranscriptChange: (text: string) => void
  currentText?: string
}

export default function VoiceDictation({ onTranscriptChange, currentText = '' }: VoiceDictationProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useVoiceDictation()

  useEffect(() => {
    if (transcript) {
      onTranscriptChange(currentText + ' ' + transcript)
    }
  }, [transcript])

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleReset = () => {
    resetTranscript()
    onTranscriptChange(currentText.replace(transcript, '').trim())
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-500 italic">
        Voice dictation not supported in this browser
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              Stop Dictating
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Dictate Note
            </>
          )}
        </button>

        {transcript && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear dictation"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-blue-400 animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span>Listening...</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
          {error}
        </div>
      )}

      {transcript && (
        <div className="text-xs text-slate-400 bg-blue-500/10 border border-blue-500/30 rounded px-3 py-2">
          <span className="font-medium text-blue-300">Transcribed:</span> {transcript}
        </div>
      )}
    </div>
  )
}
