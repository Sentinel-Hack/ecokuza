import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash, Edit, Plus, RefreshCw } from 'lucide-react'
import { apiCall, ENDPOINTS } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await apiCall(ENDPOINTS.STUDENTS, { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        // Convert API response to local format
        const studentList = (data.students || []).map(s => ({
          id: s.id,
          name: s.first_name,
          email: s.email,
          joined_at: s.date_joined,
        }))
        setStudents(studentList)
      } else {
        toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => setForm({ id: null, name: '', email: '', password: '' })

  const handleAddOrUpdate = async (e) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    const trimmedEmail = form.email.trim()

    if (editingId) {
      // UPDATE
      if (!trimmedName || !trimmedEmail) {
        toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' })
        return
      }

      try {
        const res = await apiCall(`${ENDPOINTS.STUDENTS}${editingId}/`, {
          method: 'PUT',
          body: JSON.stringify({ first_name: trimmedName, email: trimmedEmail }),
        })
        if (res.ok) {
          const updated = await res.json()
          setStudents((prev) =>
            prev.map((s) =>
              s.id === editingId ? { ...s, name: updated.first_name, email: updated.email } : s
            )
          )
          setEditingId(null)
          resetForm()
          toast({ title: 'Success', description: 'Student updated successfully' })
        } else {
          const err = await res.json()
          toast({ title: 'Error', description: err.error || 'Failed to update student', variant: 'destructive' })
        }
      } catch (err) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    } else {
      // CREATE
      if (!trimmedName || !trimmedEmail || !form.password.trim()) {
        toast({ title: 'Error', description: 'Name, email, and password are required', variant: 'destructive' })
        return
      }

      try {
        const res = await apiCall(ENDPOINTS.STUDENTS, {
          method: 'POST',
          body: JSON.stringify({ first_name: trimmedName, email: trimmedEmail, password: form.password }),
        })
        if (res.ok) {
          const newStudent = await res.json()
          setStudents((prev) => [
            { id: newStudent.id, name: newStudent.first_name, email: newStudent.email, joined_at: new Date().toISOString() },
            ...prev,
          ])
          resetForm()
          toast({ title: 'Success', description: 'Student added successfully' })
        } else {
          const err = await res.json()
          toast({ title: 'Error', description: err.error || 'Failed to add student', variant: 'destructive' })
        }
      } catch (err) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    }
  }

  const handleEdit = (student) => {
    setForm({ id: student.id, name: student.name, email: student.email, password: '' })
    setEditingId(student.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student ${name}? This cannot be undone.`)) return

    try {
      const res = await apiCall(`${ENDPOINTS.STUDENTS}${id}/`, { method: 'DELETE' })
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id))
        toast({ title: 'Success', description: `Student ${name} deleted` })
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to delete student', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile — Manage Students</h1>
            <p className="text-sm text-muted-foreground">Add, edit or remove students in your 4K Club</p>
          </div>
          <Button
            onClick={fetchStudents}
            variant="outline"
            size="icon"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Student' : 'Add Student'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Student name" />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="student@example.org" type="email" />
              </div>
              {!editingId && (
                <div className="sm:col-span-1">
                  <label className="text-sm text-muted-foreground">Password</label>
                  <Input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" />
                </div>
              )}
              <div className="sm:col-span-1 flex gap-2">
                <Button type="submit" className="flex items-center gap-2" variant="default">
                  <Plus className="w-4 h-4" /> {editingId ? 'Update' : 'Add'}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={() => { resetForm(); setEditingId(null) }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground mt-2">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No students yet. Add a student using the form above.</div>
            ) : (
              <div className="space-y-3">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                      <p className="text-xs text-muted-foreground">Joined: {new Date(s.joined_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} aria-label={`Edit ${s.name}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)} aria-label={`Delete ${s.name}`}>
                        <Trash className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
