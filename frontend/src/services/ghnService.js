// GHN (Giao Hàng Nhanh) Location Service
// API for fetching Vietnamese provinces and districts

const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data'
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN || '1d6b0323-aadb-11f1-9911-ba4ae12eb1e2'
const GHN_SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID || '5513563'

console.log('GHN Service initialized:', {
  token: GHN_API_TOKEN ? '***' : 'NOT SET',
  shopId: GHN_SHOP_ID
})

const ghnService = {
  // Fetch all provinces (cities)
  getProvinces: async () => {
    try {
      const response = await fetch(`${GHN_API_URL}/province`, {
        method: 'GET',
        headers: {
          'Token': GHN_API_TOKEN,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        return {
          success: true,
          data: data.data.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName, 'vi'))
        }
      } else {
        throw new Error(data.message || 'Failed to fetch provinces')
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // Fetch districts by province
  getDistricts: async (provinceId) => {
    try {
      const response = await fetch(`${GHN_API_URL}/district`, {
        method: 'POST',
        headers: {
          'Token': GHN_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          province_id: parseInt(provinceId)
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        return {
          success: true,
          data: data.data.sort((a, b) => a.DistrictName.localeCompare(b.DistrictName, 'vi'))
        }
      } else {
        throw new Error(data.message || 'Failed to fetch districts')
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // Fetch wards by district
  getWards: async (districtId) => {
    try {
      const response = await fetch(`${GHN_API_URL}/ward`, {
        method: 'POST',
        headers: {
          'Token': GHN_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          district_id: parseInt(districtId)
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        return {
          success: true,
          data: data.data.sort((a, b) => a.WardName.localeCompare(b.WardName, 'vi'))
        }
      } else {
        throw new Error(data.message || 'Failed to fetch wards')
      }
    } catch (error) {
      console.error('Error fetching wards:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }
}

export default ghnService
