'use client'

import { CheckCircle, Circle, Clock, Plus, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Order {
  _id?: string
  description: string
  completed: boolean
  completedBy?: string
  completedAt?: Date
  createdAt?: Date
}

interface OrdersChecklistProps {
  appointmentId: string
  orders: Order[]
  nurseName: string
  onUpdate: () => void
}

export default function OrdersChecklist({ appointmentId, orders = [], nurseName, onUpdate }: OrdersChecklistProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newOrder, setNewOrder] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddOrder = async () => {
    if (!newOrder.trim()) {
      toast.error('Please enter an order description')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/nurse/${appointmentId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newOrder })
      })

      if (!res.ok) throw new Error()

      toast.success('Order added successfully')
      setNewOrder('')
      setIsAdding(false)
      onUpdate()
    } catch {
      toast.error('Failed to add order')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOrder = async (orderId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/nurse/${appointmentId}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          completed: !completed,
          completedBy: !completed ? nurseName : undefined
        })
      })

      if (!res.ok) throw new Error()

      toast.success(completed ? 'Order marked incomplete' : 'Order completed')
      onUpdate()
    } catch {
      toast.error('Failed to update order')
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Orders & Tasks
        </h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isAdding ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Plus className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Add New Order */}
      {isAdding && (
        <div className="mb-4 p-4 bg-white/10 border border-white/20 rounded-lg">
          <textarea
            value={newOrder}
            onChange={(e) => setNewOrder(e.target.value)}
            placeholder="Enter order description (e.g., 'Administer Vaccine', 'Draw Blood Sample')"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            rows={2}
          />
          <button
            onClick={handleAddOrder}
            disabled={loading}
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Order'}
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No orders assigned yet. Click + to add one.
          </p>
        ) : (
          orders.map((order, index) => (
            <div
              key={order._id || index}
              className={`p-4 rounded-lg border transition-all ${
                order.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleOrder(order._id!, order.completed)}
                  className="flex-shrink-0 mt-1"
                >
                  {order.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400 hover:text-blue-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    order.completed ? 'text-green-300 line-through' : 'text-white'
                  }`}>
                    {order.description}
                  </p>

                  {order.completed && order.completedBy && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        Completed by {order.completedBy} at{' '}
                        {order.completedAt
                          ? new Date(order.completedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
