'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import  supabase  from '../lib/config/supabaseclient'
import { todoSchema } from '../lib/validation'
import { motion } from 'framer-motion'
import { FiX, FiFlag, FiCircle, FiClock, FiCheckCircle } from 'react-icons/fi'
import { z } from 'zod'

// Define the form data type based on the schema
type FormData = z.infer<typeof todoSchema>

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TodoFormProps {
  onSuccess: () => void
  editingTodo?: any
}

export default function TodoForm({ onSuccess, editingTodo }: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
  register,
  handleSubmit,
  reset,
  setValue,
  watch,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(todoSchema),
  defaultValues: editingTodo ? {
    title: editingTodo.title,
    description: editingTodo.description || '',
    priority: editingTodo.priority,
    status: editingTodo.status,
  } : {
    title: '',
    description: '',
    priority: 'medium', // Still set a default
    status: 'pending',  // Still set a default
  },
})

  const currentPriority = watch('priority')
  const currentStatus = watch('status')

  // Use SubmitHandler to properly type the onSubmit function
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('You must be logged in to create a todo')
      }

      if (editingTodo) {
        // Update existing todo
        const { error } = await supabase
          .from('todos')
          .update({
            title: data.title,
            description: data.description || null,
            priority: data.priority,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTodo.id)

        if (error) throw error
      } else {
        // Create new todo
        const { error } = await supabase
          .from('todos')
          .insert([
            {
              title: data.title,
              description: data.description || null,
              priority: data.priority,
              status: data.status,
              user_id: userData.user.id,
            },
          ])

        if (error) throw error
      }
      reset()
      onSuccess()
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'high', label: 'High', color: 'text-red-500' },
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: FiCircle },
    { value: 'in-progress', label: 'In Progress', icon: FiClock },
    { value: 'completed', label: 'Completed', icon: FiCheckCircle },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-black backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold  dark:text-white text-gray-800">
          {editingTodo ? 'Edit Task' : 'Add New Task'}
        </h2>
        <button
          onClick={onSuccess}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm dark:text-white font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-4 py-2 border text-black/70 dark:text-white border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What needs to be done?"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm  dark:text-white font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border text-black/70 dark:text-white border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add details (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('priority', option.value as any)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPriority === option.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiFlag className={option.color} />
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('priority')} />
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium  dark:text-white text-gray-700 mb-1">
              Status
            </label>
            <div className="flex gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('status', option.value as any)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentStatus === option.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={14} />
                    {option.label}
                  </button>
                )
              })}
            </div>
            <input type="hidden" {...register('status')} />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Saving...' : editingTodo ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
