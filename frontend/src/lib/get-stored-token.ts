import AsyncStorage from "@react-native-async-storage/async-storage"

 export const getStoredToken = async () => {
    try {
      const keysToTry = ['token', 'authToken', 'accessToken']
      for (const key of keysToTry) {
        const t = await AsyncStorage.getItem(key)
        if (t) return t
      }
      return null
    } catch (e) {
      return null
    }
  }