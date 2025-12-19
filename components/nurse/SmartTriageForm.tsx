'use client'

import { useState, useEffect } from 'react'
import { Thermometer, Heart, Activity, Wind, Weight, Ruler, AlertTriangle, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import RiskAlert from './RiskAlert'

interface VitalsData {
  temperature: string
  bloodPressure: string
  pulse: string
  oxygen: string
  weight: string
  height: string
  nurseNote: string
}

interface SmartTriageFormProps {
  appointmentId: string
  currentVitals?: Partial<VitalsData>
  onSubmit: (id: string, vitals: VitalsData & { triageRiskLevel: string }) => void
  onCancel?: () => void
}

interface FieldValidation {
  isValid: boolean
  isCritical: boolean
  isWarning: boolean
  message?: string
}

export default function SmartTriageForm({
  appointmentId,
  currentVitals = {},
  onSubmit,
  onCancel
}: SmartTriageFormProps) {
  const [form, setForm] = useState<VitalsData>({
    temperature: currentVitals.temperature || '',
    bloodPressure: currentVitals.bloodPressure || '',
    pulse: currentVitals.pulse || '',
    oxygen: currentVitals.oxygen || '',
    weight: currentVitals.weight || '',
    height: currentVitals.height || '',
    nurseNote: currentVitals.nurseNote || '',
  })

  const [validation, setValidation] = useState<Record<string, FieldValidation>>({})
  const [riskLevel, setRiskLevel] = useState<'normal' | 'warning' | 'critical'>('normal')

  useEffect(() => {
    validateAllFields()
  }, [form])

  const validateTemperature = (temp: string): FieldValidation => {
    if (!temp) return { isValid: true, isCritical: false, isWarning: false }
    const value = parseFloat(temp)
    if (isNaN(value)) return { isValid: false, isCritical: false, isWarning: false, message: 'Invalid number' }

    if (value >= 39) {
      return { isValid: true, isCritical: true, isWarning: false, message: 'HIGH FEVER - Critical!' }
    } else if (value >= 38 || value < 35) {
      return { isValid: true, isCritical: false, isWarning: true, message: 'Abnormal temperature' }
    }
    return { isValid: true, isCritical: false, isWarning: false }
  }

  const validateBloodPressure = (bp: string): FieldValidation => {
    if (!bp) return { isValid: true, isCritical: false, isWarning: false }
    const match = bp.match(/^(\d+)\/(\d+)$/)
    if (!match) return { isValid: false, isCritical: false, isWarning: false, message: 'Use format: 120/80' }

    const systolic = parseInt(match[1])
    const diastolic = parseInt(match[2])

    if (systolic >= 180 || diastolic >= 120) {
      return { isValid: true, isCritical: true, isWarning: false, message: 'Hypertensive Crisis!' }
    } else if (systolic >= 140 || diastolic >= 90 || systolic < 90 || diastolic < 60) {
      return { isValid: true, isCritical: false, isWarning: true, message: 'Abnormal BP' }
    }
    return { isValid: true, isCritical: false, isWarning: false }
  }

  const validatePulse = (pulse: string): FieldValidation => {
    if (!pulse) return { isValid: true, isCritical: false, isWarning: false }
    const value = parseInt(pulse)
    if (isNaN(value)) return { isValid: false, isCritical: false, isWarning: false, message: 'Invalid number' }

    if (value > 120 || value < 40) {
      return { isValid: true, isCritical: true, isWarning: false, message: 'Critical pulse rate!' }
    } else if (value > 100 || value < 60) {
      return { isValid: true, isCritical: false, isWarning: true, message: 'Abnormal pulse' }
    }
    return { isValid: true, isCritical: false, isWarning: false }
  }

  const validateOxygen = (oxygen: string): FieldValidation => {
    if (!oxygen) return { isValid: true, isCritical: false, isWarning: false }
    const value = parseInt(oxygen)
    if (isNaN(value)) return { isValid: false, isCritical: false, isWarning: false, message: 'Invalid number' }

    if (value < 90) {
      return { isValid: true, isCritical: true, isWarning: false, message: 'HYPOXIA - Critical!' }
    } else if (value < 95) {
      return { isValid: true, isCritical: false, isWarning: true, message: 'Low oxygen saturation' }
    }
    return { isValid: true, isCritical: false, isWarning: false }
  }

  const validateAllFields = () => {
    const newValidation = {
      temperature: validateTemperature(form.temperature),
      bloodPressure: validateBloodPressure(form.bloodPressure),
      pulse: validatePulse(form.pulse),
      oxygen: validateOxygen(form.oxygen),
    }

    setValidation(newValidation)

    // Calculate overall risk level
    const hasCritical = Object.values(newValidation).some(v => v.isCritical)
    const hasWarning = Object.values(newValidation).some(v => v.isWarning)

    if (hasCritical) {
      setRiskLevel('critical')
    } else if (hasWarning) {
      setRiskLevel('warning')
    } else {
      setRiskLevel('normal')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    // Check required fields
    if (!form.temperature || !form.bloodPressure || !form.pulse || !form.oxygen) {
      toast.error('Please fill all vital signs')
      return
    }

    // Check for invalid fields
    const hasInvalid = Object.values(validation).some(v => v.isValid === false)
    if (hasInvalid) {
      toast.error('Please fix invalid entries')
      return
    }

    // Submit with risk level
    onSubmit(appointmentId, {
      ...form,
      triageRiskLevel: riskLevel
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          Smart Triage - Record Vitals
        </h4>
      </div>

      {/* Risk Alert */}
      <RiskAlert riskLevel={riskLevel} />

      {/* Vitals Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalInput
          icon={<Thermometer className="w-5 h-5" />}
          name="temperature"
          label="Temperature (°C)"
          placeholder="37.0"
          value={form.temperature}
          onChange={handleChange}
          validation={validation.temperature}
          required
        />

        <VitalInput
          icon={<Heart className="w-5 h-5" />}
          name="bloodPressure"
          label="Blood Pressure"
          placeholder="120/80"
          value={form.bloodPressure}
          onChange={handleChange}
          validation={validation.bloodPressure}
          required
        />

        <VitalInput
          icon={<Activity className="w-5 h-5" />}
          name="pulse"
          label="Pulse (bpm)"
          placeholder="72"
          value={form.pulse}
          onChange={handleChange}
          validation={validation.pulse}
          required
        />

        <VitalInput
          icon={<Wind className="w-5 h-5" />}
          name="oxygen"
          label="Oxygen Saturation (%)"
          placeholder="98"
          value={form.oxygen}
          onChange={handleChange}
          validation={validation.oxygen}
          required
        />

        <VitalInput
          icon={<Weight className="w-5 h-5" />}
          name="weight"
          label="Weight (kg)"
          placeholder="70"
          value={form.weight}
          onChange={handleChange}
        />

        <VitalInput
          icon={<Ruler className="w-5 h-5" />}
          name="height"
          label="Height (cm)"
          placeholder="170"
          value={form.height}
          onChange={handleChange}
        />
      </div>

      {/* Nurse Notes */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Clinical Observations
        </label>
        <textarea
          name="nurseNote"
          placeholder="Document any observations, patient complaints, or concerns..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all resize-none text-base"
          rows={4}
          value={form.nurseNote}
          onChange={handleChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Save className="w-6 h-6" />
          Save to Chart
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Guidelines Reference */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-xs text-blue-300 font-medium mb-2">Quick Reference:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-200">
          <div>• Temp: 36.5-37.5°C</div>
          <div>• BP: 90-140 / 60-90</div>
          <div>• Pulse: 60-100 bpm</div>
          <div>• O2: 95-100%</div>
        </div>
      </div>
    </div>
  )
}

interface VitalInputProps {
  icon: React.ReactNode
  name: string
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  validation?: FieldValidation
  required?: boolean
}

function VitalInput({ icon, name, label, placeholder, value, onChange, validation, required }: VitalInputProps) {
  const getBorderColor = () => {
    if (validation?.isCritical) return 'border-red-500 border-2 ring-2 ring-red-500/50'
    if (validation?.isWarning) return 'border-yellow-500 border-2 ring-2 ring-yellow-500/50'
    if (!validation?.isValid && value) return 'border-red-400 border-2'
    return 'border-white/20'
  }

  const getBackgroundColor = () => {
    if (validation?.isCritical) return 'bg-red-500/20'
    if (validation?.isWarning) return 'bg-yellow-500/20'
    return 'bg-white/10'
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-4 py-3 ${getBackgroundColor()} border ${getBorderColor()} rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all`}
        />
      </div>
      {validation?.message && (
        <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${
          validation.isCritical ? 'text-red-400' : validation.isWarning ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {validation.isCritical && <AlertTriangle className="w-3 h-3" />}
          {validation.message}
        </p>
      )}
    </div>
  )
}
