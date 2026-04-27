/**
 * patients.ts
 * Mock patient records. In production, replace with a useCohortData() hook
 * that fetches from your Supabase `patients` table.
 */

export interface Vitals {
    hr:   number   // beats per minute
    spo2: number   // %
    mbp:  number   // mmHg
    pp:   number   // pulse pressure (systolic - diastolic)
  }
  
  export interface VitalPoint {
    time:  string  // e.g. "4h ago"
    hr:    number
    spo2:  number
    mbp:   number
  }
  
  export interface ShapFeature {
    name:        string
    value:       number   // SHAP contribution (-1 to 1 range)
    displayVal:  string   // human-readable raw value, e.g. "3.18 mm/kg"
    direction:   'risk' | 'protective'
  }
  
  export interface Patient {
    id:                   string
    gender:               'M' | 'F'
    diagnosis:            string
    diagnosisShort:       string
    shuntType:            'BT' | 'Sano'
    riskScore:            number   // 0–1
    modelConfidence:      number
    birthWeightKg:        number
    gestAgeWeeks:         number
    ageAtSurgeryDays:     number
    ageAtSurgeryMonths:   number
    surgWeightKg:         number
    shuntSizeMm:          number
    shuntToWeight:        number   // compound feature
    cpbMinutes:           number
    xclampMinutes:        number
    tapvrClass:           0 | 1 | 2  // 0=absent,1=present,2=concurrently repaired
    premature:            boolean
    syndrome:             boolean
    // Complications (before SH)
    compChylo:            boolean
    compLCOS:             boolean
    compArrest:           boolean
    compSepsis:           boolean
    openSternum:          boolean
    nitricOxide:          boolean
    ncaaLungs:            boolean
    // Live vitals
    vitals:               Vitals
    vitalHistory:         VitalPoint[]   // last 4 hours
    // SHAP features (top 10)
    shapFeatures:         ShapFeature[]
    // Clinical synthesis from model
    clinicalSummary:      string
    criticalInsight:      string
    recommendation:       string
  }
  
  export const PATIENTS: Patient[] = [
    {
      id:                 '4492-X',
      gender:             'M',
      diagnosis:          'Hypoplastic Left Heart Syndrome (Sano Shunt)',
      diagnosisShort:     'HLHS (Sano)',
      shuntType:          'Sano',
      riskScore:          0.82,
      modelConfidence:    0.94,
      birthWeightKg:      1.25,
      gestAgeWeeks:       28,
      ageAtSurgeryDays:   12,
      ageAtSurgeryMonths: 0.4,
      surgWeightKg:       1.3,
      shuntSizeMm:        3.5,
      shuntToWeight:      3.18,
      cpbMinutes:         148,
      xclampMinutes:      68,
      tapvrClass:         0,
      premature:          true,
      syndrome:           false,
      compChylo:          true,
      compLCOS:           false,
      compArrest:         false,
      compSepsis:         false,
      openSternum:        true,
      nitricOxide:        true,
      ncaaLungs:          false,
      vitals:             { hr: 142, spo2: 84, mbp: 42, pp: 33 },
      vitalHistory: [
        { time: '4h ago', hr: 135, spo2: 91, mbp: 52 },
        { time: '3h ago', hr: 137, spo2: 90, mbp: 49 },
        { time: '2h ago', hr: 139, spo2: 88, mbp: 46 },
        { time: '1h ago', hr: 141, spo2: 86, mbp: 44 },
        { time: 'Now',    hr: 142, spo2: 84, mbp: 42 },
      ],
      shapFeatures: [
        { name: 'MBP trend',        value:  0.88, displayVal: '−2.1 mmHg/hr', direction: 'risk' },
        { name: 'Shunt-to-weight',  value:  0.72, displayVal: '3.18 mm/kg',   direction: 'risk' },
        { name: 'Birth weight',     value:  0.45, displayVal: '1.25 kg',       direction: 'risk' },
        { name: 'CPB time',         value:  0.38, displayVal: '148 min',       direction: 'risk' },
        { name: 'Gest. age',        value: -0.12, displayVal: '28 wk',         direction: 'protective' },
        { name: 'Chylothorax',      value:  0.31, displayVal: 'Yes (before SH)', direction: 'risk' },
        { name: 'Age at surgery',   value:  0.28, displayVal: '12 days',       direction: 'risk' },
        { name: 'Shunt size class', value:  0.24, displayVal: '≤3.5 mm',       direction: 'risk' },
        { name: 'Nitric oxide',     value: -0.18, displayVal: 'Active',         direction: 'protective' },
        { name: 'Open sternum',     value:  0.15, displayVal: 'Resolved day 3', direction: 'risk' },
      ],
      clinicalSummary:  'Patient #4492-X is at extremely high risk for acute shunt occlusion. Over the last 4 hours, Mean Blood Pressure has drifted from 52 to 42 mmHg, while heart rate has climbed from 135 to 142 bpm. This combination of rising tachycardia and falling perfusion pressure is highly concerning for acute hemodynamic compromise.',
      criticalInsight:  'The Shunt-to-Weight ratio (3.18) exceeds the high-risk threshold of 3.0.',
      recommendation:   'Increase heparin titration and schedule urgent surgical review.',
    },
    {
      id:                 '9901-L',
      gender:             'F',
      diagnosis:          'Hypoplastic Left Heart Syndrome (Sano Shunt)',
      diagnosisShort:     'HLHS (Sano)',
      shuntType:          'Sano',
      riskScore:          0.65,
      modelConfidence:    0.89,
      birthWeightKg:      2.1,
      gestAgeWeeks:       35,
      ageAtSurgeryDays:   20,
      ageAtSurgeryMonths: 0.67,
      surgWeightKg:       2.2,
      shuntSizeMm:        3.5,
      shuntToWeight:      1.91,
      cpbMinutes:         112,
      xclampMinutes:      54,
      tapvrClass:         2,
      premature:          true,
      syndrome:           false,
      compChylo:          false,
      compLCOS:           true,
      compArrest:         false,
      compSepsis:         false,
      openSternum:        false,
      nitricOxide:        true,
      ncaaLungs:          true,
      vitals:             { hr: 134, spo2: 89, mbp: 48, pp: 28 },
      vitalHistory: [
        { time: '4h ago', hr: 130, spo2: 91, mbp: 50 },
        { time: '3h ago', hr: 131, spo2: 90, mbp: 49 },
        { time: '2h ago', hr: 133, spo2: 90, mbp: 49 },
        { time: '1h ago', hr: 133, spo2: 89, mbp: 48 },
        { time: 'Now',    hr: 134, spo2: 89, mbp: 48 },
      ],
      shapFeatures: [
        { name: 'LCOS',             value:  0.62, displayVal: 'Yes (before SH)', direction: 'risk' },
        { name: 'Shunt-to-weight',  value:  0.44, displayVal: '1.91 mm/kg',   direction: 'risk' },
        { name: 'CPB time',         value:  0.38, displayVal: '112 min',       direction: 'risk' },
        { name: 'TAPVR repair',     value: -0.41, displayVal: 'Concurrent',    direction: 'protective' },
        { name: 'Birth weight',     value:  0.22, displayVal: '2.1 kg',        direction: 'risk' },
        { name: 'NCAA lungs',       value: -0.19, displayVal: 'Yes',           direction: 'protective' },
        { name: 'Nitric oxide',     value: -0.17, displayVal: 'Active',        direction: 'protective' },
        { name: 'Age at surgery',   value:  0.15, displayVal: '20 days',       direction: 'risk' },
        { name: 'Gest. age',        value: -0.10, displayVal: '35 wk',         direction: 'protective' },
        { name: 'MBP trend',        value:  0.08, displayVal: '−0.5 mmHg/hr', direction: 'risk' },
      ],
      clinicalSummary:  'Patient #9901-L shows moderate-elevated risk. Prior LCOS episode is the primary driver. Vitals have been stable over the past 4 hours with no acute deterioration, though SpO₂ remains below target.',
      criticalInsight:  'LCOS occurred before SH window. Concurrent TAPVR repair is a significant protective factor reducing risk by ~41%.',
      recommendation:   'Continue current monitoring cadence. Repeat echo in 12 hours. No immediate surgical escalation indicated.',
    },
    {
      id:                 '3319-M',
      gender:             'M',
      diagnosis:          'Pulmonary Atresia (BT Shunt)',
      diagnosisShort:     'Pulm. Atresia (BT)',
      shuntType:          'BT',
      riskScore:          0.42,
      modelConfidence:    0.88,
      birthWeightKg:      3.1,
      gestAgeWeeks:       38,
      ageAtSurgeryDays:   38,
      ageAtSurgeryMonths: 1.27,
      surgWeightKg:       3.2,
      shuntSizeMm:        4.0,
      shuntToWeight:      1.25,
      cpbMinutes:         88,
      xclampMinutes:      40,
      tapvrClass:         0,
      premature:          false,
      syndrome:           false,
      compChylo:          false,
      compLCOS:           false,
      compArrest:         false,
      compSepsis:         false,
      openSternum:        false,
      nitricOxide:        false,
      ncaaLungs:          false,
      vitals:             { hr: 122, spo2: 93, mbp: 55, pp: 30 },
      vitalHistory: [
        { time: '4h ago', hr: 120, spo2: 93, mbp: 56 },
        { time: '3h ago', hr: 121, spo2: 93, mbp: 55 },
        { time: '2h ago', hr: 121, spo2: 94, mbp: 55 },
        { time: '1h ago', hr: 122, spo2: 93, mbp: 55 },
        { time: 'Now',    hr: 122, spo2: 93, mbp: 55 },
      ],
      shapFeatures: [
        { name: 'Shunt-to-weight',  value:  0.35, displayVal: '1.25 mm/kg',   direction: 'risk' },
        { name: 'Age at surgery',   value: -0.22, displayVal: '38 days',       direction: 'protective' },
        { name: 'CPB time',         value:  0.18, displayVal: '88 min',        direction: 'risk' },
        { name: 'Birth weight',     value: -0.16, displayVal: '3.1 kg',        direction: 'protective' },
        { name: 'MBP trend',        value: -0.10, displayVal: 'Stable',        direction: 'protective' },
        { name: 'Gest. age',        value: -0.09, displayVal: '38 wk',         direction: 'protective' },
        { name: 'Shunt size class', value: -0.08, displayVal: '>3.5 mm',       direction: 'protective' },
        { name: 'Nitric oxide',     value:  0.06, displayVal: 'Not used',      direction: 'risk' },
        { name: 'Premature',        value: -0.05, displayVal: 'No',            direction: 'protective' },
        { name: 'Syndrome',         value:  0.04, displayVal: 'No',            direction: 'risk' },
      ],
      clinicalSummary:  'Patient #3319-M is at moderate risk. Vitals are stable and within acceptable range. Birth weight and gestational age are within normal range, providing protective buffering against anatomical risk factors.',
      criticalInsight:  'Shunt-to-weight ratio (1.25) is below the 3.0 threshold. No acute complications recorded.',
      recommendation:   'Routine monitoring. Next scheduled review in 24 hours.',
    },
    {
      id:                 '8812-F',
      gender:             'F',
      diagnosis:          'Tricuspid Atresia',
      diagnosisShort:     'Tricuspid Atresia',
      shuntType:          'BT',
      riskScore:          0.14,
      modelConfidence:    0.91,
      birthWeightKg:      3.5,
      gestAgeWeeks:       39,
      ageAtSurgeryDays:   55,
      ageAtSurgeryMonths: 1.83,
      surgWeightKg:       3.7,
      shuntSizeMm:        4.0,
      shuntToWeight:      1.08,
      cpbMinutes:         72,
      xclampMinutes:      32,
      tapvrClass:         0,
      premature:          false,
      syndrome:           false,
      compChylo:          false,
      compLCOS:           false,
      compArrest:         false,
      compSepsis:         false,
      openSternum:        false,
      nitricOxide:        false,
      ncaaLungs:          false,
      vitals:             { hr: 118, spo2: 95, mbp: 58, pp: 28 },
      vitalHistory: [
        { time: '4h ago', hr: 117, spo2: 95, mbp: 58 },
        { time: '3h ago', hr: 118, spo2: 95, mbp: 58 },
        { time: '2h ago', hr: 117, spo2: 96, mbp: 59 },
        { time: '1h ago', hr: 118, spo2: 95, mbp: 58 },
        { time: 'Now',    hr: 118, spo2: 95, mbp: 58 },
      ],
      shapFeatures: [
        { name: 'Age at surgery',   value: -0.38, displayVal: '55 days',       direction: 'protective' },
        { name: 'Birth weight',     value: -0.28, displayVal: '3.5 kg',        direction: 'protective' },
        { name: 'Shunt-to-weight',  value: -0.22, displayVal: '1.08 mm/kg',   direction: 'protective' },
        { name: 'Gest. age',        value: -0.18, displayVal: '39 wk',         direction: 'protective' },
        { name: 'CPB time',         value:  0.14, displayVal: '72 min',        direction: 'risk' },
        { name: 'MBP trend',        value: -0.12, displayVal: 'Stable',        direction: 'protective' },
        { name: 'Shunt size class', value: -0.10, displayVal: '>3.5 mm',       direction: 'protective' },
        { name: 'Premature',        value: -0.08, displayVal: 'No',            direction: 'protective' },
        { name: 'Nitric oxide',     value:  0.05, displayVal: 'Not used',      direction: 'risk' },
        { name: 'Syndrome',         value:  0.03, displayVal: 'No',            direction: 'risk' },
      ],
      clinicalSummary:  'Patient #8812-F presents with low risk profile. All vitals within target range. Age at surgery and birth weight are significant protective factors.',
      criticalInsight:  'No risk factors exceed threshold. Model confidence is high (0.91).',
      recommendation:   'Standard interstage monitoring protocol. Discharge planning may begin.',
    },
    {
      id:                 '1204-S',
      gender:             'M',
      diagnosis:          'Tetralogy of Fallot with Pulmonary Atresia',
      diagnosisShort:     'TOF with PA',
      shuntType:          'BT',
      riskScore:          0.32,
      modelConfidence:    0.86,
      birthWeightKg:      2.8,
      gestAgeWeeks:       37,
      ageAtSurgeryDays:   30,
      ageAtSurgeryMonths: 1.0,
      surgWeightKg:       2.9,
      shuntSizeMm:        3.5,
      shuntToWeight:      1.21,
      cpbMinutes:         95,
      xclampMinutes:      45,
      tapvrClass:         0,
      premature:          false,
      syndrome:           false,
      compChylo:          false,
      compLCOS:           false,
      compArrest:         false,
      compSepsis:         false,
      openSternum:        false,
      nitricOxide:        false,
      ncaaLungs:          false,
      vitals:             { hr: 126, spo2: 91, mbp: 52, pp: 29 },
      vitalHistory: [
        { time: '4h ago', hr: 124, spo2: 92, mbp: 53 },
        { time: '3h ago', hr: 125, spo2: 91, mbp: 52 },
        { time: '2h ago', hr: 125, spo2: 91, mbp: 52 },
        { time: '1h ago', hr: 126, spo2: 91, mbp: 52 },
        { time: 'Now',    hr: 126, spo2: 91, mbp: 52 },
      ],
      shapFeatures: [
        { name: 'CPB time',         value:  0.28, displayVal: '95 min',        direction: 'risk' },
        { name: 'Shunt-to-weight',  value:  0.22, displayVal: '1.21 mm/kg',   direction: 'risk' },
        { name: 'Age at surgery',   value: -0.18, displayVal: '30 days',       direction: 'protective' },
        { name: 'Birth weight',     value: -0.15, displayVal: '2.8 kg',        direction: 'protective' },
        { name: 'Gest. age',        value: -0.10, displayVal: '37 wk',         direction: 'protective' },
        { name: 'Shunt size class', value:  0.09, displayVal: '≤3.5 mm',       direction: 'risk' },
        { name: 'MBP trend',        value:  0.07, displayVal: 'Stable',        direction: 'risk' },
        { name: 'Premature',        value: -0.06, displayVal: 'No',            direction: 'protective' },
        { name: 'Nitric oxide',     value:  0.04, displayVal: 'Not used',      direction: 'risk' },
        { name: 'NCAA lungs',       value:  0.03, displayVal: 'No',            direction: 'risk' },
      ],
      clinicalSummary:  'Patient #1204-S is at low-moderate risk. No acute complications. SpO₂ is slightly below the 92% target but has been stable.',
      criticalInsight:  'CPB time (95 min) is the primary risk driver. All other factors within expected range.',
      recommendation:   'SpO₂ monitoring every 2 hours. Consider supplemental O₂ titration.',
    },
  ]