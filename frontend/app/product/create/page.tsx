import CreateProductForm from '@/components/create-product-form'
import ImageResizer from '@/components/image-resizer'
import { ImageProvider } from '@/providers/image-provider'
import React from 'react'

function CreateProduct() {
  return (
    <ImageProvider>
        <div className='container mx-auto px-4 py-8 min-h-screen flex flex-col'>
            <h1 className='text-3xl font-bold mb-6'>Create your product</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 mt-8 gap-8'>
                <ImageResizer />
                <CreateProductForm />
            </div>
        </div>
    </ImageProvider>
  )
}

export default CreateProduct