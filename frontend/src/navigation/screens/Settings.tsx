import React, { useState } from "react"
import { View, Text, ScrollView, Pressable, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from '@react-native-async-storage/async-storage'

export function Settings() {
  const navigation = useNavigation()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Pega o token armazenado
      const token = await AsyncStorage.getItem('authToken')

      if (token) {
        // Chama a API de logout
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }

      // Remove os dados do AsyncStorage
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'userStreak'
      ])

      // Navega para a tela de login
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })

    } catch (error) {
      console.error('Erro ao fazer logout:', error)

      // Mesmo com erro, limpa os dados locais e desloga
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'userStreak'
      ])

      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <View className="flex-1 bg-blue-50">
      <ScrollView className="flex-1 p-6">
        {/* Aparência */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-4 text-gray-900">Aparência</Text>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-gray-700 text-base">Tamanho da fonte</Text>
            <View className="bg-blue-100 rounded-lg px-4 py-2">
              <Text className="text-blue-600 font-medium">Normal</Text>
            </View>
          </View>
        </View>

        {/* Notificações */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-4 text-gray-900">Notificações</Text>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <Text className="text-gray-700 text-base">Som</Text>
            <Pressable
              onPress={() => setSoundEnabled(!soundEnabled)}
              className={`w-14 h-7 rounded-full p-1 ${soundEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
              style={{ justifyContent: 'center', alignItems: soundEnabled ? 'flex-end' : 'flex-start' }}
            >
              <View className="w-5 h-5 bg-white rounded-full shadow" />
            </Pressable>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-gray-700 text-base">Leitura por voz</Text>
            <Pressable
              onPress={() => setVoiceEnabled(!voiceEnabled)}
              className={`w-14 h-7 rounded-full p-1 ${voiceEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
              style={{ justifyContent: 'center', alignItems: voiceEnabled ? 'flex-end' : 'flex-start' }}
            >
              <View className="w-5 h-5 bg-white rounded-full shadow" />
            </Pressable>
          </View>
        </View>

        {/* Sobre */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-4 text-gray-900">Sobre</Text>

          <View className="py-3 border-b border-gray-100">
            <Text className="text-gray-700 text-base mb-1">Versão do aplicativo</Text>
            <Text className="text-gray-500 text-sm">1.0.0</Text>
          </View>

          <Pressable className="py-3 border-b border-gray-100">
            <Text className="text-gray-700 text-base">Termos de uso</Text>
          </Pressable>

          <Pressable className="py-3">
            <Text className="text-gray-700 text-base">Política de privacidade</Text>
          </Pressable>
        </View>

        {/* Conta */}
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-lg font-bold mb-4 text-gray-900">Conta</Text>

          <Pressable
            className="py-3"
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Text className="text-red-600 text-base font-medium">
              {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

export default Settings