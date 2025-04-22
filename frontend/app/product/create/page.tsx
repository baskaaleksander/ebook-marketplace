import CreateProductForm from '@/components/create-product-form'
import { ImageProvider } from '@/providers/image-provider'
import React from 'react'

function CreateProduct() {
  return (
    <ImageProvider>
        <div className='container mx-auto px-4 py-8 min-h-screen flex flex-col'>
            <h1 className='text-3xl font-bold mb-6'>Create your product</h1>
            <CreateProductForm />
        </div>
    </ImageProvider>
  )
}

export default CreateProduct