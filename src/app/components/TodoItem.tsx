// app/components/TodoItem.tsx
'use client'

import { useState } from 'react'
import  supabase  from '../lib/config/supabaseclient'
import { motion } from 'framer-motion'
import { FiCheck, FiTrash2, FiEdit, FiCircle, FiFlag, FiClock, FiCheckCircle } from 'react-icons/fi'
import DeleteConfirmation from './DeleteConfirmation'

interface Todo {
  id: string
  title: string
  description: string | null
  is_complete: boolean
  inserted_at: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
}

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
      
      const { error } = await supabase
        .from('todos')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', todo.id)

      if (error) throw error
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
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      console.error('Error deleting todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (todo.status) {
      case 'pending': return <FiCircle className="text-gray-400" />
      case 'in-progress': return <FiClock className="text-blue-500" />
      case 'completed': return <FiCheckCircle className="text-green-500" />
      default: return <FiCircle className="text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (todo.status) {
      case 'pending': return 'Pending'
      case 'in-progress': return 'In Progress'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow border border-white/20"
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`mt-1 p-2 rounded-full transition-colors ${
              todo.status === 'completed' 
                ? 'bg-green-100 text-green-500' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {todo.status === 'completed' ? <FiCheck size={18} /> : <FiCircle size={18} />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FiFlag className={`${getPriorityColor()} text-sm`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor()} bg-opacity-20`}>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>
            
            <h3 className={`text-lg font-medium ${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {todo.title}
            </h3>
            
            {todo.description && (
              <p className="text-gray-600 mt-2">{todo.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span>
                {new Date(todo.inserted_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(todo)}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmation
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={todo.title}
      />
    </>
  )
}