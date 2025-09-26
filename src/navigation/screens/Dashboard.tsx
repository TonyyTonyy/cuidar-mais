import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Medicine } from "@/src/types/medicine"
import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, Modal, Pressable, Platform, Animated, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Speech from "expo-speech"

const mockUser = {
  name: "Carlos",
  greeting: "Bom dia",
  avatar: "👨‍⚕️",
  streak: 7
}

const mockMedicines: Medicine[] = [
  { id: 1, name: "Losartana", dosage: "50mg - 1 comprimido", time: "09:00", nextIn: 30, notes: "Após o café", status: "pending", color: "#6366F1" },
  { id: 2, name: "Metformina", dosage: "850mg - 1 comprimido", time: "12:00", nextIn: 210, notes: "Antes do almoço", status: "pending", color: "#8B5CF6" },
  { id: 3, name: "Omeprazol", dosage: "20mg - 1 cápsula", time: "07:30", nextIn: -30, notes: "Em jejum", status: "overdue", color: "#EC4899" },
  { id: 4, name: "Vitamina D", dosage: "2000 UI - 1 cápsula", time: "08:00", nextIn: 0, notes: "Com o café da manhã", status: "taken", color: "#10B981" },
]

export default function DashboardScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines)
  const [showSettings, setShowSettings] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const nextMedicine = medicines.find((m) => m.status === "pending" && m.nextIn >= 0) || medicines[0]
  const takenToday = medicines.filter(m => m.status === "taken").length
  const totalToday = medicines.length
  const completionPercentage = Math.round((takenToday / totalToday) * 100)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleTakeMedicine = (medicineId: number) => {
    try {
      const text = "Parabéns! Medicamento confirmado com sucesso!"
      if (Platform.OS !== "web") {
        Speech.speak(text, { language: "pt-BR" })
      } else if ("speechSynthesis" in global) {
        const utterance = new (global as any).SpeechSynthesisUtterance(text)
        utterance.lang = "pt-BR"
          ; (global as any).speechSynthesis.speak(utterance)
      }
    } catch (e) {
      // ignore
    }

    setMedicines((prev) => prev.map((med) => (med.id === medicineId ? { ...med, status: "taken" } : med)))
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

  return (
    <View className="flex-1">
      <View className="relative">
        <View className="py-5 px-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                <Text className="text-2xl">{mockUser.avatar}</Text>
              </View>
              <View>
                <Text className="text-slate-800 text-sm font-medium">
                  {getGreeting()}
                </Text>
                <Text className="text-black text-xl font-bold">
                  {mockUser.name}!
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowSettings(true)}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="settings-outline" size={20} color="black" />
            </Pressable>
          </View>

          <View className="flex-row justify-between mt-0">
            <View className="bg-white/15 backdrop-blur-lg rounded-2xl p-3 flex-1 mr-2">
              <Text className="text-black text-xs">Sequência</Text>
              <Text className="text-slate-800 text-lg font-bold">{mockUser.streak} dias 🔥</Text>
            </View>
            <View className="bg-white/15 backdrop-blur-lg rounded-2xl p-3 flex-1 mx-1">
              <Text className="text-black text-xs">Hoje</Text>
              <Text className="text-slate-800 text-lg font-bold">{takenToday}/{totalToday}</Text>
            </View>
            <View className="bg-white/15 backdrop-blur-lg rounded-2xl p-3 flex-1 ml-2">
              <Text className="text-black text-xs">Progresso</Text>
              <Text className="text-slate-800 text-lg font-bold">{completionPercentage}% ✨</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal visible={showSettings} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-96">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6"></View>

            <Text className="text-2xl font-bold mb-6 text-gray-900">Configurações</Text>

            <View className="space-y-6">
              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-base font-semibold mb-3">Aparência</Text>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-700">Tamanho da fonte</Text>
                  <View className="bg-blue-100 rounded-lg px-3 py-2">
                    <Text className="text-blue-600 font-medium">Normal</Text>
                  </View>
                </View>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-base font-semibold mb-3">Notificações</Text>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-700">Som</Text>
                  <View className="w-12 h-6 bg-green-500 rounded-full items-end justify-center p-1">
                    <View className="w-4 h-4 bg-white rounded-full"></View>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700">Leitura por voz</Text>
                  <View className="w-12 h-6 bg-gray-300 rounded-full justify-center p-1">
                    <View className="w-4 h-4 bg-white rounded-full"></View>
                  </View>
                </View>
              </View>
            </View>

            <Button
              onPress={() => setShowSettings(false)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 mt-8 p-0 rounded-2xl"
            >
              <Text className="text-white text-center font-bold text-lg">Fechar</Text>
            </Button>
          </View>
        </View>
      </Modal>

      <ScrollView
        className="flex-1 px-4 -mt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="bg-white rounded-3xl p-6 mb-6 shadow-xl border-0" style={{ elevation: 4 }}>
          <View className="items-center">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3 bg-blue-400/20">
              <Ionicons name="time" size={28} color={"#3b82f6"} />
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
                className="bg-emerald-500 h-12 p-0 rounded-2xl shadow-lg"
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Confirmar Medicamento</Text>
              </Button>
            </View>
          )}
        </Card>

        <View>
          <Text className="text-xl font-bold text-gray-900 mb-4">Medicamentos de Hoje</Text>

          {medicines
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((medicine, index) => (
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
                  </View>
                </View>
              </Card>
            ))}
        </View>
      </ScrollView>
    </View>
  )
}