import React from 'react'
import { useNavigate } from 'react-router-dom'

const OrderPlaced = () => {
  const navigate = useNavigate()
  return (
    <div>
      <button className='bg-red-400' onClick={() =>navigate("/my-order")}>back to my Order</button>
    </div>
  )
}

export default OrderPlaced
