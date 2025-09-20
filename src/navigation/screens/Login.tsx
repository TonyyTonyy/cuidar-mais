import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, Alert, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '..'
import logo from "@/assets/LogoCuidar.png";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [showManualLogin, setShowManualLogin] = useState(false)
  const [error, setError] = useState('')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsLoading(false)
        setShowManualLogin(true)
      } catch (err) {
        setError('Não foi possível conectar automaticamente')
        setIsLoading(false)
        setShowManualLogin(true)
      }
    }

    attemptAutoLogin()
  }, [])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (navigation && typeof navigation.navigate === 'function') {
        navigation.replace("Dashboard")
      } else {
        Alert.alert('Sucesso', 'Login simulado com sucesso — redirecionando para dashboard')
      }
    } catch (err) {
      setError('Não foi possível conectar ao Google — tente novamente')
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md">
        <View className="items-center mb-6 relative">
          <Image
            source={logo}
            style={{ height: 150 }}
            resizeMode="contain"
          />
          <Text className="text-base text-gray-500">Seus medicamentos na hora certa</Text>
        </View>

        {isLoading && !showManualLogin && (
          <Card className="p-6 bg-gray-100 items-center">
            <ActivityIndicator size="large" color="#4DA6FF" />
            <Text className="mt-4 text-lg text-gray-800">Conectando automaticamente...</Text>
          </Card>
        )}

        {showManualLogin && (
          <View className="space-y-4">
            <Button
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 rounded-lg justify-center"
              style={{ backgroundColor: '#4DA6FF' }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text className="text-white font-semibold text-lg">Entrar com Google</Text>
                </View>
              )}
            </Button>

            {error ? (
              <View className="p-4 rounded-lg" style={{ backgroundColor: '#FF6B6B' }}>
                <Text className="text-white font-medium text-center">{error}</Text>
              </View>
            ) : null}

            <Text className="text-sm text-center text-gray-500 px-2">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade. Seus dados de
              saúde são protegidos e nunca compartilhados.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}