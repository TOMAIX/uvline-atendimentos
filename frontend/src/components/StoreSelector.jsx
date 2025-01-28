import { useState } from 'react'
import { stores } from '../data/stores'

function StoreSelector({ onStoreSelect }) {
  const [selectedStore, setSelectedStore] = useState('')

  const handleStoreChange = (e) => {
    const storeId = e.target.value
    setSelectedStore(storeId)
    onStoreSelect(storeId)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Selecione sua loja</h2>
      <select
        value={selectedStore}
        onChange={handleStoreChange}
        className="w-full p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecione...</option>
        {stores.map(store => (
          <option key={store.id} value={store.id}>
            {store.name} - {store.location}
          </option>
        ))}
      </select>
    </div>
  )
}

export default StoreSelector