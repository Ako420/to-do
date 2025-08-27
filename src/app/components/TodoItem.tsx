'use client'

import { useState } from 'react'
import  supabase  from '../lib/config/supabaseclient'
import { motion } from 'framer-motion'
import { FiCheck, FiTrash2, FiEdit, FiCircle } from 'react-icons/fi'

interface Todo {
  id: string
  title: string
  description: string | null
  is_complete: boolean
  inserted_at: string
}

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [isComplete, setIsComplete] = useState(todo.is_complete)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !isComplete })
        .eq('id', todo.id)

      if (error) throw error
      setIsComplete(!isComplete)
    } catch (error) {
      console.error('Error updating todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todo.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('todos')
        .update({ title, description: description || null })
        .eq('id', todo.id)

      if (error) throw error
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow border border-white/20"
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isLoading || !title.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`mt-1 p-1 rounded-full ${isComplete ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {isComplete ? <FiCheck size={20} /> : <FiCircle size={20} />}
          </button>
          
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${isComplete ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 mt-1">{todo.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}