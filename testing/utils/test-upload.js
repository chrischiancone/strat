#!/usr/bin/env node

// Test the branding upload API with a simple base64 image

const testUpload = async () => {
  try {
    // A simple 1x1 PNG image in base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    
    const response = await fetch('http://localhost:3000/api/branding/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        municipalityId: '00000000-0000-0000-0000-000000000001',
        fileName: 'test-logo.png',
        fileType: 'image/png',
        contentBase64: testImageBase64,
      }),
    })

    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (response.ok) {
      console.log('✅ Upload API is working!')
      console.log('📸 Image URL:', data.url)
    } else {
      console.log('❌ Upload failed:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testUpload()