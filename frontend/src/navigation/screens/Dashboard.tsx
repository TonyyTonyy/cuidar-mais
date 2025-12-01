import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Medicine } from "@/src/types/medicine"
import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, Platform, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Speech from "expo-speech"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TutorialOverlay, useResetTutorial } from "./dashboard/tutorial-overlay"
import { useNavigation } from "@react-navigation/native"
import { EditMedicineModal } from "./dashboard/edit-medicine-modal"
import { getStoredToken } from "@/src/lib/get-stored-token"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

interface User {
  id: string
  name: string
  email: string
  picture?: string
  avatar?: string
  streak: number
}

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [takingMedicine, setTakingMedicine] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const { resetTutorial } = useResetTutorial()

  const nextMedicine = medicines.find((m) => m.status === "pending" && m.nextIn >= 0) || medicines[0]
  const takenToday = medicines.filter(m => m.status === "taken").length
  const totalToday = medicines.length
  const completionPercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])



  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await getStoredToken()

      if (!token) {
        setError('Token não encontrado. Faça login novamente.')
        setLoading(false)
        return
      }

      // Busca dados do usuário
      const userRes = await fetch(`${API_URL}/api/user/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (userRes.ok) {
        const body = await userRes.json()
        const remoteUser: User = body?.user ?? body?.data ?? body

        if (remoteUser) {
          setUser(remoteUser)
          await AsyncStorage.setItem('userData', JSON.stringify(remoteUser))
        }
      } else {
        console.warn('Falha ao buscar /api/user/me', await userRes.text())
        setError('Erro ao carregar dados do usuário')
      }

      // Busca medicamentos de hoje
      const medsRes = await fetch(`${API_URL}/api/medicines/today`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (medsRes.ok) {
        const medsBody = await medsRes.json()
        const remoteMeds: Medicine[] = medsBody?.medicines ?? medsBody?.data ?? medsBody
        if (Array.isArray(remoteMeds)) {
          setMedicines(remoteMeds)
        }
      } else {
        console.warn('/api/medicines/today não disponível:', medsRes.status)
        if (medicines.length === 0) {
          setError('Nenhum medicamento cadastrado')
        }
      }

    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTakeMedicine = async (medicineId: string) => {
    setTakingMedicine(medicineId)

    try {
      const token = await getStoredToken()

      if (!token) {
        setError('Token não encontrado. Faça login novamente.')
        return
      }

      const medicine = medicines.find(m => m.id === medicineId)
      if (!medicine) return

      const response = await fetch(`${API_URL}/api/medicines/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicationId: medicine.medicationId,
          scheduledTime: medicine.time,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        setMedicines((prev) =>
          prev.map((med) =>
            med.id === medicineId ? { ...med, status: "taken" } : med
          )
        )

        if (data.streak && user) {
          setUser({ ...user, streak: data.streak })
        }

        const text = "Parabéns! Medicamento confirmado com sucesso!"
        if (Platform.OS !== "web") {
          Speech.speak(text, { language: "pt-BR" })
        } else if ("speechSynthesis" in global) {
          const utterance = new (global as any).SpeechSynthesisUtterance(text)
          utterance.lang = "pt-BR"
            ; (global as any).speechSynthesis.speak(utterance)
        }
      } else {
        setError('Erro ao confirmar medicamento')
      }
    } catch (err) {
      console.error('Erro ao confirmar medicamento:', err)
      setError('Erro ao confirmar medicamento')
    } finally {
      setTakingMedicine(null)
    }
  }

  const handleEditMedicine = (medicationId: string) => {
    setEditingMedicationId(medicationId)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingMedicationId(null)
  }

  const handleUpdateComplete = () => {
    // Recarrega os dados após atualização
    fetchData()
  }

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 0) return "Atrasado"
    if (minutes === 0) return "Agora"
    if (minutes < 60) return `em ${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "#10B981"
      case "overdue":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 text-lg">Carregando seus dados...</Text>
      </View>
    )
  }

  if (error && !user) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50 px-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-gray-900 text-xl font-bold mt-4 text-center">{error}</Text>
        <Button
          onPress={() => fetchData()}
          className="bg-blue-500 mt-6 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Tentar novamente</Text>
        </Button>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <TutorialOverlay onComplete={() => setShowTutorial(false)} />

      {/* Header */}
      <View className="relative">
        <View className="pt-5 pb-2 px-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3 overflow-hidden">
                {user?.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-2xl">{user?.avatar || '👤'}</Text>
                )}
              </View>
              <View>
                <Text className="text-slate-600 text-sm font-medium">
                  {getGreeting()}
                </Text>
                <Text className="text-slate-900 text-xl font-bold">
                  {user?.name || "Usuário"}!
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Pressable
                onPress={resetTutorial}
                className="w-10 h-10 bg-white/30 rounded-full items-center justify-center mr-2"
              >
                <Ionicons name="help-outline" size={20} color="#1e293b" />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Settings')}
                className="w-10 h-10 bg-white/30 rounded-full items-center justify-center"
              >
                <Ionicons name="settings-outline" size={20} color="#1e293b" />
              </Pressable>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between mt-2">
            <View className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 flex-1 mr-2 shadow-sm">
              <Text className="text-slate-600 text-xs">Sequência</Text>
              <Text className="text-slate-900 text-lg font-bold">{user?.streak || 0} dias 🔥</Text>
            </View>
            <View className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 flex-1 mx-1 shadow-sm">
              <Text className="text-slate-600 text-xs">Hoje</Text>
              <Text className="text-slate-900 text-lg font-bold">{takenToday}/{totalToday}</Text>
            </View>
            <View className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 flex-1 ml-2 shadow-sm">
              <Text className="text-slate-600 text-xs">Progresso</Text>
              <Text className="text-slate-900 text-lg font-bold">{completionPercentage}% ✨</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Next Medicine Card */}
        {nextMedicine && (
          <Card className="bg-white rounded-3xl p-6 mb-6 shadow-xl border-0" style={{ elevation: 4 }}>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3 bg-blue-100">
                <Ionicons name="time" size={28} color="#3b82f6" />
              </View>
              <Text className="text-gray-600 text-sm font-medium">Próximo medicamento</Text>
              <View className="bg-blue-500 px-4 py-1 my-2 rounded-2xl">
                <Text className="text-white text-2xl font-bold">
                  {formatTimeUntil(nextMedicine.nextIn)}
                </Text>
              </View>
            </View>

            <View className="items-center space-y-2">
              <Text className="text-xl font-bold text-gray-900">{nextMedicine.name}</Text>
              <Text className="text-base text-gray-600">{nextMedicine.dosage}</Text>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500 ml-1">
                  {nextMedicine.notes} • às {nextMedicine.time}
                </Text>
              </View>
            </View>

            {nextMedicine.status === "pending" && (
              <View className="mt-6">
                <Button
                  onPress={() => handleTakeMedicine(nextMedicine.id)}
                  disabled={takingMedicine === nextMedicine.id}
                  className="bg-emerald-500 h-12 p-0 rounded-2xl shadow-lg data-[hover=true]:bg-emerald-600"
                >
                  {takingMedicine === nextMedicine.id ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">Confirmar Medicamento</Text>
                    </>
                  )}
                </Button>
              </View>
            )}
          </Card>
        )}

        {/* Medicine List */}
        <View>
          <Text className="text-xl font-bold text-gray-900 mb-4">Medicamentos de Hoje</Text>

          {medicines.length === 0 ? (
            <Card className="bg-white rounded-2xl p-6 shadow-sm border-0">
              <View className="items-center py-8">
                <Ionicons name="medical-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-center mt-4 text-base">
                  Nenhum medicamento cadastrado para hoje
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  Adicione seus medicamentos para começar
                </Text>
              </View>
            </Card>
          ) : (
            medicines
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((medicine) => (
                <Card key={medicine.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border-0">
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: medicine.color + "20" }}
                    >
                      {medicine.status === "taken" ? (
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      ) : medicine.status === "overdue" ? (
                        <Ionicons name="alert-circle" size={24} color="#EF4444" />
                      ) : (
                        <Ionicons name="medical" size={20} color={medicine.color} />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 mb-1">
                        {medicine.name}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-1">{medicine.dosage}</Text>
                      <Text className="text-gray-400 text-xs">{medicine.notes}</Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-900 mb-2">{medicine.time}</Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: getStatusColor(medicine.status) + "20" }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getStatusColor(medicine.status) }}
                        >
                          {medicine.status === "taken" ? "Tomado ✅" :
                            medicine.status === "overdue" ? "Atrasado ⏰" : "Pendente 📝"}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => handleEditMedicine(medicine.medicationId)}
                        className="mt-2 px-3 py-1 bg-blue-50 rounded-full"
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="pencil" size={12} color="#3B82F6" />
                          <Text className="text-blue-500 text-xs font-medium ml-1">Editar</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))
          )}
        </View>

        {error && medicines.length > 0 && (
          <View className="bg-red-50 rounded-2xl p-4 mt-4">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-600 ml-2 flex-1">{error}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <EditMedicineModal
        visible={showEditModal}
        medicationId={editingMedicationId}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateComplete}
        onDelete={handleUpdateComplete}
      />
    </View>
  )
}