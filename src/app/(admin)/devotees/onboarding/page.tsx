'use client'
import { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Card } from '../../../../components/ui/card'
import { Textarea } from '../../../../components/ui/textarea'
import { Table, Tbody, Tr, Td, Thead, Th } from '../../../../components/ui/table'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type Devotee = {
  id?: string
  name: string
  email?: string
  phone?: string
  duplicate?: boolean
  matchScore?: number
}

function fuzzyMatch(a: Devotee, b: Devotee): number {
  // Simple fuzzy logic: +0.5 for same email, +0.3 for similar name, +0.2 for similar phone
  let score = 0
  if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) score += 0.5
  if (a.name && b.name && a.name.toLowerCase() === b.name.toLowerCase()) score += 0.3
  if (a.phone && b.phone && a.phone.replace(/\D/g, '') === b.phone.replace(/\D/g, '')) score += 0.2
  return score
}

export default function DevoteeOnboardingPage() {
  const [bulkText, setBulkText] = useState('')
  const [manual, setManual] = useState<Devotee>({ name: '', email: '', phone: '' })
  const [pending, setPending] = useState<Devotee[]>([])
  const [duplicates, setDuplicates] = useState<Devotee[]>([])
  const [reviewed, setReviewed] = useState<Devotee[]>([])
  const supabase = useSupabaseClient()

  async function handleBulkParse() {
    // Parse CSV: name,email,phone
    const lines = bulkText.trim().split('\n')
    const rows: Devotee[] = []
    for (const line of lines) {
      const [name, email, phone] = line.split(',').map(s => s.trim())
      if (name) rows.push({ name, email, phone })
    }
    // Fetch existing devotees from Supabase
    const { data: existing } = await supabase.from('devotees').select('*')
    // Fuzzy match
    const withDuplicates = rows.map(row => {
      const match = existing?.find((d: Devotee) => fuzzyMatch(row, d) > 0.6)
      if (match) {
        return { ...row, duplicate: true, matchScore: fuzzyMatch(row, match) }
      }
      return row
    })
    setPending(withDuplicates)
    setDuplicates(withDuplicates.filter(d => d.duplicate))
  }

  async function handleManualAdd() {
    if (!manual.name) return
    // Fetch existing devotees from Supabase
    const { data: existing } = await supabase.from('devotees').select('*')
    const isDuplicate = existing?.some((d: Devotee) => fuzzyMatch(manual, d) > 0.6)
    if (isDuplicate) {
      setDuplicates([...duplicates, { ...manual, duplicate: true }])
    } else {
      setPending([...pending, manual])
    }
    setManual({ name: '', email: '', phone: '' })
  }

  async function handleApprove(devotee: Devotee) {
    // Insert to Supabase
    await supabase.from('devotees').insert([{
      name: devotee.name,
      email: devotee.email,
      phone: devotee.phone,
    }])
    setReviewed([...reviewed, devotee])
    setPending(pending.filter(d => d !== devotee))
    setDuplicates(duplicates.filter(d => d !== devotee))
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#043933]">Devotee Onboarding</h1>
      <Card className="p-6">
        <h2 className="font-semibold mb-3 text-[#043933]">Bulk Entry</h2>
        <Textarea
          rows={6}
          placeholder="Paste CSV: name,email,phone"
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
        />
        <Button className="mt-2" onClick={handleBulkParse}>Parse & Detect Duplicates</Button>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold mb-3 text-[#043933]">Manual Entry</h2>
        <form
          onSubmit={e => {
            e.preventDefault()
            handleManualAdd()
          }}
          className="flex gap-2 flex-wrap items-end"
        >
          <Input
            placeholder="Name"
            value={manual.name}
            onChange={e => setManual({ ...manual, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={manual.email}
            onChange={e => setManual({ ...manual, email: e.target.value })}
          />
          <Input
            placeholder="Phone"
            type="tel"
            value={manual.phone}
            onChange={e => setManual({ ...manual, phone: e.target.value })}
          />
          <Button type="submit">Add</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold mb-3 text-[#043933]">Review Pending</h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Duplicate?</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pending.map((d, idx) => (
              <Tr key={idx} className={d.duplicate ? 'bg-yellow-50' : ''}>
                <Td>{d.name}</Td>
                <Td>{d.email}</Td>
                <Td>{d.phone}</Td>
                <Td>
                  {d.duplicate ? (
                    <span className="text-yellow-600 font-medium">Possible Duplicate ({d.matchScore})</span>
                  ) : (
                    <span className="text-green-600 font-medium">No</span>
                  )}
                </Td>
                <Td>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApprove(d)}
                  >
                    Approve
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold mb-3 text-[#043933]">Duplicates Detected</h2>
        {duplicates.length === 0 ? (
          <p className="text-sm text-gray-500">No duplicates detected.</p>
        ) : (
          <ul className="space-y-2">
            {duplicates.map((d, idx) => (
              <li key={idx} className="p-2 bg-yellow-50 rounded shadow-sm">
                <div>
                  <span className="font-semibold">{d.name}</span> — {d.email || 'N/A'} — {d.phone || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Possible duplicate. <Button size="sm" onClick={() => handleApprove(d)}>Override & Add</Button></div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold mb-3 text-[#043933]">Onboarded</h2>
        <ul className="list-disc pl-6 space-y-1">
          {reviewed.map((d, idx) => (
            <li key={idx}>{d.name} ({d.email || 'N/A'})</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
