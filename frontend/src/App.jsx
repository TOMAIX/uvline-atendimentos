// App.jsx
import { useState } from 'react'
import StoreSelector from './components/StoreSelector'
import AudioRecorder from './components/AudioRecorder'

function App() {
 const [selectedStore, setSelectedStore] = useState('')

 const handleStoreSelect = (storeId) => {
   setSelectedStore(storeId)
 }

 return (
   <div className="min-h-screen bg-gray-100 py-6">
     <h1 className="text-2xl font-bold text-center mb-6">
       S.CARLET
     </h1>

     {!selectedStore ? (
       <StoreSelector onStoreSelect={handleStoreSelect} />
     ) : (
       <div className="max-w-md mx-auto">
         <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
           <p className="text-center text-gray-600">
             Loja atual: <span className="font-semibold">{selectedStore}</span>
           </p>
         </div>
         <AudioRecorder selectedStore={selectedStore} />
       </div>
     )}
   </div>
 )
}

export default App