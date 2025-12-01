import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, Alert, Image, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '..'
import logo from "@/assets/LogoCuidar.png"
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeRedirectUri } from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [showManualLogin, setShowManualLogin] = useState(false)
  const [error, setError] = useState('')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    responseType: 'id_token',
  })

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken')

        if (token) {
          const response = await fetch(`${API_URL}/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            await AsyncStorage.setItem('userData', JSON.stringify(data.user))
            navigation.replace('Home')
            return
          } else {
            await AsyncStorage.removeItem('authToken')
            await AsyncStorage.removeItem('userData')
          }
        }

        setIsLoading(false)
        setShowManualLogin(true)
      } catch (err) {
        console.error('Erro no auto-login:', err)
        setIsLoading(false)
        setShowManualLogin(true)
      }
    }

    attemptAutoLogin()
  }, [])

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Resposta completa do Google:', response)
      const { authentication, params } = response

      // Tenta obter o idToken de diferentes lugares
      const idToken = authentication?.idToken || params?.id_token
      const accessToken = authentication?.accessToken || params?.access_token

      console.log('idToken:', idToken)
      console.log('accessToken:', accessToken)

      if (idToken) {
        handleGoogleLoginWithToken(idToken)
      } else if (accessToken) {
        // Fallback: usa accessToken para obter informações do usuário
        handleGoogleLoginWithAccessToken(accessToken)
      } else {
        setError('Não foi possível obter token do Google')
      }
    } else if (response?.type === 'error') {
      console.error('Erro na resposta do Google:', response.error)
      setError('Erro ao autenticar com Google')
    }
  }, [response])

  const handleGoogleLoginWithToken = async (idToken: string) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      await AsyncStorage.setItem('authToken', data.token)
      await AsyncStorage.setItem('userData', JSON.stringify(data.user))

      navigation.replace('Home')
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError(err.message || 'Não foi possível conectar ao servidor')
      setIsLoading(false)
    }
  }

  // Método alternativo usando accessToken
  const handleGoogleLoginWithAccessToken = async (accessToken: string) => {
    setIsLoading(true)
    setError('')

    try {
      // Busca informações do usuário usando o accessToken
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!userInfoResponse.ok) {
        throw new Error('Não foi possível obter informações do usuário')
      }

      const userInfo = await userInfoResponse.json()
      console.log('Informações do usuário:', userInfo)

      // Envia para o backend
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          userInfo
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      await AsyncStorage.setItem('authToken', data.token)
      await AsyncStorage.setItem('userData', JSON.stringify(data.user))

      navigation.replace('Home')
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError(err.message || 'Não foi possível conectar ao servidor')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError('')
      console.log('Redirect URI:', makeRedirectUri({
        scheme: 'cuidarmais',
        path: 'redirect'
      }))
      console.log('Iniciando login com Google...')
      await promptAsync({
        showInRecents: true
      })
    } catch (err) {
      console.error('Erro ao iniciar login Google:', err)
      setError('Erro ao iniciar autenticação')
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
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
              disabled={isLoading || !request}
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

            <Text className="text-sm text-center mt-2 text-gray-500 px-2">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade. Seus dados de
              saúde são protegidos e nunca compartilhados.
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}